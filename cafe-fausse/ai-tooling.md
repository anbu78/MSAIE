# AI Tooling Summary

This document describes the AI-assisted development tooling used to build the
Café Fausse web application, per the assignment's submission requirements.

## Tool Used

**Cursor** (AI-based IDE with agentic coding capabilities) was used as the
primary — and only — development tool for this project.

## How It Was Used

1. **Requirements ingestion**: The SRS document
   (`Café Fausse Website Development SRS`) and the assignment brief were
   loaded directly into the agent. The agent read both PDFs and extracted the
   functional requirements (FR-1 through FR-18) and non-functional
   requirements (NFR-1 through NFR-9) before writing any code.
2. **Architecture planning**: Based on the SRS constraints (React/JSX
   front-end, Flask back-end, PostgreSQL database), the agent chose:
   - Vite as the React build tool/dev server (fast, minimal config, fully
     compatible with plain JSX — no TypeScript required by the SRS).
   - React Router for client-side navigation between the five required pages.
   - Flask application-factory pattern with Blueprints for modular route
     organization (`routes/reservations.py`, `routes/newsletter.py`).
   - Flask-SQLAlchemy as the ORM against PostgreSQL, matching the exact
     `Customers` / `Reservations` schema specified in FR-17.
3. **Full implementation**: The agent generated the entire codebase in one
   pass: all five React pages (Home, Menu, Reservations, About Us, Gallery),
   shared components (Navbar, Footer, Newsletter signup form, Lightbox), the
   Flask REST API (reservation creation with random table assignment and
   availability checking, newsletter signup with email validation), the
   SQLAlchemy models, and the CSS theme (Flexbox/Grid based, consistent
   branding).
4. **Local verification**: The agent set up a local PostgreSQL database,
   started the Flask server, and used `curl` to exercise every endpoint,
   including an edge-case test that filled all 30 tables for a single time
   slot to confirm the "fully booked" rejection path and `NFR-5` (no
   double-booking) actually works against the real database. It also started
   the Vite dev server and used a browser tool to visually confirm page
   rendering and navigation.
5. **Iteration**: Where issues came up during verification (e.g., macOS's
   AirPlay Receiver occupying port 5000, and the installed SQLAlchemy version
   defaulting to the `psycopg` v3 driver instead of `psycopg2`), the agent
   diagnosed the error from server logs/stack traces and corrected the
   configuration (switched Flask to port 5001, pinned the SQLAlchemy URI to
   the `postgresql+psycopg2://` dialect).

## What Worked Well

- Generating a complete, consistent full-stack scaffold (front-end, back-end,
  and DB schema) in a single coherent pass, directly traceable to specific
  SRS requirement IDs (comments in the code reference FR-#/NFR-# numbers).
- Automated end-to-end testing via terminal commands (curl + psql) caught a
  real environment issue (port conflict, driver mismatch) before a human ever
  had to debug it manually.
- Keeping business logic (random table assignment, availability checks,
  duplicate-booking protection via a DB unique constraint) isolated in a
  single, well-commented Flask route made it easy to verify correctness
  against the SRS line-by-line.

## What Didn't Work as Well / Required Manual Follow-up

- Initial placeholder gallery/hero images used generic stock photography
  (via Picsum) since no restaurant photography had been supplied yet. These
  were later swapped for AI-generated, royalty-free restaurant photography
  (dining room interior, private event setup, and a plated ribeye dish),
  which now power the home page hero and gallery grid.
- Local environment quirks (AirPlay Receiver on port 5000) are
  macOS-specific and wouldn't necessarily surface on another OS — this is a
  reminder to always verify ports are actually free rather than trusting
  framework defaults.
- The agent could not provision a shared/staging PostgreSQL instance; all
  verification was done against a local database created for this project.
