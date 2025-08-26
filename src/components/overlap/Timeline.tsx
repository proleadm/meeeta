'use client';

import type { City } from '@/lib/time';
import type { Slot } from '@/lib/time-overlap';
import { DateTime, Interval } from 'luxon';
import { mapCityBusinessToSourceDay, intersectAll, sliceByDuration } from '@/lib/time-overlap';
import { useRef, useState, useEffect } from 'react';

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
  const rowsWrapperRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const blockMinutes = durationMins >= 60 ? 60 : 30;

  const setFromClientX = (clientX: number) => {
    if (!rowsWrapperRef.current) return;
    const rect = rowsWrapperRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const ratio = rect.width === 0 ? 0 : x / rect.width;
    const mins = Math.round((ratio * 1440) / blockMinutes) * blockMinutes;
    onSelectTime(mins % 1440);
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
          <div className="w-6 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-lg shadow-sm border border-emerald-400/20"></div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Comfortable</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">9AM–5PM local</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-lg shadow-sm border border-amber-400/20"></div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Borderline</span>
            <span className="text-xs text-amber-600 dark:text-amber-400">7–9AM, 5–9PM local</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-lg shadow-sm border border-purple-400/20"></div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Unfriendly</span>
            <span className="text-xs text-purple-600 dark:text-purple-400">Night/Early hours</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border-0 bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30 shadow-lg shadow-black/5 backdrop-blur-sm p-6 space-y-6">
        {/* Hour markers */}
        <div className="relative mb-6">
          <div className="h-3 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 shadow-inner" />
          {/* Major hour ticks */}
          {[0, 6, 12, 18, 24].map((hour) => (
            <div
              key={hour}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${(hour / 24) * 100}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-1 h-6 bg-gray-600 dark:bg-gray-300 rounded-full shadow-sm" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2 px-2 py-1 bg-white/80 dark:bg-gray-800/80 rounded-md shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
          {/* Minor hour ticks */}
          {[3, 9, 15, 21].map((hour) => (
            <div
              key={`minor-${hour}`}
              className="absolute top-0"
              style={{ left: `${(hour / 24) * 100}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-0.5 h-4 bg-gray-400 dark:bg-gray-500 rounded-full opacity-60" />
            </div>
          ))}
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

              {/* Timeline row - 24 segments showing local comfort levels */}
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl p-2">
                <div className="flex h-16 rounded-lg overflow-hidden">
                  {Array.from({ length: 24 }).map((_, hour) => {
                    // This segment represents hour X in the source timezone
                    const sourceHour = sourceDay.set({ hour, minute: 0 });
                    
                    // Convert to local time in this city
                    const localTime = sourceHour.setZone(c.timezone);
                    const localHour = localTime.hour;
                    
                    // Determine comfort level based on LOCAL time in this city
                    let label, bgColor, textColor;
                    
                    if (localHour >= 9 && localHour < 17) {
                      // 9 AM - 5 PM local = Comfortable (business hours)
                      label = 'Comfortable';
                      bgColor = 'bg-emerald-500';
                      textColor = 'text-white';
                    } else if ((localHour >= 7 && localHour < 9) || (localHour >= 17 && localHour < 21)) {
                      // 7-9 AM or 5-9 PM local = Borderline (shoulder hours)
                      label = 'Borderline';
                      bgColor = 'bg-amber-500';
                      textColor = 'text-white';
                    } else {
                      // Night/early morning local = Unfriendly
                      label = 'Unfriendly';
                      bgColor = 'bg-purple-500';
                      textColor = 'text-white';
                    }
                    
                    const sourceTimeStr = sourceHour.toFormat('HH:mm');
                    const localTimeStr = localTime.toFormat('HH:mm');
                    const title = `${sourceTimeStr} source → ${localTimeStr} ${c.name} (${label})`;

                    return (
                      <div
                        key={hour}
                        className={`flex-1 ${bgColor} ${textColor} cursor-pointer transition-all duration-200 hover:brightness-110 relative group flex items-center justify-center border-r border-white/10 last:border-r-0`}
                        title={title}
                      >
                        {/* Hour label for major hours */}
                        {hour % 6 === 0 && (
                          <div className="text-xs font-bold opacity-80">
                            {hour.toString().padStart(2, '0')}
                          </div>
                        )}
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                          <div className="font-semibold">{sourceTimeStr} source</div>
                          <div>{localTimeStr} in {c.name}</div>
                          <div className="text-xs opacity-75">{label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
          {/* Global overlap highlights and selection line */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Suggested slot highlights */}
            {suggestions.map((slot, i) => {
              const startMin = slot.startMinute;
              const lenMin = slot.endMinute - slot.startMinute;
              const isHovered = hoveredSlot?.startMinute === slot.startMinute;
              return (
                <div 
                  key={`hl-${i}`} 
                  className={`absolute top-0 bottom-0 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                    isHovered 
                      ? 'bg-blue-500/30 border-2 border-blue-500/60 shadow-lg' 
                      : 'bg-blue-500/15 border-2 border-blue-500/30'
                  }`}
                  style={{ left: pct(startMin), width: pct(lenMin) }} 
                  aria-label={`Overlap highlight ${i + 1}`} 
                />
              );
            })}
            
            {/* Vertical selection line */}
            {selectedTime !== null && (
              <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: pct(selectedTime) }}>
                <div className="w-1 h-full bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-full shadow-lg">
                  <div className="absolute -top-2 -left-1.5 w-4 h-4 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full border-2 border-white dark:border-gray-900 shadow-lg">
                    <div className="absolute inset-0.5 bg-white dark:bg-gray-900 rounded-full"></div>
                  </div>
                  {/* Time tooltip */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-cyan-500 text-white text-xs rounded font-medium shadow-lg whitespace-nowrap">
                    {sourceDay.plus({ minutes: selectedTime }).toFormat('HH:mm')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


