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
  
  // Render sorted cities as responsive grid
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {sortedCities.map((city) => (
        <TimeCard key={city.id} city={city} />
      ))}
    </div>
  );
}
