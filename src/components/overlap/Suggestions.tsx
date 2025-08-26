'use client';

import { useMemo } from 'react';
import { DateTime, Interval } from 'luxon';
import { formatSlot, intersectAll, mapCityBusinessToSourceDay, sliceByDuration, scoreSlot } from '@/lib/time-overlap';

interface SuggestionsProps {
  suggestions?: Array<any>;
  sourceTZ: string;
  cities?: { name: string; timezone: string }[];
  durationMins?: number;
  day?: 'today' | 'tomorrow' | Date;
  onHover?: (s: any | null) => void;
  onLeave?: () => void;
  onPick?: (s: any) => void;
}

export default function Suggestions({ suggestions, sourceTZ, cities = [], durationMins = 30, day = 'today', onHover, onLeave, onPick }: SuggestionsProps) {
  const sourceDay = typeof day === 'string'
    ? (day === 'today' ? DateTime.now() : DateTime.now().plus({ days: 1 }))
    : DateTime.fromJSDate(day as Date);

  const computed = useMemo(() => {
    if (!cities.length) return [] as { slot: Interval; label: string; lines: { city: string; local: string }[]; score: number }[];

    // Build allowed windows (comfortable + shoulders) in sourceTZ for each city
    const perCityWindows = cities.map((c) => {
      const biz = mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '09:00', '17:00');
      const early = mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '07:00', '09:00');
      const late = mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '17:00', '21:00');
      return [...biz, ...early, ...late];
    });

    // Intersect across all cities
    const overlap = intersectAll(perCityWindows);
    if (overlap.length === 0) return [];

    // Slice into candidate slots
    const slots = sliceByDuration(overlap, durationMins, 5);
    // Score and format
    const scored = slots.map((slot) => {
      const score = scoreSlot(slot, cities);
      const { label, lines } = formatSlot(slot, cities, sourceTZ);
      return { slot, label, lines, score };
    });

    // Sort: score desc, then start asc
    scored.sort((a, b) => (b.score - a.score) || a.slot.start.toMillis() - b.slot.start.toMillis());
    return scored.slice(0, 5);
  }, [cities, durationMins, day, sourceTZ]);

  const list = suggestions ?? computed;

  return (
    <div className="rounded-2xl border bg-card shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Suggested slots</h2>
      </div>
      {list.length === 0 ? (
        <div className="text-sm text-muted-foreground">No suggestions yet. Adjust cities, duration, or day.</div>
      ) : (
        <div className="grid gap-2">
          {list.map((s: any, idx: number) => (
            <div key={idx} className="rounded-lg border p-3 text-sm flex items-start justify-between gap-3 hover:border-primary/50"
              onMouseEnter={() => onHover?.(s)}
              onMouseLeave={() => onLeave?.()}
              onClick={() => onPick?.(s)}
            >
              <div>
                <div className="font-medium">{s.label}</div>
                <div className="mt-1 space-y-0.5 text-muted-foreground text-xs">
                  {s.lines.map((ln: any, i: number) => (
                    <div key={i}>{ln.city} — {ln.local}</div>
                  ))}
                </div>
              </div>
              <button
                className="inline-flex items-center h-8 px-3 rounded-md border bg-background hover:bg-accent hover:text-accent-foreground"
                aria-label="Copy slot summary"
                onClick={async () => {
                  const oneLine = `${s.label} — ` + s.lines.map((ln: any) => `${ln.city}: ${ln.local}`).join(' • ');
                  try { await navigator.clipboard.writeText(oneLine); } catch {}
                }}
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



