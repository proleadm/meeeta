'use client';

import React from 'react';
import { ClockProvider } from '@/context/ClockContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ClockProvider>{children}</ClockProvider>;
}


