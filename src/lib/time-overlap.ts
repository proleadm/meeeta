import { DateTime, Interval, Duration } from 'luxon';
import { getTimezoneAbbreviation, formatUtcOffset } from '@/lib/time-format';

export type BuildOpts = { date: DateTime; tz: string; start?: string; end?: string };

export function buildBusinessWindow(opts: BuildOpts): Interval {
  const { date, tz, start = '09:00', end = '17:00' } = opts;
  const [sh, sm] = start.split(':').map((n) => parseInt(n, 10));
  const [eh, em] = end.split(':').map((n) => parseInt(n, 10));
  const base = date.setZone(tz).startOf('day');
  const localStart = base.set({ hour: sh || 0, minute: sm || 0, second: 0, millisecond: 0 });
  let localEnd = base.set({ hour: eh || 0, minute: em || 0, second: 0, millisecond: 0 });
  // Handle overnight ranges by rolling end to next day
  if (localEnd <= localStart) localEnd = localEnd.plus({ days: 1 });
  return Interval.fromDateTimes(localStart, localEnd);
}

// Intersect cumulatively; return possibly multiple intersections when combining sets
export function intersectAll(intervalGroups: Interval[][]): Interval[] {
  let current: Interval[] = [Interval.invalid('empty').set({}) as any];
  // Start with an open day span if first group provided; otherwise empty
  if (intervalGroups.length > 0) {
    current = [...intervalGroups[0]];
  }
  for (let i = 1; i < intervalGroups.length; i++) {
    const nextGroup = intervalGroups[i];
    const next: Interval[] = [];
    for (const a of current) {
      for (const b of nextGroup) {
        const inter = a.intersection(b);
        if (inter && inter.isValid && inter.length('minutes') > 0) next.push(inter);
      }
    }
    current = next;
    if (current.length === 0) break;
  }
  return current;
}

export function sliceByDuration(intervals: Interval[], minutes: number, stepMinutes: number = 5): Interval[] {
  const result: Interval[] = [];
  const dur = Duration.fromObject({ minutes });
  const step = Duration.fromObject({ minutes: stepMinutes });
  for (const iv of intervals) {
    let cursor = iv.start;
    while (cursor.plus(dur) <= iv.end) {
      const next = cursor.plus(dur);
      result.push(Interval.fromDateTimes(cursor, next));
      cursor = cursor.plus(step);
    }
  }
  return result;
}

export function toMinutesOfDay(dt: DateTime): number {
  return dt.hour * 60 + dt.minute;
}

export function buildShoulderWindows(opts: BuildOpts): Interval[] {
  const { date, tz } = opts;
  const a = buildBusinessWindow({ date, tz, start: '07:00', end: '09:00' });
  const b = buildBusinessWindow({ date, tz, start: '17:00', end: '21:00' });
  return [a, b];
}

export function scoreSlot(slot: Interval, cities: { timezone: string }[]): number {
  let score = 0;
  for (const c of cities) {
    const day = slot.start.setZone(c.timezone).startOf('day');
    const biz = buildBusinessWindow({ date: day, tz: c.timezone });
    const shoulders = buildShoulderWindows({ date: day, tz: c.timezone });
    const sBiz = slot.set({ start: slot.start.setZone(c.timezone), end: slot.end.setZone(c.timezone) });
    if (sBiz.intersection(biz)) {
      score += 2; // comfortable
      continue;
    }
    if (shoulders.some((iv) => sBiz.intersection(iv))) {
      score += 1; // borderline
      continue;
    }
    // unfriendly adds 0
  }
  return score;
}

export function formatSlot(
  slot: Interval,
  cities: { name: string; timezone: string }[],
  sourceTZ: string
): { label: string; lines: { city: string; local: string }[] } {
  const srcStart = slot.start.setZone(sourceTZ);
  const srcEnd = slot.end.setZone(sourceTZ);
  const label = `${srcStart.toFormat('EEE, MMM d • HH:mm')}–${srcEnd.toFormat('HH:mm')} (${sourceTZ})`;
  const lines = cities.map((c) => {
    const localStart = slot.start.setZone(c.timezone);
    const localEnd = slot.end.setZone(c.timezone);
    const abbrev = getTimezoneAbbreviation(c.timezone);
    const local = `${localStart.toFormat('HH:mm')}–${localEnd.toFormat('HH:mm')} ${abbrev}`;
    return { city: c.name, local };
  });
  return { label, lines };
}

export function mapCityBusinessToSourceDay(
  cityTz: string,
  sourceTZ: string,
  sourceDay: DateTime,
  start: string = '09:00',
  end: string = '17:00'
): Interval[] {
  // Source day span in sourceTZ
  const srcStart = sourceDay.setZone(sourceTZ).startOf('day');
  const srcEnd = srcStart.plus({ days: 1 });
  const srcSpan = Interval.fromDateTimes(srcStart, srcEnd);

  // Same span in city local time
  const citySpan = Interval.fromDateTimes(srcStart.setZone(cityTz), srcEnd.setZone(cityTz));

  // Build business windows for both relevant local dates (start day and possibly end day if different)
  const d1 = citySpan.start.startOf('day');
  const d2 = citySpan.end.startOf('day');
  const windows: Interval[] = [];
  const w1 = buildBusinessWindow({ date: d1, tz: cityTz, start, end });
  windows.push(w1.intersection(citySpan) || w1);
  if (!d2.equals(d1)) {
    const w2 = buildBusinessWindow({ date: d2, tz: cityTz, start, end });
    const inter = w2.intersection(citySpan);
    if (inter && inter.isValid) windows.push(inter);
  }

  // Map windows back to sourceTZ and clamp to source day span
  const mapped: Interval[] = [];
  for (const w of windows) {
    const s = w.start.setZone(sourceTZ);
    const e = w.end.setZone(sourceTZ);
    const iv = Interval.fromDateTimes(s, e).intersection(srcSpan);
    if (iv && iv.isValid && iv.length('minutes') > 0) mapped.push(iv);
  }
  return mapped;
}



