# Surplus Marketplace

Surplus Marketplace is a web platform built to help food businesses sell
extra food instead of letting it go to waste.

Bakeries, restaurants, grocery stores and other food businesses can
publish surplus items at discounted prices. Customers can browse the
available deals, search for specific food or businesses, filter listings
by category, and reserve items for pickup.

## What it does

### For customers

-   Browse available surplus food listings
-   Search by food item or business name
-   Filter listings by Bakery, Restaurant, Grocery or Produce
-   View original and discounted prices
-   See available quantity, pickup details and distance
-   Open a listing and reserve a deal
-   Receive a pickup code in the prototype flow

### For businesses

-   Publish a new surplus listing
-   Add the item name, business name, prices, quantity, pickup
    information, emoji and category
-   View listings in the business section
-   Delete a listing when it is no longer available

## Main features

-   Real listings are loaded from Supabase
-   New listings are saved to the PostgreSQL database
-   Search works on food names and business names
-   Category filtering works for All, Bakery, Restaurant, Grocery and
    Produce
-   Listings can be deleted through the business UI
-   Available quantity is displayed for each listing
-   Original and surplus prices are displayed
-   Pickup information is shown to customers
-   A simple reservation and pickup-code flow is included in the
    frontend
-   Responsive React interface

## How the application works

The basic data flow is:

User ↓ React + Vite Frontend ↓ Supabase REST API ↓ Row Level Security
(RLS) ↓ PostgreSQL Database

When the app starts, the frontend requests listings from Supabase and
displays them in the marketplace.

When a business publishes a listing, the frontend sends the data to
Supabase, where it is stored in PostgreSQL.

When a business deletes a listing, the frontend sends a delete request
to Supabase and the listing is removed from the database.

Search and category filtering happen in the frontend on the listings
that have been loaded from Supabase.

## Database

### `listings`

The main table used by the application is `listings`.

  Column             Purpose
  ------------------ -----------------------------------
  `id`               Unique ID for each listing
  `name`             Food item name
  `business`         Business name
  `original_price`   Original price
  `surplus_price`    Discounted surplus price
  `quantity`         Number of items available
  `pickup`           Pickup information
  `emoji`            Emoji displayed with the listing
  `distance`         Approximate distance in km
  `category`         Listing category
  `created_at`       Time when the listing was created

The `id` is generated automatically and `created_at` is stored when the
listing is created.

## Tech stack

### Frontend

-   React
-   Vite
-   JavaScript / JSX
-   CSS

### Backend

-   Supabase
-   PostgreSQL
-   Supabase REST API
-   Row Level Security (RLS)

### Development and deployment

-   Node.js
-   npm
-   Git
-   GitHub
-   GitHub Codespaces
-   Vercel

There is no separate Express.js or custom Node backend. The React
frontend communicates directly with the Supabase REST API.

## Running the project locally

You need Node.js and npm installed.

1.  Clone the repository.

``` bash
git clone https://github.com/aryankantak/Bit-N-Build-Hackathon.git
```

2.  Open the project folder.

``` bash
cd Bit-N-Build-Hackathon
```

3.  Install dependencies.

``` bash
npm install
```

4.  Start the development server.

``` bash
npm run dev
```

5.  Open the local address shown by Vite in your browser.

For Codespaces or another remote environment:

``` bash
npm run dev -- --host 0.0.0.0
```

Then open the forwarded Vite port.

## Supabase setup

The frontend is connected directly to Supabase using the project URL and
a publishable key.

Supabase is used to: - Read listings - Create listings - Delete
listings - Store the marketplace data in PostgreSQL

Database access is controlled with Supabase Row Level Security policies.

For this hackathon prototype, the policies are kept simple. In a
production version, authentication and stricter ownership rules should
be added so only the business that owns a listing can modify or delete
it.

## Project structure

``` text
Bit-N-Build-Hackathon/
├── public/
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Current limitations

This is a hackathon prototype, so some features are intentionally kept
simple.

-   User authentication is not implemented
-   Listing ownership is not tied to individual business accounts
-   The reservation flow is currently handled in the frontend
-   Payment processing is not implemented
-   Distance is currently stored as listing data rather than calculated
    from live location
-   There is no dedicated admin system
-   The RLS policies should be made stricter before a production release

## Future improvements

-   Business and customer authentication
-   Secure listing ownership and editing
-   Persistent reservation records
-   Automatic inventory reduction after confirmed reservations
-   Online payments
-   Live location and map integration
-   Notifications for new or expiring listings
-   Time-based automatic pricing
-   Business analytics
-   Automatic listing expiry
-   Smarter recommendations based on customer preferences and location

## AI / ML

AI or machine learning is not used in the current working
implementation.

Possible future uses include demand prediction, personalized
recommendations and helping businesses estimate expected surplus.

## Team

This project was built for the Bit-N-Build Hackathon.

The goal is to create a practical, simple way to reduce food waste while
helping businesses recover value from unsold food and helping customers
find affordable food.

## License

Created for hackathon and educational purposes.
