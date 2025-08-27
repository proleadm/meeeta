'use client';

import { DateTime, Interval } from 'luxon';
import type { City } from '@/lib/time';
import { formatSlot } from '@/lib/time-overlap';
import { Button } from '@/components/ui/button';

interface Props {
  cities: City[];
  sourceTZ: string;
  sourceDay: DateTime;
  selectedMinuteOfDay: number | null;
  durationMins: number;
}

export default function CustomSelectionBanner({ cities, sourceTZ, sourceDay, selectedMinuteOfDay, durationMins }: Props) {
  if (selectedMinuteOfDay == null) return null;

  // Clamp window to day
  const startMin = Math.max(0, selectedMinuteOfDay - Math.floor(durationMins / 2));
  const spanMin = Math.min(durationMins, 1440 - startMin);

  const start = sourceDay.setZone(sourceTZ).startOf('day').plus({ minutes: startMin });
  const end = start.plus({ minutes: spanMin });
  const interval = Interval.fromDateTimes(start, end);

  const formatted = formatSlot(interval, cities.map(c => ({ name: c.name, timezone: c.timezone })), sourceTZ);
  const copyText = [formatted.label, ...formatted.lines.map(l => `${l.city} — ${l.local}`)].join('\n');

  return (
    <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-50/40 to-yellow-50/30 dark:from-amber-900/20 dark:to-yellow-900/10 shadow p-4 flex items-center justify-between">
      <div className="space-y-1">
        <div className="text-xs font-semibold text-amber-600 dark:text-amber-300">Custom selection</div>
        <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{formatted.label}</div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {formatted.lines.map((l, idx) => (
            <span key={idx} className="text-xs text-gray-600 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-700/50 rounded-md px-2 py-0.5">
              {l.city}: {l.local}
            </span>
          ))}
        </div>
      </div>
      <Button
        onClick={async () => {
          try { await navigator.clipboard.writeText(copyText); } catch {}
        }}
        className="rounded-xl"
      >
        Copy times
      </Button>
    </div>
  );
}


