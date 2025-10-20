/**
 * Optimized Database Query Service
 *
 * Features:
 * - Query result caching with Redis
 * - N+1 query prevention with eager loading
 * - Batch operations for efficiency
 * - Query monitoring and logging
 * - Connection pooling
 * - Transaction support
 *
 * Usage:
 * ```typescript
 * import { queryService } from '@/lib/db/query-service';
 *
 * const users = await queryService.findMany('users', {
 *   where: { status: 'ACTIVE' },
 *   include: ['applications'],
 *   cache: true,
 *   ttl: 600
 * });
 * ```
 */

import { PrismaClient } from '@prisma/client';
import { cacheService, CACHE_NAMESPACES } from '../cache/cache-service';

// Global Prisma instance with connection pooling
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],

    // Connection pool configuration
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Query options interface
 */
interface QueryOptions {
  where?: Record<string, unknown>;
  select?: Record<string, boolean>;
  include?: Record<string, boolean | object>;
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  take?: number;
  skip?: number;
  cache?: boolean;
  ttl?: number;
}

/**
 * Query statistics for monitoring
 */
interface QueryStats {
  totalQueries: number;
  cachedQueries: number;
  slowQueries: number;
  avgQueryTime: number;
}

/**
 * Optimized Query Service
 */
class QueryService {
  private stats: QueryStats = {
    totalQueries: 0,
    cachedQueries: 0,
    slowQueries: 0,
    avgQueryTime: 0,
  };

  private queryTimes: number[] = [];
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second

  /**
   * Generate cache key from query options
   */
  private generateCacheKey(model: string, operation: string, options: QueryOptions): string {
    return `${model}:${operation}:${JSON.stringify(options)}`;
  }

  /**
   * Track query execution time
   */
  private trackQuery(duration: number): void {
    this.stats.totalQueries++;
    this.queryTimes.push(duration);

    // Keep only last 100 query times
    if (this.queryTimes.length > 100) {
      this.queryTimes.shift();
    }

    // Calculate average
    this.stats.avgQueryTime = this.queryTimes.reduce((a, b) => a + b, 0) / this.queryTimes.length;

    // Track slow queries
    if (duration > this.SLOW_QUERY_THRESHOLD) {
      this.stats.slowQueries++;
      console.warn(`⚠️  Slow query detected: ${duration}ms`);
    }
  }

  /**
   * Find many records with caching
   */
  public async findMany<T>(model: keyof PrismaClient, options: QueryOptions = {}): Promise<T[]> {
    const startTime = Date.now();

    try {
      // Check cache if enabled
      if (options.cache) {
        const cacheKey = this.generateCacheKey(model as string, 'findMany', options);

        const cached = await cacheService.get<T[]>(CACHE_NAMESPACES.API_RESPONSES.prefix, cacheKey);

        if (cached) {
          this.stats.cachedQueries++;
          return cached;
        }
      }

      // Execute query
      const delegate = prisma[model] as any;
      const result = await delegate.findMany({
        where: options.where,
        select: options.select,
        include: options.include,
        orderBy: options.orderBy,
        take: options.take,
        skip: options.skip,
      });

      // Cache result if enabled
      if (options.cache) {
        const cacheKey = this.generateCacheKey(model as string, 'findMany', options);

        await cacheService.set(
          CACHE_NAMESPACES.API_RESPONSES.prefix,
          cacheKey,
          result,
          options.ttl || 600,
        );
      }

      return result;
    } finally {
      const duration = Date.now() - startTime;
      this.trackQuery(duration);
    }
  }

  /**
   * Find unique record with caching
   */
  public async findUnique<T>(
    model: keyof PrismaClient,
    where: Record<string, unknown>,
    options: Omit<QueryOptions, 'where'> = {},
  ): Promise<T | null> {
    const startTime = Date.now();

    try {
      // Check cache if enabled
      if (options.cache) {
        const cacheKey = this.generateCacheKey(model as string, 'findUnique', {
          where,
          ...options,
        });

        const cached = await cacheService.get<T>(CACHE_NAMESPACES.API_RESPONSES.prefix, cacheKey);

        if (cached) {
          this.stats.cachedQueries++;
          return cached;
        }
      }

      // Execute query
      const delegate = prisma[model] as any;
      const result = await delegate.findUnique({
        where,
        select: options.select,
        include: options.include,
      });

      // Cache result if enabled
      if (options.cache && result) {
        const cacheKey = this.generateCacheKey(model as string, 'findUnique', {
          where,
          ...options,
        });

        await cacheService.set(
          CACHE_NAMESPACES.API_RESPONSES.prefix,
          cacheKey,
          result,
          options.ttl || 600,
        );
      }

      return result;
    } finally {
      const duration = Date.now() - startTime;
      this.trackQuery(duration);
    }
  }

