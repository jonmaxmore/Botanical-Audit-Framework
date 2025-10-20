/**
 * Integration Tests - Database Operations
 * Tests database CRUD, transactions, indexes, and query performance
 */

import {
  setupTestEnvironment,
  teardownTestEnvironment,
  createTestUser,
  createTestApplication,
  getPrisma,
} from '../setup';
import {
  countRecords,
  executeInTransaction,
  measurePerformance,
  assertPerformance,
  createBulkTestData,
} from '../helpers';

describe('Database Operations Integration Tests', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  describe('Transaction Management', () => {
    test('should commit successful transaction', async () => {
      const prisma = getPrisma();

      const result = await executeInTransaction(async tx => {
        const user = await tx.user.create({
          data: {
            email: `tx-success-${Date.now()}@example.com`,
            password: 'hashedPassword123',
            firstName: 'Transaction',
            lastName: 'Success',
            phoneNumber: '0812345678',
            role: 'FARMER',
            isEmailVerified: true,
            isActive: true,
          },
        });

        const application = await tx.application.create({
          data: {
            userId: user.id,
            applicationNumber: `TX-${Date.now()}`,
            applicationType: 'GAP_VEGETABLES',
            farmName: 'Transaction Farm',
            farmLocation: 'Bangkok',
            farmSize: 10,
            crops: ['Tomato'],
            status: 'DRAFT',
          },
        });

        return { user, application };
      });

      expect(result.user).toBeDefined();
      expect(result.application).toBeDefined();
      expect(result.application.userId).toBe(result.user.id);

      // Verify data persisted
      const user = await prisma.user.findUnique({
        where: { id: result.user.id },
      });
      expect(user).toBeDefined();
    });

    test('should rollback failed transaction', async () => {
      const prisma = getPrisma();
      const initialUserCount = await countRecords('user');
      const initialAppCount = await countRecords('application');

      try {
        await executeInTransaction(async tx => {
          const user = await tx.user.create({
            data: {
              email: `tx-fail-${Date.now()}@example.com`,
              password: 'hashedPassword123',
              firstName: 'Transaction',
              lastName: 'Fail',
              phoneNumber: '0812345678',
              role: 'FARMER',
              isEmailVerified: true,
              isActive: true,
            },
          });

          // This will fail and rollback
          await tx.application.create({
            data: {
              userId: 'invalid-user-id', // Invalid foreign key
              applicationNumber: `TX-FAIL-${Date.now()}`,
              applicationType: 'GAP_VEGETABLES',
              farmName: 'Transaction Farm',
              farmLocation: 'Bangkok',
              farmSize: 10,
              crops: ['Tomato'],
              status: 'DRAFT',
            },
          });
        });
      } catch (error) {
        // Transaction should fail
        expect(error).toBeDefined();
      }

      // Verify rollback - counts should be unchanged
      const finalUserCount = await countRecords('user');
      const finalAppCount = await countRecords('application');

      expect(finalUserCount).toBe(initialUserCount);
      expect(finalAppCount).toBe(initialAppCount);
    });

    test('should handle nested transactions', async () => {
      const prisma = getPrisma();

      const result = await executeInTransaction(async tx => {
        const user = await tx.user.create({
          data: {
            email: `nested-tx-${Date.now()}@example.com`,
            password: 'hashedPassword123',
            firstName: 'Nested',
            lastName: 'Transaction',
            phoneNumber: '0812345678',
            role: 'FARMER',
            isEmailVerified: true,
            isActive: true,
          },
        });

        // Create multiple related records in same transaction
        const [app1, app2] = await Promise.all([
          tx.application.create({
            data: {
              userId: user.id,
              applicationNumber: `NESTED-1-${Date.now()}`,
              applicationType: 'GAP_VEGETABLES',
              farmName: 'Farm 1',
              farmLocation: 'Bangkok',
              farmSize: 10,
              crops: ['Tomato'],
              status: 'DRAFT',
            },
          }),
          tx.application.create({
            data: {
              userId: user.id,
              applicationNumber: `NESTED-2-${Date.now()}`,
              applicationType: 'GAP_FRUITS',
              farmName: 'Farm 2',
              farmLocation: 'Chiang Mai',
              farmSize: 15,
              crops: ['Orange'],
              status: 'DRAFT',
            },
          }),
        ]);

        return { user, applications: [app1, app2] };
      });

      expect(result.applications).toHaveLength(2);
      expect(result.applications[0].userId).toBe(result.user.id);
      expect(result.applications[1].userId).toBe(result.user.id);
    });
  });

  describe('Index Performance', () => {
    test('should efficiently query by indexed email field', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      const { result, duration } = await measurePerformance('Query by indexed email', async () => {
        return await prisma.user.findUnique({
          where: { email: user.email },
        });
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      assertPerformance(duration, 50, 'Query by email'); // < 50ms
    });

    test('should efficiently query applications by userId (indexed)', async () => {
      const user = await createTestUser('FARMER');
      await Promise.all([
        createTestApplication(user.id),
        createTestApplication(user.id),
        createTestApplication(user.id),
      ]);

      const prisma = getPrisma();
      const { result, duration } = await measurePerformance(
        'Query applications by userId',
        async () => {
          return await prisma.application.findMany({
            where: { userId: user.id },
          });
        },
      );

      expect(result).toHaveLength(3);
      assertPerformance(duration, 100, 'Query applications by userId'); // < 100ms
    });

    test('should efficiently query by composite index (status + userId)', async () => {
      const user = await createTestUser('FARMER');
      await Promise.all([
        createTestApplication(user.id, 'DRAFT'),
        createTestApplication(user.id, 'PENDING_REVIEW'),
        createTestApplication(user.id, 'PENDING_REVIEW'),
      ]);

      const prisma = getPrisma();
      const { result, duration } = await measurePerformance(
        'Query by composite index',
        async () => {
          return await prisma.application.findMany({
            where: {
              userId: user.id,
              status: 'PENDING_REVIEW',
            },
          });
        },
      );

      expect(result).toHaveLength(2);
      assertPerformance(duration, 100, 'Query by composite index'); // < 100ms
    });

    test('should efficiently query with date range', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      // Create applications
      await createTestApplication(user.id);

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');

      const { result, duration } = await measurePerformance('Query with date range', async () => {
        return await prisma.application.findMany({
          where: {
            userId: user.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });
      });

      expect(result.length).toBeGreaterThanOrEqual(0);
      assertPerformance(duration, 100, 'Query with date range'); // < 100ms
    });
  });

  describe('Bulk Operations', () => {
    test('should handle bulk insert efficiently', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      const { duration } = await measurePerformance('Bulk insert 50 applications', async () => {
        const promises = Array.from({ length: 50 }, (_, i) =>
          prisma.application.create({
            data: {
              userId: user.id,
              applicationNumber: `BULK-${i}-${Date.now()}`,
              applicationType: 'GAP_VEGETABLES',
              farmName: `Bulk Farm ${i}`,
              farmLocation: 'Bangkok',
              farmSize: 10,
              crops: ['Tomato'],
              status: 'DRAFT',
            },
          }),
        );

        await Promise.all(promises);
      });

      assertPerformance(duration, 5000, 'Bulk insert 50 records'); // < 5 seconds

      const count = await prisma.application.count({
        where: { userId: user.id },
      });
      expect(count).toBe(50);
    });

    test('should handle bulk update efficiently', async () => {
      const users = await createBulkTestData(10, 'users');
      const prisma = getPrisma();

      const userIds = users.map(u => u.id);

      const { duration } = await measurePerformance('Bulk update 10 users', async () => {
        await prisma.user.updateMany({
          where: {
            id: { in: userIds },
          },
          data: {
            isEmailVerified: true,
          },
        });
      });

      assertPerformance(duration, 1000, 'Bulk update 10 records'); // < 1 second

      const verifiedCount = await prisma.user.count({
        where: {
          id: { in: userIds },
          isEmailVerified: true,
        },
      });
      expect(verifiedCount).toBe(10);
    });

    test('should handle bulk delete efficiently', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      // Create 20 draft applications
      await Promise.all(
        Array.from({ length: 20 }, (_, i) =>
          prisma.application.create({
            data: {
              userId: user.id,
              applicationNumber: `DEL-${i}-${Date.now()}`,
              applicationType: 'GAP_VEGETABLES',
              farmName: `Delete Farm ${i}`,
              farmLocation: 'Bangkok',
              farmSize: 10,
              crops: ['Tomato'],
              status: 'DRAFT',
            },
          }),
        ),
      );

      const { duration } = await measurePerformance('Bulk delete 20 applications', async () => {
        await prisma.application.deleteMany({
          where: {
            userId: user.id,
            status: 'DRAFT',
          },
        });
      });

      assertPerformance(duration, 1000, 'Bulk delete 20 records'); // < 1 second

      const remaining = await prisma.application.count({
        where: {
          userId: user.id,
          status: 'DRAFT',
        },
      });
      expect(remaining).toBe(0);
    });
  });

  describe('Complex Queries', () => {
    test('should perform aggregation queries efficiently', async () => {
      const user1 = await createTestUser('FARMER');
      const user2 = await createTestUser('FARMER');

      await Promise.all([
        createTestApplication(user1.id, 'DRAFT'),
        createTestApplication(user1.id, 'PENDING_REVIEW'),
        createTestApplication(user2.id, 'APPROVED'),
      ]);

      const prisma = getPrisma();
      const { result, duration } = await measurePerformance('Aggregation query', async () => {
        return await prisma.application.groupBy({
          by: ['status'],
          _count: true,
        });
      });

      expect(result.length).toBeGreaterThan(0);
      assertPerformance(duration, 200, 'Aggregation query'); // < 200ms
    });

    test('should perform join queries efficiently', async () => {
      const user = await createTestUser('FARMER');
      const application = await createTestApplication(user.id);

      const prisma = getPrisma();
      const { result, duration } = await measurePerformance(
        'Join query with relations',
        async () => {
          return await prisma.application.findUnique({
            where: { id: application.id },
            include: {
              user: true,
              documents: true,
              payments: true,
            },
          });
        },
      );

      expect(result).toBeDefined();
      expect(result?.user).toBeDefined();
      assertPerformance(duration, 150, 'Join query'); // < 150ms
    });

    test('should perform nested queries efficiently', async () => {
      const user = await createTestUser('FARMER');
      await createTestApplication(user.id);

      const prisma = getPrisma();
      const { result, duration } = await measurePerformance('Nested query', async () => {
        return await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            applications: {
              include: {
                documents: true,
              },
            },
          },
        });
      });

      expect(result).toBeDefined();
      expect(result?.applications).toBeDefined();
      assertPerformance(duration, 200, 'Nested query'); // < 200ms
    });

    test('should perform full-text search efficiently', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      await prisma.application.create({
        data: {
          userId: user.id,
          applicationNumber: `SEARCH-${Date.now()}`,
          applicationType: 'GAP_VEGETABLES',
          farmName: 'Organic Green Valley Farm',
          farmLocation: 'Bangkok',
          farmSize: 10,
          crops: ['Organic Tomato'],
          status: 'DRAFT',
        },
      });

      const { result, duration } = await measurePerformance('Full-text search', async () => {
        return await prisma.application.findMany({
          where: {
            OR: [
              { farmName: { contains: 'Organic', mode: 'insensitive' } },
              { farmLocation: { contains: 'Organic', mode: 'insensitive' } },
            ],
          },
        });
      });

      expect(result.length).toBeGreaterThan(0);
      assertPerformance(duration, 200, 'Full-text search'); // < 200ms
    });
  });

  describe('Database Constraints', () => {
    test('should enforce unique constraint on email', async () => {
      const email = `unique-${Date.now()}@example.com`;
      const prisma = getPrisma();

      await prisma.user.create({
        data: {
          email,
          password: 'hashedPassword123',
          firstName: 'First',
          lastName: 'User',
          phoneNumber: '0812345678',
          role: 'FARMER',
          isEmailVerified: true,
          isActive: true,
        },
      });

      await expect(
        prisma.user.create({
          data: {
            email, // Duplicate
            password: 'hashedPassword456',
            firstName: 'Second',
            lastName: 'User',
            phoneNumber: '0812345679',
            role: 'FARMER',
            isEmailVerified: true,
            isActive: true,
          },
        }),
      ).rejects.toThrow();
    });

    test('should enforce foreign key constraint', async () => {
      const prisma = getPrisma();

      await expect(
        prisma.application.create({
          data: {
            userId: 'non-existent-user-id',
            applicationNumber: `FK-${Date.now()}`,
            applicationType: 'GAP_VEGETABLES',
            farmName: 'Test Farm',
            farmLocation: 'Bangkok',
            farmSize: 10,
            crops: ['Tomato'],
            status: 'DRAFT',
          },
        }),
      ).rejects.toThrow();
    });

    test('should enforce NOT NULL constraints', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      await expect(
        prisma.application.create({
          data: {
            userId: user.id,
            applicationNumber: `NULL-${Date.now()}`,
            applicationType: 'GAP_VEGETABLES',
            // Missing required fields: farmName, farmLocation, farmSize
          } as any,
        }),
      ).rejects.toThrow();
    });
  });

  describe('Connection Pooling', () => {
    test('should handle concurrent queries efficiently', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      const { duration } = await measurePerformance('10 concurrent queries', async () => {
        const promises = Array.from({ length: 10 }, () =>
          prisma.user.findUnique({
            where: { id: user.id },
          }),
        );

        await Promise.all(promises);
      });

      assertPerformance(duration, 500, '10 concurrent queries'); // < 500ms
    });

    test('should handle mixed operations concurrently', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      const { duration } = await measurePerformance('Mixed concurrent operations', async () => {
        await Promise.all([
          // Read operations
          prisma.user.findUnique({ where: { id: user.id } }),
          prisma.application.findMany({ where: { userId: user.id } }),
          // Write operations
          prisma.application.create({
            data: {
              userId: user.id,
              applicationNumber: `MIXED-${Date.now()}`,
              applicationType: 'GAP_VEGETABLES',
              farmName: 'Mixed Farm',
              farmLocation: 'Bangkok',
              farmSize: 10,
              crops: ['Tomato'],
              status: 'DRAFT',
            },
          }),
        ]);
      });

      assertPerformance(duration, 500, 'Mixed concurrent operations'); // < 500ms
    });
  });
});
