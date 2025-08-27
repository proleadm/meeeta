'use client';

import { useState } from 'react';
import { DateTime } from 'luxon';
import { usePrefs } from '@/state/usePrefs';
import OverlapHomeTimeBar from '@/components/overlap/HomeTimeBar';

export default function HomeTimeBar() {
  const homeTZ = usePrefs((s) => s.prefs.homeTZ);
  const now = DateTime.now().setZone(homeTZ);
  const [minuteOfDay, setMinuteOfDay] = useState<number>(now.hour * 60 + now.minute);

  return (
    <OverlapHomeTimeBar
      selectedMinuteOfDay={minuteOfDay}
      onChangeMinute={setMinuteOfDay}
    />
  );
}
