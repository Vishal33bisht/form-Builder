import { env } from "../env";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimitService {
  private storage: Map<string, RateLimitEntry> = new Map();

  public checkLimit(
    identifier: string,
    maxRequests?: number,
    windowMs?: number
  ): void {
    const max =
      maxRequests ||
      parseInt(env.RATE_LIMIT_MAX_REQUESTS || "10");
    const window =
      windowMs ||
      parseInt(env.RATE_LIMIT_WINDOW_MS || "60000");

    const now = Date.now();
    const entry = this.storage.get(identifier);

    // Clean up expired entries periodically
    this.cleanup();

    if (!entry || now > entry.resetAt) {
      // Create new entry
      this.storage.set(identifier, {
        count: 1,
        resetAt: now + window,
      });
      return;
    }

    if (entry.count >= max) {
      const resetIn = Math.ceil((entry.resetAt - now) / 1000);
      throw new Error(
        `Rate limit exceeded. Please try again in ${resetIn} seconds.`
      );
    }

    // Increment count
    entry.count++;
    this.storage.set(identifier, entry);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetAt) {
        this.storage.delete(key);
      }
    }
  }

  public reset(identifier: string): void {
    this.storage.delete(identifier);
  }

  public resetAll(): void {
    this.storage.clear();
  }
}

export default RateLimitService;