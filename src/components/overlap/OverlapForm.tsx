'use client';

import { useMemo, useState } from 'react';
import type { City } from '@/lib/time';
import { listCommonCities, searchCities } from '@/lib/time';

interface OverlapFormProps {
  selectedCities: City[];
  setSelectedCities: (cities: City[]) => void;
  durationMins: number;
  setDurationMins: (m: number) => void;
  day: 'today' | 'tomorrow' | Date;
  setDay: (d: 'today' | 'tomorrow' | Date) => void;
  sourceTZ: string;
  setSourceTZ: (tz: string) => void;
}

export default function OverlapForm(props: OverlapFormProps) {
  const { selectedCities, setSelectedCities, durationMins, setDurationMins, day, setDay, sourceTZ, setSourceTZ } = props;

  const [cityQuery, setCityQuery] = useState('');
  const results = useMemo(() => searchCities(cityQuery), [cityQuery]);

  const addTempCity = (c: City) => {
    if (selectedCities.some((x) => x.id === c.id)) return;
    setSelectedCities([...selectedCities, c]);
    setCityQuery('');
  };
  const removeCity = (id: string) => setSelectedCities(selectedCities.filter((c) => c.id !== id));

  return (
    <div className="rounded-2xl border bg-card shadow-sm p-4 space-y-4">
      {/* Cities */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Cities</label>
        <div className="flex flex-wrap items-center gap-2 min-h-10">
          {selectedCities.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs bg-accent text-accent-foreground">
              {c.name}
              <button onClick={() => removeCity(c.id)} className="rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 px-1.5" aria-label={`Remove ${c.name}`}>
                ×
              </button>
            </span>
          ))}
          <div className="relative grow">
            <input
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="Add temporary city..."
              className="w-full h-9 px-3 rounded-md border bg-background"
              aria-label="Search and add temporary city"
            />
            {cityQuery && results.length > 0 && (
              <div className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-auto rounded-md border bg-popover shadow">
                {results.slice(0, 10).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => addTempCity(c)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    {c.name} <span className="text-muted-foreground">• {c.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Duration, Day, Source TZ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="duration">Meeting duration</label>
          <select
            id="duration"
            value={durationMins}
            onChange={(e) => setDurationMins(parseInt(e.target.value, 10))}
            className="h-9 px-3 rounded-md border bg-background"
          >
            {[15, 30, 45, 60, 90].map((m) => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Day</label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="day"
                checked={day === 'today'}
                onChange={() => setDay('today')}
              />
              Today
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="day"
                checked={day === 'tomorrow'}
                onChange={() => setDay('tomorrow')}
              />
              Tomorrow
            </label>
            <input
              type="date"
              onChange={(e) => {
                if (e.target.value) {
                  const d = new Date(e.target.value);
                  setDay(d);
                }
              }}
              className="h-9 px-3 rounded-md border bg-background"
              aria-label="Pick a date"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="sourceTZ">Source timezone</label>
          <input
            id="sourceTZ"
            value={sourceTZ}
            onChange={(e) => setSourceTZ(e.target.value)}
            className="h-9 w-full px-3 rounded-md border bg-background"
            placeholder="e.g., America/New_York"
          />
        </div>
      </div>
    </div>
  );
}


