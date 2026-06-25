'use client';

import { useEffect, useState } from 'react';
import { timeUntil } from '@/lib/utils';

export function CountdownTimer({ endDate, className }: { endDate: string; className?: string }) {
  const [time, setTime] = useState(() => timeUntil(endDate));

  useEffect(() => {
    const interval = setInterval(() => setTime(timeUntil(endDate)), 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (time.expired) return <span className={className}>Ended</span>;

  return (
    <span className={className}>
      {time.days > 0 && `${time.days}d `}
      {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}
    </span>
  );
}
