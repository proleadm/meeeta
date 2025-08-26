import { DateTime } from 'luxon';
import { buildBusinessWindow, intersectAll, sliceByDuration, toMinutesOfDay, formatSlot, mapCityBusinessToSourceDay } from '@/lib/time-overlap';

describe('time-overlap helpers', () => {
  const date = DateTime.fromISO('2025-08-26T00:00:00');

  test('buildBusinessWindow basic', () => {
    const iv = buildBusinessWindow({ date, tz: 'America/New_York', start: '09:00', end: '17:00' });
    expect(iv.start.hour).toBe(9);
    expect(iv.end.hour === 17 || iv.end.minus({ minutes: 1 }).hour === 16).toBeTruthy();
  });

  test('intersectAll returns empty when none', () => {
    const a = buildBusinessWindow({ date, tz: 'America/New_York', start: '09:00', end: '10:00' });
    const b = buildBusinessWindow({ date, tz: 'America/Los_Angeles', start: '12:00', end: '13:00' });
    const mappedA = [a];
    const mappedB = [b];
    const out = intersectAll([mappedA, mappedB]);
    expect(out.length === 0 || out.every(iv => iv.length('minutes') <= 0)).toBeTruthy();
  });

  test('sliceByDuration produces stepped windows', () => {
    const iv = buildBusinessWindow({ date, tz: 'UTC', start: '00:00', end: '01:00' });
    const slots = sliceByDuration([iv], 30, 30);
    expect(slots.length).toBe(2);
  });

  test('toMinutesOfDay', () => {
    const dt = DateTime.fromISO('2025-08-26T10:15:00');
    expect(toMinutesOfDay(dt)).toBe(10 * 60 + 15);
  });

  test('formatSlot returns label and lines', () => {
    const start = DateTime.fromISO('2025-08-26T10:00:00Z');
    const end = start.plus({ minutes: 30 });
    const slot = { start, end } as any;
    const out = formatSlot(slot, [{ name: 'New York', timezone: 'America/New_York' }], 'UTC');
    expect(out.label).toContain('10:00');
    expect(out.lines[0].city).toBe('New York');
  });

  test('mapCityBusinessToSourceDay maps windows back to source TZ', () => {
    const srcDay = DateTime.fromISO('2025-08-26T00:00:00');
    const mapped = mapCityBusinessToSourceDay('America/New_York', 'UTC', srcDay);
    expect(mapped.length).toBeGreaterThan(0);
  });
});


