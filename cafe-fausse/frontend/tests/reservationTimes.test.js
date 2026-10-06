import test from 'node:test';
import assert from 'node:assert/strict';
import { getReservationTimes } from '../src/data/reservationTimes.js';

test('Monday through Saturday offer only 15-minute slots from 17:00 through 22:45', () => {
  for (let day = 5; day <= 10; day++) {
    const times = getReservationTimes(`2026-10-${String(day).padStart(2, '0')}`);
    assert.equal(times.length, 24);
    assert.equal(times[0].value, '17:00');
    assert.equal(times.at(-1).value, '22:45');
    assert.equal(new Set(times.map((slot) => slot.value)).size, 24);
    for (const slot of times) assert.match(slot.value, /^(17|18|19|20|21|22):(00|15|30|45)$/);
  }
});

test('Sunday closes earlier and excludes 21:00', () => {
  const times = getReservationTimes('2026-10-11');
  assert.equal(times.length, 16);
  assert.equal(times.at(-1).value, '20:45');
  assert.deepEqual(times.slice(0, 4).map((slot) => slot.label), ['5:00 PM', '5:15 PM', '5:30 PM', '5:45 PM']);
  assert.ok(times.every((slot) => /^(17|18|19|20):(00|15|30|45)$/.test(slot.value)));
});

test('No time choices until a date is selected', () => {
  assert.deepEqual(getReservationTimes(''), []);
  assert.deepEqual(getReservationTimes('invalid'), []);
});
