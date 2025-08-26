'use client';

import { useMemo } from 'react';
import TimeCard from './TimeCard';
import { AddCityDialog } from './AddCityDialog';
import { usePrefs } from '@/state/usePrefs';
import { useMounted } from '@/hooks/useMounted';

function SkeletonCard() {
  return (
    <div className="h-full flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-lg animate-pulse">
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-6 bg-muted rounded-sm"></div>
          <div className="h-5 bg-muted rounded w-24"></div>
        </div>
        <div className="text-center space-y-2">
          <div className="h-12 bg-muted rounded w-32 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-20 mx-auto"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-muted rounded w-16"></div>
            <div className="h-3 bg-muted rounded w-8"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-muted rounded w-20"></div>
            <div className="h-3 bg-muted rounded w-12"></div>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-1 pt-4">
        <div className="w-8 h-8 bg-muted rounded-full"></div>
        <div className="w-8 h-8 bg-muted rounded-full"></div>
        <div className="w-8 h-8 bg-muted rounded-full"></div>
      </div>
    </div>
  );
}

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
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-fr">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  
  // If empty, show premium empty state
  if (sortedCities.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-12 max-w-lg">
          {/* Premium illustration */}
          <div className="relative">
            <div className="w-40 h-40 mx-auto bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-[2rem] flex items-center justify-center backdrop-blur-sm border border-primary/10">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                </svg>
              </div>
            </div>
            {/* Enhanced floating elements */}
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl opacity-70 animate-bounce shadow-lg" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-xl opacity-70 animate-bounce shadow-lg" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 -left-6 w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg opacity-70 animate-bounce shadow-lg" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute top-8 -right-8 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full opacity-70 animate-bounce shadow-lg" style={{animationDelay: '2s'}}></div>
          </div>
          
          {/* Enhanced content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-foreground">Your Global Dashboard Awaits</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Transform your workflow with real-time timezone tracking. Add cities where your team, clients, and partners are located to stay perfectly synchronized across the globe.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="inline-flex items-center gap-3 text-sm text-muted-foreground bg-gradient-to-r from-muted/50 to-muted/30 px-6 py-3 rounded-full border border-border/50 backdrop-blur-sm">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Click "Add City" above to create your first timezone
              </div>
              
              {/* Feature highlights */}
              <div className="flex items-center gap-6 text-xs text-muted-foreground mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Business Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>DST Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span>Time Zones</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render sorted cities as responsive grid with bottom CTA
  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-fr">
        {sortedCities.map((city) => (
          <TimeCard key={city.id} city={city} />
        ))}
      </div>
      
      {/* Bottom Add City CTA */}
      {sortedCities.length > 0 && (
        <div className="flex justify-center pt-4">
          <AddCityDialog>
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/10 hover:from-blue-500/10 hover:to-purple-500/10 hover:border-blue-500/20 transition-all duration-300 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Add Another City</div>
                <div className="text-xs text-muted-foreground">Track more locations worldwide</div>
              </div>
            </div>
          </AddCityDialog>
        </div>
      )}
    </div>
  );
}
