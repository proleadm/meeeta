'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ClockProvider } from '@/context/ClockContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ClockProvider>{children}</ClockProvider>
    </SessionProvider>
  );
}
