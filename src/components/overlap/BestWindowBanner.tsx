'use client';

import type { Slot } from '@/lib/time-overlap';
import type { City } from '@/lib/time';

interface BestWindowBannerProps {
  slot: Slot | null;
  cities: City[];
  sourceTZ: string;
  onCopy: () => void;
}

export default function BestWindowBanner({ slot, cities, sourceTZ, onCopy }: BestWindowBannerProps) {
  if (!slot) return null;
  const start = slot.interval?.start;
  const end = slot.interval?.end;
  if (!start || !end) return null;
  
  const quality = slot.quality === 'comfortable' ? 'Comfortable' : 
                  slot.quality === 'borderline' ? 'Borderline' : 'Unfriendly';
  
  const getBadgeStyles = () => {
    switch (quality) {
      case 'Comfortable':
        return {
          badge: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25',
          accent: 'from-emerald-500/10 to-emerald-600/10',
          border: 'border-emerald-500 dark:border-emerald-400'
        };
      case 'Borderline':
        return {
          badge: 'bg-amber-500 text-white shadow-lg shadow-amber-500/25',
          accent: 'from-amber-500/10 to-amber-600/10',
          border: 'border-amber-500 dark:border-amber-400'
        };
      default:
        return {
          badge: 'bg-purple-500 text-white shadow-lg shadow-purple-500/25',
          accent: 'from-purple-500/10 to-purple-600/10',
          border: 'border-purple-500 dark:border-purple-400'
        };
    }
  };

  const styles = getBadgeStyles();

  return (
    <div className={`relative rounded-2xl border-2 ${styles.border} bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30 shadow-xl shadow-black/10 backdrop-blur-sm p-6 overflow-hidden`}>
      {/* Background accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.accent} opacity-50`}></div>
      
      {/* Content */}
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Best Overlap
              </span>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${styles.badge}`}>
              {quality}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {start.setZone(sourceTZ).toFormat('EEE, MMM d • HH:mm')}–{end.setZone(sourceTZ).toFormat('HH:mm')} ({sourceTZ})
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {slot.perCity.slice(0, 3).map((cityData, idx) => {
              const city = cities.find(c => c.id === cityData.cityId);
              return (
                <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-gray-800/60 px-2 py-1 rounded-lg">
                  <span className="font-medium">{city?.name}:</span> {cityData.localStart.toFormat('HH:mm')}–{cityData.localEnd.toFormat('HH:mm')} {cityData.tzShort}
                </div>
              );
            })}
            {slot.perCity.length > 3 && (
              <div className="text-sm text-gray-500 dark:text-gray-500 bg-white/40 dark:bg-gray-800/40 px-2 py-1 rounded-lg">
                +{slot.perCity.length - 3} more
              </div>
            )}
          </div>
        </div>
        
        <div className="ml-6">
          <button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={onCopy}
            aria-label="Copy best overlap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Details
          </button>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-pink-500/10 rounded-full translate-y-12 -translate-x-12"></div>
    </div>
  );
}


