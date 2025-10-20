/**
 * Integration Test Helpers
 * Utility functions for integration tests
 */

import { Application, User, Payment, Certificate } from '@prisma/client';
import { getPrisma, getRedis } from './setup';

/**
 * Assert database record exists
 */
export async function assertRecordExists(model: string, id: string): Promise<boolean> {
  const prisma = getPrisma();

  const record = await (prisma as any)[model].findUnique({
    where: { id },
  });

  return record !== null;
}

/**
 * Assert cache key exists
 */
export async function assertCacheExists(key: string): Promise<boolean> {
  const redis = getRedis();
  const exists = await redis.exists(key);
  return exists === 1;
}

/**
 * Get cache value
 */
export async function getCacheValue(key: string): Promise<string | null> {
  const redis = getRedis();
  return await redis.get(key);
}

/**
 * Assert application status
 */
export async function assertApplicationStatus(
  applicationId: string,
  expectedStatus: string,
): Promise<boolean> {
  const prisma = getPrisma();

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  return application?.status === expectedStatus;
}

/**
 * Get application with relations
 */
export async function getApplicationWithRelations(applicationId: string) {
  const prisma = getPrisma();

  return await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      user: true,
      documents: true,
      payments: true,
      inspections: true,
      certificate: true,
      history: true,
    },
  });
}

/**
 * Create complete test application flow
 */
export async function createCompleteApplication(userId: string): Promise<{
  application: Application;
  payment: Payment;
  documents: any[];
}> {
  const prisma = getPrisma();

  // Create application
  const application = await prisma.application.create({
    data: {
      userId,
      applicationNumber: `TEST-${Date.now()}`,
      applicationType: 'GAP_VEGETABLES',
      farmName: 'Test Farm',
      farmLocation: 'Bangkok',
      farmSize: 10.5,
      crops: ['Tomato', 'Cucumber'],
      status: 'PENDING_REVIEW',
      submittedAt: new Date(),
    },
  });

  // Create payment
  const payment = await prisma.payment.create({
    data: {
      applicationId: application.id,
      amount: 5000,
      paymentMethod: 'PROMPTPAY',
      paymentStatus: 'COMPLETED',
      paymentReference: `PAY-${Date.now()}`,
      paidAt: new Date(),
    },
  });

  // Create documents
  const documents = await Promise.all([
    prisma.document.create({
      data: {
        applicationId: application.id,
        documentType: 'FARM_REGISTRATION',
        fileName: 'farm-reg.pdf',
        fileUrl: '/uploads/farm-reg.pdf',
        fileSize: 102400,
        mimeType: 'application/pdf',
        status: 'VERIFIED',
      },
    }),
    prisma.document.create({
      data: {
        applicationId: application.id,
        documentType: 'LAND_CERTIFICATE',
        fileName: 'land-cert.pdf',
        fileUrl: '/uploads/land-cert.pdf',
        fileSize: 204800,
        mimeType: 'application/pdf',
        status: 'VERIFIED',
      },
    }),
  ]);

  return { application, payment, documents };
}

/**
 * Simulate time passage for testing expiry
 */
export async function simulateTimePassage(applicationId: string, daysForward: number) {
  const prisma = getPrisma();

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysForward);

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      submittedAt: futureDate,
      updatedAt: futureDate,
    },
  });
}

/**
 * Count records in table
 */
export async function countRecords(model: string): Promise<number> {
  const prisma = getPrisma();
  return await (prisma as any)[model].count();
}

/**
 * Execute in transaction for rollback testing
 */
export async function executeInTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
  const prisma = getPrisma();
  return await prisma.$transaction(callback);
}

/**
 * Assert email sent
 */
export function assertEmailSent(mockFn: jest.Mock, to: string, subject?: string): boolean {
  const calls = mockFn.mock.calls;
  return calls.some(([emailData]) => {
    const match = emailData.to === to;
    if (subject) {
      return match && emailData.subject === subject;
    }
    return match;
  });
}

/**
 * Clear all mocks
 */
export function clearAllMocks() {
  jest.clearAllMocks();
}

/**
 * Create test data set for bulk operations
 */
export async function createBulkTestData(
  count: number,
  type: 'users' | 'applications',
): Promise<any[]> {
  const prisma = getPrisma();
  const data = [];

  if (type === 'users') {
    for (let i = 0; i < count; i++) {
      const user = await prisma.user.create({
        data: {
          email: `bulk-test-${i}-${Date.now()}@example.com`,
          password: 'hashedPassword123',
          firstName: `Test${i}`,
          lastName: 'User',
          phoneNumber: `08123456${String(i).padStart(2, '0')}`,
          role: 'FARMER',
          isEmailVerified: true,
          isActive: true,
        },
      });
      data.push(user);
    }
  } else if (type === 'applications') {
    // Create users first
    const users = await createBulkTestData(count, 'users');

    for (const user of users) {
      const application = await prisma.application.create({
        data: {
          userId: user.id,
          applicationNumber: `BULK-${Date.now()}-${user.id.substring(0, 8)}`,
          applicationType: 'GAP_VEGETABLES',
          farmName: `Test Farm ${user.firstName}`,
          farmLocation: 'Bangkok',
          farmSize: 10.5,
          crops: ['Tomato'],
          status: 'PENDING_REVIEW',
          submittedAt: new Date(),
        },
      });
      data.push(application);
    }
  }

  return data;
}

/**
 * Performance measurement helper
 */
export async function measurePerformance<T>(
  name: string,
  callback: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();
  const result = await callback();
  const duration = Date.now() - startTime;

  console.log(`[Performance] ${name}: ${duration}ms`);

  return { result, duration };
}

/**
 * Assert performance within threshold
 */
export function assertPerformance(duration: number, threshold: number, operation: string): void {
  if (duration > threshold) {
    throw new Error(
      `Performance threshold exceeded for ${operation}: ${duration}ms > ${threshold}ms`,
    );
  }
}
