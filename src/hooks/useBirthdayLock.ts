import { useState, useEffect, useMemo } from 'react';
import { BIRTHDAY_DATE } from '../lib/constants';

interface BirthdayLockState {
  isLocked: boolean;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  countdownDisplay: string;
  unlockDate: Date;
}

export function useBirthdayLock(): BirthdayLockState {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    const diff = BIRTHDAY_DATE.getTime() - now.getTime();
    const isLocked = diff > 0;

    if (!isLocked) {
      return {
        isLocked: false,
        timeRemaining: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        countdownDisplay: 'Unlocked! 🎉',
        unlockDate: BIRTHDAY_DATE,
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return {
      isLocked,
      timeRemaining: { days, hours, minutes, seconds },
      countdownDisplay: parts.join(' '),
      unlockDate: BIRTHDAY_DATE,
    };
  }, [now]);
}
