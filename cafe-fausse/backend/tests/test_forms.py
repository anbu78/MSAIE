"""Run from backend with: python -m unittest discover -s tests -v."""
import unittest
from datetime import datetime, timedelta

from app import create_app
from config import Config
from extensions import db
from models import Customer, Reservation


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


class FormTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.context = self.app.app_context()
        self.context.push()
        db.create_all()
        self.client = self.app.test_client()
        future = datetime.now() + timedelta(days=14)
        self.monday = (future + timedelta(days=-future.weekday())).date()
        self.sunday = self.monday + timedelta(days=6)
        self.payload = {
            "name": "Test Guest", "email": "guest@example.com", "guests": 2,
            "time_slot": f"{self.monday}T19:00",
        }

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.context.pop()

    def post(self, **changes):
        return self.client.post("/api/reservations", json=self.payload | changes)

    def test_non_object_bodies_are_validation_errors(self):
        for path in ("/api/reservations", "/api/newsletter"):
            for body in ([], [1], "text", 123, True, None):
                with self.subTest(path=path, body=body):
                    response = self.client.post(path, json=body)
                    self.assertEqual(response.status_code, 400)
                    self.assertIsNotNone(response.json.get("error"))
            self.assertEqual(self.client.post(path, data='{', content_type='application/json').status_code, 400)

    def test_malformed_reservation_field_types(self):
        for field in ("name", "email", "phone", "time_slot"):
            for value in (123, True, ["test"], {"value": "test"}):
                with self.subTest(field=field, value=value):
                    response = self.post(**{field: value})
                    self.assertEqual(response.status_code, 400)
                    self.assertIn(field, response.json["fields"])
        self.assertEqual(Customer.query.count(), 0)

    def test_newsletter_field_types_and_lengths(self):
        for field, value in (("email", []), ("name", 42), ("name", "x" * 121), ("email", "x" * 256)):
            with self.subTest(field=field):
                response = self.client.post('/api/newsletter', json={"email": "guest@example.com", field: value})
                self.assertEqual(response.status_code, 400)

    def test_text_length_limits(self):
        for field, limit in (("name", 120), ("email", 255), ("phone", 30)):
            with self.subTest(field=field):
                self.assertEqual(self.post(**{field: 'x' * (limit + 1)}).status_code, 400)

    def test_invalid_guest_counts(self):
        for guests in (True, False, 1.5, '1.5', 0, -1, 21, [], {}, None, 'NaN', 'Infinity'):
            with self.subTest(guests=guests):
                self.assertEqual(self.post(guests=guests).status_code, 400)

    def test_every_quarter_hour_within_weekday_and_sunday_hours(self):
        for date, closing in ((self.monday, 23), (self.sunday, 21)):
            for hour in range(17, closing):
                for minute in (0, 15, 30, 45):
                    with self.subTest(date=date, hour=hour, minute=minute):
                        response = self.post(time_slot=f"{date}T{hour:02}:{minute:02}")
                        self.assertEqual(response.status_code, 201)
                        self.assertEqual(response.json['reservation']['guests'], 2)

    def test_closed_hours_and_off_quarter_times(self):
        for slot in (f'{self.monday}T16:45', f'{self.monday}T23:00', f'{self.sunday}T21:00',
                     f'{self.sunday}T22:00', f'{self.monday}T19:01', f'{self.monday}T19:00:01',
                     f'{self.monday}T19:15:00.000001'):
            with self.subTest(slot=slot):
                self.assertEqual(self.post(time_slot=slot).status_code, 400)

    def test_timezone_and_past_dates(self):
        for slot in (f'{self.monday}T19:00Z', f'{self.monday}T19:00-05:00', '2000-01-01T19:00'):
            with self.subTest(slot=slot):
                self.assertEqual(self.post(time_slot=slot).status_code, 400)

    def test_capacity_and_unique_table_assignments(self):
        tables = set()
        for _ in range(30):
            response = self.post(phone=None)
            self.assertEqual(response.status_code, 201)
            tables.add(response.json['table_number'])
        self.assertEqual(tables, set(range(1, 31)))
        self.assertEqual(self.post().status_code, 409)
        self.assertEqual(Reservation.query.count(), 30)

    def test_newsletter_reuses_reservation_customer(self):
        self.assertEqual(self.post().status_code, 201)
        for _ in range(2):
            response = self.client.post('/api/newsletter', json={'email': 'GUEST@example.com'})
            self.assertEqual(response.status_code, 201)
        self.assertEqual(Customer.query.count(), 1)
        self.assertTrue(Customer.query.one().newsletter_signup)
