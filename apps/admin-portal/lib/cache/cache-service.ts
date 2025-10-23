/**
 * Cache Service - High-level caching abstraction
 *
 * Features:
 * - Automatic key prefixing by namespace
 * - Cache-aside pattern implementation
 * - Stale-while-revalidate strategy
 * - Cache invalidation patterns
 * - TypeScript type safety
 * - Metrics tracking
 *
 * Usage:
 * ```typescript
 * import { cacheService } from '@/lib/cache/cache-service';
 *
 * // Cache with TTL
 * await cacheService.set('users', 'user:123', userData, 3600);
 *
 * // Get or fetch pattern
 * const user = await cacheService.getOrFetch(
 *   'users',
 *   'user:123',
 *   () => fetchUserFromDB(123),
 *   3600
 * );
 * ```
 */

import { redisClient } from './redis-client';

/**
 * Cache configuration per namespace
 */
interface CacheConfig {
  ttl: number; // Default TTL in seconds
  prefix: string; // Key prefix
  staleWhileRevalidate?: number; // Stale time in seconds
}

/**
 * Cache namespaces with default configurations
 */
export const CACHE_NAMESPACES = {
  USERS: {
    prefix: 'user',
    ttl: 3600, // 1 hour
  },
  APPLICATIONS: {
    prefix: 'app',
    ttl: 1800, // 30 minutes
  },
  DOCUMENTS: {
    prefix: 'doc',
    ttl: 7200, // 2 hours
  },
  PAYMENTS: {
    prefix: 'pay',
    ttl: 900, // 15 minutes
  },
  ANALYTICS: {
    prefix: 'analytics',
    ttl: 300, // 5 minutes
  },
  SESSIONS: {
    prefix: 'session',
    ttl: 86400, // 24 hours
  },
  API_RESPONSES: {
    prefix: 'api',
    ttl: 600, // 10 minutes
  },
} as const;

/**
 * Cache Service Class
 */
class CacheService {
  private metrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  /**
   * Build full cache key with namespace prefix
   */
  private buildKey(namespace: string, key: string): string {
    return `${namespace}:${key}`;
  }

  /**
   * Get value from cache
   */
  public async get<T>(namespace: string, key: string): Promise<T | null> {
    const fullKey = this.buildKey(namespace, key);
    const value = await redisClient.get<T>(fullKey);

    if (value !== null) {
      this.metrics.hits++;
    } else {
      this.metrics.misses++;
    }

    return value;
  }

  /**
   * Set value in cache with TTL
   */
  public async set(namespace: string, key: string, value: any, ttl?: number): Promise<boolean> {
    const fullKey = this.buildKey(namespace, key);
    const config = this.getNamespaceConfig(namespace);
    const finalTtl = ttl || config.ttl;

    const success = await redisClient.set(fullKey, value, finalTtl);

    if (success) {
      this.metrics.sets++;
    }

    return success;
  }

  /**
   * Delete value from cache
   */
  public async delete(namespace: string, key: string): Promise<boolean> {
    const fullKey = this.buildKey(namespace, key);
    const deleted = await redisClient.del(fullKey);

    if (deleted > 0) {
      this.metrics.deletes++;
    }

    return deleted > 0;
  }

  /**
   * Delete multiple keys at once
   */
  public async deleteMany(namespace: string, keys: string[]): Promise<number> {
    const fullKeys = keys.map(key => this.buildKey(namespace, key));
    const deleted = await redisClient.del(...fullKeys);
    this.metrics.deletes += deleted;
    return deleted;
  }

  /**
   * Get or fetch pattern (cache-aside)
   * If not in cache, fetch from source and cache it
   */
  public async getOrFetch<T>(
    namespace: string,
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(namespace, key);

    if (cached !== null) {
      return cached;
    }

    // Not in cache, fetch from source
    const value = await fetchFn();

    // Cache the result
    await this.set(namespace, key, value, ttl);

    return value;
  }

  /**
   * Invalidate all keys in namespace
   */
  public async invalidateNamespace(namespace: string): Promise<number> {
    const pattern = `${namespace}:*`;
    return await redisClient.deletePattern(pattern);
  }

  /**
   * Invalidate keys matching pattern within namespace
   */
  public async invalidatePattern(namespace: string, pattern: string): Promise<number> {
    const fullPattern = `${namespace}:${pattern}`;
    return await redisClient.deletePattern(fullPattern);
  }

