import { useEffect, useState } from 'react';
import { createReservation } from '../api';
import { getReservationTimes, localDateToday } from '../data/reservationTimes';
import './Reservations.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PARTY_SIZE = 20;

const initialForm = {
  name: '', email: '', phone: '', guests: 2, date: '', time: '',
};

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!EMAIL_REGEX.test(form.email.trim())) errors.email = 'Enter a valid email address.';

  if (!form.date) errors.date = 'Select a date.';
  if (!form.time) {
    errors.time = 'Select a time.';
  } else if (!getReservationTimes(form.date).some((slot) => slot.value === form.time)) {
    errors.time = 'Select an available quarter-hour time for this date.';
  } else if (new Date(`${form.date}T${form.time}`).getTime() <= Date.now()) {
    errors.time = 'Please choose a date and time in the future.';
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
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const timeOptions = getReservationTimes(form.date);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value, ...(name === 'date' ? { time: '' } : {}) }));
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

    try {
      const response = await createReservation({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        guests: Number(form.guests),
        time_slot: `${form.date}T${form.time}`,
      });

      // Build the confirmation from the server's saved reservation record
      // (not the raw client-side form value), so the message always reflects
      // exactly what was persisted to the database.
      const saved = response.reservation;
      setStatus('success');
      setResultMessage(
        `You're booked! Table #${saved.table_number} is reserved for ${saved.guests} guest(s).`
      );
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      if (err.fields) {
        const { time_slot, ...fields } = err.fields;
        setErrors({ ...fields, ...(time_slot ? { time: time_slot } : {}) });
      }
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
                <label htmlFor="date">Date *</label>
                <input
                  id="date" name="date" type="date" min={localDateToday(currentTime)}
                  value={form.date} onChange={handleChange} required
                  aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? 'date-error' : undefined}
                />
                {errors.date && <p id="date-error" className="form-field__error">{errors.date}</p>}
              </div>
              <div className="form-field">
                <label htmlFor="time">Time *</label>
                <select
                  id="time" name="time" value={form.time} onChange={handleChange}
                  required disabled={!form.date} aria-invalid={Boolean(errors.time)}
                  aria-describedby={errors.time ? 'time-hint time-error' : 'time-hint'}
                >
                  <option value="">{form.date ? 'Select a time' : 'Select a date first'}</option>
                  {timeOptions.map((slot) => (
                    <option key={slot.value} value={slot.value}
                      disabled={new Date(`${form.date}T${slot.value}`).getTime() <= currentTime}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                <p id="time-hint" className="form-field__hint">
                  Every 15 minutes. Mon–Sat 5–11 PM; Sun 5–9 PM.
                </p>
                {errors.time && <p id="time-error" className="form-field__error">{errors.time}</p>}
              </div>
            </div>
            <div className="form-row">
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
