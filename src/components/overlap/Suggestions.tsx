'use client';

import type { Slot } from '@/lib/time-overlap';
import type { City } from '@/lib/time';

interface SuggestionsProps {
  suggestions: Slot[];
  cities: City[];
  sourceTZ: string;
  onHover: (slot: Slot | null) => void;
  onLeave: () => void;
  onPick: (slot: Slot) => void;
  onCopy: (slot: Slot) => void;
  selectedMinuteOfDay?: number | null;
}

export default function Suggestions({ suggestions, cities, sourceTZ, onHover, onLeave, onPick, onCopy, selectedMinuteOfDay }: SuggestionsProps) {

  const getComfortBadge = (quality: 'comfortable' | 'borderline' | 'unfriendly') => {
    switch (quality) {
      case 'comfortable':
        return { 
          label: 'Comfortable', 
          class: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25',
          cardBorder: 'hover:border-emerald-300 dark:hover:border-emerald-600'
        };
      case 'borderline':
        return { 
          label: 'Borderline', 
          class: 'bg-amber-500 text-white shadow-lg shadow-amber-500/25',
          cardBorder: 'hover:border-amber-300 dark:hover:border-amber-600'
        };
      default:
        return { 
          label: 'Unfriendly', 
          class: 'bg-purple-500 text-white shadow-lg shadow-purple-500/25',
          cardBorder: 'hover:border-purple-300 dark:hover:border-purple-600'
        };
    }
  };

  return (
    <div className="rounded-2xl border-0 bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30 shadow-lg shadow-black/5 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Suggested Meeting Slots</h2>
        </div>
        {suggestions.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {suggestions.length} slot{suggestions.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>
      
      {suggestions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.691-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">No overlapping slots found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Try adjusting cities, duration, or day selection</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((slot, idx) => {
            const badge = getComfortBadge(slot.quality);
            const start = slot.interval?.start;
            const end = slot.interval?.end;
            if (!start || !end) return null;
            const containsMarker =
              typeof selectedMinuteOfDay === 'number' &&
              selectedMinuteOfDay >= slot.startMinute &&
              selectedMinuteOfDay < slot.endMinute;
            return (
              <div 
                key={idx} 
                className={`group relative rounded-xl border ${containsMarker ? 'border-blue-500 ring-1 ring-blue-400/60' : 'border-gray-200 dark:border-gray-700'} bg-white/80 dark:bg-gray-800/80 p-5 transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg hover:shadow-black/5 ${badge.cardBorder} cursor-pointer`}
                onMouseEnter={() => onHover(slot)}
                onMouseLeave={() => onLeave()}
                onClick={() => onPick(slot)}
              >
                {/* Header with time and badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                        {start.setZone(sourceTZ).toFormat('EEE, MMM d • HH:mm')}–{end.setZone(sourceTZ).toFormat('HH:mm')}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.class}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Score: {slot.score} • {sourceTZ}
                    </div>
                  </div>
                  
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                    aria-label="Copy slot summary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopy(slot);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>

                {/* City breakdown */}
                <div className="space-y-2">
                  {slot.perCity.map((cityData, i) => {
                    const city = cities.find(c => c.id === cityData.cityId);
                    const dotColor = cityData.band === 'comfortable' ? 'bg-emerald-500' : 
                                    cityData.band === 'borderline' ? 'bg-amber-500' : 'bg-purple-500';
                    return (
                      <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{city?.name}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {cityData.localStart.toFormat('HH:mm')}–{cityData.localEnd.toFormat('HH:mm')} {cityData.tzShort}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Hover indicator */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}



