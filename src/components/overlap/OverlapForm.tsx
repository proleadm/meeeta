'use client';

import { useMemo, useState } from 'react';
import { Globe, Clock, Calendar, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="sticky top-2 z-10 rounded-2xl border-0 bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30 shadow-lg shadow-black/5 backdrop-blur-sm p-4 space-y-4">
      {/* Cities */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Select Cities
          </label>
        </div>
        <div className="relative">
          <div className="min-h-[2.25rem] p-2 border rounded-xl bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 flex flex-wrap gap-1.5 items-center transition-all duration-200 hover:bg-white dark:hover:bg-gray-800">
            {selectedCities.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all duration-200">
                {c.name}
                <button 
                  onClick={() => removeCity(c.id)} 
                  className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5 transition-colors" 
                  aria-label={`Remove ${c.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <div className="relative flex-1 min-w-[140px]">
              <input
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="Type to add cities..."
                className="w-full h-auto border-0 shadow-none focus:ring-0 focus:outline-none p-0 bg-transparent placeholder:text-gray-400 text-sm"
                aria-label="Search and add temporary city"
              />
              {cityQuery && results.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto backdrop-blur-sm">
                  {results.slice(0, 10).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => addTempCity(c)}
                      className="w-full px-3 py-2 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 flex items-center justify-between transition-all duration-200 first:rounded-t-xl last:rounded-b-xl text-sm"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{c.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{c.country}</div>
                      </div>
                      <Plus className="h-4 w-4 text-blue-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Duration */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="duration">
              Duration
            </label>
          </div>
          <select
            id="duration"
            value={durationMins}
            onChange={(e) => setDurationMins(parseInt(e.target.value, 10))}
            className="h-9 w-full px-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {[15, 30, 45, 60, 90].map((m) => (
              <option key={m} value={m}>{m} minutes</option>
            ))}
          </select>
        </div>

        {/* Day */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Day
            </label>
          </div>
          <div className="flex gap-2">
            <Button
              variant={day === 'today' ? 'default' : 'outline'}
              onClick={() => setDay('today')}
              className="flex-1 h-9 rounded-xl font-medium transition-all duration-200 text-sm"
            >
              Today
            </Button>
            <Button
              variant={day === 'tomorrow' ? 'default' : 'outline'}
              onClick={() => setDay('tomorrow')}
              className="flex-1 h-9 rounded-xl font-medium transition-all duration-200 text-sm"
            >
              Tomorrow
            </Button>
          </div>
        </div>

        {/* Source Timezone */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="sourceTZ">
              Source Timezone
            </label>
          </div>
          <input
            id="sourceTZ"
            value={sourceTZ}
            onChange={(e) => setSourceTZ(e.target.value)}
            className="h-9 w-full px-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="e.g., America/New_York"
          />
        </div>
      </div>
    </div>
  );
}


