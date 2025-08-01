interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  blocked: boolean;
  blockExpiry?: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(maxAttempts = 5, windowMs = 60000, blockDurationMs = 300000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  private getKey(identifier: string, action: string): string {
    return `${identifier}:${action}`;
  }

  private isExpired(entry: RateLimitEntry): boolean {
    const now = Date.now();
    return now - entry.firstAttempt > this.windowMs;
  }

  private isBlockExpired(entry: RateLimitEntry): boolean {
    if (!entry.blocked || !entry.blockExpiry) return true;
    return Date.now() > entry.blockExpiry;
  }

  checkLimit(identifier: string, action: string = 'default'): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    reason?: string;
  } {
    const key = this.getKey(identifier, action);
    const now = Date.now();
    let entry = this.attempts.get(key);

    // Check if currently blocked
    if (entry?.blocked && !this.isBlockExpired(entry)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockExpiry || now + this.blockDurationMs,
        reason: 'Rate limit exceeded. Please try again later.'
      };
    }

    // Clean up expired entries or reset if window expired
    if (!entry || this.isExpired(entry)) {
      entry = {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
        blocked: false
      };
    } else {
      entry.count++;
      entry.lastAttempt = now;
    }

    // Check if limit exceeded
    if (entry.count > this.maxAttempts) {
      entry.blocked = true;
      entry.blockExpiry = now + this.blockDurationMs;
      this.attempts.set(key, entry);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockExpiry,
        reason: `Too many attempts. Please wait ${Math.ceil(this.blockDurationMs / 60000)} minutes before trying again.`
      };
    }

    this.attempts.set(key, entry);

    return {
      allowed: true,
      remaining: this.maxAttempts - entry.count,
      resetTime: entry.firstAttempt + this.windowMs
    };
  }

  reset(identifier: string, action: string = 'default'): void {
    const key = this.getKey(identifier, action);
    this.attempts.delete(key);
  }

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (this.isExpired(entry) && (!entry.blocked || this.isBlockExpired(entry))) {
        this.attempts.delete(key);
      }
    }
  }
}

// Export singleton instances for different actions
export const formSubmissionLimiter = new RateLimiter(3, 60000, 300000); // 3 attempts per minute, 5 min block
export const loginLimiter = new RateLimiter(5, 300000, 900000); // 5 attempts per 5 minutes, 15 min block
export const searchLimiter = new RateLimiter(100, 60000, 60000); // 100 searches per minute, 1 min block

// Utility to get client identifier (IP simulation using browser fingerprint)
export const getClientIdentifier = (): string => {
  // In a real app, this would be IP address from the server
  // For client-side, we use a combination of browser characteristics
  const navigator = window.navigator;
  const screen = window.screen;
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.cookieEnabled
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
};

// Periodic cleanup - run every 10 minutes
setInterval(() => {
  formSubmissionLimiter.cleanup();
  loginLimiter.cleanup();
  searchLimiter.cleanup();
}, 600000);
