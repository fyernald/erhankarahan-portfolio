import "server-only";

type Bucket = { count: number; resetAt: number };

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

/**
 * Fixed-window, in-memory rate limiter. The site runs as a single container on the
 * VPS, so process memory is an adequate store; swap for Redis if you scale out.
 */
export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  consume(key: string): RateLimitResult {
    const now = Date.now();
    this.evictExpired(now);

    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.limit - 1, retryAfterSeconds: 0 };
    }

    bucket.count += 1;
    const allowed = bucket.count <= this.limit;
    return {
      allowed,
      remaining: Math.max(0, this.limit - bucket.count),
      retryAfterSeconds: allowed ? 0 : Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  private evictExpired(now: number) {
    if (this.buckets.size < 5_000) return;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}

const globalForLimits = globalThis as unknown as { __rateLimiters?: Map<string, RateLimiter> };

/** Returns a named limiter that survives hot reloads. */
export function getRateLimiter(name: string, limit: number, windowMs: number): RateLimiter {
  globalForLimits.__rateLimiters ??= new Map();
  let limiter = globalForLimits.__rateLimiters.get(name);
  if (!limiter) {
    limiter = new RateLimiter(limit, windowMs);
    globalForLimits.__rateLimiters.set(name, limiter);
  }
  return limiter;
}
