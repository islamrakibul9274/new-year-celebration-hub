interface RateRecord {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const SWEEP_INTERVAL_MS = 5 * 60_000;

const buckets = new Map<string, RateRecord>();

function sweep(now: number) {
  for (const [key, record] of buckets) {
    if (record.resetAt <= now) buckets.delete(key);
  }
}

let lastSweep = Date.now();

/**
 * Best-effort in-memory sliding-window limiter.
 * Note: on serverless (Netlify Functions) each instance keeps its own map,
 * so this reduces abuse but is not a distributed guarantee.
 */
export function rateLimit(key: string, max = MAX_REQUESTS, windowMs = WINDOW_MS): RateLimitResult {
  const now = Date.now();
  if (now - lastSweep > SWEEP_INTERVAL_MS) {
    sweep(now);
    lastSweep = now;
  }

  const record = buckets.get(key);
  if (!record || record.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1, retryAfterSeconds: 0 };
  }

  record.count += 1;
  if (record.count > max) {
    return {
      success: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
    };
  }
  return { success: true, remaining: max - record.count, retryAfterSeconds: 0 };
}

export function clientKey(req: Request, scope: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}

export function tooManyRequests(retryAfterSeconds: number): Response {
  return new Response(
    JSON.stringify({
      error: `Too many attempts. Please wait ${retryAfterSeconds}s and try again.`,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}
