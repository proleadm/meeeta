'use client';

import { useMemo } from 'react';
import TimeCard from './TimeCard';
import { usePrefs } from '@/state/usePrefs';
import { useMounted } from '@/hooks/useMounted';

export function CityList() {
  const mounted = useMounted();
  const cities = usePrefs(state => state.cities);
  
  // Use useMemo to sort cities (pinned first)
  const sortedCities = useMemo(() => {
    return [...cities].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [cities]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Loading your clocks...</h3>
            <p className="text-sm text-muted-foreground">Just a moment while we sync your time zones</p>
          </div>
        </div>
      </div>
    );
  }
  
  // If empty, show premium empty state
  if (sortedCities.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-8 max-w-md">
          {/* Illustration */}
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                </svg>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full opacity-60 animate-bounce" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full opacity-60 animate-bounce" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 -left-4 w-3 h-3 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full opacity-60 animate-bounce" style={{animationDelay: '1.5s'}}></div>
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Track time worldwide</h3>
              <p className="text-muted-foreground leading-relaxed">
                Add cities from around the globe to keep track of multiple time zones at once. Perfect for remote teams, travel planning, or staying connected with friends and family.
              </p>
            </div>
            
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Click "Add City" above to get started
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render sorted cities as responsive grid
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {sortedCities.map((city) => (
        <TimeCard key={city.id} city={city} />
      ))}
    </div>
  );
}
