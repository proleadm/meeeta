import { create } from 'zustand';
import { City, TimeFormat } from '@/lib/time';

// Export types as requested
export type TrackedCity = City;

export interface Prefs {
  format: TimeFormat;
  homeTZ: string;
}

interface PrefsState {
  // State
  cities: TrackedCity[];
  prefs: Prefs;
  
  // Actions
  addCity: (city: Omit<TrackedCity, 'isPinned'>) => void;
  removeCity: (cityId: string) => void;
  togglePin: (cityId: string) => void;
  setFormat: (format: TimeFormat) => void;
  setHomeTZ: (timezone: string) => void;
}

const STORAGE_KEY = 'worldclocked-prefs';

// Official SSR-safe pattern for Zustand
export const usePrefs = create<PrefsState>()((set, get) => ({
  // Initial state
  cities: [],
  prefs: {
    format: '12h',
    homeTZ: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },

  // Actions
  addCity: (cityData) => {
    const { cities } = get();
    if (cities.some(city => city.id === cityData.id)) return;
    const newCity: TrackedCity = { ...cityData, isPinned: false };
    set({ cities: [...cities, newCity] });
  },

  removeCity: (cityId) => {
    const { cities } = get();
    set({ cities: cities.filter(city => city.id !== cityId) });
  },

  togglePin: (cityId) => {
    const { cities } = get();
    const updatedCities = cities.map(city =>
      city.id === cityId ? { ...city, isPinned: !city.isPinned } : city
    );
    set({ cities: updatedCities });
  },

  setFormat: (format) => {
    const { prefs } = get();
    set({ prefs: { ...prefs, format } });
  },

  setHomeTZ: (timezone) => {
    const { prefs } = get();
    set({ prefs: { ...prefs, homeTZ: timezone } });
  },
}));
