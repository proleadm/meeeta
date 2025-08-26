'use client';

import { useMemo, useState } from 'react';
import { Pin, X, MoreHorizontal, Sun, Moon, Sunrise, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrackedCity, usePrefs } from '@/state/usePrefs';
import { nowInTZ, formatTime, getTimezoneOffset } from '@/lib/time';
import { getTimezoneAbbreviation, formatUtcOffset, formatOffsetDelta, getCountryCode } from '@/lib/time-format';
import { useClock } from '@/context/ClockContext';
import { useMounted } from '@/hooks/useMounted';
import { cn } from '@/lib/utils';

interface TimeCardProps {
  city: TrackedCity;
  // When provided, the card renders this fixed DateTime (converted to city's tz)
  fixedDateTime?: import('luxon').DateTime;
  // Hide pin/remove actions for read-only contexts (e.g., Convert tab)
  readOnly?: boolean;
  // Provide source context to show relative delta/day offset
  sourceTZ?: string;
  sourceDt?: import('luxon').DateTime;
  // Show a Copy button (for Convert tab)
  showCopy?: boolean;
}

// Theme-safe time-of-day configuration
function getTimeOfDayInfo(hour: number) {
  if (hour >= 5 && hour < 11) return { 
    label: 'Morning', 
    icon: Sunrise,
    badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
    borderColor: 'from-yellow-400 to-amber-500'
  };
  if (hour >= 11 && hour < 17) return { 
    label: 'Afternoon', 
    icon: Sun,
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    borderColor: 'from-emerald-400 to-green-500'
  };
  if (hour >= 17 && hour < 21) return { 
    label: 'Evening', 
    icon: Sunrise,
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
    borderColor: 'from-orange-400 to-red-500'
  };
  return { 
    label: 'Night', 
    icon: Moon,
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
    borderColor: 'from-indigo-400 to-blue-500'
  };
}



export default function TimeCard({ city, fixedDateTime, readOnly = false, sourceTZ, sourceDt, showCopy = false }: TimeCardProps) {
  const mounted = useMounted();
  const now = useClock();
  const format = usePrefs((s) => s.prefs.format);
  const workingHours = usePrefs((s) => s.prefs.workingHours) || { start: 9, end: 17 };
  const removeCity = usePrefs((s) => s.removeCity);
  const togglePin = usePrefs((s) => s.togglePin);
  const [copied, setCopied] = useState(false);

  // Memoize expensive calculations (must be called before any early returns)
  const timeData = useMemo(() => {
    const base = fixedDateTime ? fixedDateTime : now;
    const current = (fixedDateTime ? fixedDateTime : nowInTZ(city.timezone)).setZone(city.timezone);
    const timeStr = formatTime(current, format);
    const dateStr = current.toFormat('EEE, MMM dd');
    const offsetStr = formatUtcOffset(city.timezone);
    const hour = current.hour;
    const timeOfDay = getTimeOfDayInfo(hour);
    const tzAbbrev = getTimezoneAbbreviation(city.timezone);
    const isDST = current.isInDST;
    const countryCode = getCountryCode(city.country);
    
    // Business hours calculation
    const isBusinessHours = hour >= workingHours.start && hour < workingHours.end;
    
    // Relative delta vs source using shared helper
    let relLabel: string | null = null;
    let dayOffsetLabel: string | null = null;
    if (sourceTZ && sourceDt) {
      const delta = formatOffsetDelta(sourceDt, city.timezone);
      relLabel = delta.relLabel;
      dayOffsetLabel = delta.dayOffsetLabel;
    }

    return {
      current,
      timeStr,
      dateStr,
      offsetStr,
      hour,
      timeOfDay,
      tzAbbrev,
      isDST,
      countryCode,
      isBusinessHours,
      relLabel,
      dayOffsetLabel
    };
  }, [now, fixedDateTime, city.timezone, city.country, format, workingHours, sourceTZ, sourceDt]);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <Card className="h-full flex flex-col justify-between group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30 shadow-lg shadow-black/5 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:-translate-y-1 hover:scale-[1.02]">
      {/* Top gradient border for time-of-day */}
      <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", timeData.timeOfDay.borderColor)} />
      
      <CardContent className="relative p-5 flex flex-col h-full">
        {/* Time-of-day pill */}
        <div className="mb-2 w-fit">
          <Badge className={cn("text-xs px-2 py-1 border-0 shadow-sm", timeData.timeOfDay.badgeClass)}>
            <timeData.timeOfDay.icon className="w-3 h-3 mr-1" />
            {timeData.timeOfDay.label}
          </Badge>
        </div>

        {/* City header with flag */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Country flag with fallback */}
            <div className="flex-shrink-0 w-8 h-6 rounded-sm overflow-hidden shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <img 
                src={`https://flagcdn.com/w40/${timeData.countryCode}.png`}
                alt={`${city.country} flag`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"><span class="text-xs font-bold text-primary">${city.country.slice(0, 2).toUpperCase()}</span></div>`;
                }}
              />
            </div>
            
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                {city.name}
              </h3>
              <p className="text-xs font-medium text-muted-foreground truncate">
                {city.country}
              </p>
            </div>
          </div>
          
          {city.isPinned && (
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex-shrink-0">
              <Pin className="w-3 h-3 text-primary fill-primary" />
            </div>
          )}
        </div>

        {/* Main time display - single line with reduced font size */}
        <div className="text-center mb-4 flex-1 flex flex-col justify-center">
          <div className="text-3xl md:text-4xl font-semibold font-mono tabular-nums tracking-tight text-foreground/90 mb-1 group-hover:scale-105 transition-transform duration-200 whitespace-nowrap">
            {timeData.timeStr}
          </div>
          <div className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 opacity-60" />
            {timeData.dateStr}
          </div>
        </div>

        {/* Compact status info - tighter spacing */}
        <div className="space-y-1 mb-4">
          {/* UTC Offset and DST */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-muted-foreground">
                {timeData.offsetStr} • {timeData.tzAbbrev}
              </span>
            </div>
            <Badge variant={timeData.isDST ? "default" : "secondary"} className="text-xs px-2 py-0.5 h-5">
              {timeData.isDST ? "DST" : "STD"}
            </Badge>
          </div>

          {/* Relative vs source or business hours */}
          {sourceTZ && sourceDt ? (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                {timeData.dayOffsetLabel && (
                  <Badge variant="secondary" className="px-2 py-0.5 h-5">{timeData.dayOffsetLabel}</Badge>
                )}
              </div>
              <span className="text-muted-foreground">{timeData.relLabel}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  timeData.isBusinessHours ? "bg-green-500 animate-pulse" : "bg-gray-400"
                )} />
                <span className="text-muted-foreground">
                  {timeData.isBusinessHours ? "Business" : "After Hours"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions / Copy */}
        <div className="flex items-center justify-center gap-1">
          {showCopy && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${city.name} — ${timeData.timeStr} (${timeData.dateStr})`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                } catch {}
              }}
              className="h-8 px-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Copy ${city.name} time`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          )}

          {!readOnly && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => togglePin(city.id)}
                className={cn(
                  "h-8 w-8 rounded-full transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  city.isPinned 
                    ? "text-primary hover:text-primary hover:bg-primary/10" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                )}
                aria-label={city.isPinned ? `Unpin ${city.name}` : `Pin ${city.name}`}
              >
                <Pin className="h-3.5 w-3.5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCity(city.id)}
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Remove ${city.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`More options for ${city.name}`}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}