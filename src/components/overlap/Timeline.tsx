'use client';

import type { City } from '@/lib/time';
import { DateTime } from 'luxon';
import { mapCityBusinessToSourceDay, buildBusinessWindow, intersectAll, sliceByDuration } from '@/lib/time-overlap';

interface TimelineProps {
  cities: City[];
  day: 'today' | 'tomorrow' | Date;
  sourceTZ: string;
  durationMins: number;
}

function pct(mins: number) { return `${(mins / 1440) * 100}%`; }

export default function Timeline({ cities, day, sourceTZ, durationMins }: TimelineProps) {
  const sourceDay = typeof day === 'string'
    ? (day === 'today' ? DateTime.now() : DateTime.now().plus({ days: 1 }))
    : DateTime.fromJSDate(day as Date);

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
      <div className="space-y-3">
        {cities.map((c) => (
          <div key={c.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium">{c.name}</div>
              <div className="text-muted-foreground text-xs">{c.timezone}</div>
            </div>
            <div className="relative h-3 rounded-full bg-muted/30 overflow-hidden">
              {/* Comfortable (business 09-17) */}
              {(() => {
                const windows = mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '09:00', '17:00');
                return windows.map((w, i) => {
                  const startMin = w.start.setZone(sourceTZ).hour * 60 + w.start.setZone(sourceTZ).minute;
                  const lenMin = Math.max(0, Math.round(w.length('minutes')));
                  return (
                    <div key={`biz-${i}`} className="absolute top-0 bottom-0 bg-emerald-500/40" style={{ left: pct(startMin), width: pct(lenMin) }} />
                  );
                });
              })()}

              {/* Borderline shoulders 07-09, 17-21 */}
              {(() => {
                const early = mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '07:00', '09:00');
                const late = mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '17:00', '21:00');
                const all = [...early, ...late];
                return all.map((w, i) => {
                  const startMin = w.start.setZone(sourceTZ).hour * 60 + w.start.setZone(sourceTZ).minute;
                  const lenMin = Math.max(0, Math.round(w.length('minutes')));
                  return (
                    <div key={`shoulder-${i}`} className="absolute top-0 bottom-0 bg-amber-500/35" style={{ left: pct(startMin), width: pct(lenMin) }} />
                  );
                });
              })()}
            </div>
          </div>
        ))}
        {/* Global overlap highlights based on top suggestions (visual only, simple heuristic) */}
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
            <div className="relative h-0">
              {slots.map((w, i) => {
                const startMin = w.start.setZone(sourceTZ).hour * 60 + w.start.setZone(sourceTZ).minute;
                const lenMin = Math.max(0, Math.round(w.length('minutes')));
                return (
                  <div key={`hl-${i}`} className="absolute -top-7 h-3 bg-primary/25 border border-primary/40 rounded" style={{ left: pct(startMin), width: pct(lenMin) }} aria-label="Overlap highlight" />
                );
              })}
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


