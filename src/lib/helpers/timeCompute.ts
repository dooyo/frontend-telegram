export function timeUntil(date: string) {
    const now = new Date();
    const then = new Date(date);
    const delta = Math.abs(then.getTime() - now.getTime()) / 1000;
    const days = Math.floor(delta / 86400);
    const hours = Math.floor(delta / 3600) % 24;
    const minutes = Math.floor(delta / 60) % 60;
    const seconds = Math.floor(delta % 60);
    if (days > 2) {
      return `${days}d`;
    } else if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${seconds}s`;
  }
  