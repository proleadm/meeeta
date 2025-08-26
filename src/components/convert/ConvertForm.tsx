'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { usePrefs } from '@/state/usePrefs';
import { listCommonCities } from '@/lib/time';
import { minutesToString } from '@/lib/parseTime';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConvertFormProps {
  defaultInput?: string;
  defaultSourceTZ?: string;
  error?: string | null;
  onConvert: (payload: { input: string; sourceTZ: string; dt: DateTime }) => void;
}

export default function ConvertForm({ defaultInput = '', defaultSourceTZ, onConvert, error }: ConvertFormProps) {
  const homeTZ = usePrefs((s) => s.prefs.homeTZ);
  const formatPref = usePrefs((s) => s.prefs.format);
  const [sourceTZ, setSourceTZ] = useState(defaultSourceTZ || homeTZ);
  // unified minute-of-day scrubber (0..1439)
  const [minuteOfDay, setMinuteOfDay] = useState<number>(() => {
    const now = DateTime.now();
    return now.hour * 60 + now.minute;
  });
  const [date, setDate] = useState<DateTime>(DateTime.now());

  useEffect(() => {
    if (defaultSourceTZ) setSourceTZ(defaultSourceTZ);
  }, [defaultSourceTZ]);

  const tzOptions = useMemo(() => {
    const set = new Set<string>();
    set.add(homeTZ);
    listCommonCities().forEach((c) => set.add(c.timezone));
    return Array.from(set).sort();
  }, [homeTZ]);

  // helpers
  function minutesToHHMM(m: number) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const hh = h.toString().padStart(2, '0');
    const mm = min.toString().padStart(2, '0');
    if (formatPref === '24h') return `${hh}:${mm}`;
    const dt = DateTime.fromObject({ hour: h, minute: min });
    return dt.toFormat('h:mm a');
  }
  function hhmmToMinutes(hhmm: string) {
    const parts = hhmm.trim().toLowerCase();
    // try 24h first
    const m24 = parts.match(/^(\d{1,2}):(\d{2})$/);
    if (m24) {
      const h = Math.min(23, Math.max(0, Number(m24[1])));
      const m = Math.min(59, Math.max(0, Number(m24[2])));
      return h * 60 + m;
    }
    // try 12h like 10:30 am or 10am
    const m12 = parts.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
    if (m12) {
      let h = Number(m12[1]);
      const m = Number(m12[2] || '0');
      const ampm = m12[3];
      if (ampm === 'am') { if (h === 12) h = 0; }
      if (ampm === 'pm') { if (h !== 12) h += 12; }
      return h * 60 + m;
    }
    return null;
  }

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const h = Math.floor(minuteOfDay / 60);
    const m = minuteOfDay % 60;
    const dt = date.set({ hour: h, minute: m }).setZone(sourceTZ);
    const timeString = minutesToString(minuteOfDay, formatPref === '12h');
    onConvert({ input: timeString, sourceTZ, dt });
  };

  const setNow = () => {
    const dt = DateTime.now().setZone(sourceTZ);
    onConvert({ input: 'now', sourceTZ, dt });
    setMinuteOfDay(dt.hour * 60 + dt.minute);
    setDate(dt);
  };

  // Instant re-run when scrubber/date change
  useEffect(() => {
    const h = Math.floor(minuteOfDay / 60);
    const m = minuteOfDay % 60;
    const dt = date.set({ hour: h, minute: m }).setZone(sourceTZ);
    const timeString = minutesToString(minuteOfDay, formatPref === '12h');
    onConvert({ input: timeString, sourceTZ, dt });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minuteOfDay, date, sourceTZ]);

  return (
    <div className="sticky top-2 z-10 rounded-2xl border-0 bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30 shadow-lg shadow-black/5 backdrop-blur-sm p-3 md:p-4 lg:p-5">
      <form onSubmit={submit} className="space-y-3 md:space-y-4">
        {/* Compact Header Row */}
        <div className="flex flex-wrap gap-3 lg:items-center">
          {/* Source timezone */}
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">Source timezone:</div>
            <Select value={sourceTZ} onValueChange={setSourceTZ}>
              <SelectTrigger 
                aria-label="Source timezone"
                className="h-9 w-48 rounded-lg border-gray-200/50 dark:border-gray-700/50 bg-background/50 backdrop-blur-sm focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
              >
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectGroup>
                  {tzOptions.map((tz) => (
                    <SelectItem value={tz} key={tz} className="rounded-md">{tz}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Time dropdowns */}
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-muted-foreground">Time:</div>
          
          {/* Hour Dropdown */}
          <Select 
            value={formatPref === '12h' ? 
              (minuteOfDay === 0 ? '12' : Math.floor(minuteOfDay / 60) > 12 ? String(Math.floor(minuteOfDay / 60) - 12) : String(Math.floor(minuteOfDay / 60) || 12)) : 
              String(Math.floor(minuteOfDay / 60))
            }
            onValueChange={(value) => {
              const hour = parseInt(value);
              const currentMinute = minuteOfDay % 60;
              const currentHour = Math.floor(minuteOfDay / 60);
              const isAM = currentHour < 12;
              
              let newHour = hour;
              if (formatPref === '12h') {
                if (hour === 12) {
                  newHour = isAM ? 0 : 12;
                } else {
                  newHour = isAM ? hour : hour + 12;
                }
              }
              
              const newMinutes = Math.max(0, Math.min(1439, newHour * 60 + currentMinute));
              setMinuteOfDay(newMinutes);
            }}
          >
            <SelectTrigger className="w-16 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {formatPref === '12h' ? 
                  Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                  )) :
                  Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>{i.toString().padStart(2, '0')}</SelectItem>
                  ))
                }
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Minute Dropdown */}
          <Select 
            value={String(minuteOfDay % 60)}
            onValueChange={(value) => {
              const minute = parseInt(value);
              const currentHour = Math.floor(minuteOfDay / 60);
              const newMinutes = Math.max(0, Math.min(1439, currentHour * 60 + minute));
              setMinuteOfDay(newMinutes);
            }}
          >
            <SelectTrigger className="w-16 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Array.from({ length: 60 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>{i.toString().padStart(2, '0')}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* AM/PM Dropdown - only in 12h mode */}
          {formatPref === '12h' && (
            <Select 
              value={Math.floor(minuteOfDay / 60) < 12 ? 'AM' : 'PM'}
              onValueChange={(value) => {
                const currentHour = Math.floor(minuteOfDay / 60);
                const currentMinute = minuteOfDay % 60;
                const hour12 = currentHour % 12;
                
                let newHour = value === 'AM' ? hour12 : hour12 + 12;
                if (hour12 === 0) newHour = value === 'AM' ? 0 : 12;
                
                const newMinutes = Math.max(0, Math.min(1439, newHour * 60 + currentMinute));
                setMinuteOfDay(newMinutes);
              }}
            >
              <SelectTrigger className="w-16 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          </div>

          {/* Now button */}
          <Button 
            type="button" 
            variant="outline" 
            onClick={setNow} 
            className="h-9 px-4 rounded-lg border-gray-200/50 dark:border-gray-700/50 bg-background/50 backdrop-blur-sm hover:bg-muted/30 transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Now
          </Button>
        </div>

        {/* Clock-Face Style Scrubber */}
        <div className="space-y-6 md:space-y-8">
          <div className="relative pb-6">
            {/* Hour tick marks */}
            <div className="absolute inset-x-0 top-1 h-2 pointer-events-none">
              {Array.from({ length: 25 }, (_, i) => {
                const position = (i / 24) * 100; // 0-24 hours, so divide by 24
                const isMajorTick = i % 6 === 0; // Major ticks at 0, 6, 12, 18, 24
                return (
                  <div
                    key={i}
                    className={`absolute top-0 w-px bg-gray-300/60 dark:bg-gray-600/60 ${
                      isMajorTick ? 'h-2' : 'h-1'
                    }`}
                    style={{ left: `${position}%` }}
                  />
                );
              })}
            </div>
            
            {/* Gradient scrubber */}
            <input
              type="range"
              min={0}
              max={1439}
              step={1}
              value={minuteOfDay}
              onChange={(e) => {
                const v = Math.max(0, Math.min(1439, Number(e.target.value)));
                setMinuteOfDay(v);
              }}
              className="w-full h-3 rounded-full appearance-none cursor-pointer gradient-scrubber relative z-10 mt-1"
              aria-label="Time scrubber"
              style={{
                background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(147 51 234) ${(minuteOfDay / 1439) * 100}%, rgb(229 231 235) ${(minuteOfDay / 1439) * 100}%, rgb(229 231 235) 100%)`
              }}
            />
            
            {/* Time tooltip above thumb */}
            <div 
              className="absolute -top-10 transform -translate-x-1/2 -translate-y-1 text-xs font-semibold bg-primary text-primary-foreground px-2 py-1 rounded shadow-sm ring-2 ring-primary/40 focus:ring-primary/60 transition-all duration-200 z-20 hidden sm:block"
              style={{ left: `${(minuteOfDay / 1439) * 100}%` }}
            >
              {minutesToString(minuteOfDay, formatPref === '12h')}
            </div>
            
            {/* Hour labels */}
            <div className="absolute inset-x-0 bottom-0 pointer-events-none hidden sm:block">
              {[0, 6, 12, 18, 24].map((hour) => {
                const position = (hour / 24) * 100; // Fixed positioning calculation
                return (
                  <div
                    key={hour}
                    className={`absolute text-xs text-muted-foreground font-medium ${
                      hour === 24 ? 'transform -translate-x-full' : 'transform -translate-x-1/2'
                    }`}
                    style={{ left: `${position}%` }}
                  >
                    {hour.toString().padStart(2, '0')}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day selector - horizontal group */}
          <div className="flex items-center gap-2 mt-6 md:mt-8">
            <Button 
              type="button" 
              variant={date.hasSame(DateTime.now().setZone(sourceTZ), 'day') ? "default" : "outline"}
              size="sm"
              onClick={() => setDate(DateTime.now().setZone(sourceTZ))}
              className="h-8 px-3 rounded-md text-xs transition-all duration-200"
            >
              Today
            </Button>
            <Button 
              type="button" 
              variant={date.hasSame(DateTime.now().setZone(sourceTZ).plus({ days: 1 }), 'day') ? "default" : "outline"}
              size="sm"
              onClick={() => setDate(DateTime.now().setZone(sourceTZ).plus({ days: 1 }))}
              className="h-8 px-3 rounded-md text-xs transition-all duration-200"
            >
              Tomorrow
            </Button>
            <Button 
              type="button" 
              variant={date.hasSame(DateTime.now().setZone(sourceTZ).minus({ days: 1 }), 'day') ? "default" : "outline"}
              size="sm"
              onClick={() => setDate(DateTime.now().setZone(sourceTZ).minus({ days: 1 }))}
              className="h-8 px-3 rounded-md text-xs transition-all duration-200"
            >
              Yesterday
            </Button>
            <div className="ml-auto text-xs text-muted-foreground font-medium">
              {date.toFormat('EEE, MMM dd')}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}


