'use client';

import { useMemo } from 'react';
import { Pin, X, MoreHorizontal, Sun, Moon, Sunrise, Clock, MapPin } from 'lucide-react';
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

function getTimeOfDayInfo(hour: number) {
  if (hour >= 6 && hour < 12) return { 
    label: 'Morning', 
    icon: Sunrise, 
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
    textColor: 'text-amber-700 dark:text-amber-300'
  };
  if (hour >= 12 && hour < 18) return { 
    label: 'Afternoon', 
    icon: Sun, 
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20',
    textColor: 'text-yellow-700 dark:text-yellow-300'
  };
  if (hour >= 18 && hour < 22) return { 
    label: 'Evening', 
    icon: Sunrise, 
    color: 'from-orange-400 to-red-500',
    bgColor: 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20',
    textColor: 'text-orange-700 dark:text-orange-300'
  };
  return { 
    label: 'Night', 
    icon: Moon, 
    color: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
    textColor: 'text-blue-700 dark:text-blue-300'
  };
}

function getTimezoneAbbreviation(timezone: string): string {
  // Common timezone abbreviations
  const abbrevMap: Record<string, string> = {
    'America/New_York': 'EST/EDT',
    'America/Chicago': 'CST/CDT', 
    'America/Denver': 'MST/MDT',
    'America/Los_Angeles': 'PST/PDT',
    'Europe/London': 'GMT/BST',
    'Europe/Paris': 'CET/CEST',
    'Europe/Berlin': 'CET/CEST',
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
    'Asia/Kolkata': 'IST',
    'Asia/Dubai': 'GST',
    'Australia/Sydney': 'AEST/AEDT',
    'Pacific/Auckland': 'NZST/NZDT'
  };
  
  return abbrevMap[timezone] || timezone.split('/').pop()?.replace('_', ' ') || 'UTC';
}

function getCountryCode(country: string): string {
  // Map country names to ISO 3166-1 alpha-2 codes for flag display
  const countryCodeMap: Record<string, string> = {
    'United States': 'us',
    'United Kingdom': 'gb',
    'France': 'fr',
    'Germany': 'de',
    'Japan': 'jp',
    'China': 'cn',
    'India': 'in',
    'Australia': 'au',
    'Canada': 'ca',
    'Brazil': 'br',
    'Russia': 'ru',
    'South Korea': 'kr',
    'Italy': 'it',
    'Spain': 'es',
    'Netherlands': 'nl',
    'Switzerland': 'ch',
    'Sweden': 'se',
    'Norway': 'no',
    'Denmark': 'dk',
    'Finland': 'fi',
    'Belgium': 'be',
    'Austria': 'at',
    'Ireland': 'ie',
    'Portugal': 'pt',
    'Greece': 'gr',
    'Poland': 'pl',
    'Czech Republic': 'cz',
    'Hungary': 'hu',
    'Romania': 'ro',
    'Bulgaria': 'bg',
    'Croatia': 'hr',
    'Slovenia': 'si',
    'Slovakia': 'sk',
    'Estonia': 'ee',
    'Latvia': 'lv',
    'Lithuania': 'lt',
    'Luxembourg': 'lu',
    'Malta': 'mt',
    'Cyprus': 'cy',
    'Iceland': 'is',
    'New Zealand': 'nz',
    'Singapore': 'sg',
    'Hong Kong': 'hk',
    'Taiwan': 'tw',
    'South Africa': 'za',
    'Egypt': 'eg',
    'Israel': 'il',
    'Turkey': 'tr',
    'Saudi Arabia': 'sa',
    'UAE': 'ae',
    'Thailand': 'th',
    'Malaysia': 'my',
    'Indonesia': 'id',
    'Philippines': 'ph',
    'Vietnam': 'vn',
    'Mexico': 'mx',
    'Argentina': 'ar',
    'Chile': 'cl',
    'Colombia': 'co',
    'Peru': 'pe',
    'Venezuela': 've',
    'Uruguay': 'uy',
    'Ecuador': 'ec',
    'Bolivia': 'bo',
    'Paraguay': 'py'
  };
  
  return countryCodeMap[country] || 'un'; // UN flag as fallback
}

