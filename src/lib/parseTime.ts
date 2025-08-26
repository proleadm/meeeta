import { DateTime } from 'luxon';

// Minimal natural language parsing without external network
// Supports: now, today, tomorrow, yesterday, next/last <weekday>, +Nh / +Nm / in <Nm>, explicit date-times

const WEEKDAYS: Record<string, number> = {
  sun: 7, mon: 1, tue: 2, tues: 2, wed: 3, thu: 4, thur: 4, fri: 5, sat: 6,
};

export function parseInputToDateTime(inputRaw: string, sourceTZ: string): DateTime {
  const input = (inputRaw || '').trim().toLowerCase();
  if (!input || input === 'now') {
    return DateTime.now().setZone(sourceTZ);
  }

  // ISO-like: 2025-09-01 18:00, 2025/09/01 18:00, 2025-09-01T18:00
  const isoMatch = input.match(/(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})(?:[ t](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (isoMatch) {
    const [, y, m, d, hh = '00', mm = '00', ss = '00'] = isoMatch;
    const dt = DateTime.fromObject({
      year: Number(y),
      month: Number(m),
      day: Number(d),
      hour: Number(hh),
      minute: Number(mm),
      second: Number(ss),
    }, { zone: sourceTZ });
    if (dt.isValid) return dt;
  }

  // Relative: in 45m, in 2h, +3h, +90m
  const relMatch = input.match(/^(?:in\s+)?(\+)?(\d+)\s*([hm])$/);
  if (relMatch) {
    const [, , amountStr, unit] = relMatch;
    const amount = Number(amountStr);
    let dt = DateTime.now().setZone(sourceTZ);
    if (unit === 'h') dt = dt.plus({ hours: amount });
    if (unit === 'm') dt = dt.plus({ minutes: amount });
    return dt;
  }

  // Simple times like 10am, 6:30pm optionally with keywords today/tomorrow/yesterday
  const timeMatch = input.match(/^(?:today\s+|tomorrow\s+|yesterday\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (timeMatch) {
    const base = DateTime.now().setZone(sourceTZ).startOf('day');
    const kwTomorrow = input.includes('tomorrow');
    const kwYesterday = input.includes('yesterday');
    let day = base;
    if (kwTomorrow) day = day.plus({ days: 1 });
    if (kwYesterday) day = day.minus({ days: 1 });
    const hourRaw = Number(timeMatch[1]);
    const minute = Number(timeMatch[2] || '0');
    const ampm = timeMatch[3];
    let hour = hourRaw;
    if (ampm === 'am') {
      if (hour === 12) hour = 0;
    } else if (ampm === 'pm') {
      if (hour !== 12) hour = hour + 12;
    }
    const dt = day.set({ hour, minute });
    if (dt.isValid) return dt;
  }

  // next tue 18:00, last fri 9:30
  const nextLastMatch = input.match(/\b(next|last)\s+([a-z]{3,})\b/);
  if (nextLastMatch) {
    const dir = nextLastMatch[1];
    const wdKey = nextLastMatch[2].slice(0,3);
    const targetWeekday = WEEKDAYS[wdKey];
    if (targetWeekday) {
      let base = DateTime.now().setZone(sourceTZ).startOf('day');
      const currentWeekday = base.weekday; // 1=Mon..7=Sun
      const delta = ((targetWeekday - currentWeekday + 7) % 7) || 7;
      if (dir === 'next') base = base.plus({ days: delta });
      if (dir === 'last') base = base.minus({ days: (7 - delta) || 7 });

      // Optional time like 18:00
      const t = input.match(/(\d{1,2})(?::(\d{2}))?/);
      let hour = 9, minute = 0; // default
      if (t) {
        hour = Number(t[1]);
        minute = Number(t[2] || '0');
      }
      const dt = base.set({ hour, minute });
      if (dt.isValid) return dt;
    }
  }

  // Fallback: today keyword without time
  if (input === 'today') return DateTime.now().setZone(sourceTZ);

  // As last resort, try Luxon's parsing with some formats
  const formats = ['h:mm a', 'HH:mm', 'h a'];
  for (const f of formats) {
    const dt = DateTime.fromFormat(inputRaw, f, { zone: sourceTZ });
    if (dt.isValid) return dt;
  }

  return DateTime.invalid('Invalid input');
}

// --- Bidirectional helpers for Convert tab ---
export function minutesToString(m: number, is12h: boolean): string {
  const clamped = ((Math.floor(m) % 1440) + 1440) % 1440;
  const h = Math.floor(clamped / 60);
  const min = clamped % 60;
  if (!is12h) return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  const dt = DateTime.fromObject({ hour: h, minute: min });
  return dt.toFormat('h:mm a');
}

function parseOffsetLike(s: string, baseMinutes: number): number | null {
  const m = s.trim().toLowerCase().match(/^([+\-])(\d+)\s*([hm])$/);
  if (!m) return null;
  const sign = m[1] === '-' ? -1 : 1;
  const amount = Number(m[2]);
  const unit = m[3];
  const delta = unit === 'h' ? amount * 60 : amount;
  const result = baseMinutes + sign * delta;
  return ((result % 1440) + 1440) % 1440;
}

export function tryParseToMinutes(s: string, base: DateTime): number | null {
  const input = (s || '').trim().toLowerCase();
  if (!input) return null;
  if (input === 'now') return base.hour * 60 + base.minute;

  const baseMinutes = base.hour * 60 + base.minute;
  const off = parseOffsetLike(input, baseMinutes);
  if (off !== null) return off;

  // strip day words (handled upstream)
  const cleaned = input.replace(/\b(today|tomorrow|yesterday)\b/g, '').trim();

  // 24h H:mm
  let m = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    const h = Number(m[1]);
    const mm = Number(m[2]);
    if (h >= 0 && h <= 23 && mm >= 0 && mm <= 59) return h * 60 + mm;
    return null;
  }

  // 12h h:mm a
  m = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (m) {
    let h = Number(m[1]);
    const mm = Number(m[2] || '0');
    if (mm < 0 || mm > 59 || h < 1 || h > 12) return null;
    const ampm = m[3];
    if (ampm === 'am') { if (h === 12) h = 0; }
    else if (ampm === 'pm') { if (h !== 12) h += 12; }
    return h * 60 + mm;
  }

  // 12h compact like 4pm or 4p
  m = cleaned.match(/^(\d{1,2})\s*(pm|am|p|a)$/);
  if (m) {
    let h = Number(m[1]);
    const ap = m[2];
    if (ap.startsWith('a')) { if (h === 12) h = 0; }
    else { if (h !== 12) h += 12; }
    if (h < 0 || h > 23) return null;
    return h * 60;
  }

  return null;
}


