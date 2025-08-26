'use client';

import { useEffect } from 'react';
import { useClock } from '@/state/useClock';

export function Ticker() {
  const setNow = useClock((s) => s.setNow);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [setNow]);
  return null;
}