export default function TimeCard({ city }: TimeCardProps) {
  const now = useClock();
  const format = usePrefs((s) => s.prefs.format);
  const removeCity = usePrefs((s) => s.removeCity);
  const togglePin = usePrefs((s) => s.togglePin);

  const current = useMemo(() => nowInTZ(city.timezone), [now, city.timezone]);
  const timeStr = formatTime(current, format);
  const dateStr = current.toFormat('EEE, MMM dd');
  const offsetStr = getTimezoneOffset(city.timezone);
  const hour = current.hour;
  const timeOfDay = getTimeOfDayInfo(hour);
  const tzAbbrev = getTimezoneAbbreviation(city.timezone);
  const isDST = current.isInDST;
  const countryCode = getCountryCode(city.country);
  
  // Business hours indicator (9 AM - 6 PM)
  const isBusinessHours = hour >= 9 && hour < 18;
  
  // Time difference from now (for relative time)
  const timeDiff = Math.abs(current.hour - new Date().getHours());

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30 shadow-lg shadow-black/5 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 hover:scale-[1.02]">
      {/* Refined gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-200/50 via-gray-100/30 to-gray-200/50 dark:from-gray-700/50 dark:via-gray-600/30 dark:to-gray-700/50 p-[0.5px]">
        <div className="h-full w-full rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30" />
      </div>
      
      {/* Subtle time of day accent */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-60", timeOfDay.color)} />
      
      <CardContent className="relative p-5">
        {/* Compact header with flag, city info and pin */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Country flag */}
            <div className="flex-shrink-0 w-8 h-6 rounded-sm overflow-hidden shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <img 
                src={`https://flagcdn.com/w40/${countryCode}.png`}
                alt={`${city.country} flag`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Fallback to a simple colored rectangle if flag fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"><span class="text-xs font-bold text-primary">${city.country.slice(0, 2).toUpperCase()}</span></div>`;
                }}
              />
            </div>
            
            <div className="min-w-0 flex-1">
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

        {/* Compact time display */}
        <div className="text-center mb-4">
          <div className="text-3xl font-bold font-mono tabular-nums text-foreground mb-1 tracking-tight">
            {timeStr}
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            {dateStr}
          </div>
        </div>

        {/* Compact status info */}
        <div className="space-y-3 mb-4">
          {/* UTC Offset and DST in one line */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">
                {offsetStr} • {tzAbbrev}
              </span>
            </div>
            <Badge variant={isDST ? "default" : "secondary"} className="text-xs px-2 py-0.5 h-5">
              {isDST ? "DST" : "STD"}
            </Badge>
          </div>

          {/* Time of day and business hours */}
          <div className="flex items-center justify-between">
            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full", timeOfDay.bgColor)}>
              <timeOfDay.icon className={cn("w-3 h-3", timeOfDay.textColor)} />
              <span className={cn("text-xs font-medium", timeOfDay.textColor)}>
                {timeOfDay.label}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                isBusinessHours ? "bg-green-500 animate-pulse" : "bg-gray-400"
              )} />
              <span className="text-xs text-muted-foreground">
                {isBusinessHours ? "Business" : "After Hours"}
              </span>
            </div>
          </div>

          {/* Time difference indicator */}
          <div className="text-center">
            <span className="text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-full">
              {timeDiff === 0 ? "Same timezone" : `${timeDiff}h ${timeDiff > 12 ? "behind" : "ahead"}`}
            </span>
          </div>
        </div>

        {/* Compact action buttons */}
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePin(city.id)}
            className={cn(
              "h-8 w-8 rounded-full transition-all duration-200 hover:scale-110",
              city.isPinned 
                ? "text-primary hover:text-primary hover:bg-primary/10" 
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            )}
            aria-label={`Toggle pin for ${city.name}`}
          >
            <Pin className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeCity(city.id)}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110"
            aria-label={`Remove ${city.name}`}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-200 hover:scale-110"
            aria-label="More options"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}