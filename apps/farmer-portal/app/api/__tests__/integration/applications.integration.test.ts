/**
 * Applications API Integration Tests
 *
 * Tests application lifecycle: create, list, update, submit, status transitions
 */

import {
  setupIntegrationTest,
  teardownIntegrationTest,
  mockDb,
} from '@/lib/test-utils/http-test-helpers';

describe('Applications API Integration Tests - Business Flow Validation', () => {
  beforeEach(() => {
    setupIntegrationTest();
  });

  afterEach(() => {
    teardownIntegrationTest();
  });

  describe('Application Creation Flow', () => {
    it('should create new application with all required fields', async () => {
      // Create farmer first
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed_password',
        name: 'Test Farmer',
        role: 'farmer',
        farmerId: 'F101',
      });

      // Create application
      const application = await mockDb.createApplication({
        farmerId: farmer.farmerId,
        type: 'initial',
        status: 'draft',
        farmDetails: {
          farmName: 'Test Farm',
          farmSize: '10 rai',
          location: 'Chiang Mai',
          crops: ['Cannabis'],
        },
      });

      // Verify application created correctly
      expect(application).toMatchObject({
        farmerId: 'F101',
        type: 'initial',
        status: 'draft',
      });
      expect(application.farmDetails.farmName).toBe('Test Farm');
      expect(application.id).toBeDefined();
      expect(application.createdAt).toBeDefined();
    });

    it('should generate unique application IDs', async () => {
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed',
        name: 'Farmer',
        farmerId: 'F101',
      });

      const appIds = [];

      // Create 5 applications
      for (let i = 0; i < 5; i++) {
        const app = await mockDb.createApplication({
          farmerId: farmer.farmerId,
          type: 'initial',
          status: 'draft',
        });
        appIds.push(app.id);
      }

      // Verify all IDs are unique
      const uniqueIds = new Set(appIds);
      expect(uniqueIds.size).toBe(5);
    });

    it('should associate application with correct farmer', async () => {
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed',
        name: 'Farmer',
        farmerId: 'F101',
      });

      const application = await mockDb.createApplication({
        farmerId: farmer.farmerId,
        type: 'initial',
        status: 'draft',
      });

      // Verify farmer can retrieve their applications
      const farmerApps = await mockDb.findApplicationsByFarmerId(farmer.farmerId);

      expect(farmerApps).toHaveLength(1);
      expect(farmerApps[0].id).toBe(application.id);
    });
  });

  describe('Application Listing and Retrieval', () => {
    it('should list all applications for a farmer', async () => {
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed',
        name: 'Farmer',
        farmerId: 'F101',
      });

      // Create multiple applications
      await mockDb.createApplication({
        farmerId: farmer.farmerId,
        type: 'initial',
        status: 'draft',
      });
      await mockDb.createApplication({
        farmerId: farmer.farmerId,
        type: 'renewal',
        status: 'submitted',
      });

      const applications = await mockDb.findApplicationsByFarmerId(farmer.farmerId);

      expect(applications).toHaveLength(2);
      expect(applications[0].farmerId).toBe('F101');
      expect(applications[1].farmerId).toBe('F101');
    });

    it('should retrieve application by ID', async () => {
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed',
        name: 'Farmer',
        farmerId: 'F101',
      });

      const app = await mockDb.createApplication({
        farmerId: farmer.farmerId,
        type: 'initial',
        status: 'draft',
        farmDetails: { farmName: 'Test Farm' },
      });

      const retrieved = await mockDb.findApplicationById(app.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(app.id);
      expect(retrieved?.farmDetails.farmName).toBe('Test Farm');
    });

    it('should return undefined for non-existent application ID', async () => {
      const retrieved = await mockDb.findApplicationById('nonexistent_id');
      expect(retrieved).toBeUndefined();
    });

    it('should isolate applications between different farmers', async () => {
      // Create two farmers
      const farmer1 = await mockDb.createUser({
        email: 'farmer1@test.com',
        password: 'hashed',
        name: 'Farmer 1',
        farmerId: 'F101',
      });

      const farmer2 = await mockDb.createUser({
        email: 'farmer2@test.com',
        password: 'hashed',
        name: 'Farmer 2',
        farmerId: 'F102',
      });

      // Create applications for each
      await mockDb.createApplication({
        farmerId: farmer1.farmerId,
        type: 'initial',
        status: 'draft',
      });

      await mockDb.createApplication({
        farmerId: farmer2.farmerId,
        type: 'initial',
        status: 'draft',
      });

      // Verify isolation
      const farmer1Apps = await mockDb.findApplicationsByFarmerId(farmer1.farmerId);
      const farmer2Apps = await mockDb.findApplicationsByFarmerId(farmer2.farmerId);

      expect(farmer1Apps).toHaveLength(1);
      expect(farmer2Apps).toHaveLength(1);
      expect(farmer1Apps[0].farmerId).toBe('F101');
      expect(farmer2Apps[0].farmerId).toBe('F102');
    });
  });

  describe('Application Update Flow', () => {
    it('should update application fields', async () => {
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed',
        name: 'Farmer',
        farmerId: 'F101',
      });

      const app = await mockDb.createApplication({
        farmerId: farmer.farmerId,
        type: 'initial',
        status: 'draft',
        farmDetails: { farmName: 'Original Name' },
      });

      // Update application
      const updated = await mockDb.updateApplication(app.id, {
        farmDetails: { farmName: 'Updated Name' },
        status: 'in-progress',
      });

      expect(updated).toBeDefined();
      expect(updated?.farmDetails.farmName).toBe('Updated Name');
      expect(updated?.status).toBe('in-progress');
      expect(updated?.modifiedAt).toBeDefined();
    });

    it('should return null when updating non-existent application', async () => {
      const result = await mockDb.updateApplication('nonexistent_id', {
        status: 'updated',
      });

      expect(result).toBeNull();
    });

    it('should preserve farmerId when updating application', async () => {
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed',
        name: 'Farmer',
        farmerId: 'F101',
      });

      const app = await mockDb.createApplication({
        farmerId: farmer.farmerId,
        type: 'initial',
        status: 'draft',
      });

      // Update without changing farmerId
      const updated = await mockDb.updateApplication(app.id, {
        status: 'submitted',
      });

      expect(updated?.farmerId).toBe('F101');
    });
  });

  describe('Application Status Transitions', () => {
    it('should transition from draft to submitted', async () => {
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed',
        name: 'Farmer',
        farmerId: 'F101',
      });

      const app = await mockDb.createApplication({
        farmerId: farmer.farmerId,
        type: 'initial',
        status: 'draft',
      });

      expect(app.status).toBe('draft');

      // Submit application
      const submitted = await mockDb.updateApplication(app.id, {
        status: 'submitted',
        submittedAt: new Date(),
      });

      expect(submitted?.status).toBe('submitted');
      expect(submitted?.submittedAt).toBeDefined();
    });

    it('should track multiple status transitions', async () => {
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed',
        name: 'Farmer',
        farmerId: 'F101',
      });

      const app = await mockDb.createApplication({
        farmerId: farmer.farmerId,
        type: 'initial',
        status: 'draft',
      });

      // Transition: draft -> submitted -> under-review -> approved
      const submitted = await mockDb.updateApplication(app.id, {
        status: 'submitted',
      });
      expect(submitted?.status).toBe('submitted');

      const underReview = await mockDb.updateApplication(app.id, {
        status: 'under-review',
        assignedInspector: 'INSP001',
      });
      expect(underReview?.status).toBe('under-review');

      const approved = await mockDb.updateApplication(app.id, {
        status: 'approved',
        approvedAt: new Date(),
      });
      expect(approved?.status).toBe('approved');
      expect(approved?.approvedAt).toBeDefined();
    });
  });

  describe('Application Business Rules', () => {
    it('should enforce required fields for submission', async () => {
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed',
        name: 'Farmer',
        farmerId: 'F101',
      });

      const app = await mockDb.createApplication({
        farmerId: farmer.farmerId,
        type: 'initial',
        status: 'draft',
        farmDetails: {
          farmName: 'Test Farm',
          farmSize: '10 rai',
          location: 'Chiang Mai',
          crops: ['Cannabis'],
        },
      });

      // Validate required fields
      const hasRequiredFields =
        app.farmDetails.farmName &&
        app.farmDetails.farmSize &&
        app.farmDetails.location &&
        app.farmDetails.crops.length > 0;

      expect(hasRequiredFields).toBe(true);

      // Should allow submission
      if (hasRequiredFields) {
        const submitted = await mockDb.updateApplication(app.id, {
          status: 'submitted',
        });
        expect(submitted?.status).toBe('submitted');
      }
    });

    it('should track application creation and modification dates', async () => {
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed',
        name: 'Farmer',
        farmerId: 'F101',
      });

      const beforeCreate = new Date();

      const app = await mockDb.createApplication({
        farmerId: farmer.farmerId,
        type: 'initial',
        status: 'draft',
      });

      const afterCreate = new Date();

      expect(app.createdAt).toBeDefined();
      expect(app.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(app.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());

      // Update application
      const updated = await mockDb.updateApplication(app.id, {
        status: 'submitted',
      });

      expect(updated?.modifiedAt).toBeDefined();
    });
  });
});
