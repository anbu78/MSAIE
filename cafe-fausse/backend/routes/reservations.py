import random
import re
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import Customer, Reservation

reservations_bp = Blueprint("reservations", __name__)

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def parse_time_slot(raw_value):
    """Parse an ISO-ish datetime string (e.g. from <input type=datetime-local>)."""
    if not raw_value:
        return None
    try:
        # datetime-local inputs produce "YYYY-MM-DDTHH:MM" (no timezone/seconds).
        return datetime.fromisoformat(raw_value)
    except ValueError:
        return None


@reservations_bp.route("/api/reservations", methods=["POST"])
def create_reservation():
    """SRS FR-6 through FR-9, FR-18: validate the request, find or create the
    customer, assign a random available table for the time slot, and persist
    the reservation. Returns 201 + table number on success, or 409 with an
    error message if the time slot is fully booked.
    """
    payload = request.get_json(silent=True) or {}

    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    phone = (payload.get("phone") or "").strip() or None
    guests = payload.get("guests")
    time_slot_raw = payload.get("time_slot")

    errors = {}
    if not name:
        errors["name"] = "Customer name is required."
    if not email or not EMAIL_REGEX.match(email):
        errors["email"] = "A valid email address is required."

    time_slot = parse_time_slot(time_slot_raw)
    if not time_slot:
        errors["time_slot"] = "A valid date and time is required."

    try:
        guests = int(guests)
        if guests < 1:
            raise ValueError
    except (TypeError, ValueError):
        errors["guests"] = "Number of guests must be a positive integer."
        guests = None

    if errors:
        return jsonify({"error": "Invalid reservation request.", "fields": errors}), 400

    total_tables = current_app.config["TOTAL_TABLES"]

    # FR-7: Determine which tables are already booked for this exact time slot.
    booked_tables = {
        r.table_number
        for r in Reservation.query.filter_by(time_slot=time_slot).all()
    }
    available_tables = [t for t in range(1, total_tables + 1) if t not in booked_tables]

    if not available_tables:
        return (
            jsonify(
                {
                    "error": (
                        "Sorry, that time slot is fully booked. "
                        "Please choose another time."
                    )
                }
            ),
            409,
        )

    # FR-8: Assign a random available table.
    assigned_table = random.choice(available_tables)

    # FR-18: Insert/update the customer record.
    customer = Customer.query.filter_by(email=email).first()
    if customer is None:
        customer = Customer(customer_name=name, email=email, phone_number=phone)
        db.session.add(customer)
    else:
        customer.customer_name = name or customer.customer_name
        customer.phone_number = phone or customer.phone_number

    db.session.flush()  # Populate customer.customer_id without committing yet.

    reservation = Reservation(
        customer_id=customer.customer_id,
        time_slot=time_slot,
        table_number=assigned_table,
        guests=guests,
    )
    db.session.add(reservation)

    try:
        db.session.commit()
    except IntegrityError:
        # Extremely unlikely race condition: another request grabbed the same
        # table for the same slot between our check and commit. Fail safely
        # with a clear message rather than double-booking (NFR-5).
        db.session.rollback()
        return (
            jsonify(
                {
                    "error": (
                        "That table was just booked by someone else. "
                        "Please try again."
                    )
                }
            ),
            409,
        )

    return (
        jsonify(
            {
                "message": "Reservation confirmed.",
                "reservation": reservation.to_dict(),
                "table_number": assigned_table,
            }
        ),
        201,
    )
