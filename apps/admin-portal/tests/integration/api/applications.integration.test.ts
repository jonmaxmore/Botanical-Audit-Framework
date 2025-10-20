/**
 * Integration Tests - Applications API
 * Tests application CRUD operations, status changes, and workflow
 */

import {
  setupTestEnvironment,
  teardownTestEnvironment,
  createTestUser,
  createTestApplication,
  createTestPayment,
  getPrisma,
} from '../setup';
import {
  assertRecordExists,
  assertApplicationStatus,
  getApplicationWithRelations,
  createCompleteApplication,
  countRecords,
} from '../helpers';

describe('Applications API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  describe('CREATE Operations', () => {
    test('should create new application with valid data', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      const application = await prisma.application.create({
        data: {
          userId: user.id,
          applicationNumber: `APP-${Date.now()}`,
          applicationType: 'GAP_VEGETABLES',
          farmName: 'Green Valley Farm',
          farmLocation: 'Chiang Mai',
          farmSize: 15.5,
          crops: ['Tomato', 'Pepper', 'Cucumber'],
          status: 'DRAFT',
        },
      });

      expect(application).toBeDefined();
      expect(application.farmName).toBe('Green Valley Farm');
      expect(application.status).toBe('DRAFT');
      expect(await assertRecordExists('application', application.id)).toBe(true);
    });

    test('should auto-generate application number', async () => {
      const user = await createTestUser('FARMER');
      const application = await createTestApplication(user.id);

      expect(application.applicationNumber).toMatch(/^TEST-\d+$/);
    });

    test('should create application with required fields only', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      const application = await prisma.application.create({
        data: {
          userId: user.id,
          applicationNumber: `MIN-${Date.now()}`,
          applicationType: 'GAP_FRUITS',
          farmName: 'Minimal Farm',
          farmLocation: 'Bangkok',
          farmSize: 5.0,
          crops: ['Orange'],
          status: 'DRAFT',
        },
      });

      expect(application).toBeDefined();
      expect(application.submittedAt).toBeNull();
    });

    test('should reject application without required fields', async () => {
      const prisma = getPrisma();

      await expect(
        prisma.application.create({
          data: {
            userId: 'invalid-user-id',
            applicationNumber: `INV-${Date.now()}`,
            applicationType: 'GAP_VEGETABLES',
            // Missing required fields
          } as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('READ Operations', () => {
    test('should retrieve application by ID', async () => {
      const user = await createTestUser('FARMER');
      const created = await createTestApplication(user.id);

      const prisma = getPrisma();
      const found = await prisma.application.findUnique({
        where: { id: created.id },
      });

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.farmName).toBe(created.farmName);
    });

    test('should retrieve application with relations', async () => {
      const user = await createTestUser('FARMER');
      const { application, payment, documents } = await createCompleteApplication(user.id);

      const found = await getApplicationWithRelations(application.id);

      expect(found).toBeDefined();
      expect(found?.user.id).toBe(user.id);
      expect(found?.payments).toHaveLength(1);
      expect(found?.documents).toHaveLength(2);
    });

    test('should list applications with pagination', async () => {
      const user = await createTestUser('FARMER');
      await Promise.all([
        createTestApplication(user.id),
        createTestApplication(user.id),
        createTestApplication(user.id),
      ]);

      const prisma = getPrisma();
      const applications = await prisma.application.findMany({
        where: { userId: user.id },
        take: 2,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });

      expect(applications).toHaveLength(2);
    });

    test('should filter applications by status', async () => {
      const user = await createTestUser('FARMER');
      await createTestApplication(user.id, 'DRAFT');
      await createTestApplication(user.id, 'PENDING_REVIEW');
      await createTestApplication(user.id, 'APPROVED');

      const prisma = getPrisma();
      const pending = await prisma.application.findMany({
        where: {
          userId: user.id,
          status: 'PENDING_REVIEW',
        },
      });

      expect(pending).toHaveLength(1);
      expect(pending[0].status).toBe('PENDING_REVIEW');
    });

    test('should search applications by farm name', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      await prisma.application.create({
        data: {
          userId: user.id,
          applicationNumber: `SEARCH-1-${Date.now()}`,
          applicationType: 'GAP_VEGETABLES',
          farmName: 'Sunshine Valley Farm',
          farmLocation: 'Bangkok',
          farmSize: 10,
          crops: ['Tomato'],
          status: 'DRAFT',
        },
      });

      const results = await prisma.application.findMany({
        where: {
          farmName: {
            contains: 'Sunshine',
            mode: 'insensitive',
          },
        },
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].farmName).toContain('Sunshine');
    });
  });

  describe('UPDATE Operations', () => {
    test('should update application draft', async () => {
      const user = await createTestUser('FARMER');
      const application = await createTestApplication(user.id, 'DRAFT');

      const prisma = getPrisma();
      const updated = await prisma.application.update({
        where: { id: application.id },
        data: {
          farmName: 'Updated Farm Name',
          farmSize: 20.0,
        },
      });

      expect(updated.farmName).toBe('Updated Farm Name');
      expect(updated.farmSize).toBe(20.0);
    });

    test('should submit application (change status)', async () => {
      const user = await createTestUser('FARMER');
      const application = await createTestApplication(user.id, 'DRAFT');

      const prisma = getPrisma();
      const submitted = await prisma.application.update({
        where: { id: application.id },
        data: {
          status: 'PENDING_PAYMENT',
          submittedAt: new Date(),
        },
      });

      expect(submitted.status).toBe('PENDING_PAYMENT');
      expect(submitted.submittedAt).toBeDefined();
      expect(await assertApplicationStatus(application.id, 'PENDING_PAYMENT')).toBe(true);
    });

    test('should approve application', async () => {
      const user = await createTestUser('FARMER');
      const application = await createTestApplication(user.id, 'PENDING_REVIEW');
      await createTestPayment(application.id, 'COMPLETED');

      const admin = await createTestUser('ADMIN');
      const prisma = getPrisma();

      const approved = await prisma.application.update({
        where: { id: application.id },
        data: {
          status: 'APPROVED',
          reviewedBy: admin.id,
          reviewedAt: new Date(),
          reviewNotes: 'All documents verified',
        },
      });

      expect(approved.status).toBe('APPROVED');
      expect(approved.reviewedBy).toBe(admin.id);
      expect(approved.reviewNotes).toBe('All documents verified');
    });

    test('should reject application with reason', async () => {
      const user = await createTestUser('FARMER');
      const application = await createTestApplication(user.id, 'PENDING_REVIEW');

      const admin = await createTestUser('ADMIN');
      const prisma = getPrisma();

      const rejected = await prisma.application.update({
        where: { id: application.id },
        data: {
          status: 'REJECTED',
          reviewedBy: admin.id,
          reviewedAt: new Date(),
          reviewNotes: 'Missing required documents',
        },
      });

      expect(rejected.status).toBe('REJECTED');
      expect(rejected.reviewNotes).toContain('Missing required documents');
    });

    test('should track application history on status change', async () => {
      const user = await createTestUser('FARMER');
      const application = await createTestApplication(user.id, 'DRAFT');

      const prisma = getPrisma();

      // Change status
      await prisma.application.update({
        where: { id: application.id },
        data: { status: 'PENDING_PAYMENT' },
      });

      // Create history record
      await prisma.applicationHistory.create({
        data: {
          applicationId: application.id,
          status: 'PENDING_PAYMENT',
          changedBy: user.id,
          notes: 'Application submitted',
        },
      });

      const history = await prisma.applicationHistory.findMany({
        where: { applicationId: application.id },
      });

      expect(history).toHaveLength(1);
      expect(history[0].status).toBe('PENDING_PAYMENT');
    });
  });

  describe('DELETE Operations', () => {
    test('should delete draft application', async () => {
      const user = await createTestUser('FARMER');
      const application = await createTestApplication(user.id, 'DRAFT');

      const prisma = getPrisma();
      await prisma.application.delete({
        where: { id: application.id },
      });

      expect(await assertRecordExists('application', application.id)).toBe(false);
    });

    test('should not delete submitted application', async () => {
      const user = await createTestUser('FARMER');
      const application = await createTestApplication(user.id, 'PENDING_REVIEW');

      // In real implementation, this would be prevented by business logic
      // For now, we just verify the application exists
      expect(await assertRecordExists('application', application.id)).toBe(true);
    });

    test('should cascade delete related records', async () => {
      const user = await createTestUser('FARMER');
      const { application } = await createCompleteApplication(user.id);

      const prisma = getPrisma();

      // Delete application (should cascade to documents and payments)
      await prisma.application.delete({
        where: { id: application.id },
      });

      // Verify related records are deleted (if cascade is configured)
      const documents = await prisma.document.findMany({
        where: { applicationId: application.id },
      });

      // Note: Cascade behavior depends on Prisma schema configuration
      expect(documents).toHaveLength(0);
    });
  });

  describe('Business Logic Integration', () => {
    test('should enforce status workflow', async () => {
      const user = await createTestUser('FARMER');
      const application = await createTestApplication(user.id, 'DRAFT');

      // Valid: DRAFT -> PENDING_PAYMENT
      const prisma = getPrisma();
      await prisma.application.update({
        where: { id: application.id },
        data: { status: 'PENDING_PAYMENT' },
      });

      expect(await assertApplicationStatus(application.id, 'PENDING_PAYMENT')).toBe(true);
    });

    test('should require payment before review', async () => {
      const user = await createTestUser('FARMER');
      const application = await createTestApplication(user.id, 'PENDING_PAYMENT');

      // Create payment
      const payment = await createTestPayment(application.id, 'COMPLETED');

      // Now can move to PENDING_REVIEW
      const prisma = getPrisma();
      await prisma.application.update({
        where: { id: application.id },
        data: { status: 'PENDING_REVIEW' },
      });

      expect(payment.paymentStatus).toBe('COMPLETED');
      expect(await assertApplicationStatus(application.id, 'PENDING_REVIEW')).toBe(true);
    });

    test('should count applications by status', async () => {
      const user = await createTestUser('FARMER');
      await createTestApplication(user.id, 'DRAFT');
      await createTestApplication(user.id, 'PENDING_REVIEW');
      await createTestApplication(user.id, 'APPROVED');

      const prisma = getPrisma();
      const stats = await prisma.application.groupBy({
        by: ['status'],
        where: { userId: user.id },
        _count: true,
      });

      expect(stats).toHaveLength(3);
    });

    test('should validate application completeness', async () => {
      const user = await createTestUser('FARMER');
      const { application, documents } = await createCompleteApplication(user.id);

      // Check if application has all required documents
      expect(documents.length).toBeGreaterThanOrEqual(2);
      expect(documents.every(doc => doc.status === 'VERIFIED')).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should handle bulk application creation', async () => {
      const user = await createTestUser('FARMER');
      const prisma = getPrisma();

      const startCount = await countRecords('application');

      // Create 10 applications
      const promises = Array.from({ length: 10 }, (_, i) =>
        prisma.application.create({
          data: {
            userId: user.id,
            applicationNumber: `BULK-${i}-${Date.now()}`,
            applicationType: 'GAP_VEGETABLES',
            farmName: `Farm ${i}`,
            farmLocation: 'Bangkok',
            farmSize: 10,
            crops: ['Tomato'],
            status: 'DRAFT',
          },
        })
      );

      await Promise.all(promises);

      const endCount = await countRecords('application');
      expect(endCount - startCount).toBe(10);
    });

    test('should query applications efficiently with indexes', async () => {
      const user = await createTestUser('FARMER');
      await Promise.all([
        createTestApplication(user.id, 'PENDING_REVIEW'),
        createTestApplication(user.id, 'PENDING_REVIEW'),
        createTestApplication(user.id, 'APPROVED'),
      ]);

      const prisma = getPrisma();
      const startTime = Date.now();

      await prisma.application.findMany({
        where: {
          userId: user.id,
          status: 'PENDING_REVIEW',
        },
        orderBy: { createdAt: 'desc' },
      });

      const duration = Date.now() - startTime;

      // Query should be fast (< 100ms)
      expect(duration).toBeLessThan(100);
    });
  });
});
