'use client';

import { useMemo } from 'react';
import { Pin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { City, nowInTZ, formatTime, getTimezoneOffset } from '@/lib/time';
import { usePrefs } from '@/state/usePrefs';
import { cn } from '@/lib/utils';
import { useClock } from '@/context/ClockContext';

interface CityItemProps {
  city: City;
}

export function CityItem({ city }: CityItemProps) {
  const now = useClock();
  const format = usePrefs(state => state.prefs.format);
  const removeCity = usePrefs(state => state.removeCity);
  const togglePin = usePrefs(state => state.togglePin);
  
  const currentTime = useMemo(() => nowInTZ(city.timezone), [now, city.timezone]);
  const timeString = formatTime(currentTime, format);
  const offsetString = getTimezoneOffset(city.timezone);
  const dateString = currentTime.toFormat('MMM d');
  
  return (
    <Card className="group relative">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-lg truncate">{city.name}</h3>
          {city.isPinned && (
            <Pin className="h-4 w-4 text-primary fill-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {city.country} • {offsetString}
        </p>
        </div>
      
        <div className="text-right">
        <div className="text-2xl font-mono font-bold tabular-nums">
          {timeString}
        </div>
        <div className="text-sm text-muted-foreground">
          {dateString}
        </div>
        </div>
      
      {/* Action buttons - shown on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => togglePin(city.id)}
          className={cn(
            "h-8 w-8 p-0",
            city.isPinned && "text-primary"
          )}
        >
          <Pin className={cn(
            "h-4 w-4",
            city.isPinned && "fill-current"
          )} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeCity(city.id)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      </CardContent>
    </Card>
  );
}
