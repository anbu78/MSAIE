# MSAIE

This repository holds coursework projects for the MS in AI Engineering
program. Each project lives in its own top-level folder.

## Projects

### [`cafe-fausse/`](./cafe-fausse) — Web Application & Interface Design

A full-stack web application for **Café Fausse**, a fine-dining restaurant:
a React (JSX) front-end, a Flask REST API back-end, and a PostgreSQL
database for table reservations and newsletter signups.

**Team:** You, Balaji, Anbu

#### Quick start (for teammates)

You'll need: **Node.js 18+**, **Python 3.10+**, and **PostgreSQL** installed
locally.

```bash
# 1. Clone the repo
git clone https://github.com/userkavitha/MSAIE.git
cd MSAIE/cafe-fausse

# 2. Create the local database
psql postgres -c "CREATE ROLE cafe_fausse WITH LOGIN PASSWORD 'cafe_fausse';"
psql postgres -c "CREATE DATABASE cafe_fausse OWNER cafe_fausse;"

# 3. Backend setup (Flask + PostgreSQL) — in one terminal
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # edit DATABASE_URL if your local setup differs
python seed.py                  # creates the customers/reservations tables
python app.py                   # runs on http://localhost:5001

# 4. Frontend setup (React + Vite) — in a second terminal
cd frontend
npm install
npm run dev                     # runs on http://localhost:5173
```

Then open **http://localhost:5173** in your browser. The front-end
automatically proxies API calls to the Flask server during development.

> **Note:** the Flask app runs on port `5001` instead of the default `5000`
> because macOS's AirPlay Receiver commonly occupies port `5000`.

For full details — project structure, API reference, implementation notes,
and testing notes — see [`cafe-fausse/README.md`](./cafe-fausse/README.md).

Other useful files in that folder:
- [`cafe-fausse/ai-tooling.md`](./cafe-fausse/ai-tooling.md) — summary of AI tooling used to build this project
- [`cafe-fausse/staging.md`](./cafe-fausse/staging.md) — deployment/staging notes
- [`cafe-fausse/PRESENTATION_SCRIPT.md`](./cafe-fausse/PRESENTATION_SCRIPT.md) — demo presentation script for the group recording

#### Working as a team

- Pull before you start working: `git pull`
- Create a branch per change: `git checkout -b your-name/short-description`
- Open a PR into `main` rather than pushing directly, so the other two can review
- Don't commit your local `.env` file (it's git-ignored) — each teammate should
  copy `backend/.env.example` to `backend/.env` locally
