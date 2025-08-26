'use client';

import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePrefs } from '@/state/usePrefs';
import { useClock } from '@/context/ClockContext';
import { getTimezoneOffset } from '@/lib/time';

function getCountryFromTimezone(timezone: string): { country: string; code: string } {
  // Map common timezones to countries and their ISO codes
  const timezoneCountryMap: Record<string, { country: string; code: string }> = {
    'America/New_York': { country: 'United States', code: 'us' },
    'America/Chicago': { country: 'United States', code: 'us' },
    'America/Denver': { country: 'United States', code: 'us' },
    'America/Los_Angeles': { country: 'United States', code: 'us' },
    'America/Phoenix': { country: 'United States', code: 'us' },
    'America/Anchorage': { country: 'United States', code: 'us' },
    'Pacific/Honolulu': { country: 'United States', code: 'us' },
    'America/Toronto': { country: 'Canada', code: 'ca' },
    'America/Vancouver': { country: 'Canada', code: 'ca' },
    'America/Montreal': { country: 'Canada', code: 'ca' },
    'Europe/London': { country: 'United Kingdom', code: 'gb' },
    'Europe/Paris': { country: 'France', code: 'fr' },
    'Europe/Berlin': { country: 'Germany', code: 'de' },
    'Europe/Rome': { country: 'Italy', code: 'it' },
    'Europe/Madrid': { country: 'Spain', code: 'es' },
    'Europe/Amsterdam': { country: 'Netherlands', code: 'nl' },
    'Europe/Brussels': { country: 'Belgium', code: 'be' },
    'Europe/Zurich': { country: 'Switzerland', code: 'ch' },
    'Europe/Vienna': { country: 'Austria', code: 'at' },
    'Europe/Stockholm': { country: 'Sweden', code: 'se' },
    'Europe/Oslo': { country: 'Norway', code: 'no' },
    'Europe/Copenhagen': { country: 'Denmark', code: 'dk' },
    'Europe/Helsinki': { country: 'Finland', code: 'fi' },
    'Europe/Dublin': { country: 'Ireland', code: 'ie' },
    'Europe/Lisbon': { country: 'Portugal', code: 'pt' },
    'Europe/Athens': { country: 'Greece', code: 'gr' },
    'Europe/Warsaw': { country: 'Poland', code: 'pl' },
    'Europe/Prague': { country: 'Czech Republic', code: 'cz' },
    'Europe/Budapest': { country: 'Hungary', code: 'hu' },
    'Europe/Bucharest': { country: 'Romania', code: 'ro' },
    'Asia/Tokyo': { country: 'Japan', code: 'jp' },
    'Asia/Shanghai': { country: 'China', code: 'cn' },
    'Asia/Hong_Kong': { country: 'Hong Kong', code: 'hk' },
    'Asia/Singapore': { country: 'Singapore', code: 'sg' },
    'Asia/Seoul': { country: 'South Korea', code: 'kr' },
    'Asia/Taipei': { country: 'Taiwan', code: 'tw' },
    'Asia/Bangkok': { country: 'Thailand', code: 'th' },
    'Asia/Jakarta': { country: 'Indonesia', code: 'id' },
    'Asia/Manila': { country: 'Philippines', code: 'ph' },
    'Asia/Kuala_Lumpur': { country: 'Malaysia', code: 'my' },
    'Asia/Ho_Chi_Minh': { country: 'Vietnam', code: 'vn' },
    'Asia/Kolkata': { country: 'India', code: 'in' },
    'Asia/Calcutta': { country: 'India', code: 'in' },
    'Asia/Mumbai': { country: 'India', code: 'in' },
    'Asia/Delhi': { country: 'India', code: 'in' },
    'Asia/Dubai': { country: 'UAE', code: 'ae' },
    'Asia/Riyadh': { country: 'Saudi Arabia', code: 'sa' },
    'Asia/Tel_Aviv': { country: 'Israel', code: 'il' },
    'Asia/Istanbul': { country: 'Turkey', code: 'tr' },
    'Australia/Sydney': { country: 'Australia', code: 'au' },
    'Australia/Melbourne': { country: 'Australia', code: 'au' },
    'Australia/Brisbane': { country: 'Australia', code: 'au' },
    'Australia/Perth': { country: 'Australia', code: 'au' },
    'Pacific/Auckland': { country: 'New Zealand', code: 'nz' },
    'Africa/Cairo': { country: 'Egypt', code: 'eg' },
    'Africa/Johannesburg': { country: 'South Africa', code: 'za' },
    'America/Mexico_City': { country: 'Mexico', code: 'mx' },
    'America/Sao_Paulo': { country: 'Brazil', code: 'br' },
    'America/Buenos_Aires': { country: 'Argentina', code: 'ar' },
    'America/Santiago': { country: 'Chile', code: 'cl' },
    'America/Bogota': { country: 'Colombia', code: 'co' },
    'America/Lima': { country: 'Peru', code: 'pe' },
    'Europe/Moscow': { country: 'Russia', code: 'ru' },
  };
  
  return timezoneCountryMap[timezone] || { country: 'Unknown', code: 'un' };
}

