'use client';

import type { City } from '@/lib/time';
import { DateTime } from 'luxon';
import { mapCityBusinessToSourceDay, intersectAll, sliceByDuration } from '@/lib/time-overlap';
import { useRef, useState, useEffect } from 'react';

interface TimelineProps {
  cities: City[];
  day: 'today' | 'tomorrow' | Date;
  sourceTZ: string;
  durationMins: number;
  suggestions?: { slot: import('luxon').Interval }[];
  hoverSlot?: import('luxon').Interval | null;
  selectedMinute?: number | null;
  onSelectMinute?: (m: number) => void;
}

function pct(mins: number) { return `${(mins / 1440) * 100}%`; }

export default function Timeline({ cities, day, sourceTZ, durationMins, suggestions = [], hoverSlot, selectedMinute = null, onSelectMinute }: TimelineProps) {
  const sourceDay = typeof day === 'string'
    ? (day === 'today' ? DateTime.now() : DateTime.now().plus({ days: 1 }))
    : DateTime.fromJSDate(day as Date);
  const rowsWrapperRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const blockMinutes = durationMins >= 60 ? 60 : 30;

  const setFromClientX = (clientX: number) => {
    if (!rowsWrapperRef.current || !onSelectMinute) return;
    const rect = rowsWrapperRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const ratio = rect.width === 0 ? 0 : x / rect.width;
    const mins = Math.round((ratio * 1440) / blockMinutes) * blockMinutes;
    onSelectMinute(mins % 1440);
  };

  useEffect(() => {
    const up = () => setDragging(false);
    window.addEventListener('mouseup', up);
    window.addEventListener('mouseleave', up);
    return () => {
      window.removeEventListener('mouseup', up);
      window.removeEventListener('mouseleave', up);
    };
  }, []);

  return (
    <div className="rounded-2xl border bg-card shadow-sm p-4 space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="inline-flex items-center gap-2"><span className="w-3 h-2 rounded-sm bg-emerald-500/40" /> Comfortable</div>
        <div className="inline-flex items-center gap-2"><span className="w-3 h-2 rounded-sm bg-amber-500/35" /> Borderline</div>
        <div className="inline-flex items-center gap-2"><span className="w-3 h-2 rounded-sm bg-muted/40" /> Unfriendly</div>
      </div>
      {/* Ticks */}
      <div className="relative">
        <div className="h-1 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
        <div className="mt-1 grid grid-cols-24 text-[10px] text-muted-foreground">
          {[...Array(25)].map((_, i) => (
            <div key={i} className={i === 0 ? '' : 'text-right'}>
              {i % 6 === 0 ? String(i).padStart(2, '0') : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-3 relative" ref={rowsWrapperRef}
        onMouseDown={(e) => { setDragging(true); setFromClientX(e.clientX); }}
        onMouseMove={(e) => { if (dragging) setFromClientX(e.clientX); }}
        role="presentation"
        aria-label="Timeline rows drag area"
      >
        {cities.map((c) => (
          <div key={c.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium">{c.name}</div>
              <div className="text-muted-foreground text-xs">{c.timezone}</div>
            </div>
            <div className="relative h-6 rounded-md bg-muted/30 overflow-hidden">
              {/* Block grid */}
              <div className={`grid ${durationMins >= 60 ? 'grid-cols-24' : 'grid-cols-48'} gap-px h-full`}>
                {Array.from({ length: durationMins >= 60 ? 24 : 48 }).map((_, idx) => {
                  const startMin = idx * blockMinutes;
                  const blockStart = sourceDay.set({ hour: Math.floor(startMin / 60), minute: startMin % 60 });
                  const blockEnd = blockStart.plus({ minutes: blockMinutes });
                  const blockIv = { start: blockStart, end: blockEnd } as any;
                  const biz = mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '09:00', '17:00');
                  const shoulders = [
                    ...mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '07:00', '09:00'),
                    ...mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '17:00', '21:00'),
                  ];
                  const isComfort = biz.some((w) => w.intersection(blockIv));
                  const isBorder = !isComfort && shoulders.some((w) => w.intersection(blockIv));
                  const color = isComfort ? 'bg-emerald-500/70 hover:bg-emerald-400' : isBorder ? 'bg-amber-500/70 hover:bg-amber-400' : 'bg-purple-500/70 hover:bg-purple-400';
                  const title = `${c.name} — ${blockStart.setZone(c.timezone).toFormat('HH:mm')} (${isComfort ? 'Comfortable' : isBorder ? 'Borderline' : 'Unfriendly'})`;
                  return <div key={idx} className={`rounded-sm w-full h-full ${color}`} title={title} />;
                })}
              </div>
            </div>
          </div>
        ))}
        {/* Global overlap highlights and selection line */}
        {(() => {
          if (!cities.length) return null;
          const src = sourceDay;
          const perCity = cities.map((c) => {
            const biz = mapCityBusinessToSourceDay(c.timezone, sourceTZ, src, '09:00', '17:00');
            const early = mapCityBusinessToSourceDay(c.timezone, sourceTZ, src, '07:00', '09:00');
            const late = mapCityBusinessToSourceDay(c.timezone, sourceTZ, src, '17:00', '21:00');
            return [...biz, ...early, ...late];
          });
          const overlap = intersectAll(perCity);
          const slots = sliceByDuration(overlap, durationMins || 30, 5).slice(0, 5);
          return (
            <div className="relative h-0 select-none">
              {slots.map((w, i) => {
                const startMin = w.start.setZone(sourceTZ).hour * 60 + w.start.setZone(sourceTZ).minute;
                const lenMin = Math.max(0, Math.round(w.length('minutes')));
                return (
                  <div key={`hl-${i}`} className="absolute -top-7 h-3 bg-primary/25 border border-primary/40 rounded" style={{ left: pct(startMin), width: pct(lenMin) }} aria-label="Overlap highlight" />
                );
              })}
              {selectedMinute !== null && (
                <div className="absolute inset-x-0 -top-7 h-3" aria-hidden>
                  <div className="absolute" style={{ left: pct(selectedMinute) }}>
                    <div className="translate-x-[-1px] w-[2px] h-[calc(100%+24px)] bg-cyan-400 rounded" />
                    <div className="w-3 h-3 -translate-x-[6px] -translate-y-2 rounded-full border-2 border-cyan-400 bg-background" />
                  </div>
                </div>
              )}
            </div>
          );
        })()}
        {cities.length === 0 && (
          <div className="text-sm text-muted-foreground">Select cities to see timelines.</div>
        )}
      </div>
    </div>
  );
}


