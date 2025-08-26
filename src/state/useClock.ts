"use client";

import { create } from 'zustand';

interface ClockState {
  now: Date;
  setNow: (now: Date) => void;
}

export const useClock = create<ClockState>((set) => ({
  now: new Date(),
  setNow: (now: Date) => set({ now }),
}));


