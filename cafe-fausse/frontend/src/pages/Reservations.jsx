import { useState } from 'react';
import { createReservation } from '../api';
import './Reservations.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!EMAIL_REGEX.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (!form.timeSlot) errors.timeSlot = 'Select a date and time.';
  if (!form.guests || Number(form.guests) < 1) errors.guests = 'At least 1 guest is required.';
  if (Number(form.guests) > 20) errors.guests = 'For parties over 20, please call us directly.';
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

      setStatus('success');
      setConfirmedTable(response.table_number);
      setResultMessage(
        `You're booked! Table #${response.table_number} is reserved for ${form.guests} guest(s).`
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
                  value={form.timeSlot}
                  onChange={handleChange}
                  required
                />
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
                  value={form.guests}
                  onChange={handleChange}
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
