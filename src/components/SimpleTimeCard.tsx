'use client';

import { TrackedCity } from '@/state/usePrefs';

interface SimpleTimeCardProps {
  city: TrackedCity;
}

export default function SimpleTimeCard({ city }: SimpleTimeCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="font-bold">{city.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{city.country}</p>
      <p className="text-lg font-mono">Loading...</p>
    </div>
  );
}