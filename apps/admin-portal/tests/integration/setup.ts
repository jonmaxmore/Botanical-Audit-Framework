/**
 * Integration Test Setup
 * Sets up test environment, database, and mocks for integration tests
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

// Global test instances
let prisma: PrismaClient;
let redisClient: RedisClientType;

/**
 * Initialize test database and services
 */
export async function setupTestEnvironment() {
  // Initialize Prisma with test database
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
      },
    },
  });

  // Connect to database
  await prisma.$connect();

  // Initialize Redis client for cache tests
  redisClient = createClient({
    url: process.env.REDIS_URL_TEST || process.env.REDIS_URL || 'redis://localhost:6379',
  });

  await redisClient.connect();

  // Clear Redis cache before tests
  await redisClient.flushDb();

  return { prisma, redisClient };
}

/**
 * Clean up test environment after tests
 */
export async function teardownTestEnvironment() {
  // Clear test data
  if (prisma) {
    // Delete all test data in reverse order of dependencies
    await prisma.notification.deleteMany();
    await prisma.inspectionReport.deleteMany();
    await prisma.inspection.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.document.deleteMany();
    await prisma.applicationHistory.deleteMany();
    await prisma.application.deleteMany();
    await prisma.user.deleteMany();

    // Disconnect
    await prisma.$disconnect();
  }

  // Disconnect Redis
  if (redisClient) {
    await redisClient.quit();
  }
}

/**
 * Get Prisma client instance
 */
export function getPrisma() {
  if (!prisma) {
    throw new Error('Prisma client not initialized. Call setupTestEnvironment() first.');
  }
  return prisma;
}

/**
 * Get Redis client instance
 */
export function getRedis() {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call setupTestEnvironment() first.');
  }
  return redisClient;
}

/**
 * Clean specific table for isolated tests
 */
export async function cleanTable(tableName: string) {
  const prisma = getPrisma();

  switch (tableName) {
    case 'users':
      await prisma.user.deleteMany();
      break;
    case 'applications':
      await prisma.application.deleteMany();
      break;
    case 'documents':
      await prisma.document.deleteMany();
      break;
    case 'payments':
      await prisma.payment.deleteMany();
      break;
    case 'certificates':
      await prisma.certificate.deleteMany();
      break;
    case 'inspections':
      await prisma.inspection.deleteMany();
      break;
    default:
      throw new Error(`Unknown table: ${tableName}`);
  }
}

/**
 * Create test user with specific role
 */
export async function createTestUser(role: 'FARMER' | 'ADMIN' | 'INSPECTOR' = 'FARMER') {
  const prisma = getPrisma();

  return await prisma.user.create({
    data: {
      email: `test-${role.toLowerCase()}-${Date.now()}@example.com`,
      password: 'hashedPassword123', // In real tests, use proper hashing
      firstName: 'Test',
      lastName: role,
      phoneNumber: '0812345678',
      role,
      isEmailVerified: true,
      isActive: true,
    },
  });
}

/**
 * Create test application
 */
export async function createTestApplication(userId: string, status: string = 'DRAFT') {
  const prisma = getPrisma();

  return await prisma.application.create({
    data: {
      userId,
      applicationNumber: `TEST-${Date.now()}`,
      applicationType: 'GAP_VEGETABLES',
      farmName: 'Test Farm',
      farmLocation: 'Bangkok',
      farmSize: 10.5,
      crops: ['Tomato', 'Cucumber'],
      status,
      submittedAt: status !== 'DRAFT' ? new Date() : null,
    },
  });
}

/**
 * Create test payment
 */
export async function createTestPayment(applicationId: string, status: string = 'COMPLETED') {
  const prisma = getPrisma();

  return await prisma.payment.create({
    data: {
      applicationId,
      amount: 5000,
      paymentMethod: 'PROMPTPAY',
      paymentStatus: status,
      paymentReference: `PAY-${Date.now()}`,
      paidAt: status === 'COMPLETED' ? new Date() : null,
    },
  });
}

/**
 * Mock external API responses
 */
export const mockExternalApis = {
  promptpay: {
    generateQR: jest.fn().mockResolvedValue({
      success: true,
      qrCode: 'mock-qr-code-data',
      referenceId: 'MOCK-REF-123',
    }),
    verifyPayment: jest.fn().mockResolvedValue({
      success: true,
      status: 'COMPLETED',
      transactionId: 'TXN-123',
    }),
  },

  email: {
    send: jest.fn().mockResolvedValue({
      success: true,
      messageId: 'msg-123',
    }),
  },

  sms: {
    send: jest.fn().mockResolvedValue({
      success: true,
      messageId: 'sms-123',
    }),
  },
};

/**
 * Wait for async operations
 */
export async function waitFor(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate mock file upload
 */
export function mockFileUpload(filename: string, size: number = 1024) {
  return {
    fieldname: 'file',
    originalname: filename,
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.alloc(size),
    size,
  };
}
