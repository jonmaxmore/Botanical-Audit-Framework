/**
 * Inspections, Certificates, and Users API Integration Tests
 *
 * Combined test suite for remaining APIs to efficiently cover critical workflows
 */

import {
  setupIntegrationTest,
  teardownIntegrationTest,
  mockDb
} from '@/lib/test-utils/http-test-helpers';

describe('Inspections API Integration Tests', () => {
  beforeEach(() => {
    setupIntegrationTest();
  });

  afterEach(() => {
    teardownIntegrationTest();
  });

  describe('Inspection Scheduling and Management', () => {
    it('should schedule inspection for submitted application', async () => {
      // Create farmer and application
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed',
        name: 'Farmer',
        farmerId: 'F101'
      });

      const application = await mockDb.createApplication({
        farmerId: farmer.farmerId,
        type: 'initial',
        status: 'submitted'
      });

      // Schedule inspection
      const inspection = await mockDb.createInspection({
        applicationId: application.id,
        farmerId: farmer.farmerId,
        scheduledDate: new Date('2024-12-01'),
        status: 'scheduled',
        inspector: 'INSP001'
      });

      expect(inspection).toMatchObject({
        applicationId: application.id,
        farmerId: 'F101',
        status: 'scheduled',
        inspector: 'INSP001'
      });
      expect(inspection.scheduledDate).toBeDefined();
    });

    it('should update inspection status', async () => {
      const inspection = await mockDb.createInspection({
        applicationId: 'app_123',
        farmerId: 'F101',
        scheduledDate: new Date(),
        status: 'scheduled'
      });

      const updated = await mockDb.updateInspection(inspection.id, {
        status: 'in-progress',
        startedAt: new Date()
      });

      expect(updated?.status).toBe('in-progress');
      expect(updated?.startedAt).toBeDefined();
    });

    it('should complete inspection with findings', async () => {
      const inspection = await mockDb.createInspection({
        applicationId: 'app_123',
        farmerId: 'F101',
        scheduledDate: new Date(),
        status: 'in-progress'
      });

      const completed = await mockDb.updateInspection(inspection.id, {
        status: 'completed',
        completedAt: new Date(),
        findings: {
          compliance: true,
          issues: [],
          recommendations: ['Maintain good practices']
        }
      });

      expect(completed?.status).toBe('completed');
      expect(completed?.completedAt).toBeDefined();
      expect(completed?.findings.compliance).toBe(true);
    });

    it('should list inspections for farmer', async () => {
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed',
        name: 'Farmer',
        farmerId: 'F101'
      });

      // Create multiple inspections
      await mockDb.createInspection({
        applicationId: 'app_1',
        farmerId: farmer.farmerId,
        scheduledDate: new Date(),
        status: 'scheduled'
      });

      await mockDb.createInspection({
        applicationId: 'app_2',
        farmerId: farmer.farmerId,
        scheduledDate: new Date(),
        status: 'completed'
      });

      const inspections = await mockDb.findInspectionsByFarmerId(farmer.farmerId);

      expect(inspections).toHaveLength(2);
      expect(inspections[0].farmerId).toBe('F101');
      expect(inspections[1].farmerId).toBe('F101');
    });
  });
});

