'use client';

import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePrefs } from '@/state/usePrefs';
import { useClock } from '@/context/ClockContext';
import { getTimezoneOffset } from '@/lib/time';

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

  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(timeStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  return (
    <div className="relative">
      {/* Premium glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl"></div>
      <div className="relative backdrop-blur-xl bg-card/50 border border-border/50 rounded-3xl p-8 shadow-2xl shadow-primary/5">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Home Time</span>
              </div>
              {isDst && (
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 border-0 shadow-sm">
                  DST
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-foreground">{homeTZ.replace('_', ' ')}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {offsetStr} • {dateStr}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right space-y-1">
              <div
                className="font-mono text-5xl md:text-6xl font-bold tabular-nums tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
                suppressHydrationWarning
              >
                {timeStr}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider text-right">
                Live Time
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-10 px-4 bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
              aria-label="Copy home time"
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


