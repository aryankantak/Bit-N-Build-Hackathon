# Surplus Marketplace

Surplus Marketplace is a simple web platform that helps businesses sell extra food instead of letting it go to waste.

The idea is straightforward. Bakeries, cafes, restaurants, and other food businesses often have good food left at the end of the day. At the same time, people are looking for affordable food. This platform connects the two sides by letting businesses list their surplus items at a lower price and allowing customers to find and reserve them.

## What the project does

A business can publish a surplus food listing with details such as:

- Food item name
- Business name
- Original price
- Surplus price
- Available quantity
- Pickup information
- Distance
- An emoji to make the listing easy to recognise

Customers can browse the available listings and see the discounted price, quantity, pickup details, and distance.

The current frontend also includes a simple reservation interaction for the demo.

## Main features

- Browse surplus food listings
- Show original and discounted prices
- Display available quantity
- Show pickup information
- Show approximate distance
- Publish a new surplus listing
- Store listings in a PostgreSQL database
- Fetch listings from the backend when the application loads
- Use Row Level Security (RLS) for database access
- Simple and responsive user interface

## Tech stack

### Frontend

- React
- Vite
- JavaScript / JSX
- CSS

### Backend

We use Supabase as the backend service.

- Supabase
- PostgreSQL
- Supabase REST API
- Row Level Security (RLS)

### Development and version control

- Node.js
- npm
- Git
- GitHub
- GitHub Codespaces

There is no separate Express.js server in this project. The React frontend communicates directly with the Supabase REST API.

## How the application works

The basic flow is:

User → React + Vite → Supabase REST API → Row Level Security → PostgreSQL

When the application starts, the frontend requests the available listings from Supabase. The data is then displayed as food cards in the marketplace.

When a business publishes a listing, the frontend sends the listing data to Supabase. Supabase checks the request through the configured RLS policies and stores the data in PostgreSQL.

## Database

The project currently uses one main table:

`listings`

The table contains:

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | bigint | Unique ID for each listing |
| `name` | text | Name of the food item |
| `business` | text | Name of the business |
| `original_price` | numeric | Original price |
| `surplus_price` | numeric | Discounted surplus price |
| `quantity` | integer | Number of items available |
| `pickup` | text | Pickup information |
| `emoji` | text | Emoji shown with the listing |
| `distance` | numeric | Approximate distance in km |
| `created_at` | timestamptz | Time when the listing was created |

`id` is generated automatically, while `created_at` uses the current time by default.

## Running the project locally

You need Node.js and npm installed.

1. Clone the repository.

```bash
git clone https://github.com/aryankantak/Bit-N-Build-Hackathon.git
```

2. Open the project folder.

```bash
cd Bit-N-Build-Hackathon
```

3. Install the dependencies.

```bash
npm install
```

4. Start the development server.

```bash
npm run dev
```

5. Open the local address shown by Vite in your browser.

For Codespaces or another remote development environment, you can run:

```bash
npm run dev -- --host 0.0.0.0
```

Then open the forwarded Vite port.

## Supabase setup

The frontend is connected to the project's Supabase REST API.

The application uses:

- Supabase project URL
- Supabase publishable key
- REST API endpoint for the `listings` table

The publishable key is intended for use in frontend applications. Database security is handled through Supabase Row Level Security policies.

For a production version, access policies should be made more restrictive and user authentication should be added before allowing public users to create or modify data.

## Project structure

```text
Bit-N-Build-Hackathon/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
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

## Why this project matters

Food waste is not only an environmental problem. It also means that businesses lose money on food that could still be useful.

Surplus Marketplace tries to solve both problems with a simple marketplace model. Businesses get a chance to recover some value from their unsold food, while customers get access to food at reduced prices.

## Current limitations

This is a hackathon prototype, so some parts are intentionally kept simple.

- Authentication is not implemented yet.
- Reservations are currently handled on the frontend and are not stored in the database.
- Payment processing is not implemented.
- Distance is currently provided as listing data rather than calculated from live location.
- There is no dedicated admin dashboard yet.
- The current RLS setup is suitable for the prototype but should be tightened for a real production system.

## Future improvements

Some features we would like to add in a future version are:

- User and business authentication
- A proper reservations table
- Online payments
- Live location and map integration
- Notifications for new or expiring listings
- Business dashboard and analytics
- Automatic listing expiry
- Better inventory management
- Smarter recommendations based on customer preferences and location

## AI / ML

AI or machine learning is **not currently used in the working implementation**.

In the future, AI/ML could be used for things such as demand prediction, personalised food recommendations, or helping businesses estimate how much surplus they are likely to have.

## Team

Build n Bit
Aryan Kantak 
Arnav Naik 
Aditi Dessai 
Aditya Gupta 

## License

This project was created for hackathon and educational purposes.
