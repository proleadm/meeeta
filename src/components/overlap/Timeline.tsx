'use client';

import type { City } from '@/lib/time';
import { DateTime, Interval } from 'luxon';
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
      <div className="flex items-center justify-center gap-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-emerald-500 rounded-lg shadow-sm"></div>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Comfortable</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400">(9AM-5PM)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-amber-500 rounded-lg shadow-sm"></div>
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Borderline</span>
          <span className="text-xs text-amber-600 dark:text-amber-400">(7-9AM, 5-9PM)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-purple-500 rounded-lg shadow-sm"></div>
          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Unfriendly</span>
          <span className="text-xs text-purple-600 dark:text-purple-400">(Night/Early)</span>
        </div>
      </div>

      <div className="rounded-2xl border-0 bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30 shadow-lg shadow-black/5 backdrop-blur-sm p-6 space-y-6">
        {/* Hour markers */}
        <div className="relative mb-4">
          <div className="h-2 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 shadow-inner" />
          <div className="mt-3 grid grid-cols-25 text-xs font-medium text-gray-600 dark:text-gray-400">
            {[...Array(25)].map((_, i) => (
              <div key={i} className={`${i === 0 ? 'text-left' : i === 24 ? 'text-right' : 'text-center'} relative`}>
                {i % 6 === 0 && (
                  <>
                    <span>{String(i).padStart(2, '0')}</span>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* City rows */}
        <div className="space-y-6 relative" ref={rowsWrapperRef}
          onMouseDown={(e) => { setDragging(true); setFromClientX(e.clientX); }}
          onMouseMove={(e) => { if (dragging) setFromClientX(e.clientX); }}
          role="presentation"
          aria-label="Timeline rows drag area"
        >
          {cities.map((c) => (
            <div key={c.id} className="space-y-3">
              {/* City header */}
              <div className="flex items-center gap-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{c.name}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{c.country}</span>
                <div className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                  {sourceDay.setZone(c.timezone).toFormat('MMM d, HH:mm')} local
                </div>
              </div>

              {/* Timeline row */}
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <div className={`grid ${durationMins >= 60 ? 'grid-cols-24' : 'grid-cols-48'} gap-1 h-12`}>
                  {Array.from({ length: durationMins >= 60 ? 24 : 48 }).map((_, idx) => {
                    const startMin = idx * blockMinutes;
                    const blockStart = sourceDay.set({ hour: Math.floor(startMin / 60), minute: startMin % 60 });
                    const blockEnd = blockStart.plus({ minutes: blockMinutes });
                    const blockIv = Interval.fromDateTimes(blockStart, blockEnd);
                    const biz = mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '09:00', '17:00');
                    const shoulders = [
                      ...mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '07:00', '09:00'),
                      ...mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '17:00', '21:00'),
                    ];
                    const isComfort = biz.some((w) => w.intersection(blockIv));
                    const isBorder = !isComfort && shoulders.some((w) => w.intersection(blockIv));
                    
                    let bgClass, hoverClass, label;
                    if (isComfort) {
                      bgClass = 'bg-emerald-500';
                      hoverClass = 'hover:bg-emerald-400';
                      label = 'Comfortable';
                    } else if (isBorder) {
                      bgClass = 'bg-amber-500';
                      hoverClass = 'hover:bg-amber-400';
                      label = 'Borderline';
                    } else {
                      bgClass = 'bg-purple-500';
                      hoverClass = 'hover:bg-purple-400';
                      label = 'Unfriendly';
                    }
                    
                    const localTime = blockStart.setZone(c.timezone).toFormat('HH:mm');
                    const title = `${c.name}, ${localTime} — ${label}`;

                    return (
                      <div
                        key={idx}
                        className={`${bgClass} ${hoverClass} rounded-lg h-full cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 relative group`}
                        title={title}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                          {localTime} • {label}
                        </div>
                      </div>
                    );
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
              <div className="absolute inset-0 pointer-events-none">
                {/* Suggested slot highlights */}
                {slots.map((w, i) => {
                  const startMin = w.start.setZone(sourceTZ).hour * 60 + w.start.setZone(sourceTZ).minute;
                  const lenMin = Math.max(0, Math.round(w.length('minutes')));
                  return (
                    <div 
                      key={`hl-${i}`} 
                      className="absolute top-0 bottom-0 bg-blue-500/20 border-2 border-blue-500/40 rounded-lg backdrop-blur-sm" 
                      style={{ left: pct(startMin), width: pct(lenMin) }} 
                      aria-label="Overlap highlight" 
                    />
                  );
                })}
                
                {/* Vertical selection line */}
                {selectedMinute !== null && (
                  <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: pct(selectedMinute) }}>
                    <div className="w-1 h-full bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-full shadow-lg">
                      <div className="absolute -top-2 -left-1.5 w-4 h-4 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full border-2 border-white dark:border-gray-900 shadow-lg">
                        <div className="absolute inset-0.5 bg-white dark:bg-gray-900 rounded-full"></div>
                      </div>
                      {/* Time tooltip */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-cyan-500 text-white text-xs rounded font-medium shadow-lg whitespace-nowrap">
                        {sourceDay.plus({ minutes: selectedMinute }).toFormat('HH:mm')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}


