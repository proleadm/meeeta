'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import Timeline from '@/components/overlap/Timeline';
import OverlapForm from '@/components/overlap/OverlapForm';
import Suggestions from '@/components/overlap/Suggestions';
import BestWindowBanner from '@/components/overlap/BestWindowBanner';
import { intersectEligible, formatSlotForCopy, type City as OverlapCity, type Slot } from '@/lib/time-overlap';
import { usePrefs } from '@/state/usePrefs';
import type { City } from '@/lib/time';
import HomeTimeBar from '@/components/overlap/HomeTimeBar';
import CustomSelectionBanner from '@/components/overlap/CustomSelectionBanner';

export default function OverlapPage() {
  const homeTZ = usePrefs((s) => s.prefs.homeTZ);
  const trackedCities = usePrefs((s) => s.cities);

  // Determine default selection from pinned cities (fallback to all tracked)
  const pinnedOrTracked = useMemo(() => {
    const pinned = trackedCities.filter((c) => c.isPinned);
    return pinned.length > 0 ? pinned : trackedCities;
  }, [trackedCities]);

  const [selectedCities, setSelectedCities] = useState<City[]>(pinnedOrTracked);
  const [isSyncedWithClocks, setIsSyncedWithClocks] = useState<boolean>(true);
  const [durationMins, setDurationMins] = useState<number>(30);
  const [day, setDay] = useState<'today' | 'tomorrow' | Date>('today');
  const [sourceTZ, setSourceTZ] = useState<string>(homeTZ);
  const [hoveredSlot, setHoveredSlot] = useState<Slot | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [selectedMinuteOfDay, setSelectedMinuteOfDay] = useState<number>(DateTime.now().setZone(homeTZ).hour * 60 + DateTime.now().setZone(homeTZ).minute);

  // Clamp selection when duration changes or timezone changes (to keep band within day)
  useEffect(() => {
    setSelectedMinuteOfDay((prev) => {
      let start = prev - Math.floor(durationMins / 2);
      if (start < 0) return Math.floor(durationMins / 2);
      if (start > 1440 - durationMins) return 1440 - Math.ceil(durationMins / 2);
      return prev;
    });
  }, [durationMins, sourceTZ]);

  // Keep Overlap selected cities synced with Clocks (pinned first) until user adjusts locally
  useEffect(() => {
    if (!isSyncedWithClocks) return;
    setSelectedCities(pinnedOrTracked);
  }, [isSyncedWithClocks, pinnedOrTracked]);

  const sourceDay = useMemo(() => (
    typeof day === 'string' ? (day === 'today' ? DateTime.now() : DateTime.now().plus({ days: 1 })) : DateTime.fromJSDate(day as Date)
  ), [day]);

  // Compute suggestions using new overlap logic
  const suggestions = useMemo(() => {
    if (!selectedCities.length) return [] as Slot[];
    
    // Convert City[] to OverlapCity[]
    const overlapCities: OverlapCity[] = selectedCities.map(city => ({
      id: city.id,
      name: city.name,
      country: city.country,
      timezone: city.timezone
    }));
    
    return intersectEligible(overlapCities, sourceDay, sourceTZ, durationMins, 5);
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
          setSelectedCities={(cities) => {
            setIsSyncedWithClocks(false);
            setSelectedCities(cities);
          }}
          durationMins={durationMins}
          setDurationMins={setDurationMins}
          day={day}
          setDay={setDay}
          sourceTZ={sourceTZ}
          setSourceTZ={setSourceTZ}
        />

        {/* Best Window */}
        <BestWindowBanner
          slot={suggestions[0] || null}
          cities={selectedCities}
          sourceTZ={sourceTZ}
          onCopy={async () => {
            const slot = suggestions[0];
            if (!slot) return;
            const overlapCities: OverlapCity[] = selectedCities.map(city => ({
              id: city.id,
              name: city.name,
              country: city.country,
              timezone: city.timezone
            }));
            const copyText = formatSlotForCopy(slot, overlapCities, sourceTZ);
            try { 
              await navigator.clipboard.writeText(copyText); 
            } catch (err) {
              console.error('Failed to copy:', err);
            }
          }}
        />

        {/* Custom selection banner (shows current marker window and copy) */}
        <CustomSelectionBanner
          cities={selectedCities}
          sourceTZ={sourceTZ}
          sourceDay={sourceDay}
          selectedMinuteOfDay={selectedMinuteOfDay}
          durationMins={durationMins}
        />

        {/* Home Time Bar - anchor at very top of visualizer */}
        <HomeTimeBar
          selectedMinuteOfDay={selectedMinuteOfDay}
          onChangeMinute={setSelectedMinuteOfDay}
          durationMins={durationMins}
          timezone={sourceTZ}
        />

        {/* Timeline */}
        <Timeline
          cities={selectedCities}
          day={day}
          sourceTZ={sourceTZ}
          durationMins={durationMins}
          suggestions={suggestions}
          hoveredSlot={hoveredSlot}
          selectedTime={selectedMinuteOfDay}
          onSelectTime={setSelectedMinuteOfDay}
        />

        {/* Suggestions */}
        <Suggestions 
          suggestions={suggestions}
          cities={selectedCities}
          sourceTZ={sourceTZ}
          selectedMinuteOfDay={selectedMinuteOfDay}
          onHover={setHoveredSlot}
          onLeave={() => setHoveredSlot(null)}
          onPick={(slot) => {
            const sourceTime = slot.interval.start.setZone(sourceTZ);
            const minutes = sourceTime.hour * 60 + sourceTime.minute;
            setSelectedMinuteOfDay(minutes);
          }}
          onCopy={async (slot) => {
            const overlapCities: OverlapCity[] = selectedCities.map(city => ({
              id: city.id,
              name: city.name,
              country: city.country,
              timezone: city.timezone
            }));
            const copyText = formatSlotForCopy(slot, overlapCities, sourceTZ);
            try { 
              await navigator.clipboard.writeText(copyText); 
            } catch (err) {
              console.error('Failed to copy:', err);
            }
          }}
        />
      </div>
    </div>
  );
}


