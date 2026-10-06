import re

from flask import Blueprint, jsonify, request

from extensions import db
from models import Customer

newsletter_bp = Blueprint("newsletter", __name__)

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


@newsletter_bp.route("/api/newsletter", methods=["POST"])
def signup_newsletter():
    """SRS FR-15, FR-16: validate email format and persist the signup to the
    Customers table (newsletter_signup = True). If the email already belongs
    to an existing customer (e.g. from a prior reservation), simply flags
    that record for the newsletter instead of creating a duplicate.
    """
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Request body must be a JSON object."}), 400
    for field, limit in (("email", 255), ("name", 120)):
        value = payload.get(field)
        if value is not None and not isinstance(value, str):
            return jsonify({"error": f"{field.capitalize()} must be text."}), 400
        if isinstance(value, str) and len(value.strip()) > limit:
            return jsonify({"error": f"{field.capitalize()} must be {limit} characters or fewer."}), 400
    email = (payload.get("email") or "").strip().lower()
    name = (payload.get("name") or "").strip() or "Newsletter Subscriber"

    if not email or not EMAIL_REGEX.match(email):
        return jsonify({"error": "A valid email address is required."}), 400

    customer = Customer.query.filter_by(email=email).first()
    if customer is None:
        customer = Customer(customer_name=name, email=email, newsletter_signup=True)
        db.session.add(customer)
    else:
        customer.newsletter_signup = True

    db.session.commit()

    return (
        jsonify({"message": "Subscribed to the newsletter.", "customer": customer.to_dict()}),
        201,
    )