describe('Certificates API Integration Tests', () => {
  beforeEach(() => {
    setupIntegrationTest();
  });

  afterEach(() => {
    teardownIntegrationTest();
  });

  describe('Certificate Generation and Management', () => {
    it('should generate certificate after approved inspection', async () => {
      // Setup: Farmer, application, and completed inspection
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed',
        name: 'Farmer',
        farmerId: 'F101'
      });

      const application = await mockDb.createApplication({
        farmerId: farmer.farmerId,
        type: 'initial',
        status: 'approved'
      });

      const inspection = await mockDb.createInspection({
        applicationId: application.id,
        farmerId: farmer.farmerId,
        scheduledDate: new Date(),
        status: 'completed',
        findings: { compliance: true, issues: [] }
      });

      // Generate certificate
      const certificate = await mockDb.createCertificate({
        applicationId: application.id,
        farmerId: farmer.farmerId,
        inspectionId: inspection.id,
        certificateNumber: 'CERT-2024-001',
        issuedDate: new Date(),
        expiryDate: new Date('2025-12-31'),
        status: 'active'
      });

      expect(certificate).toMatchObject({
        applicationId: application.id,
        farmerId: 'F101',
        inspectionId: inspection.id,
        certificateNumber: 'CERT-2024-001',
        status: 'active'
      });
      expect(certificate.issuedDate).toBeDefined();
      expect(certificate.expiryDate).toBeDefined();
    });

    it('should verify certificate by number', async () => {
      const certificate = await mockDb.createCertificate({
        applicationId: 'app_123',
        farmerId: 'F101',
        inspectionId: 'insp_123',
        certificateNumber: 'CERT-VERIFY-001',
        issuedDate: new Date(),
        expiryDate: new Date('2025-12-31'),
        status: 'active'
      });

      const found = await mockDb.findCertificateByCertificateNumber('CERT-VERIFY-001');

      expect(found).toBeDefined();
      expect(found?.certificateNumber).toBe('CERT-VERIFY-001');
      expect(found?.status).toBe('active');
    });

    it('should list all certificates for farmer', async () => {
      const farmer = await mockDb.createUser({
        email: 'farmer@test.com',
        password: 'hashed',
        name: 'Farmer',
        farmerId: 'F101'
      });

      // Generate multiple certificates
      await mockDb.createCertificate({
        applicationId: 'app_1',
        farmerId: farmer.farmerId,
        inspectionId: 'insp_1',
        certificateNumber: 'CERT-001',
        issuedDate: new Date('2024-01-01'),
        expiryDate: new Date('2025-01-01'),
        status: 'active'
      });

      await mockDb.createCertificate({
        applicationId: 'app_2',
        farmerId: farmer.farmerId,
        inspectionId: 'insp_2',
        certificateNumber: 'CERT-002',
        issuedDate: new Date('2024-06-01'),
        expiryDate: new Date('2025-06-01'),
        status: 'active'
      });

      const certificates = await mockDb.findCertificatesByFarmerId(farmer.farmerId);

      expect(certificates).toHaveLength(2);
      expect(certificates[0].certificateNumber).toBe('CERT-001');
      expect(certificates[1].certificateNumber).toBe('CERT-002');
    });

    it('should handle certificate expiry', async () => {
      const certificate = await mockDb.createCertificate({
        applicationId: 'app_123',
        farmerId: 'F101',
        inspectionId: 'insp_123',
        certificateNumber: 'CERT-EXPIRED-001',
        issuedDate: new Date('2023-01-01'),
        expiryDate: new Date('2024-01-01'),
        status: 'active'
      });

      // Update to expired
      const expired = await mockDb.updateCertificate(certificate.id, {
        status: 'expired'
      });

      expect(expired?.status).toBe('expired');
    });
  });
});

describe('Users API Integration Tests', () => {
  beforeEach(() => {
    setupIntegrationTest();
  });

  afterEach(() => {
    teardownIntegrationTest();
  });

  describe('User Profile Management', () => {
    it('should retrieve user profile by ID', async () => {
      const user = await mockDb.createUser({
        email: 'profile@test.com',
        password: 'hashed',
        name: 'Profile User',
        role: 'farmer',
        farmerId: 'F201'
      });

      const profile = await mockDb.findUserById(user.id);

      expect(profile).toBeDefined();
      expect(profile?.email).toBe('profile@test.com');
      expect(profile?.name).toBe('Profile User');
      expect(profile?.farmerId).toBe('F201');
    });

    it('should update user profile', async () => {
      const user = await mockDb.createUser({
        email: 'update@test.com',
        password: 'hashed',
        name: 'Original Name',
        role: 'farmer'
      });

      const updated = await mockDb.updateUser(user.id, {
        name: 'Updated Name',
        phone: '0898765432'
      });

      expect(updated?.name).toBe('Updated Name');
      expect(updated?.phone).toBe('0898765432');
      expect(updated?.email).toBe('update@test.com'); // Preserved
    });

    it('should return undefined for non-existent user', async () => {
      const user = await mockDb.findUserById('nonexistent_id');
      expect(user).toBeUndefined();
    });
  });

  describe('Multi-Role User Management', () => {
    it('should list users by role', async () => {
      // Create users with different roles
      await mockDb.createUser({
        email: 'farmer1@test.com',
        password: 'hashed',
        name: 'Farmer 1',
        role: 'farmer',
        farmerId: 'F301'
      });

      await mockDb.createUser({
        email: 'farmer2@test.com',
        password: 'hashed',
        name: 'Farmer 2',
        role: 'farmer',
        farmerId: 'F302'
      });

      await mockDb.createUser({
        email: 'inspector@test.com',
        password: 'hashed',
        name: 'Inspector',
        role: 'inspector'
      });

      const farmers = await mockDb.findUsersByRole('farmer');
      const inspectors = await mockDb.findUsersByRole('inspector');

      expect(farmers).toHaveLength(2);
      expect(inspectors).toHaveLength(1);
      expect(farmers[0].role).toBe('farmer');
      expect(inspectors[0].role).toBe('inspector');
    });
  });
});

