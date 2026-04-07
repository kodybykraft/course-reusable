export interface RateLimiterConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Simple in-memory rate limiter.
 * For production, use Redis-backed rate limiting (e.g. via BullMQ or upstash/ratelimit).
 */
export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();

  constructor(private config: RateLimiterConfig) {
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), this.config.windowMs);
  }

  /** Check if a request from the given key should be allowed */
  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now >= entry.resetAt) {
      // New window
      const resetAt = now + this.config.windowMs;
      this.store.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: this.config.maxRequests - 1, resetAt };
    }

    if (entry.count >= this.config.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return { allowed: true, remaining: this.config.maxRequests - entry.count, resetAt: entry.resetAt };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now >= entry.resetAt) this.store.delete(key);
    }
  }
}

/** Default rate limiter: 100 requests per minute per IP */
export const defaultRateLimiter = new RateLimiter({ windowMs: 60_000, maxRequests: 100 });
