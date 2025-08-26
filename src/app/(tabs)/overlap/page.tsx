'use client';

import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import Timeline from '@/components/overlap/Timeline';
import OverlapForm from '@/components/overlap/OverlapForm';
import Suggestions from '@/components/overlap/Suggestions';
import { usePrefs } from '@/state/usePrefs';
import type { City } from '@/lib/time';

export default function OverlapPage() {
  const homeTZ = usePrefs((s) => s.prefs.homeTZ);
  const trackedCities = usePrefs((s) => s.cities);

  const [selectedCities, setSelectedCities] = useState<City[]>(trackedCities);
  const [durationMins, setDurationMins] = useState<number>(30);
  const [day, setDay] = useState<'today' | 'tomorrow' | Date>('today');
  const [sourceTZ, setSourceTZ] = useState<string>(homeTZ);

  // Placeholder suggestions until helpers are wired
  const suggestions = useMemo(() => [] as any[], [selectedCities, durationMins, day, sourceTZ]);

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/5">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Find Overlapping Hours
            </h1>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Pick cities and see common meeting windows.
        </p>

        {/* Controls */}
        <OverlapForm
          selectedCities={selectedCities}
          setSelectedCities={setSelectedCities}
          durationMins={durationMins}
          setDurationMins={setDurationMins}
          day={day}
          setDay={setDay}
          sourceTZ={sourceTZ}
          setSourceTZ={setSourceTZ}
        />

        {/* Timeline */}
        <Timeline
          cities={selectedCities}
          day={day}
          sourceTZ={sourceTZ}
          durationMins={durationMins}
        />

        {/* Suggestions */}
        <Suggestions suggestions={suggestions} sourceTZ={sourceTZ} />
      </div>
    </div>
  );
}