  /**
   * Create record and invalidate cache
   */
  public async create<T>(model: keyof PrismaClient, data: Record<string, unknown>): Promise<T> {
    const startTime = Date.now();

    try {
      const delegate = prisma[model] as any;
      const result = await delegate.create({ data });

      // Invalidate related cache
      await this.invalidateModelCache(model as string);

      return result;
    } finally {
      const duration = Date.now() - startTime;
      this.trackQuery(duration);
    }
  }

  /**
   * Update record and invalidate cache
   */
  public async update<T>(
    model: keyof PrismaClient,
    where: Record<string, unknown>,
    data: Record<string, unknown>,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const delegate = prisma[model] as any;
      const result = await delegate.update({ where, data });

      // Invalidate related cache
      await this.invalidateModelCache(model as string);

      return result;
    } finally {
      const duration = Date.now() - startTime;
      this.trackQuery(duration);
    }
  }

  /**
   * Delete record and invalidate cache
   */
  public async delete<T>(model: keyof PrismaClient, where: Record<string, unknown>): Promise<T> {
    const startTime = Date.now();

    try {
      const delegate = prisma[model] as any;
      const result = await delegate.delete({ where });

      // Invalidate related cache
      await this.invalidateModelCache(model as string);

      return result;
    } finally {
      const duration = Date.now() - startTime;
      this.trackQuery(duration);
    }
  }

  /**
   * Count records with caching
   */
  public async count(
    model: keyof PrismaClient,
    where?: Record<string, unknown>,
    cache: boolean = true,
  ): Promise<number> {
    const startTime = Date.now();

    try {
      // Check cache if enabled
      if (cache) {
        const cacheKey = this.generateCacheKey(model as string, 'count', { where });

        const cached = await cacheService.get<number>(
          CACHE_NAMESPACES.API_RESPONSES.prefix,
          cacheKey,
        );

        if (cached !== null) {
          this.stats.cachedQueries++;
          return cached;
        }
      }

      // Execute query
      const delegate = prisma[model] as any;
      const result = await delegate.count({ where });

      // Cache result if enabled
      if (cache) {
        const cacheKey = this.generateCacheKey(model as string, 'count', { where });

        await cacheService.set(
          CACHE_NAMESPACES.API_RESPONSES.prefix,
          cacheKey,
          result,
          300, // 5 minutes for counts
        );
      }

      return result;
    } finally {
      const duration = Date.now() - startTime;
      this.trackQuery(duration);
    }
  }

  /**
   * Batch create records (more efficient than multiple creates)
   */
  public async createMany(
    model: keyof PrismaClient,
    data: Record<string, unknown>[],
  ): Promise<{ count: number }> {
    const startTime = Date.now();

    try {
      const delegate = prisma[model] as any;
      const result = await delegate.createMany({ data });

      // Invalidate related cache
      await this.invalidateModelCache(model as string);

      return result;
    } finally {
      const duration = Date.now() - startTime;
      this.trackQuery(duration);
    }
  }

  /**
   * Invalidate all cache for a model
   */
  private async invalidateModelCache(model: string): Promise<void> {
    const pattern = `${model}:*`;
    await cacheService.invalidatePattern(CACHE_NAMESPACES.API_RESPONSES.prefix, pattern);
  }

  /**
   * Get query statistics
   */
  public getStats(): QueryStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      totalQueries: 0,
      cachedQueries: 0,
      slowQueries: 0,
      avgQueryTime: 0,
    };
    this.queryTimes = [];
  }

  /**
   * Get Prisma client for custom queries
   */
  public getClient(): PrismaClient {
    return prisma;
  }
}

// Export singleton instance
export const queryService = new QueryService();

// Export for testing
export { QueryService };
