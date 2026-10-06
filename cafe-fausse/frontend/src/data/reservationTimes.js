// Generate quarter-hour reservation choices using the same opening hours as
// the backend's BUSINESS_HOURS (SRS FR-2): Mon–Sat 5–11 PM, Sun 5–9 PM.
// Date#getDay() returns 0 for Sunday, so only Sunday uses the earlier closing time.
// Closing time is exclusive: the last choices are 10:45 PM and 8:45 PM respectively.
// This replaces the former BUSINESS_HOURS map in Reservations.jsx; the backend
// still independently validates opening hours and quarter-hour boundaries.
export function getReservationTimes(dateValue) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return [];
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return [];
  const closeHour = date.getDay() === 0 ? 21 : 23;
  const times = [];
  for (let minutes = 17 * 60; minutes < closeHour * 60; minutes += 15) {
    const hour = Math.floor(minutes / 60);
    const minute = String(minutes % 60).padStart(2, '0');
    times.push({
      value: `${String(hour).padStart(2, '0')}:${minute}`,
      label: `${hour % 12 || 12}:${minute} PM`,
    });
  }
  return times;
}

export function localDateToday(timestamp = Date.now()) {
  const now = new Date(timestamp);
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}
