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
    <div className="sticky top-16 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80 border-b">
      <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Home Time</span>
            {isDst && <Badge variant="secondary">DST</Badge>}
          </div>
          <div className="text-sm truncate">
            <span className="font-medium">{homeTZ}</span>
            <span className="text-muted-foreground"> • {offsetStr} • {dateStr}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right leading-none">
            <div
              className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight"
              suppressHydrationWarning
            >
              {timeStr}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            aria-label="Copy home time"
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    </div>
  );
}


