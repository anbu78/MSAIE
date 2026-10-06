// Restaurant local times; closing time is exclusive.
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
