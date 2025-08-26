'use client';

import { useMemo } from 'react';
import { Pin, X, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrackedCity, usePrefs } from '@/state/usePrefs';
import { nowInTZ, formatTime, getTimezoneOffset } from '@/lib/time';
import { useClock } from '@/context/ClockContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TimeCardProps {
  city: TrackedCity;
}

function getTimeOfDayLabel(hour: number): 'Day' | 'Dawn/Dusk' | 'Night' {
  if (hour >= 6 && hour < 18) return 'Day';
  if ((hour >= 5 && hour < 7) || (hour >= 18 && hour < 20)) return 'Dawn/Dusk';
  return 'Night';
}

function timeOfDayClasses(label: 'Day' | 'Dawn/Dusk' | 'Night') {
  if (label === 'Day') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
  if (label === 'Dawn/Dusk') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
}

export default function TimeCard({ city }: TimeCardProps) {
  const now = useClock();
  const format = usePrefs((s) => s.prefs.format);
  const removeCity = usePrefs((s) => s.removeCity);
  const togglePin = usePrefs((s) => s.togglePin);

  const current = useMemo(() => nowInTZ(city.timezone), [now, city.timezone]);
  const timeStr = formatTime(current, format);
  const dateStr = current.toFormat('MMM dd');
  const offsetStr = getTimezoneOffset(city.timezone);
  const hour = current.hour;
  const tod = getTimeOfDayLabel(hour);

  return (
    <Card className="p-5 rounded-xl shadow-sm border hover:border-primary/30 hover:shadow-md transition-colors">
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge className={cn('mb-1', timeOfDayClasses(tod))}>{tod}</Badge>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base truncate">{city.name}</h3>
              {city.isPinned && <Pin className="h-4 w-4 text-primary fill-primary" />}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {city.country} • {offsetStr}
            </p>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              Local time in {city.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-semibold tracking-tight font-mono tabular-nums">{timeStr}</div>
            <div className="text-sm text-muted-foreground">{dateStr}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Pin ${city.name}`}
              onClick={() => togglePin(city.id)}
              className={cn(city.isPinned && 'text-primary')}
            >
              <Pin className={cn('h-4 w-4', city.isPinned && 'fill-current')} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Remove ${city.name}`}
              onClick={() => removeCity(city.id)}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" aria-label={`More actions for ${city.name}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


