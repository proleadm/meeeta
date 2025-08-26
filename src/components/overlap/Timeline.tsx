'use client';

import type { City } from '@/lib/time';

interface TimelineProps {
  cities: City[];
  day: 'today' | 'tomorrow' | Date;
  sourceTZ: string;
  durationMins: number;
}

export default function Timeline({ cities, day, sourceTZ }: TimelineProps) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm p-4 space-y-4">
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
            <div className="h-3 rounded-full bg-muted/60" />
          </div>
        ))}
        {cities.length === 0 && (
          <div className="text-sm text-muted-foreground">Select cities to see timelines.</div>
        )}
      </div>
    </div>
  );
}


