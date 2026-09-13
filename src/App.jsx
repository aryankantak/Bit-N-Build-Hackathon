import { useEffect, useState } from 'react'
import './App.css'

const SUPABASE_URL = 'https://yaqznbcojhcqfyqawbie.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_8sK7yio5RGIFHN8NP1xC-A_R7E5usyf'

const supabaseHeaders = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  'Content-Type': 'application/json',
}

function App() {
  const [selectedItem, setSelectedItem] = useState(null)
  const [currentPage, setCurrentPage] = useState('customer')
  const [items, setItems] = useState([])
  const [reservations, setReservations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    const loadListings = async () => {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/listings?select=id,name,business,original_price,surplus_price,quantity,pickup,emoji,distance,category,created_at&order=created_at.desc`,
          { headers: supabaseHeaders }
        )

        if (!response.ok) {
          throw new Error(`Supabase request failed: ${response.status}`)
        }

        const data = await response.json()
        setItems(
          data.map((item) => ({
            id: item.id,
            emoji: item.emoji || '🥐',
            name: item.name,
            business: item.business,
            originalPrice: Number(item.original_price),
            surplusPrice: Number(item.surplus_price),
            quantity: Number(item.quantity),
            distance: `${item.distance ?? 0} km`,
            pickup: item.pickup,
            category: item.category || 'Restaurant',
          }))
        )
      } catch (error) {
        console.error('Unable to load listings from Supabase:', error)
      }
    }

    loadListings()
  }, [])

  const [form, setForm] = useState({
    name: '',
    business: '',
    originalPrice: '',
    surplusPrice: '',
    quantity: '',
    pickup: '',
    emoji: '🥐',
    category: 'Restaurant',
  })

  const handleFormChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    })
  }

  const handlePublish = async (event) => {
    event.preventDefault()

    const listing = {
      emoji: form.emoji,
      name: form.name,
      business: form.business,
      original_price: Number(form.originalPrice),
      surplus_price: Number(form.surplusPrice),
      quantity: Number(form.quantity),
      distance: 0.5,
      pickup: `Before ${form.pickup}`,
      category: form.category,
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/listings`, {
        method: 'POST',
        headers: {
          ...supabaseHeaders,
          Prefer: 'return=representation',
        },
        body: JSON.stringify(listing),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Supabase insert failed: ${response.status} ${errorText}`)
      }

      const [savedItem] = await response.json()

      const newItem = {
        id: savedItem.id,
        emoji: savedItem.emoji || '🥐',
        name: savedItem.name,
        business: savedItem.business,
        originalPrice: Number(savedItem.original_price),
        surplusPrice: Number(savedItem.surplus_price),
        quantity: Number(savedItem.quantity),
        distance: `${savedItem.distance ?? 0} km`,
        pickup: savedItem.pickup,
        category: savedItem.category || form.category || 'Restaurant',
      }

      setItems((currentItems) => [...currentItems, newItem])

      setForm({
        name: '',
        business: '',
        originalPrice: '',
        surplusPrice: '',
        quantity: '',
        pickup: '',
        emoji: '🥐',
        category: 'Restaurant',
      })

      setCurrentPage('customer')
    } catch (error) {
      console.error('Unable to publish listing to Supabase:', error)
      alert('Could not publish the surplus listing. Please try again.')
    }
  }

  const handleDelete = async (itemId) => {
    const item = items.find((listing) => String(listing.id) === String(itemId))

    if (!item) {
      alert('Listing not found.')
      return
    }

    const confirmed = window.confirm(
      `Delete "${item.name}"? This will remove it from the marketplace.`
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/listings?id=eq.${encodeURIComponent(itemId)}`,
        {
          method: 'DELETE',
          headers: {
            ...supabaseHeaders,
            Prefer: 'return=representation',
          },
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Supabase delete failed: ${response.status} ${errorText}`)
      }

      const deletedRows = await response.json().catch(() => [])

      if (!Array.isArray(deletedRows) || deletedRows.length === 0) {
        throw new Error('Supabase did not delete the listing. Check the DELETE RLS policy.')
      }

      setItems((currentItems) =>
        currentItems.filter((listing) => String(listing.id) !== String(itemId))
      )
    } catch (error) {
      console.error('Unable to delete listing from Supabase:', error)
      alert(`Could not delete the listing. ${error.message}`)
    }
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !normalizedSearch ||
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.business.toLowerCase().includes(normalizedSearch)

    const itemCategory = String(item.category || '').trim().toLowerCase()
    const matchesCategory =
      selectedCategory === 'All' ||
      itemCategory === selectedCategory.toLowerCase()

    return matchesSearch && matchesCategory
  })

  const handleReserve = (item) => {
    const pickupCode = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()

    const reservation = {
      id: Date.now(),
      itemName: item.name,
      business: item.business,
      code: pickupCode,
      price: item.surplusPrice,
      status: 'Reserved',
    }

    setReservations([...reservations, reservation])

    setSelectedItem({
      ...item,
      pickupCode,
    })
  }

  const handleCollect = (reservationId) => {
    setReservations(
      reservations.map((reservation) =>
        reservation.id === reservationId
          ? {
              ...reservation,
              status: 'Collected',
            }
          : reservation
      )
    )
  }

  return (
    <div className="app">

      {/* Navigation */}
      <nav className="navbar">

        <div
          className="logo"
          onClick={() => setCurrentPage('customer')}
          style={{ cursor: 'pointer' }}
        >
          <span>♻</span>
          Surplus
        </div>

        <div className="nav-links">

          {currentPage === 'customer' && (
            <>
              <a href="#deals">Browse Deals</a>
              <a href="#how">How It Works</a>

              <button
                className="business-btn"
                onClick={() => setCurrentPage('business')}
              >
                List Surplus
              </button>
            </>
          )}

          {currentPage === 'business' && (
            <button
              className="business-btn"
              onClick={() => setCurrentPage('customer')}
            >
              ← Back to Marketplace
            </button>
          )}

        </div>
      </nav>


      {/* ================= CUSTOMER PAGE ================= */}

      {currentPage === 'customer' && (
        <>

          {/* Hero */}
          <section className="hero-section">

            <div className="hero-content">

              <div className="badge">
                ♻️ Save food. Save money.
              </div>

              <h1>
                Great deals are
                <br />
                <span>waiting nearby.</span>
              </h1>

              <p>
                Discover surplus food from local businesses at
                big discounts — before it goes to waste.
              </p>

              <div className="search-box">

                <span>📍</span>

                <input
                  type="text"
                  placeholder="Search for deals near you..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />

                <button
                  type="button"
                  onClick={() => document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Search
                </button>

              </div>

              <div className="hero-stats">

                <div>
                  <strong>₹18K+</strong>
                  <span>Value recovered</span>
                </div>

                <div>
                  <strong>126 kg</strong>
                  <span>Food rescued</span>
                </div>

                <div>
                  <strong>340+</strong>
                  <span>Items saved</span>
                </div>

              </div>

            </div>


            {/* Hero Card */}
            <div className="hero-card">

              <div className="floating-label">
                🔥 Popular nearby
              </div>

              <div className="food-visual">
                🥐
              </div>

              <h3>
                Fresh Croissants
              </h3>

              <p>
                Bake House · 1.2 km away
              </p>

              <div className="price-row">

                <span className="old-price">
                  ₹500
                </span>

                <strong>
                  ₹200
                </strong>

                <span className="discount">
                  60% OFF
                </span>

              </div>

              <div className="deadline">
                ⏰ Pickup before 9:00 PM
              </div>

            </div>

          </section>


          {/* Deals */}
          <section
            className="deals-section"
            id="deals"
          >

            <div className="section-heading">

              <div>

                <span className="small-heading">
                  NEAR YOU
                </span>

                <h2>
                  Surplus deals
                </h2>

              </div>

              <button className="view-all">
                View all →
              </button>

            </div>


            {/* Categories */}
            <div className="category-row">

              <button
                className={`category ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('All')}
              >
                All deals
              </button>

              <button
                className={`category ${selectedCategory === 'Bakery' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Bakery')}
              >
                🥐 Bakery
              </button>

              <button
                className={`category ${selectedCategory === 'Restaurant' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Restaurant')}
              >
                🍕 Restaurants
              </button>

              <button
                className={`category ${selectedCategory === 'Grocery' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Grocery')}
              >
                🥬 Grocery
              </button>

              <button
                className={`category ${selectedCategory === 'Produce' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Produce')}
              >
                🌾 Produce
              </button>

            </div>


            {/* Deal Cards */}
            <div className="deals-grid">

              {filteredItems.map((item) => (

                <div
                  className="deal-card"
                  key={item.id}
                >

                  <div className="food-image">

                    <span>
                      {item.emoji}
                    </span>

                    <div className="distance">
                      📍 {item.distance}
                    </div>

                  </div>


                  <div className="deal-info">

                    <div className="business-name">
                      {item.business}
                    </div>

                    <h3>
                      {item.name}
                    </h3>

                    <p className="quantity">
                      {item.quantity} available
                    </p>


                    <div className="card-price">

                      <span className="old-price">
                        ₹{item.originalPrice}
                      </span>

                      <strong>
                        ₹{item.surplusPrice}
                      </strong>

                      <span className="discount">
                        {Math.round(
                          (1 -
                            item.surplusPrice /
                              item.originalPrice) *
                            100
                        )}
                        % OFF
                      </span>

                    </div>


                    <div className="pickup">
                      ⏰ {item.pickup}
                    </div>


                    <button
                      className="reserve-btn"
                      onClick={() => handleReserve(item)}
                    >
                      Reserve deal
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </section>


          {/* How It Works */}
          <section
            className="how-section"
            id="how"
          >

            <div className="section-heading centered">

              <span className="small-heading">
                SIMPLE & FAST
              </span>

              <h2>
                How it works
              </h2>

            </div>


            <div className="steps">

              <div className="step">

                <div className="step-icon">
                  🔎
                </div>

                <h3>
                  Discover
                </h3>

                <p>
                  Find surplus deals from businesses near you.
                </p>

              </div>


              <div className="step">

                <div className="step-icon">
                  🎟️
                </div>

                <h3>
                  Reserve
                </h3>

                <p>
                  Grab your deal before someone else does.
                </p>

              </div>


              <div className="step">

                <div className="step-icon">
                  🏪
                </div>

                <h3>
                  Pick up
                </h3>

                <p>
                  Visit the business and collect your order.
                </p>

              </div>


              <div className="step">

                <div className="step-icon">
                  🌱
                </div>

                <h3>
                  Make an impact
                </h3>

                <p>
                  Every purchase helps prevent valuable food from going to waste.
                </p>

              </div>

            </div>

          </section>

        </>
      )}


      {/* ================= BUSINESS DASHBOARD ================= */}

      {currentPage === 'business' && (

        <main className="business-dashboard">

          <div className="dashboard-header">

            <div>

              <span className="small-heading">
                BUSINESS PORTAL
              </span>

              <h1>
                List your surplus
              </h1>

              <p>
                Turn unsold inventory into revenue instead of waste.
              </p>

            </div>

            <div className="dashboard-icon">
              🏪
            </div>

          </div>


          {/* Dashboard Stats */}
          <div className="dashboard-stats">

            <div className="dashboard-stat">

              <span>
                📦
              </span>

              <div>
                <strong>
                  {items.length}
                </strong>

                <p>
                  Active listings
                </p>
              </div>

            </div>


            <div className="dashboard-stat">

              <span>
                💰
              </span>

              <div>
                <strong>
                  ₹4,850
                </strong>

                <p>
                  Revenue recovered
                </p>
              </div>

            </div>


            <div className="dashboard-stat">

              <span>
                🌱
              </span>

              <div>
                <strong>
                  126 kg
                </strong>

                <p>
                  Waste prevented
                </p>
              </div>

            </div>

          </div>


          {/* Add Surplus Form */}
          <div className="add-surplus-card">

            <h2>
              Add new surplus
            </h2>

            <p className="form-description">
              Tell customers what you have available.
            </p>


            <form onSubmit={handlePublish}>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Product name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Fresh Sandwiches"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Business name
                  </label>

                  <input
                    type="text"
                    name="business"
                    value={form.business}
                    onChange={handleFormChange}
                    placeholder="e.g. Green Cafe"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Original price (₹)
                  </label>

                  <input
                    type="number"
                    name="originalPrice"
                    value={form.originalPrice}
                    onChange={handleFormChange}
                    placeholder="500"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Surplus price (₹)
                  </label>

                  <input
                    type="number"
                    name="surplusPrice"
                    value={form.surplusPrice}
                    onChange={handleFormChange}
                    placeholder="200"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Quantity
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleFormChange}
                    placeholder="10"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Pickup before
                  </label>

                  <input
                    type="time"
                    name="pickup"
                    value={form.pickup}
                    onChange={handleFormChange}
                    required
                  />

                </div>

              </div>


              <div className="form-group emoji-group">

                <label>
                  Choose product icon
                </label>

                <select
                  name="emoji"
                  value={form.emoji}
                  onChange={handleFormChange}
                >
                  <option value="🥐">
                    🥐 Bakery
                  </option>

                  <option value="🍕">
                    🍕 Pizza / Restaurant
                  </option>

                  <option value="🥬">
                    🥬 Grocery
                  </option>

                  <option value="🌾">
                    🌾 Produce
                  </option>

                  <option value="🍰">
                    🍰 Dessert
                  </option>

                </select>

              </div>


              <div className="form-group">
                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                >
                  <option value="Bakery">🥐 Bakery</option>
                  <option value="Restaurant">🍕 Restaurant</option>
                  <option value="Grocery">🥬 Grocery</option>
                  <option value="Produce">🌾 Produce</option>
                </select>
              </div>

              <button
                type="submit"
                className="publish-btn"
              >
                🚀 Publish surplus
              </button>

            </form>

          </div>


          {/* Current Listings */}
          <div className="current-listings">

            <div className="listing-header">

              <div>

                <span className="small-heading">
                  YOUR INVENTORY
                </span>

                <h2>
                  Current listings
                </h2>

              </div>

              <span className="listing-count">
                {items.length} listings
              </span>

            </div>


            <div className="business-listings">

              {items.slice(-4).map((item) => (

                <div
                  className="business-listing"
                  key={item.id}
                >

                  <div className="listing-emoji">
                    {item.emoji}
                  </div>

                  <div className="listing-main">

                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      {item.business}
                    </span>

                  </div>

                  <div className="listing-quantity">

                    <strong>
                      {item.quantity}
                    </strong>

                    <span>
                      available
                    </span>

                  </div>

                  <div className="listing-price">

                    <strong>
                      ₹{item.surplusPrice}
                    </strong>

                    <span>
                      from ₹{item.originalPrice}
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    style={{
                      marginLeft: '12px',
                      padding: '8px 12px',
                      border: '1px solid #dc2626',
                      borderRadius: '8px',
                      background: 'transparent',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Delete
                  </button>

                </div>

              ))}

            </div>

          </div>


          {/* Reservations */}

          <div className="reservations-card">

            <div className="listing-header">

              <div>

                <span className="small-heading">
                  CUSTOMER ORDERS
                </span>

                <h2>
                  Recent reservations
                </h2>

              </div>

              <span className="listing-count">
                {reservations.length} orders
              </span>

            </div>


            {reservations.length === 0 ? (

              <div className="empty-reservations">

                <div>
                  🎟️
                </div>

                <p>
                  No reservations yet.
                </p>

                <span>
                  Customer reservations will appear here.
                </span>

              </div>

            ) : (

              <div className="reservation-list">

                {reservations.map((reservation) => (

                  <div
                    className="business-reservation"
                    key={reservation.id}
                  >

                    <div className="reservation-product">
                      🎟️
                    </div>

                    <div className="reservation-main">

                      <strong>
                        {reservation.itemName}
                      </strong>

                      <span>
                        {reservation.business}
                      </span>

                    </div>

                    <div className="reservation-code">

                      <span>
                        PICKUP CODE
                      </span>

                      <strong>
                        {reservation.code}
                      </strong>

                    </div>

                    <div className="reservation-status">
                      {reservation.status}
                    </div>

                    <button
                      className="collect-btn"
                      onClick={() =>
                        handleCollect(reservation.id)
                      }
                    >
                      {reservation.status === 'Collected'
                        ? '✓ Collected'
                        : 'Mark collected'}
                    </button>

                  </div>

                ))}

              </div>

            )}

          </div>

        </main>

      )}


      {/* Footer */}
      <footer>

        <div className="logo">
          <span>♻</span>
          Surplus
        </div>

        <p>
          Turning local surplus into affordable deals.
        </p>

      </footer>


      {/* Reservation Modal */}
      {selectedItem && (

        <div className="modal-overlay">

          <div className="reservation-modal">

            <button
              className="close-btn"
              onClick={() => setSelectedItem(null)}
            >
              ×
            </button>


            <div className="success-icon">
              🎉
            </div>


            <h2>
              Deal reserved!
            </h2>


            <p>
              Your{' '}
              <strong>
                {selectedItem.name}
              </strong>{' '}
              from{' '}
              <strong>
                {selectedItem.business}
              </strong>{' '}
              is reserved.
            </p>


            <div className="pickup-code">

              <span>
                YOUR PICKUP CODE
              </span>

              <strong>
                {selectedItem.pickupCode}
              </strong>

            </div>


            <div className="reservation-details">

              <div>

                <span>
                  📍 Location
                </span>

                <strong>
                  {selectedItem.distance} away
                </strong>

              </div>


              <div>

                <span>
                  ⏰ Pickup by
                </span>

                <strong>
                  {selectedItem.pickup}
                </strong>

              </div>


              <div>

                <span>
                  💰 You pay
                </span>

                <strong>
                  ₹{selectedItem.surplusPrice}
                </strong>

              </div>

            </div>


            <p className="pickup-message">
              Show the pickup code at the business when you collect your order.
            </p>


            <button
              className="done-btn"
              onClick={() => setSelectedItem(null)}
            >
              Done
            </button>

          </div>

        </div>

      )}

    </div>
  )
}

export default App