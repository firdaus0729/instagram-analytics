const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

type Key = string;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<Key, Bucket>();

export function rateLimit(key: Key): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (existing.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfter: existing.resetAt - now };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { allowed: true };
}


