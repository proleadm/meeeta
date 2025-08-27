'use client';

import type { City } from '@/lib/time';
import { listCommonCities } from '@/lib/time';
import type { Slot } from '@/lib/time-overlap';
import { DateTime, Interval } from 'luxon';
import { mapCityBusinessToSourceDay, intersectAll, sliceByDuration } from '@/lib/time-overlap';
import { useRef, useMemo } from 'react';
import { usePrefs } from '@/state/usePrefs';

interface TimelineProps {
  cities: City[];
  day: 'today' | 'tomorrow' | Date;
  sourceTZ: string;
  durationMins: number;
  suggestions: Slot[];
  hoveredSlot: Slot | null;
  selectedTime: number | null;
  onSelectTime: (minutes: number) => void;
}

function pct(mins: number) { return `${(mins / 1440) * 100}%`; }

export default function Timeline({ cities, day, sourceTZ, durationMins, suggestions, hoveredSlot, selectedTime, onSelectTime }: TimelineProps) {
  const sourceDay = typeof day === 'string'
    ? (day === 'today' ? DateTime.now() : DateTime.now().plus({ days: 1 }))
    : DateTime.fromJSDate(day as Date);
  const prefs = usePrefs((s) => s.prefs);
  const workingHours = prefs?.workingHours ?? { start: 9, end: 17 };

  // Resolve a friendly label for the anchor timezone (home/source)
  const homeCityName = useMemo(() => {
    const fromSelected = cities.find((c) => c.timezone === sourceTZ)?.name;
    if (fromSelected) return fromSelected;
    const fromCommon = listCommonCities().find((c) => c.timezone === sourceTZ)?.name;
    if (fromCommon) return fromCommon;
    const segment = sourceTZ.split('/').pop() || sourceTZ;
    return segment.replace(/_/g, ' ');
  }, [cities, sourceTZ]);
  const rowsWrapperRef = useRef<HTMLDivElement>(null);

  const blockMinutes = durationMins >= 60 ? 60 : 30;

  // Memoize per-city 24h comfort bands mapped on the source axis
  const bandsByCityId = useMemo(() => {
    const map: Record<string, { bgClass: string; textClass: string; label: 'Comfortable' | 'Borderline' | 'Unfriendly' }[]> = {};
    const startOfDaySource = sourceDay.setZone(sourceTZ).startOf('day');
    for (const city of cities) {
      const arr: { bgClass: string; textClass: string; label: 'Comfortable' | 'Borderline' | 'Unfriendly' }[] = [];
      for (let hour = 0; hour < 24; hour++) {
        const sourceHour = startOfDaySource.plus({ hours: hour });
        const localTime = sourceHour.setZone(city.timezone);
        const localHour = localTime.hour;
        let label: 'Comfortable' | 'Borderline' | 'Unfriendly';
        if (localHour >= 9 && localHour < 17) label = 'Comfortable';
        else if ((localHour >= 7 && localHour < 9) || (localHour >= 17 && localHour < 21)) label = 'Borderline';
        else label = 'Unfriendly';
        const bgClass = label === 'Comfortable' ? 'bg-emerald-500' : label === 'Borderline' ? 'bg-amber-500' : 'bg-gray-400';
        const textClass = 'text-white';
        arr.push({ bgClass, textClass, label });
      }
      map[city.id] = arr;
    }
    return map;
    // Depend only on inputs that affect mapping
  }, [cities, sourceTZ, sourceDay]);

  const setFromClientX = (clientX: number) => {
    if (!rowsWrapperRef.current) return;
    const rect = rowsWrapperRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const ratio = rect.width === 0 ? 0 : x / rect.width;
    const mins = Math.round((ratio * 1440) / blockMinutes) * blockMinutes;
    onSelectTime(mins % 1440);
  };

  // No drag lifecycle on rows; only the Home bar is draggable. Rows are click-to-jump.

  // Marker in source timezone
  const markerMinutes = selectedTime ?? 0;
  const markerSource = sourceDay.setZone(sourceTZ).startOf('day').plus({ minutes: markerMinutes });
  // Compute a clamped window [start, end) in source minutes so labels and overlays match near edges
  const windowStartMin = Math.max(0, markerMinutes - Math.floor(durationMins / 2));
  const windowSpanMin = Math.min(durationMins, 1440 - windowStartMin);
  const windowStartSource = sourceDay.setZone(sourceTZ).startOf('day').plus({ minutes: windowStartMin });
  const windowEndSource = windowStartSource.plus({ minutes: windowSpanMin });

  if (cities.length === 0) {
    return (
      <div className="rounded-2xl border-0 bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30 shadow-lg shadow-black/5 backdrop-blur-sm p-8 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Select cities to see availability timeline</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add cities above to visualize overlapping meeting windows</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 p-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-lg shadow-sm border border-emerald-400/20"></div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Comfortable</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">9AM–5PM local</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-gradient-to-b from-amber-500 to-amber-600 rounded-lg shadow-sm border border-amber-400/20"></div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Borderline</span>
            <span className="text-xs text-amber-600 dark:text-amber-400">7–9AM, 5–9PM local</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-gradient-to-b from-gray-400 to-gray-500 rounded-lg shadow-sm border border-gray-300/20"></div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Unfriendly</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Night/Early hours</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border-0 bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30 shadow-lg shadow-black/5 backdrop-blur-sm p-4 space-y-4">

        {/* City rows */}
        <div className="space-y-4 relative" ref={rowsWrapperRef}
          role="presentation"
          aria-label="Timeline rows"
        >
          {cities.map((c) => (
            <div key={c.id} className="space-y-3">
              {/* City header */}
              <div className="flex items-center gap-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{c.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {(() => {
                      const localStart = windowStartSource.setZone(c.timezone);
                      const localEnd = windowEndSource.setZone(c.timezone);
                      return `${localStart.toFormat('MMM d, HH:mm')}–${localEnd.toFormat('HH:mm')} local`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Timeline row - 24 segments showing local comfort levels */}
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <div className="flex h-8 rounded-lg overflow-hidden">
                  {Array.from({ length: 24 }).map((_, hour) => {
                    const band = bandsByCityId[c.id]?.[hour];
                    const sourceHour = sourceDay.setZone(sourceTZ).startOf('day').plus({ hours: hour });
                    const localTime = sourceHour.setZone(c.timezone);
                    const sourceTimeStr = sourceHour.toFormat('HH:mm');
                    const localTimeStr = localTime.toFormat('HH:mm');
                    const title = `${sourceTimeStr} source → ${localTimeStr} ${c.name} (${band?.label ?? ''})`;
                    return (
                      <div
                        key={hour}
                        className={`flex-1 ${band?.bgClass ?? 'bg-gray-300'} ${band?.textClass ?? ''} transition-all duration-200 relative group flex items-center justify-center border-r border-white/10 last:border-r-0`}
                        title={title}
                      />
                    );
                  })}
                </div>
                {/* Duration window overlay aligned to marker (rendered per row to avoid padding offset) */}
                {selectedTime !== null && (
                  (() => {
                    const start = windowStartMin;
                    const span = windowSpanMin;
                    return (
                      <div
                        className="absolute inset-y-0 rounded-md bg-purple-500/40 border border-purple-500/70 pointer-events-none"
                        style={{ left: pct(start), width: pct(span) }}
                      />
                    );
                  })()
                )}
                {/* Row-level tooltip aligned to global marker */}
                <div
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ left: pct(markerMinutes) }}
                >
                  {(() => {
                    const localStart = windowStartSource.setZone(c.timezone);
                    const localEnd = windowEndSource.setZone(c.timezone);
                    const h = localStart.hour; // comfort at start minute
                    let band = 'Unfriendly';
                    if (h >= 9 && h < 17) band = 'Comfortable';
                    else if ((h >= 7 && h < 9) || (h >= 17 && h < 21)) band = 'Borderline';
                    return (
                      <div className="translate-x-2 px-1.5 py-0.5 text-[11px] rounded-md bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 shadow whitespace-nowrap">
                        {localStart.toFormat('HH:mm')}–{localEnd.toFormat('HH:mm')} • {band}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
          {/* No global overlay; per-row overlay avoids padding misalignment */}
        </div>
      </div>
    </div>
  );
}


