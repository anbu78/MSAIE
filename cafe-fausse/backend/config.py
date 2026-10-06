import os

from dotenv import load_dotenv

load_dotenv()

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    """Base Flask configuration, driven by environment variables (see .env.example)."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")

    # Example: postgresql+psycopg2://cafe_fausse:password@localhost:5432/cafe_fausse
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql+psycopg2://cafe_fausse:cafe_fausse@localhost:5432/cafe_fausse",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Total number of physical tables in the restaurant (SRS FR-8, FR-18).
    TOTAL_TABLES = int(os.environ.get("TOTAL_TABLES", 30))

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
