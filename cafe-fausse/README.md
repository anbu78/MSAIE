# Café Fausse — Web Application

A full-stack web application for Café Fausse, a fine-dining Italian
restaurant: a React (JSX) front-end, a Flask REST API back-end, and a
PostgreSQL database for reservations and newsletter signups. Built to meet
the project's Software Requirements Specification (SRS).

## Features

- **Home** — restaurant name, address/phone/hours, and navigation (FR-1–FR-4)
- **Menu** — categorized menu (Starters, Main Courses, Desserts, Beverages)
  with descriptions and prices (FR-5)
- **Reservations** — a validated form (name, email, optional phone, date/time,
  guest count) that calls the Flask API, which checks availability and
  randomly assigns one of 30 tables, or returns a "fully booked" error
  (FR-6–FR-9, FR-18)
- **About Us** — restaurant history, mission, and founder bios (FR-10, FR-11)
- **Gallery** — image grid with a lightbox for enlarged viewing, plus awards
  and customer reviews (FR-12–FR-14)
- **Newsletter signup** — email-validated signup form in the site footer,
  persisted to the database (FR-15, FR-16)
- Responsive design using CSS Grid/Flexbox throughout (NFR-7, NFR-8)

## Tech Stack

| Layer    | Technology                                   |
|----------|-----------------------------------------------|
| Frontend | React 19 + JSX, Vite, React Router            |
| Backend  | Flask 3, Flask-SQLAlchemy, Flask-CORS         |
| Database | PostgreSQL                                    |

## Project Structure

```
cafe-fausse/
├── backend/
│   ├── app.py              # Flask app factory + entrypoint
│   ├── config.py           # Env-driven configuration
│   ├── extensions.py       # SQLAlchemy instance
│   ├── models.py           # Customer & Reservation models (FR-17)
│   ├── routes/
│   │   ├── reservations.py # POST /api/reservations (FR-6–FR-9, FR-18)
│   │   └── newsletter.py   # POST /api/newsletter (FR-15, FR-16)
│   ├── seed.py              # Creates DB tables
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── public/images/        # Restaurant photography used across pages
    ├── src/
    │   ├── pages/            # Home, Menu, Reservations, AboutUs, Gallery
    │   ├── components/       # Navbar, Footer, NewsletterSignup, Lightbox
    │   ├── data/              # Static content: menu, gallery, restaurant info
    │   └── api.js             # Fetch wrapper for the Flask API
    └── vite.config.js         # Dev proxy: /api -> http://localhost:5001
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL running locally (or accessible via a connection string)

## Local Setup

### 1. Database

Create a role and database (adjust names/password as desired):

```bash
psql postgres -c "CREATE ROLE cafe_fausse WITH LOGIN PASSWORD 'cafe_fausse';"
psql postgres -c "CREATE DATABASE cafe_fausse OWNER cafe_fausse;"
```

### 2. Backend (Flask API)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # then edit DATABASE_URL if needed
python seed.py                  # creates the customers/reservations tables
python app.py                   # runs on http://localhost:5001
```

> **Note:** The app runs on port **5001**, not Flask's default 5000, because
> macOS's AirPlay Receiver service commonly occupies port 5000. You can
> change this in `app.py` and `frontend/vite.config.js` if you prefer a
> different port.

### 3. Frontend (React)

In a separate terminal:

```bash
cd frontend
npm install
npm run dev                     # runs on http://localhost:5173
```

Open http://localhost:5173 in your browser. API calls from the front-end are
proxied to the Flask server automatically in development (see
`vite.config.js`).

### 4. Production build

```bash
cd frontend
npm run build                   # outputs static assets to frontend/dist
```

Serve `frontend/dist` with any static file host, and run the Flask app with
a production WSGI server (e.g. `gunicorn app:app`) behind a reverse proxy.
Set `CORS_ORIGINS` in the backend's environment to the deployed frontend
origin, and `VITE_API_BASE_URL` for the frontend build if the API is hosted
on a different origin.

## API Reference

### `POST /api/reservations`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "555-1234",
  "guests": 4,
  "time_slot": "2026-11-01T19:00"
}
```

- `201` on success, with the assigned `table_number`.
- `400` if required fields are missing/invalid.
- `409` if all 30 tables are booked for that exact time slot.

### `POST /api/newsletter`

```json
{ "email": "subscriber@example.com" }
```

- `201` on success (creates or updates the customer's `newsletter_signup`
  flag).
- `400` if the email is missing/invalid.

### `GET /api/health`

Simple liveness check, returns `{"status": "ok"}`.

## Design Notes

- **Random table assignment**: On each reservation request, the backend
  queries all reservations for the exact requested time slot, computes the
  set of unbooked table numbers (1–30), and picks one at random
  (`random.choice`). A unique database constraint on `(time_slot,
  table_number)` provides a second line of defense against double-booking
  under concurrent requests (NFR-5).
- **Newsletter + reservations share one `Customers` table**, matching the
  SRS schema (FR-17): a customer created via a reservation can later be
  flagged for the newsletter (or vice versa) without duplicate rows, keyed
  by email.
- **Images**: `frontend/public/images/` contains AI-generated, royalty-free
  restaurant photography used for the home page hero and gallery. Add more
  images to `frontend/src/data/gallery.js` as additional photography becomes
  available.

## Testing Notes

The reservation and newsletter endpoints were manually verified end-to-end
against a local PostgreSQL database, including:
- Successful reservation creation and random table assignment.
- Email format validation (both client-side and server-side).
- Fully booking all 30 tables for one time slot and confirming the 31st
  request correctly returns a `409 fully booked` error.
- Newsletter signup writing to, and updating, the `customers` table.

See `ai-tooling.md` for details on how AI tooling was used to build and
verify this project.