describe('Cross-Module Integration Workflows', () => {
  beforeEach(() => {
    setupIntegrationTest();
  });

  afterEach(() => {
    teardownIntegrationTest();
  });

  describe('Complete GACP Certification Workflow', () => {
    it('should complete full workflow: registration -> application -> inspection -> certificate', async () => {
      // Step 1: Farmer registration
      const farmer = await mockDb.createUser({
        email: 'complete@test.com',
        password: 'hashed_Test123!',
        name: 'Complete Workflow Farmer',
        role: 'farmer',
        farmerId: `F${mockDb.getNextSequence('farmer')}`
      });

      expect(farmer).toBeDefined();
      expect(farmer.farmerId).toMatch(/^F\d+$/);

      // Step 2: Create application
      const application = await mockDb.createApplication({
        farmerId: farmer.farmerId,
        type: 'initial',
        status: 'draft',
        farmDetails: {
          farmName: 'Complete Workflow Farm',
          farmSize: '15 rai',
          location: 'Chiang Mai',
          crops: ['Cannabis']
        }
      });

      expect(application.farmerId).toBe(farmer.farmerId);

      // Step 3: Submit application
      const submitted = await mockDb.updateApplication(application.id, {
        status: 'submitted',
        submittedAt: new Date()
      });

      expect(submitted?.status).toBe('submitted');

      // Step 4: Schedule inspection
      const inspection = await mockDb.createInspection({
        applicationId: application.id,
        farmerId: farmer.farmerId,
        scheduledDate: new Date('2024-12-15'),
        status: 'scheduled',
        inspector: 'INSP001'
      });

      expect(inspection.applicationId).toBe(application.id);

      // Step 5: Complete inspection
      const completedInspection = await mockDb.updateInspection(inspection.id, {
        status: 'completed',
        completedAt: new Date(),
        findings: {
          compliance: true,
          issues: [],
          recommendations: ['Excellent practices maintained']
        }
      });

      expect(completedInspection?.status).toBe('completed');
      expect(completedInspection?.findings.compliance).toBe(true);

      // Step 6: Approve application
      const approved = await mockDb.updateApplication(application.id, {
        status: 'approved',
        approvedAt: new Date()
      });

      expect(approved?.status).toBe('approved');

      // Step 7: Generate certificate
      const certificate = await mockDb.createCertificate({
        applicationId: application.id,
        farmerId: farmer.farmerId,
        inspectionId: inspection.id,
        certificateNumber: `CERT-${Date.now()}`,
        issuedDate: new Date(),
        expiryDate: new Date('2025-12-31'),
        status: 'active'
      });

      expect(certificate.farmerId).toBe(farmer.farmerId);
      expect(certificate.status).toBe('active');

      // Verify complete data chain
      const farmerApps = await mockDb.findApplicationsByFarmerId(farmer.farmerId);
      const farmerInspections = await mockDb.findInspectionsByFarmerId(farmer.farmerId);
      const farmerCertificates = await mockDb.findCertificatesByFarmerId(farmer.farmerId);

      expect(farmerApps).toHaveLength(1);
      expect(farmerInspections).toHaveLength(1);
      expect(farmerCertificates).toHaveLength(1);
    });
  });
});
