# AI Tooling Summary

This document describes the AI-assisted development tooling used to build the
Café Fausse web application, per the assignment's submission requirements.

## Tools Used

**Cursor** (AI-based IDE with agentic coding capabilities) was used as the
primary development tool for this project — used for requirements ingestion,
implementation, local verification, and iteration (see below).

**Codex** was additionally used for an independent code review pass after
the initial implementation was complete. Codex was given the running
application (React, Flask, and PostgreSQL) plus the assignment brief and
SRS, and asked to assess the project against the rubric's score-5 standard.
It produced a written review identifying concrete, reproducible bugs and
gaps rather than style opinions — see "Codex review and remediation" below
for what it found and how each item was addressed.

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

## Codex review and remediation

On October 6, 2026, the project (commit `d21ba75`) was independently
reviewed using **Codex** against the assignment brief, the SRS, and the
live running application. The review confirmed the core site, reservation
flow, and newsletter integration all work, and flagged six concrete issues
before a confident score-5 assessment could be made. Every finding below
was reproduced locally and fixed in this codebase:

1. **Missing behind-the-scenes gallery photography (FR-12).** The gallery
   had interior, event, and dish images but no kitchen/behind-the-scenes
   shot. *Fix:* added a new AI-generated kitchen/plating photo to
   `frontend/src/data/gallery.js` with descriptive alt text, using the
   existing lightbox behavior.
2. **Fractional guest counts were silently truncated.** Submitting `1.5`
   guests returned a success message for "1.5 guests" while the backend
   silently stored `1`, creating a mismatch between the confirmation and the
   database. *Fix:* both the React form (`Reservations.jsx`) and the Flask
   route (`routes/reservations.py`) now explicitly reject non-integer guest
   counts with a clear validation error instead of truncating, and the
   success message is now built from the server's saved reservation record
   rather than the raw client-side input.
3. **Reservation page overflowed at a 320px viewport (NFR-8).** Native
   `datetime-local` inputs have an intrinsic minimum width that can exceed a
   narrow phone's viewport inside a flex/grid layout. *Fix:* added
   `min-width: 0` to the relevant grid/flex containers and `width: 100%` to
   form inputs in `Reservations.css`, plus `overflow-wrap`/`word-break` for
   long unbroken text (e.g. the support email). Verified via a headless
   browser at an exact 320px viewport that `document.documentElement
   .scrollWidth` now equals `320` (previously larger).
4. **Lightbox keyboard/focus behavior.** Arrow keys could open a closed
   lightbox, and `Tab` while the lightbox was open could escape to
   background gallery buttons instead of staying in the dialog. *Fix:*
   rewrote `Lightbox.jsx` to (a) ignore navigation keys while closed, (b)
   move focus into the dialog on open and trap `Tab`/`Shift+Tab` within its
   buttons, (c) restore focus to the triggering thumbnail on close, and (d)
   add an accessible `aria-label` naming the current image. Verified via
   simulated keyboard events and real clicks in a headless browser.
5. **A timezone-aware timestamp crashed the API with a 500.** The
   reservation route compared a timezone-aware datetime to a naive
   `datetime.now()`, which raises an uncaught `TypeError` in Python. A
   standard browser form never sends this format, but a direct API call
   could. *Fix:* `parse_time_slot()` now explicitly rejects timezone-aware
   input with a clear `400` JSON validation error instead of crashing.
6. **README listed an outdated Node.js prerequisite.** The README said
   "Node.js 18+", but the installed Vite 8 / `@vitejs/plugin-react` 6
   declare `engines.node` as `^20.19.0 || >=22.12.0`. *Fix:* updated both
   mentions in `README.md` to the correct minimum versions.

Items the review flagged as still requiring manual verification before
submission (not code changes, and outside what an agent can confirm from a
local checkout) include: testing in Firefox/Safari/Edge, confirming the
SRS's page-load and form-processing time targets on an actual broadband
connection (not just localhost), and the presentation/submission checklist
(recording, live database verification, presenter ID/name, `quantic-grader`
collaborator access, and — if applicable — the signed Group Project
Agreement page).

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

## Follow-up implementation with Codex

Codex implemented the follow-up review fixes: strict JSON and field-type
validation for reservations and newsletter signup, precise Node prerequisites,
and a corrected team quick start. It also replaced the native combined
date/time input with a date picker and quarter-hour time dropdown restricted
to the restaurant's opening hours, with matching API validation. Regression
checks cover malformed input, closing-time boundaries, 15-minute options,
newsletter persistence, and reservation capacity.

Codex also implemented the requested 1–6 guest dropdown and matching API
limit, with guidance to submit separate reservations for additional tables.
Regression checks cover every allowed guest count and repeated bookings
by one customer for a 20-person group across four distinct tables.
