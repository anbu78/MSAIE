"""Optional helper: creates database tables.

Run with:
    python seed.py

This is idempotent — it only creates tables that don't already exist. It does
not insert sample data, since the SRS reservation/newsletter tables are meant
to be populated by real user interactions through the web app.
"""

from app import create_app
from extensions import db

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
        print("Database tables created (or already present).")
