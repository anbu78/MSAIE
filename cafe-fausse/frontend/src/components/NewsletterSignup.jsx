import { useState } from 'react';
import { signUpNewsletter } from '../api';
import './NewsletterSignup.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function NewsletterSignup({ compact = false }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!EMAIL_REGEX.test(email.trim())) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    try {
      await signUpNewsletter({ email: email.trim() });
      setStatus('success');
      setMessage("You're subscribed! Thanks for joining our newsletter.");
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <form
      className={`newsletter ${compact ? 'newsletter--compact' : ''}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <label htmlFor="newsletter-email" className="newsletter__label">
        Email address
      </label>
      <div className="newsletter__row">
        <input
          id="newsletter-email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="newsletter__input"
        />
        <button type="submit" className="newsletter__button" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Signing up…' : 'Sign Up'}
        </button>
      </div>
      {message && (
        <p className={`newsletter__message newsletter__message--${status}`} role="status">
          {message}
        </p>
      )}
    </form>
  );
}

export default NewsletterSignup;
