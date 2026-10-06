from datetime import datetime, timezone

from extensions import db


class Customer(db.Model):
    """SRS FR-17: Customers Table — Customer ID, Customer Name, Email Address,
    Phone Number, Newsletter Signup."""

    __tablename__ = "customers"

    customer_id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    phone_number = db.Column(db.String(30), nullable=True)
    newsletter_signup = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    reservations = db.relationship(
        "Reservation", backref="customer", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "customer_id": self.customer_id,
            "customer_name": self.customer_name,
            "email": self.email,
            "phone_number": self.phone_number,
            "newsletter_signup": self.newsletter_signup,
        }


class Reservation(db.Model):
    """SRS FR-17: Reservations Table — Reservation ID, Customer ID, Time Slot,
    Table Number."""

    __tablename__ = "reservations"

    reservation_id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(
        db.Integer, db.ForeignKey("customers.customer_id"), nullable=False
    )
    time_slot = db.Column(db.DateTime, nullable=False, index=True)
    table_number = db.Column(db.Integer, nullable=False)
    guests = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        # Data integrity: the same physical table cannot be double-booked for
        # the same time slot (SRS NFR-5).
        db.UniqueConstraint("time_slot", "table_number", name="uq_timeslot_table"),
    )

    def to_dict(self):
        return {
            "reservation_id": self.reservation_id,
            "customer_id": self.customer_id,
            "time_slot": self.time_slot.isoformat(),
            "table_number": self.table_number,
            "guests": self.guests,
        }
