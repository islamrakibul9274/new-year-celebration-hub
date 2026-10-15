/**
 * Best-effort daily usage counter for rate-limited free features.
 * In-memory (per server instance) — sufficient for a demo platform;
 * MongoDB counts are layered on top where a user is signed in.
 */

interface DayCounter {
  date: string;
  count: number;
}

const counters = new Map<string, DayCounter>();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function incrementUsage(key: string): number {
  const day = today();
  const current = counters.get(key);
  if (!current || current.date !== day) {
    counters.set(key, { date: day, count: 1 });
    return 1;
  }
  current.count += 1;
  return current.count;
}

export function currentUsage(key: string): number {
  const current = counters.get(key);
  if (!current || current.date !== today()) return 0;
  return current.count;
}
