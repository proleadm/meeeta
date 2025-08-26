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
    <Card className="group relative p-6 rounded-2xl bg-gradient-to-br from-card via-card to-card/50 border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Subtle accent border based on time of day */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 rounded-t-2xl",
        tod === "Day" && "bg-gradient-to-r from-green-400 to-emerald-500",
        tod === "Dawn/Dusk" && "bg-gradient-to-r from-orange-400 to-amber-500", 
        tod === "Night" && "bg-gradient-to-r from-blue-400 to-indigo-500"
      )} />
      
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge className={cn(
                'px-3 py-1 text-xs font-medium border-0 shadow-sm',
                timeOfDayClasses(tod)
              )}>
                {tod}
              </Badge>
              {city.isPinned && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                  <Pin className="h-3 w-3 text-primary fill-primary" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-xl truncate text-foreground group-hover:text-primary transition-colors">
                {city.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate font-medium">
                {city.country} • {offsetStr}
              </p>
              <p className="text-xs text-muted-foreground/80 truncate">
                Local time in {city.name}
              </p>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div className="text-4xl md:text-5xl font-bold tracking-tight font-mono tabular-nums text-foreground">
              {timeStr}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {dateStr}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePin(city.id)}
            className={cn(
              "h-8 w-8 p-0 rounded-full hover:bg-primary/10 transition-all duration-200",
              city.isPinned ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-primary"
            )}
            aria-label={`Toggle pin for ${city.name}`}
          >
            <Pin className="h-4 w-4" />
            <span className="sr-only">Pin</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeCity(city.id)}
            className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            aria-label={`Remove ${city.name}`}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


