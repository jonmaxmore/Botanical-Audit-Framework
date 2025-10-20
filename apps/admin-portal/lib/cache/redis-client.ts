/**
 * Redis Client Configuration and Connection Management
 *
 * Features:
 * - Connection pooling for high performance
 * - Automatic reconnection on failure
 * - Health check monitoring
 * - Environment-based configuration
 * - TypeScript type safety
 *
 * Usage:
 * ```typescript
 * import { redisClient } from '@/lib/cache/redis-client';
 * await redisClient.set('key', 'value', 3600);
 * const value = await redisClient.get('key');
 * ```
 */

import Redis, { RedisOptions } from 'ioredis';

// Redis configuration from environment variables
const REDIS_CONFIG: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),

  // Connection pool settings
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,

  // Reconnection strategy
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },

  // Connection timeout
  connectTimeout: 10000,

  // Keep-alive settings
  keepAlive: 30000,

  // Family preference (IPv4)
  family: 4,
};

/**
 * Redis Client Instance
 * Singleton pattern for connection reuse
 */
class RedisClient {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Redis(REDIS_CONFIG);
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for connection monitoring
   */
  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('✅ Redis: Connected successfully');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      console.log('✅ Redis: Ready to accept commands');
    });

    this.client.on('error', error => {
      console.error('❌ Redis Error:', error.message);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('⚠️  Redis: Connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnecting', (delay: number) => {
      console.log(`🔄 Redis: Reconnecting in ${delay}ms`);
    });
  }

  /**
   * Get connection status
   */
  public getStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Health check - ping Redis server
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Get value by key
   */
  public async get<T = string>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;

      // Try to parse JSON, fallback to string
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.error(`Redis GET error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set value with optional TTL (in seconds)
   */
  public async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

      if (ttl) {
        await this.client.setex(key, ttl, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }

      return true;
    } catch (error) {
      console.error(`Redis SET error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Delete one or more keys
   */
  public async del(...keys: string[]): Promise<number> {
    try {
      return await this.client.del(...keys);
    } catch (error) {
      console.error(`Redis DEL error for keys "${keys.join(', ')}":`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  public async exists(...keys: string[]): Promise<number> {
    try {
      return await this.client.exists(...keys);
    } catch (error) {
      console.error(`Redis EXISTS error:`, error);
      return 0;
    }
  }

  /**
   * Set expiration time (TTL) in seconds
   */
  public async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXPIRE error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  public async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Redis TTL error for key "${key}":`, error);
      return -1;
    }
  }

  /**
   * Increment value (useful for counters)
   */
  public async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error(`Redis INCR error for key "${key}":`, error);
      return 0;
    }
  }

  /**
   * Decrement value
   */
  public async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      console.error(`Redis DECR error for key "${key}":`, error);
      return 0;
    }
  }

  /**
   * Get multiple keys at once
   */
  public async mget<T = string>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.client.mget(...keys);
      return values.map(value => {
        if (!value) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as unknown as T;
        }
      });
    } catch (error) {
      console.error(`Redis MGET error:`, error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple keys at once
   */
  public async mset(data: Record<string, any>): Promise<boolean> {
    try {
      const flatData: string[] = [];
      Object.entries(data).forEach(([key, value]) => {
        flatData.push(key, typeof value === 'string' ? value : JSON.stringify(value));
      });

      await this.client.mset(...flatData);
      return true;
    } catch (error) {
      console.error(`Redis MSET error:`, error);
      return false;
    }
  }

  /**
   * Delete all keys matching pattern
   */
  public async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      return await this.client.del(...keys);
    } catch (error) {
      console.error(`Redis DELETE PATTERN error for "${pattern}":`, error);
      return 0;
    }
  }

  /**
   * Flush all data in current database
   */
  public async flushDb(): Promise<boolean> {
    try {
      await this.client.flushdb();
      return true;
    } catch (error) {
      console.error(`Redis FLUSHDB error:`, error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  public async getStats(): Promise<{
    connected: boolean;
    usedMemory: string;
    keys: number;
    hits: number;
    misses: number;
  }> {
    try {
      const info = await this.client.info('stats');
      const keyspace = await this.client.info('keyspace');

      // Parse info string
      const stats = {
        connected: this.isConnected,
        usedMemory: '0',
        keys: 0,
        hits: 0,
        misses: 0,
      };

      // Extract memory info
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      if (memoryMatch) {
        stats.usedMemory = memoryMatch[1];
      }

      // Extract hits and misses
      const hitsMatch = info.match(/keyspace_hits:(\d+)/);
      const missesMatch = info.match(/keyspace_misses:(\d+)/);
      if (hitsMatch) stats.hits = parseInt(hitsMatch[1]);
      if (missesMatch) stats.misses = parseInt(missesMatch[1]);

      // Extract key count
      const keysMatch = keyspace.match(/keys=(\d+)/);
      if (keysMatch) stats.keys = parseInt(keysMatch[1]);

      return stats;
    } catch (error) {
      console.error(`Redis STATS error:`, error);
      return {
        connected: false,
        usedMemory: '0',
        keys: 0,
        hits: 0,
        misses: 0,
      };
    }
  }

  /**
   * Close Redis connection
   */
  public async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      console.log('✅ Redis: Disconnected gracefully');
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }

  /**
   * Get raw Redis client for advanced operations
   */
  public getClient(): Redis {
    return this.client;
  }
}

// Export singleton instance
export const redisClient = new RedisClient();

// Export for testing
export { RedisClient };
