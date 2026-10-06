import random
import re
from datetime import datetime, timedelta

from flask import Blueprint, current_app, jsonify, request
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import Customer, Reservation

reservations_bp = Blueprint("reservations", __name__)

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

MAX_PARTY_SIZE = 6

# Business hours per SRS FR-2: Monday–Saturday 5:00 PM–11:00 PM,
# Sunday 5:00 PM–9:00 PM. Keyed by Python's weekday() (Monday=0 ... Sunday=6)
# as (open_hour, close_hour) in 24-hour time. The closing hour is exclusive —
# it's the last moment the kitchen is open, not a bookable reservation time.
BUSINESS_HOURS = {
    0: (17, 23),  # Monday
    1: (17, 23),  # Tuesday
    2: (17, 23),  # Wednesday
    3: (17, 23),  # Thursday
    4: (17, 23),  # Friday
    5: (17, 23),  # Saturday
    6: (17, 21),  # Sunday
}


def parse_time_slot(raw_value):
    """Parse an ISO-ish datetime string (e.g. from <input type=datetime-local>).

    Returns (datetime_or_None, error_message_or_None). The browser's
    datetime-local input always submits a naive local timestamp
    ("YYYY-MM-DDTHH:MM"), but a direct API caller could send a
    timezone-aware ISO string (e.g. with a "+00:00" or "Z" suffix). Comparing
    a naive and an aware datetime raises a TypeError, which previously
    surfaced as an unhandled 500 error. We don't currently track a
    restaurant timezone, so we reject timezone-aware input explicitly with a
    clear validation message instead (FR-7, NFR-6).
    """
    if not isinstance(raw_value, str) or not raw_value:
        return None, "A valid date and time is required."
    try:
        parsed = datetime.fromisoformat(raw_value)
    except ValueError:
        return None, "A valid date and time is required."
    if parsed.tzinfo is not None:
        return None, (
            "time_slot must be a local date and time without timezone "
            "information (e.g. 2026-12-15T19:00)."
        )
    if parsed.minute % 15 or parsed.second or parsed.microsecond:
        return None, "Choose a time on the quarter hour (:00, :15, :30, or :45)."
    return parsed, None


def business_hours_error(time_slot):
    """Returns an error message if time_slot falls outside Café Fausse's
    posted hours (SRS FR-2), or None if it's valid. Enforced server-side so
    the rule holds even if a client bypasses the front-end form."""
    open_hour, close_hour = BUSINESS_HOURS[time_slot.weekday()]
    slot_minutes = time_slot.hour * 60 + time_slot.minute
    if not (open_hour * 60 <= slot_minutes < close_hour * 60):
        day_name = time_slot.strftime("%A")
        return (
            f"Café Fausse is closed at that time on {day_name}. "
            f"We're open {open_hour % 12 or 12}:00 {'AM' if open_hour < 12 else 'PM'}"
            f"–{close_hour % 12 or 12}:00 {'AM' if close_hour < 12 else 'PM'}."
        )
    return None


@reservations_bp.route("/api/reservations", methods=["POST"])
def create_reservation():
    """SRS FR-6 through FR-9, FR-18: validate the request, find or create the
    customer, assign a random available table for the time slot, and persist
    the reservation. Returns 201 + table number on success, or 409 with an
    error message if the time slot is fully booked.
    """
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Request body must be a JSON object."}), 400

    # Validate types before string operations and lengths before database writes.
    field_errors = {}
    for field, limit in (("name", 120), ("email", 255), ("phone", 30)):
        value = payload.get(field)
        if value is not None and not isinstance(value, str):
            field_errors[field] = f"{field.capitalize()} must be text."
        elif isinstance(value, str) and len(value.strip()) > limit:
            field_errors[field] = f"{field.capitalize()} must be {limit} characters or fewer."
    if field_errors:
        return jsonify({"error": "Invalid reservation request.", "fields": field_errors}), 400

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

    time_slot, time_slot_error = parse_time_slot(time_slot_raw)
    if time_slot_error:
        errors["time_slot"] = time_slot_error
    elif time_slot < datetime.now() - timedelta(minutes=1):
        errors["time_slot"] = "Please choose a date and time in the future."
    else:
        hours_error = business_hours_error(time_slot)
        if hours_error:
            errors["time_slot"] = hours_error

    # Require a whole number of guests — do NOT silently truncate fractional
    # values (e.g. 1.5 must be rejected, not quietly booked as 1).
    try:
        if isinstance(guests, bool):
            raise ValueError
        guests_value = float(guests)
    except (TypeError, ValueError, OverflowError):
        errors["guests"] = "Number of guests must be a whole number."
        guests = None
    else:
        if not guests_value.is_integer():
            errors["guests"] = "Number of guests must be a whole number (no fractions)."
            guests = None
        else:
            guests = int(guests_value)
            if guests < 1:
                errors["guests"] = "At least 1 guest is required."
                guests = None
            elif guests > MAX_PARTY_SIZE:
                errors["guests"] = (
                    f"Each reservation allows up to {MAX_PARTY_SIZE} guests. "
                    "Submit another reservation for an additional table."
                )
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
