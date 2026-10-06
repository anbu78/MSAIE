# Café Fausse — Demo Presentation Script
### Presenters: Kavitha, Balaji, Anbu | Target length: ~8–9 minutes

This script is written to satisfy the assignment's presentation requirements:
- All three of you must be on camera for the whole recording, and **everyone must speak at least once**.
- At the start, **each person shows a government-issued ID to the camera and states their name**.
- You must demo: all 5+ pages and navigation, the newsletter signup, the reservation system, and **the effect on the backend database shown directly** (via `psql`, not an admin page).
- You must discuss your **implementation decisions**.
- Share your **screen directly** (not via "Invite People").

Before recording, have ready:
1. The frontend running at `http://localhost:5173` (`npm run dev` in `frontend/`)
2. The backend running at `http://localhost:5001` (`python app.py` in `backend/`, venv activated)
3. A terminal window with `psql cafe_fausse` ready to run, **but not yet connected** (so the audience sees you query it live)
4. The database cleared of old test rows so the demo is clean:
   ```bash
   psql cafe_fausse -c "TRUNCATE reservations, customers RESTART IDENTITY CASCADE;"
   ```

---

## 0:00–0:45 — Opening & ID Verification

**[All three on camera together. Each person holds up their ID clearly, then states their name.]**

**Kavitha:** "Hi, I'm Kavitha." *(hold ID to camera for a couple seconds)*

**Balaji:** "Hi, I'm Balaji." *(hold ID to camera)*

**Anbu:** "Hi, I'm Anbu." *(hold ID to camera)*

**Kavitha:** "Today we're presenting our project for the Web Application and Interface Design course: a full-stack website for Café Fausse, a fine-dining restaurant. We'll walk through the site, show the reservation and newsletter systems working end-to-end, and show the effect on our backend database directly. Let's get started."

**[Switch to screen share now.]**

---

## 0:45–1:30 — Project & Tech Stack Overview

**Kavitha:** "Café Fausse needed a new website that could show off their menu, their story, and their gallery — and solve a real operational problem: the owner was fielding too many phone calls for table reservations. So we built a complete reservation system behind the site."

"On the tech side, we followed the SRS requirements exactly: a React front-end built with JSX, using Vite as our build tool and React Router for navigation; a Flask REST API on the back-end; and a PostgreSQL database with two tables — Customers and Reservations — exactly as specified. Styling is done with CSS Grid and Flexbox for full responsiveness."

---

## 1:30–3:00 — Site Tour: All 5 Pages & Navigation

**[Navigate live through the site as you narrate.]**

**Kavitha:** "Let's start on the Home page." *(click Home / show hero section)* "It has the restaurant name front and center, the address, phone number, and hours, and navigation links to every other page — that covers our Home page requirements."

*(click Menu)* "Here's the Menu page, segmented into Starters, Main Courses, Desserts, and Beverages, each with a description and price, pulled directly from the SRS."

**Balaji:** *(click About Us)* "This is the About Us page — it tells Café Fausse's history, founded in 2010 by Chef Antonio Rossi and restaurateur Maria Lopez, along with their bios and the restaurant's commitment to quality and locally sourced ingredients."

*(click Gallery)* "And here's the Gallery page. It showcases the restaurant's interior, a private event, and one of our signature dishes. Clicking any image opens a lightbox for an enlarged view." *(click an image to demonstrate the lightbox, then close it)* "Below the gallery we also show our awards — Culinary Excellence Award, Restaurant of the Year — and two customer reviews."

**Balaji:** "And if you scroll to the footer on any page, you'll see the newsletter signup form and the restaurant's contact details — that's consistent site-wide."

---

## 3:00–4:00 — Newsletter Signup Demo

**Balaji:** "Let's demo the newsletter signup first, since it's the simpler of our two backend features." *(scroll to footer, click into the email field)* "I'll type in an email address." *(type e.g. `balaji.demo@example.com`)* "The form validates that it's a properly formatted email before it will submit." *(click Sign Up)* "And you can see it confirms the subscription right here in the UI."

*(Optional quick negative test)* "Let's also show what happens with an invalid email." *(type `not-an-email`, click Sign Up)* "It correctly rejects it without even hitting the server."

---

## 4:00–6:30 — Reservation System Demo

**Anbu:** "Now the core feature of this project — the reservation system. This had to satisfy a few requirements: it needs a date/time, number of guests, name, email, and an optional phone number; it has to check real-time availability; and if a table is available, it randomly assigns one of our 30 physical tables."

*(Navigate to Reservations page)* "Let's fill this out." *(fill in Name, Email, Phone optional, pick a Date & Time, set Guests)* "I'll submit this." *(click Book Table)* "And you can see we get a confirmation message with the specific table number that was randomly assigned — in this case, table number [X]."

