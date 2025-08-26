'use client';

import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import TimeCard from '@/components/TimeCard';

type Target = { label: string; tz: string; country?: string };

interface ConvertResultsProps {
  dtSource: DateTime;
  sourceTZ: string;
  format: '12h' | '24h';
  targetsTracked: Target[];
  targetsPopular: Target[];
}

export default function ConvertResults({ dtSource, sourceTZ, format, targetsTracked, targetsPopular }: ConvertResultsProps) {
  const [showMore, setShowMore] = useState(false);
  const popularToShow = showMore ? targetsPopular : targetsPopular.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Tracked Cities */}
      {targetsTracked.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Your Tracked Cities</h2>
                <p className="text-xs text-muted-foreground">Converted from {sourceTZ}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {targetsTracked.length} {targetsTracked.length === 1 ? 'City' : 'Cities'}
              </span>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-fr">
            {targetsTracked.map((t) => (
              <TimeCard
                key={`tracked-${t.tz}`}
                city={{ id: t.tz, name: t.label, timezone: t.tz, country: t.country || t.label, isPinned: false }}
                fixedDateTime={dtSource.setZone(t.tz)}
                readOnly
                showCopy
                sourceTZ={sourceTZ}
                sourceDt={dtSource}
              />
            ))}
          </div>
        </div>
      )}

      {/* Popular Time Zones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Popular Time Zones</h2>
              <p className="text-xs text-muted-foreground">Major cities around the world</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {showMore ? 'All' : 'Top 8'} of {targetsPopular.length}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-fr">
          {popularToShow.map((t) => (
            <TimeCard
              key={`popular-${t.tz}`}
              city={{ id: t.tz, name: t.label, timezone: t.tz, country: t.country || t.label, isPinned: false }}
              fixedDateTime={dtSource.setZone(t.tz)}
              readOnly
              showCopy
              sourceTZ={sourceTZ}
              sourceDt={dtSource}
            />
          ))}
        </div>
        {targetsPopular.length > 8 && (
          <div className="flex justify-center pt-2">
            <button 
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-background/50 backdrop-blur-sm px-4 py-2 text-sm font-medium hover:bg-muted/30 transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
              onClick={() => setShowMore((v) => !v)}
            >
              {showMore ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Show Less
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Show More ({targetsPopular.length - 8} more)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