  /**
   * Cache multiple values at once
   */
  public async setMany(
    namespace: string,
    data: Record<string, any>,
    ttl?: number
  ): Promise<boolean> {
    const config = this.getNamespaceConfig(namespace);
    const finalTtl = ttl || config.ttl;

    // Build full keys
    const fullData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      fullData[this.buildKey(namespace, key)] = value;
    });

    const success = await redisClient.mset(fullData);

    if (success) {
      // Set TTL for each key
      const keys = Object.keys(fullData);
      await Promise.all(keys.map(key => redisClient.expire(key, finalTtl)));
      this.metrics.sets += keys.length;
    }

    return success;
  }

  /**
   * Get multiple values at once
   */
  public async getMany<T>(namespace: string, keys: string[]): Promise<Record<string, T | null>> {
    const fullKeys = keys.map(key => this.buildKey(namespace, key));
    const values = await redisClient.mget<T>(fullKeys);

    const result: Record<string, T | null> = {};
    keys.forEach((key, index) => {
      result[key] = values[index];
      if (values[index] !== null) {
        this.metrics.hits++;
      } else {
        this.metrics.misses++;
      }
    });

    return result;
  }

  /**
   * Increment counter
   */
  public async increment(namespace: string, key: string, ttl?: number): Promise<number> {
    const fullKey = this.buildKey(namespace, key);
    const value = await redisClient.incr(fullKey);

    // Set TTL if this is the first increment
    if (value === 1 && ttl) {
      await redisClient.expire(fullKey, ttl);
    }

    return value;
  }

  /**
   * Decrement counter
   */
  public async decrement(namespace: string, key: string): Promise<number> {
    const fullKey = this.buildKey(namespace, key);
    return await redisClient.decr(fullKey);
  }

  /**
   * Check if key exists in cache
   */
  public async exists(namespace: string, key: string): Promise<boolean> {
    const fullKey = this.buildKey(namespace, key);
    const count = await redisClient.exists(fullKey);
    return count > 0;
  }

  /**
   * Get remaining TTL for a key
   */
  public async getTTL(namespace: string, key: string): Promise<number> {
    const fullKey = this.buildKey(namespace, key);
    return await redisClient.ttl(fullKey);
  }

  /**
   * Refresh TTL for a key
   */
  public async refreshTTL(namespace: string, key: string, ttl?: number): Promise<boolean> {
    const fullKey = this.buildKey(namespace, key);
    const config = this.getNamespaceConfig(namespace);
    const finalTtl = ttl || config.ttl;

    return await redisClient.expire(fullKey, finalTtl);
  }

  /**
   * Wrap async function with caching
   */
  public wrap<T>(namespace: string, key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    return this.getOrFetch(namespace, key, fn, ttl);
  }

  /**
   * Cache with stale-while-revalidate strategy
   */
  public async getStaleWhileRevalidate<T>(
    namespace: string,
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number,
    staleTime: number
  ): Promise<T> {
    const cached = await this.get<T>(namespace, key);

    if (cached !== null) {
      // Check if data is stale
      const remainingTtl = await this.getTTL(namespace, key);
      const isStale = remainingTtl > 0 && remainingTtl < staleTime;

      if (isStale) {
        // Return stale data immediately, revalidate in background
        fetchFn()
          .then(value => this.set(namespace, key, value, ttl))
          .catch(err => console.error('Background revalidation failed:', err));
      }

      return cached;
    }

    // Not in cache, fetch and cache
    const value = await fetchFn();
    await this.set(namespace, key, value, ttl);
    return value;
  }

  /**
   * Get namespace configuration
   */
  private getNamespaceConfig(namespace: string): CacheConfig {
    // Find config by namespace
    const config = Object.values(CACHE_NAMESPACES).find(ns => ns.prefix === namespace);

    return config || { prefix: namespace, ttl: 600 }; // Default 10 minutes
  }

  /**
   * Get cache metrics
   */
  public getMetrics() {
    return {
      ...this.metrics,
      hitRate: this.metrics.hits / (this.metrics.hits + this.metrics.misses) || 0,
    };
  }

  /**
   * Reset metrics
   */
  public resetMetrics() {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * Get overall cache statistics
   */
  public async getStats() {
    const redisStats = await redisClient.getStats();
    const appMetrics = this.getMetrics();

    return {
      redis: redisStats,
      application: appMetrics,
    };
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    return await redisClient.healthCheck();
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export for testing
export { CacheService };
