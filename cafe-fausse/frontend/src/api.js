// Thin wrapper around the Flask REST API.
// In development, Vite proxies `/api` requests to the Flask server (see vite.config.js).
// In production, set VITE_API_BASE_URL to the deployed backend's base URL.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response body; leave data as null.
  }

  if (!response.ok) {
    const message = (data && data.error) || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.fields = data?.fields;
    throw error;
  }

  return data;
}

export function createReservation(payload) {
  return request('/api/reservations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function signUpNewsletter(payload) {
  return request('/api/newsletter', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export default { createReservation, signUpNewsletter };
