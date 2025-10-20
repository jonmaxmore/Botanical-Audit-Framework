/**
 * Rate Limiter Service
 *
 * Provides Redis-based rate limiting functionality with:
 * - IP-based throttling
 * - User-based throttling
 * - Sliding window algorithm
 * - Token bucket algorithm
 * - Distributed rate limiting
 * - Attack detection
 */

import { RedisClient } from '../cache/redis-client';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  blockDurationMs?: number; // How long to block after limit exceeded
  skipSuccessfulRequests?: boolean; // Only count failed requests
  skipFailedRequests?: boolean; // Only count successful requests
  keyPrefix?: string; // Redis key prefix
  message?: string; // Custom error message
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // Seconds until retry allowed
  blocked?: boolean; // If currently blocked
}

export interface RateLimitOptions {
  identifier: string; // IP or User ID
  namespace: string; // e.g., 'api', 'login', 'upload'
  config?: Partial<RateLimitConfig>;
}

export class RateLimiter {
  private redis: RedisClient;
  private defaultConfig: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    blockDurationMs: 15 * 60 * 1000, // 15 minutes block
    keyPrefix: 'ratelimit',
    message: 'Too many requests, please try again later.',
  };

  constructor() {
    this.redis = RedisClient.getInstance();
  }

  /**
   * Check if request is allowed (sliding window algorithm)
   */
  async checkLimit(options: RateLimitOptions): Promise<RateLimitResult> {
    const config = { ...this.defaultConfig, ...options.config };
    const key = this.generateKey(options.identifier, options.namespace, config.keyPrefix!);
    const blockKey = `${key}:blocked`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Check if currently blocked
      const isBlocked = await this.redis.get(blockKey);
      if (isBlocked) {
        const ttl = await this.redis.ttl(blockKey);
        return {
          success: false,
          limit: config.maxRequests,
          remaining: 0,
          resetTime: new Date(now + ttl * 1000),
          retryAfter: ttl,
          blocked: true,
        };
      }

      // Use sorted set for sliding window
      const sortedSetKey = `${key}:requests`;

      // Remove old entries outside the window
      await this.redis.zremrangebyscore(sortedSetKey, 0, windowStart);

      // Count current requests in window
      const currentCount = await this.redis.zcard(sortedSetKey);

      // Check if limit exceeded
      if (currentCount >= config.maxRequests) {
        // Block the identifier
        if (config.blockDurationMs) {
          await this.redis.set(blockKey, '1', Math.floor(config.blockDurationMs / 1000));
        }

        // Log potential attack
        await this.logRateLimitExceeded(options.identifier, options.namespace, currentCount);

        const oldestRequest = await this.redis.zrange(sortedSetKey, 0, 0);
        const resetTime =
          oldestRequest.length > 0
            ? new Date(parseInt(oldestRequest[0]) + config.windowMs)
            : new Date(now + config.windowMs);

        return {
          success: false,
          limit: config.maxRequests,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil((resetTime.getTime() - now) / 1000),
        };
      }

      // Add current request to sorted set
      await this.redis.zadd(sortedSetKey, now, `${now}-${Math.random()}`);
      await this.redis.expire(sortedSetKey, Math.ceil(config.windowMs / 1000));

      const remaining = config.maxRequests - currentCount - 1;
      const oldestRequest = await this.redis.zrange(sortedSetKey, 0, 0);
      const resetTime =
        oldestRequest.length > 0
          ? new Date(parseInt(oldestRequest[0]) + config.windowMs)
          : new Date(now + config.windowMs);

      return {
        success: true,
        limit: config.maxRequests,
        remaining,
        resetTime,
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open - allow request if Redis is down
      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetTime: new Date(now + config.windowMs),
      };
    }
  }

  /**
   * Token bucket algorithm for burst handling
   */
  async checkTokenBucket(
    identifier: string,
    namespace: string,
    tokensPerSecond: number,
    bucketSize: number
  ): Promise<RateLimitResult> {
    const key = this.generateKey(identifier, namespace, 'tokenbucket');
    const now = Date.now() / 1000; // Convert to seconds

    try {
      // Get current bucket state
      const bucketData = await this.redis.get(key);
      let tokens = bucketSize;
      let lastRefill = now;

      if (bucketData) {
        const parsed = JSON.parse(bucketData);
        tokens = parsed.tokens;
        lastRefill = parsed.lastRefill;
      }

      // Calculate tokens to add based on time passed
      const timePassed = now - lastRefill;
      const tokensToAdd = timePassed * tokensPerSecond;
      tokens = Math.min(bucketSize, tokens + tokensToAdd);

      // Check if token available
      if (tokens < 1) {
        const resetTime = new Date((now + (1 - tokens) / tokensPerSecond) * 1000);
        return {
          success: false,
          limit: bucketSize,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil((1 - tokens) / tokensPerSecond),
        };
      }

      // Consume one token
      tokens -= 1;

      // Save bucket state
      await this.redis.set(
        key,
        JSON.stringify({ tokens, lastRefill: now }),
        Math.ceil(bucketSize / tokensPerSecond) + 60
      );

      return {
        success: true,
        limit: bucketSize,
        remaining: Math.floor(tokens),
        resetTime: new Date((now + 1 / tokensPerSecond) * 1000),
      };
    } catch (error) {
      console.error('Token bucket error:', error);
      // Fail open
      return {
        success: true,
        limit: bucketSize,
        remaining: bucketSize,
        resetTime: new Date((now + 1) * 1000),
      };
    }
  }

  /**
   * Reset rate limit for identifier
   */
  async resetLimit(identifier: string, namespace: string): Promise<void> {
    const pattern = this.generateKey(identifier, namespace, '*');
    await this.redis.delPattern(pattern);
  }

  /**
   * Get current rate limit status
   */
  async getStatus(identifier: string, namespace: string): Promise<RateLimitResult> {
    const config = this.defaultConfig;
    const key = this.generateKey(identifier, namespace, config.keyPrefix!);
    const blockKey = `${key}:blocked`;
    const sortedSetKey = `${key}:requests`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Check if blocked
      const isBlocked = await this.redis.get(blockKey);
      if (isBlocked) {
        const ttl = await this.redis.ttl(blockKey);
        return {
          success: false,
          limit: config.maxRequests,
          remaining: 0,
          resetTime: new Date(now + ttl * 1000),
          retryAfter: ttl,
          blocked: true,
        };
      }

      // Count requests in window
      await this.redis.zremrangebyscore(sortedSetKey, 0, windowStart);
      const currentCount = await this.redis.zcard(sortedSetKey);
      const remaining = Math.max(0, config.maxRequests - currentCount);

      const oldestRequest = await this.redis.zrange(sortedSetKey, 0, 0);
      const resetTime =
        oldestRequest.length > 0
          ? new Date(parseInt(oldestRequest[0]) + config.windowMs)
          : new Date(now + config.windowMs);

      return {
        success: remaining > 0,
        limit: config.maxRequests,
        remaining,
        resetTime,
      };
    } catch (error) {
      console.error('Get status error:', error);
      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetTime: new Date(now + config.windowMs),
      };
    }
  }

  /**
   * Log rate limit exceeded event
   */
  private async logRateLimitExceeded(
    identifier: string,
    namespace: string,
    requestCount: number
  ): Promise<void> {
    const logKey = `ratelimit:exceeded:${namespace}`;
    const logEntry = JSON.stringify({
      identifier,
      namespace,
      requestCount,
      timestamp: new Date().toISOString(),
    });

    try {
      // Add to log list (keep last 1000 entries)
      await this.redis.lpush(logKey, logEntry);
      await this.redis.ltrim(logKey, 0, 999);
      await this.redis.expire(logKey, 24 * 60 * 60); // 24 hours

      // Increment counter for monitoring
      const counterKey = `ratelimit:exceeded:count:${namespace}:${identifier}`;
      await this.redis.incr(counterKey);
      await this.redis.expire(counterKey, 24 * 60 * 60);

      console.warn(`Rate limit exceeded: ${identifier} on ${namespace} (${requestCount} requests)`);
    } catch (error) {
      console.error('Failed to log rate limit exceeded:', error);
    }
  }

  /**
   * Get rate limit exceeded logs
   */
  async getExceededLogs(namespace: string, limit: number = 100): Promise<any[]> {
    const logKey = `ratelimit:exceeded:${namespace}`;
    try {
      const logs = await this.redis.lrange(logKey, 0, limit - 1);
      return logs.map(log => JSON.parse(log));
    } catch (error) {
      console.error('Failed to get exceeded logs:', error);
      return [];
    }
  }

  /**
   * Detect potential DDoS attacks
   */
  async detectAttack(
    namespace: string,
    threshold: number = 100
  ): Promise<{
    isAttack: boolean;
    attackers: string[];
    requestCount: number;
  }> {
    try {
      const pattern = `ratelimit:exceeded:count:${namespace}:*`;
      const keys = await this.redis.keys(pattern);

      const attackers: string[] = [];
      let totalRequests = 0;

      for (const key of keys) {
        const count = await this.redis.get(key);
        const requestCount = parseInt(count || '0');
        totalRequests += requestCount;

        if (requestCount > threshold) {
          const identifier = key.split(':').pop() || '';
          attackers.push(identifier);
        }
      }

      return {
        isAttack: attackers.length > 0,
        attackers,
        requestCount: totalRequests,
      };
    } catch (error) {
      console.error('Failed to detect attack:', error);
      return {
        isAttack: false,
        attackers: [],
        requestCount: 0,
      };
    }
  }

  /**
   * Block identifier for specific duration
   */
  async blockIdentifier(
    identifier: string,
    namespace: string,
    durationMs: number,
    reason?: string
  ): Promise<void> {
    const key = this.generateKey(identifier, namespace, 'blocked');
    const blockData = JSON.stringify({
      reason: reason || 'Manual block',
      timestamp: new Date().toISOString(),
    });

    await this.redis.set(key, blockData, Math.ceil(durationMs / 1000));
    console.warn(`Blocked ${identifier} on ${namespace} for ${durationMs}ms: ${reason}`);
  }

  /**
   * Unblock identifier
   */
  async unblockIdentifier(identifier: string, namespace: string): Promise<void> {
    const key = this.generateKey(identifier, namespace, 'blocked');
    await this.redis.del(key);
    console.log(`Unblocked ${identifier} on ${namespace}`);
  }

  /**
   * Get list of blocked identifiers
   */
  async getBlockedIdentifiers(namespace: string): Promise<
    Array<{
      identifier: string;
      reason: string;
      timestamp: string;
      expiresAt: Date;
    }>
  > {
    try {
      const pattern = `ratelimit:${namespace}:*:blocked`;
      const keys = await this.redis.keys(pattern);

      const blocked: Array<any> = [];

      for (const key of keys) {
        const data = await this.redis.get(key);
        const ttl = await this.redis.ttl(key);

        if (data && ttl > 0) {
          const parsed = JSON.parse(data);
          const identifier = key.split(':')[2];

          blocked.push({
            identifier,
            reason: parsed.reason,
            timestamp: parsed.timestamp,
            expiresAt: new Date(Date.now() + ttl * 1000),
          });
        }
      }

      return blocked;
    } catch (error) {
      console.error('Failed to get blocked identifiers:', error);
      return [];
    }
  }

  /**
   * Generate Redis key
   */
  private generateKey(identifier: string, namespace: string, prefix: string): string {
    return `${prefix}:${namespace}:${identifier}`;
  }

  /**
   * Get rate limiter statistics
   */
  async getStatistics(namespace: string): Promise<{
    totalRequests: number;
    blockedRequests: number;
    activeBlocks: number;
    topIdentifiers: Array<{ identifier: string; count: number }>;
  }> {
    try {
      const pattern = `ratelimit:exceeded:count:${namespace}:*`;
      const keys = await this.redis.keys(pattern);

      let totalRequests = 0;
      const identifierCounts: Array<{ identifier: string; count: number }> = [];

      for (const key of keys) {
        const count = await this.redis.get(key);
        const requestCount = parseInt(count || '0');
        totalRequests += requestCount;

        const identifier = key.split(':').pop() || '';
        identifierCounts.push({ identifier, count: requestCount });
      }

      // Sort by count descending
      identifierCounts.sort((a, b) => b.count - a.count);

      const blocked = await this.getBlockedIdentifiers(namespace);

      return {
        totalRequests,
        blockedRequests: totalRequests,
        activeBlocks: blocked.length,
        topIdentifiers: identifierCounts.slice(0, 10),
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      return {
        totalRequests: 0,
        blockedRequests: 0,
        activeBlocks: 0,
        topIdentifiers: [],
      };
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Predefined rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  // Public API endpoints
  PUBLIC_API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 req/min
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
  },

  // Authenticated API endpoints
  AUTHENTICATED_API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120, // 120 req/min
    blockDurationMs: 5 * 60 * 1000,
  },

  // Login attempts
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },

  // Password reset
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 attempts
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },

  // File uploads
  UPLOAD: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 uploads/min
    blockDurationMs: 10 * 60 * 1000, // 10 minutes
  },

  // Heavy operations
  HEAVY_OPERATION: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 req/min
    blockDurationMs: 15 * 60 * 1000, // 15 minutes
  },

  // Admin operations
  ADMIN: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // 200 req/min
    blockDurationMs: 2 * 60 * 1000, // 2 minutes
  },
} as const;