**Anbu:** "Now let's prove the 'fully booked' logic actually works, not just the happy path. I have a small script that books the remaining 29 tables for that exact same time slot." *(run the pre-prepared script/loop in a terminal — see Appendix A below — or narrate that it was already tested)* "Now if I try to book a 31st reservation for that same time slot..." *(submit one more reservation request for the same time)* "...the system correctly tells us the time slot is fully booked, and suggests picking another time. That satisfies our requirement that the reservation system must prevent overbooking."

---

## 6:30–7:30 — Verify the Database Directly

**Anbu:** "Per the requirements, we need to show the actual effect on our backend database — not through an admin screen, but directly." *(switch to terminal, run `psql cafe_fausse`)*

```sql
SELECT customer_id, customer_name, email, phone_number, newsletter_signup FROM customers;
```

"You can see the customer records we just created — including Balaji's newsletter signup with `newsletter_signup` set to true, and the customers who made reservations."

```sql
SELECT reservation_id, customer_id, time_slot, table_number, guests FROM reservations WHERE time_slot = '<the time slot you booked>';
```

"And here are all 30 reservations for that time slot — one row per table, numbers 1 through 30, each tied back to a customer. This proves the random table assignment and the booking limit are both enforced at the database level, not just in the UI."

---

## 7:30–8:30 — Implementation Decisions

**Kavitha:** "A few implementation decisions worth calling out. We used Vite instead of Create React App for a faster, simpler React + JSX setup with no extra configuration needed."

**Kavitha:** "On styling, the SRS asked us to use either Flexbox or Grid — we actually used both, deliberately, for different jobs. We use CSS Grid for the page-level, multi-column content: the menu categories, the gallery photo grid, the About Us founder cards, and the two-column layout on the Reservations page. Then we use Flexbox for one-dimensional component alignment — the navbar, the newsletter and reservation form rows, the lightbox centering, and the overall sticky footer layout. So it's Grid for two-dimensional layout, Flexbox for one-dimensional alignment — the standard, intentional way to combine the two, not an inconsistency."

**Balaji:** "On the backend, we structured the Flask app with an application factory and blueprints, so the reservations and newsletter logic are in separate, independently testable modules. We used Flask-SQLAlchemy so our database models map directly onto the Customers and Reservations tables from the SRS."

**Anbu:** "For data integrity, we didn't just rely on checking availability before inserting a reservation — we also added a unique database constraint on time slot plus table number, so even under concurrent requests, two customers can never be assigned the same table at the same time. And we used AI-assisted tooling, specifically Cursor, to scaffold the project quickly and to verify our logic end-to-end against a real local Postgres database before this recording — details are in our `ai-tooling.md` file in the repo."

---

## 8:30–9:00 — Closing

**Kavitha:** "That covers all five pages, the newsletter signup, the full reservation flow including the fully-booked edge case, and the database effects behind both features."

**Balaji:** "Thanks for watching!"

**Anbu:** "Thank you!"

**[End recording.]**

---

## Appendix A — Quickly Filling Remaining Tables for the Demo

To make the "fully booked" demo fast, you can pre-fill 29 of the 30 tables for your chosen time slot in a terminal **before** recording that segment (keep the terminal visible so it's clear this is really hitting your API):

```bash
# Replace the time with whatever slot you plan to demo
SLOT="2026-12-15T19:30"
for i in $(seq 1 29); do
  curl -s -X POST http://127.0.0.1:5001/api/reservations \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Guest $i\",\"email\":\"guest$i@example.com\",\"guests\":2,\"time_slot\":\"$SLOT\"}" > /dev/null
done
echo "29 tables booked for $SLOT — one slot remaining."
```

Then, live on camera, submit **one real reservation through the UI** (the 30th, which should succeed) and **one more** (the 31st, which should fail with "fully booked"). This shows the real UI flow for both outcomes while keeping the demo short.

## Appendix B — Resetting Before You Record

```bash
psql cafe_fausse -c "TRUNCATE reservations, customers RESTART IDENTITY CASCADE;"
```

Run this right before you hit record so your database queries during the demo only show data from this take.

## Appendix C — Speaking Time Checklist

| Segment | Speaker(s) | Approx. time |
|---|---|---|
| Intro + ID | All three | 0:45 |
| Overview | Kavitha | 0:45 |
| Site tour | Kavitha, Balaji | 1:30 |
| Newsletter demo | Balaji | 1:00 |
| Reservation demo | Anbu | 2:30 |
| Database verification | Anbu | 1:00 |
| Implementation decisions | Kavitha, Balaji, Anbu | 1:00 |
| Closing | All three | 0:30 |
| **Total** | | **~9:00** |

Everyone speaks multiple times, which comfortably satisfies the "all members must speak at least once" requirement while keeping the whole recording within the 5–10 minute window.
