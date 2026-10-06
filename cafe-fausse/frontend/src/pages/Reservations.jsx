import { useState } from 'react';
import { createReservation } from '../api';
import './Reservations.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PARTY_SIZE = 20;

// Mirrors the backend's BUSINESS_HOURS (SRS FR-2): Monday–Saturday
// 5:00 PM–11:00 PM, Sunday 5:00 PM–9:00 PM. Keyed by Date#getDay()
// (Sunday=0 ... Saturday=6) as [openHour, closeHour] in 24-hour time.
const BUSINESS_HOURS = {
  0: [17, 21], // Sunday
  1: [17, 23], // Monday
  2: [17, 23], // Tuesday
  3: [17, 23], // Wednesday
  4: [17, 23], // Thursday
  5: [17, 23], // Friday
  6: [17, 23], // Saturday
};

const initialForm = {
  name: '',
  email: '',
  phone: '',
  guests: 2,
  timeSlot: '',
};

function getMinDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function businessHoursError(timeSlotValue) {
  // `timeSlotValue` is "YYYY-MM-DDTHH:MM" from <input type="datetime-local">,
  // parsed as local time so it matches BUSINESS_HOURS without timezone drift.
  const date = new Date(timeSlotValue);
  if (Number.isNaN(date.getTime())) return null;

  const [openHour, closeHour] = BUSINESS_HOURS[date.getDay()];
  const slotMinutes = date.getHours() * 60 + date.getMinutes();
  if (slotMinutes < openHour * 60 || slotMinutes >= closeHour * 60) {
    const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
    const fmt = (h) => `${h % 12 || 12}:00 ${h < 12 ? 'AM' : 'PM'}`;
    return `We're closed at that time on ${dayName}. Open ${fmt(openHour)}–${fmt(closeHour)}.`;
  }
  return null;
}

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!EMAIL_REGEX.test(form.email.trim())) errors.email = 'Enter a valid email address.';

  if (!form.timeSlot) {
    errors.timeSlot = 'Select a date and time.';
  } else if (new Date(form.timeSlot).getTime() < Date.now()) {
    errors.timeSlot = 'Please choose a date and time in the future.';
  } else {
    const hoursError = businessHoursError(form.timeSlot);
    if (hoursError) errors.timeSlot = hoursError;
  }

  const guestsNum = Number(form.guests);
  if (!form.guests || Number.isNaN(guestsNum)) {
    errors.guests = 'Number of guests is required.';
  } else if (!Number.isInteger(guestsNum)) {
    errors.guests = 'Number of guests must be a whole number (no fractions).';
  } else if (guestsNum < 1) {
    errors.guests = 'At least 1 guest is required.';
  } else if (guestsNum > MAX_PARTY_SIZE) {
    errors.guests = `For parties over ${MAX_PARTY_SIZE}, please call us directly.`;
  }
  return errors;
}

function Reservations() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [resultMessage, setResultMessage] = useState('');
  const [confirmedTable, setConfirmedTable] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatus('idle');
      return;
    }

    setStatus('submitting');
    setResultMessage('');
    setConfirmedTable(null);

    try {
      const response = await createReservation({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        guests: Number(form.guests),
        time_slot: form.timeSlot,
      });

      // Build the confirmation from the server's saved reservation record
      // (not the raw client-side form value), so the message always reflects
      // exactly what was persisted to the database.
      const saved = response.reservation;
      setStatus('success');
      setConfirmedTable(saved.table_number);
      setResultMessage(
        `You're booked! Table #${saved.table_number} is reserved for ${saved.guests} guest(s).`
      );
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      setResultMessage(
        err.message || 'That time slot is fully booked. Please choose another time.'
      );
    }
  };

  return (
    <div className="reservations-page">
      <section className="section">
        <div className="container section__header">
          <p className="section__eyebrow">Reservations</p>
          <h1>Reserve Your Table</h1>
          <p>Tell us when you'd like to dine, and we'll take care of the rest.</p>
        </div>

        <div className="container reservations-layout">
          <form className="card reservation-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="name">Customer Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
              />
              {errors.name && <p className="form-field__error">{errors.name}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className="form-field__error">{errors.email}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="phone">Phone Number (optional)</label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="timeSlot">Date &amp; Time *</label>
                <input
                  id="timeSlot"
                  name="timeSlot"
                  type="datetime-local"
                  min={getMinDateTime()}
                  step="1800"
                  value={form.timeSlot}
                  onChange={handleChange}
                  required
                />
                <p className="form-field__hint">
                  Open Mon–Sat 5:00 PM–11:00 PM, Sun 5:00 PM–9:00 PM.
                </p>
                {errors.timeSlot && <p className="form-field__error">{errors.timeSlot}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="guests">Number of Guests *</label>
                <input
                  id="guests"
                  name="guests"
                  type="number"
                  min="1"
                  max="20"
                  step="1"
                  inputMode="numeric"
                  value={form.guests}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    // Block decimal point / comma entry outright, since
                    // fractional guest counts are never valid.
                    if (e.key === '.' || e.key === ',') e.preventDefault();
                  }}
                  required
                />
                {errors.guests && <p className="form-field__error">{errors.guests}</p>}
              </div>
            </div>

            <button type="submit" className="btn" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Checking availability…' : 'Book Table'}
            </button>

            {resultMessage && (
              <p
                className={`reservation-form__result reservation-form__result--${status}`}
                role="status"
              >
                {resultMessage}
              </p>
            )}
          </form>

          <aside className="card reservations-info">
            <h3>Good to Know</h3>
            <ul>
              <li>We hold 30 tables per seating; availability is checked in real time.</li>
              <li>Parties of more than 20 should call us directly at (202) 555-4567.</li>
              <li>Please arrive within 15 minutes of your reserved time.</li>
              <li>Need to cancel or modify? Call us or email reservations@cafefausse.com.</li>
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default Reservations;
