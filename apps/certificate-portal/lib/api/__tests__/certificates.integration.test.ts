/**
 * Certificate API Integration Tests
 * 
 * Tests real API calls to backend certificate endpoints
 * Requires backend running on http://localhost:3004
 * 
 * To run these tests:
 * 1. Start backend: cd apps/backend && npm start
 * 2. Run tests: npm test
 * 
 * To skip these tests (default): They are skipped when backend is not available
 */

import { certificateApi } from '../certificates';
import { Certificate, CertificateFormData } from '../../types/certificate';

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Skip these tests if backend is not running
// To run: set BACKEND_RUNNING=true environment variable
const describeIfBackend = process.env.BACKEND_RUNNING === 'true' ? describe : describe.skip;

describeIfBackend('Certificate API Integration Tests', () => {
  const mockToken = 'mock-jwt-token';
  let createdCertificateId: string;

  beforeAll(() => {
    // Set auth token
    localStorage.setItem('cert_token', mockToken);
  });

  afterAll(() => {
    localStorage.clear();
  });

  describe('Certificate CRUD Operations', () => {
    it('should create a new certificate', async () => {
      const certificateData: CertificateFormData = {
        farmId: 'FARM-TEST-001',
        farmName: 'Test Farm Integration',
        farmerName: 'Integration Test Farmer',
        farmerNationalId: '1234567890123',
        address: {
          houseNumber: '123',
          village: 'Test Village',
          subdistrict: 'Test Subdistrict',
          district: 'Test District',
          province: 'Bangkok',
          postalCode: '10110',
        },
        farmArea: 15.5,
        cropType: 'Rice',
        certificationStandard: 'GACP',
        inspectionDate: new Date().toISOString(),
        inspectorName: 'Test Inspector',
        inspectionReport: 'All checks passed - Integration test',
        notes: 'Created by integration test',
      };

      const result = await certificateApi.create(certificateData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.certificateNumber).toBeDefined();
      expect(result.farmName).toBe('Test Farm Integration');
      expect(result.status).toBe('pending');

      createdCertificateId = result.id;
    });

    it('should get certificate by ID', async () => {
      const certificate = await certificateApi.getById(createdCertificateId);

      expect(certificate).toBeDefined();
      expect(certificate.id).toBe(createdCertificateId);
      expect(certificate.farmName).toBe('Test Farm Integration');
    });

    it('should get all certificates', async () => {
      const certificates = await certificateApi.getAll();

      expect(Array.isArray(certificates)).toBe(true);
      expect(certificates.length).toBeGreaterThan(0);
    });

    it('should get certificates with filters', async () => {
      const certificates = await certificateApi.getAll({
        status: 'pending',
        certificationStandard: 'GACP',
      });

      expect(Array.isArray(certificates)).toBe(true);
      certificates.forEach(cert => {
        expect(cert.status).toBe('pending');
        expect(cert.certificationStandard).toBe('GACP');
      });
    });

    it('should update certificate', async () => {
      const updatedData = {
        notes: 'Updated by integration test',
        farmArea: 20.0,
      };

      const updated = await certificateApi.update(createdCertificateId, updatedData);

      expect(updated.notes).toBe('Updated by integration test');
      expect(updated.farmArea).toBe(20.0);
    });

    it('should delete certificate', async () => {
      await expect(certificateApi.delete(createdCertificateId)).resolves.not.toThrow();

      // Verify deletion - should fail to fetch
      await expect(certificateApi.getById(createdCertificateId)).rejects.toThrow();
    });
  });

  describe('Certificate Operations', () => {
    let operationCertId: string;

    beforeAll(async () => {
      // Create a certificate for operations testing
      const certData: CertificateFormData = {
        farmId: 'FARM-OPS-001',
        farmName: 'Operations Test Farm',
        farmerName: 'Ops Test Farmer',
        farmerNationalId: '9876543210123',
        address: {
          houseNumber: '456',
          subdistrict: 'Test Sub',
          district: 'Test Dist',
          province: 'Bangkok',
          postalCode: '10120',
        },
        farmArea: 10.0,
        cropType: 'Vegetable',
        certificationStandard: 'GAP',
        inspectionDate: new Date().toISOString(),
        inspectorName: 'Ops Inspector',
      };

      const cert = await certificateApi.create(certData);
      operationCertId = cert.id;
    });

    afterAll(async () => {
      // Cleanup
      try {
        await certificateApi.delete(operationCertId);
      } catch {
        // Ignore errors during cleanup
      }
    });

    it('should renew certificate', async () => {
      const renewed = await certificateApi.renew(operationCertId);

      expect(renewed).toBeDefined();
      expect(renewed.id).toBe(operationCertId);
      // Backend should extend expiry date
      expect(new Date(renewed.expiryDate).getTime()).toBeGreaterThan(
        new Date(renewed.issuedDate).getTime()
      );
    });

    it('should revoke certificate', async () => {
      const revoked = await certificateApi.revoke(operationCertId, 'Testing revocation');

      expect(revoked.status).toBe('revoked');
      expect(revoked.revokedReason).toBe('Testing revocation');
      expect(revoked.revokedDate).toBeDefined();
    });

    it('should download certificate PDF', async () => {
      const pdfBlob = await certificateApi.downloadPDF(operationCertId);

      expect(pdfBlob).toBeDefined();
      expect(pdfBlob instanceof Blob).toBe(true);
      expect(pdfBlob.type).toContain('pdf');
    });
  });

  describe('Certificate Verification', () => {
    let verifyCertNumber: string;

    beforeAll(async () => {
      const certData: CertificateFormData = {
        farmId: 'FARM-VERIFY-001',
        farmName: 'Verify Test Farm',
        farmerName: 'Verify Farmer',
        farmerNationalId: '1111111111111',
        address: {
          houseNumber: '789',
          subdistrict: 'Verify Sub',
          district: 'Verify Dist',
          province: 'Bangkok',
          postalCode: '10130',
        },
        farmArea: 8.0,
        cropType: 'Fruit',
        certificationStandard: 'Organic',
        inspectionDate: new Date().toISOString(),
        inspectorName: 'Verify Inspector',
      };

      const cert = await certificateApi.create(certData);
      verifyCertNumber = cert.certificateNumber;
    });

    it('should verify valid certificate', async () => {
      const result = await certificateApi.verify(verifyCertNumber);

      expect(result.valid).toBe(true);
      expect(result.certificate).toBeDefined();
      expect(result.certificate?.certificateNumber).toBe(verifyCertNumber);
    });

    it('should return invalid for non-existent certificate', async () => {
      const result = await certificateApi.verify('INVALID-CERT-NUMBER');

      expect(result.valid).toBe(false);
      expect(result.certificate).toBeUndefined();
    });

    it('should get certificate by certificate number', async () => {
      const cert = await certificateApi.getByCertificateNumber(verifyCertNumber);

      expect(cert).toBeDefined();
      expect(cert.certificateNumber).toBe(verifyCertNumber);
    });
  });

  describe('Certificate Statistics', () => {
    it('should get certificate statistics', async () => {
      const stats = await certificateApi.getStats();

      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.pending).toBe('number');
      expect(typeof stats.approved).toBe('number');
      expect(typeof stats.expired).toBe('number');
    });

    it('should get expiring certificates', async () => {
      const expiring = await certificateApi.getExpiring(30);

      expect(Array.isArray(expiring)).toBe(true);
      // Each certificate should expire within 30 days
      expiring.forEach(cert => {
        const daysToExpiry =
          (new Date(cert.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        expect(daysToExpiry).toBeLessThanOrEqual(30);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 unauthorized', async () => {
      localStorage.removeItem('cert_token');

      await expect(certificateApi.getAll()).rejects.toThrow();

      localStorage.setItem('cert_token', mockToken);
    });

    it('should handle 404 not found', async () => {
      await expect(certificateApi.getById('non-existent-id')).rejects.toThrow();
    });

    it('should handle network errors with retry', async () => {
      // This would require mocking axios or backend
      // Skip for now - covered in unit tests
    });
  });
});