function formatWithSeconds(dt: DateTime, format: '12h' | '24h') {
  return format === '12h' ? dt.toFormat('h:mm:ss a') : dt.toFormat('HH:mm:ss');
}

export default function HomeTimeBar() {
  const now = useClock();
  const format = usePrefs((s) => s.prefs.format);
  const homeTZ = usePrefs((s) => s.prefs.homeTZ);

  const dt = useMemo(() => DateTime.fromJSDate(now).setZone(homeTZ), [now, homeTZ]);
  const timeStr = formatWithSeconds(dt, format);
  const dateStr = dt.toFormat('MMM dd');
  const offsetStr = getTimezoneOffset(homeTZ);
  const isDst = dt.isInDST;
  const countryInfo = getCountryFromTimezone(homeTZ);

  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(timeStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  return (
    <div className="relative overflow-hidden">
      {/* Premium gradient background with world map pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/10 to-emerald-500/5 rounded-3xl"></div>
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
          <path d="M50 100 Q100 50 150 100 T250 100 T350 100" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
          <circle cx="80" cy="100" r="2" fill="currentColor" opacity="0.4"/>
          <circle cx="180" cy="80" r="1.5" fill="currentColor" opacity="0.3"/>
          <circle cx="280" cy="120" r="2" fill="currentColor" opacity="0.4"/>
          <circle cx="320" cy="90" r="1" fill="currentColor" opacity="0.2"/>
        </svg>
      </div>
      
      <div className="relative backdrop-blur-xl bg-gradient-to-r from-card/60 via-card/80 to-card/60 border-2 border-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between gap-6">
          {/* Left side - Location info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">🏠 Home Base</span>
                {isDst && (
                  <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 dark:from-amber-900 dark:to-orange-900 dark:text-amber-100 border-0 shadow-sm text-xs px-2 py-0.5 h-5">
                    DST Active
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                {/* Country flag */}
                <div className="flex-shrink-0 w-8 h-6 rounded-sm overflow-hidden shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                  <img 
                    src={`https://flagcdn.com/w40/${countryInfo.code}.png`}
                    alt={`${countryInfo.country} flag`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to a simple colored rectangle if flag fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"><span class="text-xs font-bold text-primary">${countryInfo.country.slice(0, 2).toUpperCase()}</span></div>`;
                    }}
                  />
                </div>
                <div className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {homeTZ.replace('_', ' ')}
                </div>
              </div>
              <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                <span>{offsetStr}</span>
                <span className="w-1 h-1 bg-muted-foreground/50 rounded-full"></span>
                <span>{dateStr}</span>
                <span className="w-1 h-1 bg-muted-foreground/50 rounded-full"></span>
                <span>{countryInfo.country}</span>
              </div>
            </div>
          </div>
          
          {/* Right side - Time display */}
          <div className="flex items-center gap-4">
            <div className="text-right space-y-1">
              <div
                className="font-mono text-4xl md:text-5xl font-bold tabular-nums tracking-tight text-foreground/90 whitespace-nowrap"
                suppressHydrationWarning
              >
                {timeStr}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider text-right opacity-70 flex items-center justify-end gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Live Local Time
              </div>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-10 px-4 text-sm bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 hover:from-blue-500/20 hover:to-purple-500/20 hover:border-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              aria-label="Copy home time"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


