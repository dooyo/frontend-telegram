import { differenceInSeconds } from 'date-fns';

export function timeUntil(date: string) {
  const then = new Date(date);
  const now = new Date();
  // return Math.abs(differenceInSeconds(then, now));
  return timeDurationCalculator(Math.abs(differenceInSeconds(then, now)));
}

export function timeDurationCalculator(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '0m';
}
