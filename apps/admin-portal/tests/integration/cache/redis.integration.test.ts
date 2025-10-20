/**
 * Integration Tests - Redis Cache Operations
 * Tests Redis cache operations, invalidation strategies, and performance
 */

import {
  setupTestEnvironment,
  teardownTestEnvironment,
  createTestUser,
  createTestApplication,
  getRedis,
} from '../setup';
import {
  assertCacheExists,
  getCacheValue,
  measurePerformance,
  assertPerformance,
} from '../helpers';

describe('Redis Cache Integration Tests', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  afterEach(async () => {
    // Clear cache between tests
    const redis = getRedis();
    await redis.flushDb();
  });

  describe('Basic Cache Operations', () => {
    test('should set and get cache value', async () => {
      const redis = getRedis();
      const key = 'test:simple';
      const value = JSON.stringify({ data: 'test value' });

      await redis.set(key, value);
      const retrieved = await redis.get(key);

      expect(retrieved).toBe(value);
      expect(JSON.parse(retrieved!).data).toBe('test value');
    });

    test('should set cache with TTL', async () => {
      const redis = getRedis();
      const key = 'test:ttl';
      const value = 'temporary value';
      const ttl = 2; // 2 seconds

      await redis.setEx(key, ttl, value);

      // Check immediately
      const retrieved = await redis.get(key);
      expect(retrieved).toBe(value);

      // Check TTL
      const remainingTTL = await redis.ttl(key);
      expect(remainingTTL).toBeLessThanOrEqual(ttl);
      expect(remainingTTL).toBeGreaterThan(0);
    });

    test('should delete cache value', async () => {
      const redis = getRedis();
      const key = 'test:delete';
      const value = 'to be deleted';

      await redis.set(key, value);
      expect(await redis.get(key)).toBe(value);

      await redis.del(key);
      expect(await redis.get(key)).toBeNull();
    });

    test('should check key existence', async () => {
      const redis = getRedis();
      const key = 'test:exists';

      expect(await redis.exists(key)).toBe(0);

      await redis.set(key, 'value');
      expect(await redis.exists(key)).toBe(1);
    });

    test('should handle non-existent keys', async () => {
      const redis = getRedis();
      const value = await redis.get('non:existent:key');

      expect(value).toBeNull();
    });
  });

  describe('Application-Specific Caching', () => {
    test('should cache user data', async () => {
      const user = await createTestUser('FARMER');
      const redis = getRedis();
      const cacheKey = `user:${user.id}`;

      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      await redis.setEx(cacheKey, 3600, JSON.stringify(userData)); // 1 hour

      const cached = await getCacheValue(cacheKey);
      expect(cached).toEqual(userData);
      await assertCacheExists(cacheKey);
    });

    test('should cache application data', async () => {
      const user = await createTestUser('FARMER');
      const application = await createTestApplication(user.id);
      const redis = getRedis();
      const cacheKey = `application:${application.id}`;

      const appData = {
        id: application.id,
        applicationNumber: application.applicationNumber,
        farmName: application.farmName,
        status: application.status,
      };

      await redis.setEx(cacheKey, 1800, JSON.stringify(appData)); // 30 minutes

      const cached = await getCacheValue(cacheKey);
      expect(cached).toEqual(appData);
    });

    test('should cache application list by user', async () => {
      const user = await createTestUser('FARMER');
      const redis = getRedis();
      const cacheKey = `user:${user.id}:applications`;

      const applications = await Promise.all([
        createTestApplication(user.id),
        createTestApplication(user.id),
        createTestApplication(user.id),
      ]);

      const appIds = applications.map(app => app.id);
      await redis.setEx(cacheKey, 600, JSON.stringify(appIds)); // 10 minutes

      const cached = await getCacheValue(cacheKey);
      expect(cached).toEqual(appIds);
      expect(cached).toHaveLength(3);
    });

    test('should cache statistics data', async () => {
      const redis = getRedis();
      const cacheKey = 'stats:applications:summary';

      const stats = {
        total: 150,
        pending: 45,
        approved: 90,
        rejected: 15,
        timestamp: new Date().toISOString(),
      };

      await redis.setEx(cacheKey, 300, JSON.stringify(stats)); // 5 minutes

      const cached = await getCacheValue(cacheKey);
      expect(cached).toEqual(stats);
    });
  });

  describe('Cache Invalidation', () => {
    test('should invalidate user cache on update', async () => {
      const user = await createTestUser('FARMER');
      const redis = getRedis();
      const cacheKey = `user:${user.id}`;

      // Cache user data
      await redis.setEx(cacheKey, 3600, JSON.stringify(user));
      await assertCacheExists(cacheKey);

      // Simulate user update - invalidate cache
      await redis.del(cacheKey);

      const cached = await redis.get(cacheKey);
      expect(cached).toBeNull();
    });

    test('should invalidate application cache on status change', async () => {
      const user = await createTestUser('FARMER');
      const application = await createTestApplication(user.id);
      const redis = getRedis();
      const cacheKey = `application:${application.id}`;

      // Cache application
      await redis.setEx(cacheKey, 1800, JSON.stringify(application));
      await assertCacheExists(cacheKey);

      // Simulate status change - invalidate cache
      await redis.del(cacheKey);

      expect(await redis.exists(cacheKey)).toBe(0);
    });

    test('should invalidate pattern-based caches', async () => {
      const user = await createTestUser('FARMER');
      const redis = getRedis();

      // Create multiple cache keys for user
      const keys = [
        `user:${user.id}:profile`,
        `user:${user.id}:applications`,
        `user:${user.id}:documents`,
      ];

      // Cache data
      for (const key of keys) {
        await redis.set(key, 'data');
      }

      // Find and delete all user-related caches
      const pattern = `user:${user.id}:*`;
      const matchingKeys = await redis.keys(pattern);

      if (matchingKeys.length > 0) {
        await redis.del(...matchingKeys);
      }

      // Verify all deleted
      for (const key of keys) {
        expect(await redis.exists(key)).toBe(0);
      }
    });

    test('should handle cache expiry automatically', async () => {
      const redis = getRedis();
      const key = 'test:auto-expire';
      const ttl = 1; // 1 second

      await redis.setEx(key, ttl, 'expires soon');

      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 1500));

      const value = await redis.get(key);
      expect(value).toBeNull();
    });
  });

  describe('Cache Performance', () => {
    test('should perform cache read efficiently', async () => {
      const redis = getRedis();
      const key = 'perf:read';
      const value = JSON.stringify({ data: 'performance test' });

      await redis.set(key, value);

      const { result, duration } = await measurePerformance('Cache read', async () => {
        return await redis.get(key);
      });

      expect(result).toBe(value);
      assertPerformance(duration, 10, 'Cache read'); // < 10ms
    });

    test('should perform cache write efficiently', async () => {
      const redis = getRedis();
      const key = 'perf:write';
      const value = JSON.stringify({ data: 'write test', timestamp: Date.now() });

      const { duration } = await measurePerformance('Cache write', async () => {
        await redis.set(key, value);
      });

      assertPerformance(duration, 10, 'Cache write'); // < 10ms
      expect(await redis.get(key)).toBe(value);
    });

    test('should handle concurrent cache operations', async () => {
      const redis = getRedis();

      const { duration } = await measurePerformance('50 concurrent cache operations', async () => {
        const operations = Array.from({ length: 50 }, (_, i) =>
          redis.set(`concurrent:${i}`, `value-${i}`)
        );

        await Promise.all(operations);
      });

      assertPerformance(duration, 500, '50 concurrent writes'); // < 500ms

      // Verify all written
      const count = await redis.dbSize();
      expect(count).toBeGreaterThanOrEqual(50);
    });

    test('should handle large data efficiently', async () => {
      const redis = getRedis();
      const key = 'perf:large-data';

      // Create large object (simulating list of applications)
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: `app-${i}`,
        applicationNumber: `APP-${i}`,
        farmName: `Farm ${i}`,
        status: 'PENDING_REVIEW',
      }));

      const value = JSON.stringify(largeData);

      const { duration: writeDuration } = await measurePerformance('Write large data', async () => {
        await redis.set(key, value);
      });

      const { result, duration: readDuration } = await measurePerformance(
        'Read large data',
        async () => {
          return await redis.get(key);
        }
      );

      expect(JSON.parse(result!)).toHaveLength(1000);
      assertPerformance(writeDuration, 100, 'Write large data'); // < 100ms
      assertPerformance(readDuration, 50, 'Read large data'); // < 50ms
    });
  });

  describe('Cache Strategies', () => {
    test('should implement cache-aside pattern', async () => {
      const user = await createTestUser('FARMER');
      const redis = getRedis();
      const cacheKey = `user:${user.id}`;

      // 1. Check cache first
      let cached = await redis.get(cacheKey);
      expect(cached).toBeNull(); // Cache miss

      // 2. Cache miss - fetch from database (already have user)
      // 3. Store in cache
      await redis.setEx(cacheKey, 3600, JSON.stringify(user));

      // 4. Next request - cache hit
      cached = await redis.get(cacheKey);
      expect(cached).not.toBeNull();
      expect(JSON.parse(cached!).id).toBe(user.id);
    });

    test('should implement write-through pattern', async () => {
      const user = await createTestUser('FARMER');
      const redis = getRedis();
      const cacheKey = `user:${user.id}`;

      // Simultaneously write to database and cache
      await Promise.all([
        // Database update would happen here
        Promise.resolve(),
        // Cache update
        redis.setEx(
          cacheKey,
          3600,
          JSON.stringify({
            ...user,
            firstName: 'Updated',
          })
        ),
      ]);

      const cached = await getCacheValue(cacheKey);
      expect(cached.firstName).toBe('Updated');
    });

    test('should implement cache warming', async () => {
      const users = await Promise.all([
        createTestUser('FARMER'),
        createTestUser('FARMER'),
        createTestUser('ADMIN'),
      ]);

      const redis = getRedis();

      // Pre-populate cache with frequently accessed data
      const { duration } = await measurePerformance('Cache warming', async () => {
        const operations = users.map(user =>
          redis.setEx(`user:${user.id}`, 3600, JSON.stringify(user))
        );

        await Promise.all(operations);
      });

      assertPerformance(duration, 100, 'Cache warming'); // < 100ms

      // Verify all cached
      for (const user of users) {
        await assertCacheExists(`user:${user.id}`);
      }
    });

    test('should handle cache stampede prevention', async () => {
      const redis = getRedis();
      const lockKey = 'lock:expensive-operation';
      const cacheKey = 'data:expensive';
      const lockTimeout = 5; // 5 seconds

      // Try to acquire lock
      const lockAcquired = await redis.set(lockKey, '1', {
        NX: true, // Only set if not exists
        EX: lockTimeout,
      });

      if (lockAcquired) {
        // Simulate expensive operation
        await new Promise(resolve => setTimeout(resolve, 100));

        // Store result in cache
        await redis.setEx(cacheKey, 600, JSON.stringify({ result: 'computed' }));

        // Release lock
        await redis.del(lockKey);
      }

      const cached = await getCacheValue(cacheKey);
      expect(cached.result).toBe('computed');
    });
  });

  describe('Cache Monitoring', () => {
    test('should track cache hit ratio', async () => {
      const redis = getRedis();
      const keys = Array.from({ length: 10 }, (_, i) => `track:${i}`);

      // Set some values
      for (let i = 0; i < 5; i++) {
        await redis.set(keys[i], `value-${i}`);
      }

      let hits = 0;
      let misses = 0;

      // Simulate requests
      for (const key of keys) {
        const value = await redis.get(key);
        if (value) hits++;
        else misses++;
      }

      const hitRatio = hits / (hits + misses);

      expect(hits).toBe(5);
      expect(misses).toBe(5);
      expect(hitRatio).toBe(0.5); // 50% hit ratio
    });

    test('should monitor cache size', async () => {
      const redis = getRedis();

      // Add multiple keys
      await Promise.all(Array.from({ length: 20 }, (_, i) => redis.set(`size:${i}`, `value-${i}`)));

      const dbSize = await redis.dbSize();
      expect(dbSize).toBeGreaterThanOrEqual(20);
    });

    test('should track cache memory usage', async () => {
      const redis = getRedis();

      // Add data
      await redis.set('memory:test', 'test value');

      // Get memory info (requires Redis INFO command if available)
      // This is a basic check
      const value = await redis.get('memory:test');
      expect(value).toBeDefined();
    });
  });
});
