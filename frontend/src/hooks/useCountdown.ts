import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface CountdownResult {
  text: string;
  isOverdue: boolean;
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  percentageRemaining: number;
}

/**
 * useCountdown Hook
 *
 * Real-time countdown hook that updates every second
 * Features:
 * - Auto-updates every second for smooth countdown
 * - Calculates time remaining (days, hours, minutes, seconds)
 * - Detects overdue status
 * - Calculates percentage remaining for progress bar
 * - Cleans up interval on unmount
 * - Multi-language support
 * - Optimized for performance with minimal re-renders
 */
export const useCountdown = (
  dueDate: string | null | undefined,
  intervalDays: number
): CountdownResult | null => {
  const { t } = useTranslation();
  const [, setTick] = useState(0);

  // Update every second for real-time countdown
  useEffect(() => {
    if (!dueDate) return;

    // Update immediately
    setTick((prev) => prev + 1);

    // Then update every second for smooth real-time countdown
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000); // 1 second

    return () => clearInterval(interval);
  }, [dueDate]);

  if (!dueDate) return null;

  const now = Date.now();
  const due = new Date(dueDate).getTime();
  const diff = due - now;

  // Check if overdue
  if (diff < 0) {
    return {
      text: t('dashboard.overdue'),
      isOverdue: true,
      timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      percentageRemaining: 0
    };
  }

  // Calculate time components
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Format display text based on largest unit
  let text: string;
  if (days > 0) {
    text = `${days} ${t('dashboard.days')}`;
  } else if (hours > 0) {
    text = `${hours} ${t('dashboard.hours')}`;
  } else {
    text = `${minutes} ${t('dashboard.minutes')}`;
  }

  // Calculate percentage remaining for progress bar
  const totalIntervalMs = intervalDays * 24 * 60 * 60 * 1000;
  const percentageRemaining = Math.min(100, Math.max(0, (diff / totalIntervalMs) * 100));

  return {
    text,
    isOverdue: false,
    timeLeft: { days, hours, minutes, seconds },
    percentageRemaining
  };
};
