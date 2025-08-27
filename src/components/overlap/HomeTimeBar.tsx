'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { usePrefs } from '@/state/usePrefs';
import { listCommonCities } from '@/lib/time';

interface Props {
  selectedMinuteOfDay: number;
  onChangeMinute: (minutes: number) => void;
}

function pct(mins: number) { return `${(mins / 1440) * 100}%`; }

export default function HomeTimeBar({ selectedMinuteOfDay, onChangeMinute }: Props) {
  const prefs = usePrefs((s) => s.prefs);
  const homeTZ = prefs.homeTZ;
  const workingHours = prefs.workingHours ?? { start: 9, end: 17 };

  const sourceDay = DateTime.now().setZone(homeTZ);

  const homeCityName = useMemo(() => {
    const fromCommon = listCommonCities().find((c) => c.timezone === homeTZ)?.name;
    if (fromCommon) return fromCommon;
    const segment = homeTZ.split('/').pop() || homeTZ;
    return segment.replace(/_/g, ' ');
  }, [homeTZ]);

  const inComfort = (h: number) => {
    const start = workingHours.start;
    const end = workingHours.end;
    if (start < end) return h >= start && h < end;
    return h >= start || h < end; // overnight schedule support
  };

  const inBorderline = (h: number) => {
    const start = workingHours.start;
    const end = workingHours.end;
    const mod = (x: number) => (x + 24) % 24;
    const before = h >= mod(start - 2) && h < start;
    const after = h >= end && h < mod(end + 2);
    return before || after;
  };

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<boolean>(false);

  const setFromClientX = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const ratio = rect.width === 0 ? 0 : x / rect.width;
    const mins = Math.round((ratio * 1440) / 5) * 5; // snap to 5m for compact control
    onChangeMinute(mins % 1440);
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
    <div className="rounded-2xl border-0 bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30 shadow-lg shadow-black/5 backdrop-blur-sm p-4 space-y-2">
      <div className="flex items-center gap-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{homeCityName} ({homeTZ})</span>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
          {sourceDay.toFormat('MMM d, HH:mm')} • Home
        </div>
      </div>
      <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 select-none" ref={trackRef}
        onMouseDown={(e) => { setDragging(true); setFromClientX(e.clientX); }}
        onMouseMove={(e) => { if (dragging) setFromClientX(e.clientX); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const delta = (e.shiftKey ? 15 : 1) * (e.key === 'ArrowLeft' ? -1 : 1);
            const next = (selectedMinuteOfDay + delta + 1440) % 1440;
            onChangeMinute(next);
          }
        }}
        tabIndex={0}
        role="slider" aria-valuemin={0} aria-valuemax={1439} aria-valuenow={selectedMinuteOfDay}
        aria-label="Home time scrubber"
      >
        <div className="flex h-8 rounded-lg overflow-hidden">
          {Array.from({ length: 24 }).map((_, hour) => {
            const hourStart = sourceDay.startOf('day').plus({ hours: hour });
            const localHour = hourStart.hour;
            let bgColor = 'bg-purple-500';
            if (inComfort(localHour)) bgColor = 'bg-emerald-500';
            else if (inBorderline(localHour)) bgColor = 'bg-amber-500';
            return (
              <div
                key={`home-${hour}`}
                className={`flex-1 ${bgColor} text-white relative border-r border-white/10 last:border-r-0`}
                title={`${hourStart.toFormat('HH:mm')} ${homeTZ}`}
              >
                {/* labels will be on shared ruler, keep bar clean */}
              </div>
            );
          })}
        </div>

        {/* Small hour ticks + labels at 0,6,12,18,24 */}
        {[0, 6, 12, 18, 24].map((hour) => (
          <div key={`lbl-${hour}`} className="absolute -bottom-5 text-[10px] text-gray-600 dark:text-gray-300"
               style={{ left: `${(hour / 24) * 100}%`, transform: 'translateX(-50%)' }}>
            {hour.toString().padStart(2, '0')}
          </div>
        ))}
        {Array.from({ length: 24 }).map((_, h) => (
          <div key={`tick-${h}`} className="absolute bottom-0 w-0.5 bg-gray-500/60 dark:bg-gray-300/60"
               style={{ left: `${(h / 24) * 100}%`, height: h % 6 === 0 ? '12px' : '8px' }} />
        ))}

        {/* Vertical marker */}
        <div className="absolute inset-y-0" style={{ left: pct(selectedMinuteOfDay) }}>
          <div className="relative w-0.5 h-full bg-cyan-500 rounded-sm shadow-[0_0_0_1px_rgba(34,211,238,0.3)]">
            <div className="absolute -top-7 -left-5 px-1.5 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-500 text-white shadow">
              {sourceDay.startOf('day').plus({ minutes: selectedMinuteOfDay }).toFormat('HH:mm')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


