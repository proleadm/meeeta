import { DateTime, Interval } from 'luxon';

export function buildBusinessWindow(
  dt: DateTime,
  tz: string,
  start: string = '09:00',
  end: string = '17:00'
): Interval {
  const [sh, sm] = start.split(':').map((n) => parseInt(n, 10));
  const [eh, em] = end.split(':').map((n) => parseInt(n, 10));
  const localStart = dt.setZone(tz).set({ hour: sh || 0, minute: sm || 0, second: 0, millisecond: 0 });
  let localEnd = dt.setZone(tz).set({ hour: eh || 0, minute: em || 0, second: 0, millisecond: 0 });
  // Handle overnight ranges by rolling end to next day
  if (localEnd <= localStart) {
    localEnd = localEnd.plus({ days: 1 });
  }
  return Interval.fromDateTimes(localStart, localEnd);
}

export function intersectIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const start = intervals.reduce((max, i) => (i.start > max ? i.start : max), intervals[0].start);
  const end = intervals.reduce((min, i) => (i.end < min ? i.end : min), intervals[0].end);
  return end > start ? [Interval.fromDateTimes(start, end)] : [];
}

export function sliceByDuration(intervals: Interval[], minutes: number): Interval[] {
  const result: Interval[] = [];
  const dur = { minutes };
  for (const iv of intervals) {
    let cursor = iv.start;
    while (cursor.plus(dur) <= iv.end) {
      const next = cursor.plus(dur);
      result.push(Interval.fromDateTimes(cursor, next));
      cursor = cursor.plus(dur);
    }
  }
  return result;
}

export function formatSlot(
  slot: Interval,
  cities: { name: string; timezone: string }[],
  sourceTZ: string
): { label: string; perCity: { city: string; local: string }[] } {
  const srcStart = slot.start.setZone(sourceTZ);
  const srcEnd = slot.end.setZone(sourceTZ);
  const label = `${srcStart.toFormat('EEE, MMM d • HH:mm')} – ${srcEnd.toFormat('HH:mm')} (${sourceTZ})`;
  const perCity = cities.map((c) => {
    const localStart = slot.start.setZone(c.timezone);
    const localEnd = slot.end.setZone(c.timezone);
    return { city: c.name, local: `${localStart.toFormat('HH:mm')}–${localEnd.toFormat('HH:mm')} (${c.timezone})` };
  });
  return { label, perCity };
}


