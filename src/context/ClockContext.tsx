'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const ClockContext = createContext<Date>(new Date());

export function ClockProvider({ children }: { children: React.ReactNode }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <ClockContext.Provider value={now}>
      {children}
    </ClockContext.Provider>
  );
}

export function useClock() {
  return useContext(ClockContext);
}


