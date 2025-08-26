'use client';

import { useMemo, useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowRightLeft, Share2 } from 'lucide-react';
import { usePrefs } from '@/state/usePrefs';
import { listCommonCities, formatTime, getTimezoneOffset } from '@/lib/time';
import { parseInputToDateTime } from '@/lib/parseTime';
import ConvertForm from '@/components/convert/ConvertForm';
import ConvertResults from '@/components/convert/ConvertResults';

export default function ConvertPage() {
  const homeTZ = usePrefs((s) => s.prefs.homeTZ);
  const format = usePrefs((s) => s.prefs.format);
  const search = useSearchParams();
  const router = useRouter();

  const [input, setInput] = useState('');
  const [sourceTZ, setSourceTZ] = useState(homeTZ);
  const [dtSource, setDtSource] = useState<DateTime | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from URL
  useEffect(() => {
    const q = search.get('q') || '';
    const tz = search.get('tz') || homeTZ;
    if (q || tz) {
      setInput(q);
      setSourceTZ(tz);
      const parsed = parseInputToDateTime(q, tz);
      if (parsed.isValid) {
        setDtSource(parsed);
        setError(null);
      } else {
        setError('Could not parse input. Try formats like "2025-09-01 18:00" or phrases like "tomorrow 10am".');
        setDtSource(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const targets = useMemo(() => {
    const tracked = usePrefs.getState().cities.map((c) => ({ label: c.name, tz: c.timezone, country: c.country }));
    const popular = listCommonCities()
      .filter((c) => !tracked.some((t) => t.tz === c.timezone))
      .map((c) => ({ label: c.name, tz: c.timezone, country: c.country }));
    return { tracked, popular };
  }, []);

  const handleConvert = ({ input: nextInput, sourceTZ: nextTZ, dt }: { input: string; sourceTZ: string; dt: DateTime }) => {
    setInput(nextInput);
    setSourceTZ(nextTZ);
    setDtSource(dt);
    setError(null);
    const params = new URLSearchParams({ q: nextInput, tz: nextTZ });
    router.replace(`/convert?${params.toString()}`);
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
  };

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/5">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Convert Time Zones Dashboard
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <ArrowRightLeft className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Live Conversion</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-background/50 backdrop-blur-sm hover:bg-muted/30 transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Share conversion link"
            >
              <Share2 className="h-4 w-4" /> 
              Share
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Select a source time using the dropdowns or scrubber, then see local times across your tracked cities.
          </p>
        </div>

        {/* Form */}
        <ConvertForm
          defaultInput={input}
          defaultSourceTZ={sourceTZ}
          onConvert={handleConvert}
          error={error}
        />

        {/* Results */}
        {dtSource && (
          <ConvertResults
            dtSource={dtSource}
            sourceTZ={sourceTZ}
            format={format}
            targetsTracked={targets.tracked}
            targetsPopular={targets.popular}
          />
        )}
      </div>
    </div>
  );
}


