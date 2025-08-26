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
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-2">
          Loading...
        </div>
        <p className="text-sm text-muted-foreground">
          Click "Add City" to get started
        </p>
      </div>
    );
  }
  
  // If empty, show placeholder until hydration is complete
  if (sortedCities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-2">
          Loading...
        </div>
        <p className="text-sm text-muted-foreground">
          Click "Add City" to get started
        </p>
      </div>
    );
  }
  
  // Render sorted cities as horizontal row (desktop) / grid (small)
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr]">
      <div className="md:flex md:gap-4 md:overflow-x-auto md:snap-x md:snap-mandatory md:pb-3 md:pr-2 md:scroll-smooth">
        {sortedCities.map((city) => (
          <TimeCard key={city.id} city={city} />
        ))}
      </div>
    </div>
  );
}
