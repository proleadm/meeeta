'use client';

import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import Timeline from '@/components/overlap/Timeline';
import OverlapForm from '@/components/overlap/OverlapForm';
import Suggestions from '@/components/overlap/Suggestions';
import BestWindowBanner from '@/components/overlap/BestWindowBanner';
import { intersectAll, mapCityBusinessToSourceDay, sliceByDuration, scoreSlot, formatSlot } from '@/lib/time-overlap';
import { usePrefs } from '@/state/usePrefs';
import type { City } from '@/lib/time';

export default function OverlapPage() {
  const homeTZ = usePrefs((s) => s.prefs.homeTZ);
  const trackedCities = usePrefs((s) => s.cities);

  const [selectedCities, setSelectedCities] = useState<City[]>(trackedCities);
  const [durationMins, setDurationMins] = useState<number>(30);
  const [day, setDay] = useState<'today' | 'tomorrow' | Date>('today');
  const [sourceTZ, setSourceTZ] = useState<string>(homeTZ);
  const [hoverSlot, setHoverSlot] = useState<import('luxon').Interval | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);

  const sourceDay = useMemo(() => (
    typeof day === 'string' ? (day === 'today' ? DateTime.now() : DateTime.now().plus({ days: 1 })) : DateTime.fromJSDate(day as Date)
  ), [day]);

  // Compute suggestions centrally
  const suggestions = useMemo(() => {
    if (!selectedCities.length) return [] as any[];
    const perCity = selectedCities.map((c) => {
      const biz = mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '09:00', '17:00');
      const early = mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '07:00', '09:00');
      const late = mapCityBusinessToSourceDay(c.timezone, sourceTZ, sourceDay, '17:00', '21:00');
      return [...biz, ...early, ...late];
    });
    const overlap = intersectAll(perCity);
    if (overlap.length === 0) return [];
    const slots = sliceByDuration(overlap, durationMins, 5);
    const scored = slots.map((slot) => {
      const score = scoreSlot(slot, selectedCities);
      const { label, lines } = formatSlot(slot, selectedCities, sourceTZ);
      return { slot, label, lines, score };
    });
    scored.sort((a, b) => (b.score - a.score) || a.slot.start.toMillis() - b.slot.start.toMillis());
    return scored.slice(0, 5);
  }, [selectedCities, sourceTZ, sourceDay, durationMins]);

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

        {/* Best Window */}
        <BestWindowBanner
          suggestion={suggestions[0] || null}
          onCopy={async () => {
            const s = suggestions[0];
            if (!s) return;
            const oneLine = `${s.label} — ` + s.lines.map((ln: any) => `${ln.city}: ${ln.local}`).join(' • ');
            try { await navigator.clipboard.writeText(oneLine); } catch {}
          }}
        />

        {/* Timeline */}
        <Timeline
          cities={selectedCities}
          day={day}
          sourceTZ={sourceTZ}
          durationMins={durationMins}
          suggestions={suggestions}
          hoverSlot={hoverSlot}
          selectedMinute={selectedMinute}
          onSelectMinute={setSelectedMinute}
        />

        {/* Suggestions */}
        <Suggestions 
          sourceTZ={sourceTZ} 
          cities={selectedCities} 
          durationMins={durationMins} 
          day={day}
          suggestions={suggestions}
          onHover={(s) => setHoverSlot(s?.slot || null)}
          onLeave={() => setHoverSlot(null)}
          onPick={(s) => {
            const m = s.slot.start.setZone(sourceTZ).hour * 60 + s.slot.start.setZone(sourceTZ).minute;
            setSelectedMinute(m);
          }}
        />
      </div>
    </div>
  );
}


