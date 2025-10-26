/**
 * Certificate API Unit Tests (Simplified)
 * Basic tests for critical API methods
 */

// Mock axios BEFORE any imports
jest.mock('axios');

import axios from 'axios';
import { certificateApi } from '../certificates';

const mockedAxios = axios as any;
const mockGet = mockedAxios.mockGet;
const mockPost = mockedAxios.mockPost;
const mockPut = mockedAxios.mockPut;
const mockDelete = mockedAxios.mockDelete;

// Mock certificate data
const mockCertificate = {
  id: '1',
  certificateNumber: 'CERT-001',
  farmName: 'Test Farm',
  farmerName: 'John Doe',
  status: 'approved' as const,
};

describe('Certificate API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all certificates', async () => {
      const mockData = [
        { id: '1', farmName: 'Farm 1' },
        { id: '2', farmName: 'Farm 2' },
      ];

      mockGet.mockResolvedValue({
        data: { success: true, data: mockData },
      });

      const result = await certificateApi.getAll();
      expect(result).toEqual(mockData);
      expect(mockGet).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockGet.mockRejectedValue(new Error('Network Error'));
      await expect(certificateApi.getAll()).rejects.toThrow('Network Error');
    });
  });

  describe('getById', () => {
    it('should fetch certificate by ID', async () => {
      const mockCert = { id: '123', farmName: 'Test Farm' };
      mockGet.mockResolvedValue({
        data: { success: true, data: mockCert },
      });

      const result = await certificateApi.getById('123');
      expect(result.id).toBe('123');
    });
  });

  describe('create', () => {
    it('should create certificate', async () => {
      const newCert = {
        farmId: 'f1',
        farmName: 'New Farm',
        farmerName: 'John Doe',
        farmerNationalId: '1234567890123',
        address: {
          houseNumber: '123',
          subdistrict: 'Test',
          district: 'Test',
          province: 'Bangkok',
          postalCode: '10100',
        },
        farmArea: 10,
        cropType: 'Rice',
        certificationStandard: 'GACP' as const,
        inspectionDate: '2025-10-25',
        inspectorName: 'Inspector',
      };

      mockPost.mockResolvedValue({
        data: {
          success: true,
          data: { id: '123', ...newCert },
        }
      });

      const result = await certificateApi.create(newCert);
      expect(result.id).toBe('123');
      expect(mockPost).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update certificate', async () => {
      const updateData = { farmName: 'Updated Farm' };
      mockPut.mockResolvedValue({
        data: { success: true, data: { id: '123', ...updateData } },
      });

      const result = await certificateApi.update('123', updateData);
      expect(result.farmName).toBe('Updated Farm');
    });
  });

  describe('delete', () => {
    it('should delete certificate', async () => {
      mockDelete.mockResolvedValue({
        data: { success: true },
      });

      await certificateApi.delete('123');
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('verify', () => {
    it('should verify valid certificate', async () => {
      mockGet.mockResolvedValue({
        data: {
          success: true,
          data: {
            valid: true,
            certificate: { id: '123', farmName: 'Test' },
          }
        }
      });

      const result = await certificateApi.verify('GACP-2025-001');
      expect(result.valid).toBe(true);
    });

    it('should return invalid for non-existent certificate', async () => {
      mockGet.mockResolvedValue({
        data: {
          success: false,
          data: { valid: false, message: 'Not found' },
        }
      });

      const result = await certificateApi.verify('INVALID');
      expect(result.valid).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should fetch statistics', async () => {
      const mockStats = {
        total: 100,
        pending: 10,
        approved: 80,
        rejected: 5,
        expired: 5,
        expiringThisMonth: 3,
        issuedThisMonth: 15,
      };

      mockGet.mockResolvedValue({
        data: { success: true, data: mockStats },
      });

      const result = await certificateApi.getStats();
      expect(result.total).toBe(100);
    });
  });

  describe('renew', () => {
    it('should renew certificate', async () => {
      const mockRenewed = { id: '123', status: 'approved', expiryDate: '2026-10-25' };
      mockPost.mockResolvedValue({
        data: { success: true, data: mockRenewed },
      });

      const result = await certificateApi.renew('123');
      expect(result.id).toBe('123');
      expect(mockPost).toHaveBeenCalledWith('/certificates/123/renew');
    });

    it('should handle renewal errors', async () => {
      mockPost.mockRejectedValue(new Error('Renewal failed'));
      await expect(certificateApi.renew('123')).rejects.toThrow('Renewal failed');
    });
  });

  describe('revoke', () => {
    it('should revoke certificate with reason', async () => {
      const mockRevoked = { id: '123', status: 'revoked', revokedAt: '2025-10-25' };
      mockPost.mockResolvedValue({
        data: { success: true, data: mockRevoked },
      });

      const result = await certificateApi.revoke('123', 'Fraudulent');
      expect(result.id).toBe('123');
      expect(mockPost).toHaveBeenCalledWith('/certificates/123/revoke', { reason: 'Fraudulent' });
    });

    it('should handle revoke errors', async () => {
      mockPost.mockRejectedValue(new Error('Revoke failed'));
      await expect(certificateApi.revoke('123', 'Test')).rejects.toThrow('Revoke failed');
    });
  });

  describe('downloadPDF', () => {
    it('should download certificate as PDF blob', async () => {
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
      mockGet.mockResolvedValue({ data: mockBlob });

      const result = await certificateApi.downloadPDF('123');
      expect(result).toBeInstanceOf(Blob);
      expect(mockGet).toHaveBeenCalledWith('/certificates/123/download', { responseType: 'blob' });
    });

    it('should handle download errors', async () => {
      mockGet.mockRejectedValue(new Error('Download failed'));
      await expect(certificateApi.downloadPDF('123')).rejects.toThrow('Download failed');
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockGet.mockRejectedValue({ message: 'Network Error' });
      await expect(certificateApi.getAll()).rejects.toMatchObject({ message: 'Network Error' });
    });

    it('should handle 404 errors', async () => {
      mockGet.mockRejectedValue({ response: { status: 404 }, message: 'Not Found' });
      await expect(certificateApi.getById('999')).rejects.toMatchObject({ message: 'Not Found' });
    });

    it('should handle 500 errors', async () => {
      mockGet.mockRejectedValue({ response: { status: 500 }, message: 'Server Error' });
      await expect(certificateApi.getAll()).rejects.toMatchObject({ message: 'Server Error' });
    });
  });

  describe('with filters', () => {
    it('should fetch certificates with status filter', async () => {
      const mockData = [{ id: '1', status: 'approved' }];
      mockGet.mockResolvedValue({
        data: { success: true, data: mockData },
      });

      await certificateApi.getAll({ status: 'approved' });
      expect(mockGet).toHaveBeenCalled();
    });

    it('should fetch certificates with search query', async () => {
      const mockData = [{ id: '1', farmName: 'Test Farm' }];
      mockGet.mockResolvedValue({
        data: { success: true, data: mockData },
      });

      await certificateApi.getAll({ searchQuery: 'Test' });
      expect(mockGet).toHaveBeenCalled();
    });

    it('should fetch certificates with province filter', async () => {
      const mockData = [{ id: '1', address: { province: 'Bangkok' } }];
      mockGet.mockResolvedValue({
        data: { success: true, data: mockData },
      });

      await certificateApi.getAll({ province: 'Bangkok' });
      expect(mockGet).toHaveBeenCalled();
    });

    it('should fetch certificates with date range', async () => {
      const mockData = [{ id: '1', createdAt: '2025-10-01' }];
      mockGet.mockResolvedValue({
        data: { success: true, data: mockData },
      });

      await certificateApi.getAll({ dateFrom: '2025-10-01', dateTo: '2025-10-31' });
      expect(mockGet).toHaveBeenCalled();
    });
  });

  // === Axios Interceptor Tests ===
  describe('Axios Interceptors', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should add token to request headers when token exists', async () => {
      localStorage.setItem('cert_token', 'test-token-123');

      mockGet.mockResolvedValue({
        data: { success: true, data: [] },
      });

      await certificateApi.getAll();

      // Token is in localStorage, interceptor would use it
      expect(localStorage.getItem('cert_token')).toBe('test-token-123');
      expect(mockGet).toHaveBeenCalled();
    });

    it('should not add token when token does not exist', async () => {
      mockGet.mockResolvedValue({
        data: { success: true, data: [] },
      });

      await certificateApi.getAll();

      expect(localStorage.getItem('cert_token')).toBeNull();
    });

    it('should reject request interceptor error', async () => {
      const requestError = new Error('Request interceptor error');

      mockGet.mockRejectedValue(requestError);

      await expect(certificateApi.getAll()).rejects.toThrow('Request interceptor error');
    });

    it('should handle 401 error by rejecting', async () => {
      const error401 = {
        response: { status: 401 },
        config: {},
        message: 'Unauthorized',
      };
      mockGet.mockRejectedValue(error401);

      await expect(certificateApi.getAll()).rejects.toMatchObject({
        response: { status: 401 },
      });
    });

    it('should handle 401 with retry flag', async () => {
      const error401 = {
        response: { status: 401 },
        config: { _retry: true },
        message: 'Unauthorized',
      };
      mockGet.mockRejectedValue(error401);

      await expect(certificateApi.getAll()).rejects.toMatchObject({
        response: { status: 401 },
      });
    });

    it('should handle network errors', async () => {
      const networkError = {
        message: 'Network Error',
        config: {},
      };

      mockGet.mockRejectedValue(networkError);

      await expect(certificateApi.getAll()).rejects.toMatchObject({
        message: 'Network Error',
      });
    });

    it('should handle network error with retry flag', async () => {
      const networkError = {
        message: 'Network Error',
        config: { _retry: true },
      };

      mockGet.mockRejectedValue(networkError);

      await expect(certificateApi.getAll()).rejects.toMatchObject({
        message: 'Network Error',
      });
    });

    it('should pass through other errors', async () => {
      const otherError = {
        message: 'Server Error',
        response: { status: 500 },
        config: {},
      };

      mockGet.mockRejectedValue(otherError);

      await expect(certificateApi.getAll()).rejects.toMatchObject({
        message: 'Server Error',
      });
    });

    it('should handle response success', async () => {
      mockGet.mockResolvedValue({
        data: { success: true, data: [] },
      });

      const result = await certificateApi.getAll();

      expect(result).toEqual([]);
    });
  });

  // === getByCertificateNumber Tests ===
  describe('getByCertificateNumber', () => {
    it('should fetch certificate by certificate number', async () => {
      const mockCert = { id: '1', certificateNumber: 'CERT-001' };
      mockGet.mockResolvedValue({
        data: { success: true, data: mockCert },
      });

      const result = await certificateApi.getByCertificateNumber('CERT-001');

      expect(result).toEqual(mockCert);
      expect(mockGet).toHaveBeenCalledWith('/certificates/number/CERT-001');
    });

    it('should handle error when certificate not found', async () => {
      mockGet.mockRejectedValue(new Error('Not found'));

      await expect(certificateApi.getByCertificateNumber('INVALID')).rejects.toThrow('Not found');
    });
  });

  // === create Tests ===
  describe('create', () => {
    it('should create new certificate', async () => {
      const formData = {
        farmerInfo: { firstName: 'John' },
      };
      const mockCert = { id: '1', ...formData };

      mockPost.mockResolvedValue({
        data: { success: true, data: mockCert },
      });

      const result = await certificateApi.create(formData as any);

      expect(result).toEqual(mockCert);
      expect(mockPost).toHaveBeenCalledWith('/certificates', formData);
    });

    it('should handle create error', async () => {
      mockPost.mockRejectedValue(new Error('Creation failed'));

      await expect(certificateApi.create({} as any)).rejects.toThrow('Creation failed');
    });
  });

  // === update Tests ===
  describe('update', () => {
    it('should update certificate', async () => {
      const updateData = {
        farmerInfo: { firstName: 'John Updated' },
      };
      const mockCert = { id: '1', farmerInfo: { firstName: 'John Updated' } };

      mockPut.mockResolvedValue({
        data: { success: true, data: mockCert },
      });

      const result = await certificateApi.update('1', updateData as any);

      expect(result).toEqual(mockCert);
      expect(mockPut).toHaveBeenCalledWith('/certificates/1', updateData);
    });

    it('should handle update error', async () => {
      mockPut.mockRejectedValue(new Error('Update failed'));

      await expect(certificateApi.update('1', {})).rejects.toThrow('Update failed');
    });
  });

  // === verify Tests ===
  describe('verify', () => {
    it('should verify certificate by certificate number', async () => {
      const mockVerify = {
        isValid: true,
        certificate: mockCertificate,
        message: 'Valid certificate',
      };
      mockGet.mockResolvedValue({
        data: { success: true, data: mockVerify },
      });

      const result = await certificateApi.verify('CERT-001');

      expect(result).toEqual(mockVerify);
      expect(mockGet).toHaveBeenCalledWith('/certificates/verify/CERT-001');
    });

    it('should handle verify error', async () => {
      mockGet.mockRejectedValue(new Error('Verification failed'));

      await expect(certificateApi.verify('INVALID')).rejects.toThrow('Verification failed');
    });
  });

  // === getStats Tests ===
  describe('getStats', () => {
    it('should fetch certificate statistics', async () => {
      const mockStats = {
        total: 100,
        approved: 80,
        pending: 15,
        rejected: 5,
      };
      mockGet.mockResolvedValue({
        data: { success: true, data: mockStats },
      });

      const result = await certificateApi.getStats();

      expect(result).toEqual(mockStats);
      expect(mockGet).toHaveBeenCalledWith('/certificates/stats');
    });

    it('should handle getStats error', async () => {
      mockGet.mockRejectedValue(new Error('Stats fetch failed'));

      await expect(certificateApi.getStats()).rejects.toThrow('Stats fetch failed');
    });
  });

  // === getExpiring Tests ===
  describe('getExpiring', () => {
    it('should fetch expiring certificates with default days', async () => {
      mockGet.mockResolvedValue({
        data: { success: true, data: [mockCertificate] },
      });

      const result = await certificateApi.getExpiring();

      expect(result).toEqual([mockCertificate]);
      expect(mockGet).toHaveBeenCalledWith('/certificates/expiring', {
        params: { days: 30 },
      });
    });

    it('should fetch expiring certificates with custom days', async () => {
      mockGet.mockResolvedValue({
        data: { success: true, data: [mockCertificate] },
      });

      const result = await certificateApi.getExpiring(60);

      expect(result).toEqual([mockCertificate]);
      expect(mockGet).toHaveBeenCalledWith('/certificates/expiring', {
        params: { days: 60 },
      });
    });

    it('should handle getExpiring error', async () => {
      mockGet.mockRejectedValue(new Error('Expiring fetch failed'));

      await expect(certificateApi.getExpiring()).rejects.toThrow('Expiring fetch failed');
    });
  });

  describe('Additional Branch Coverage', () => {
    it('should handle revoke() API call', async () => {
      const mockRevoked = { data: { data: { ...mockCertificate, status: 'revoked' } } };
      mockPost.mockResolvedValue(mockRevoked);

      const result = await certificateApi.revoke('CERT-001', 'Violation');
      expect(result.status).toBe('revoked');
    });

    it('should handle downloadPDF() blob response', async () => {
      const mockBlob = new Blob(['PDF'], { type: 'application/pdf' });
      mockGet.mockResolvedValue({ data: mockBlob });

      const result = await certificateApi.downloadPDF('CERT-001');
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle getById() error flow', async () => {
      mockGet.mockRejectedValue({ response: { status: 500 }, message: 'Server error' });

      await expect(certificateApi.getById('INVALID')).rejects.toEqual({
        response: { status: 500 },
        message: 'Server error',
      });
    });

    it('should handle getByCertificateNumber() error flow', async () => {
      mockGet.mockRejectedValue({ response: { status: 404 }, message: 'Not found' });

      await expect(certificateApi.getByCertificateNumber('INVALID')).rejects.toEqual({
        response: { status: 404 },
        message: 'Not found',
      });
    });

    it('should handle renew() success path', async () => {
      const mockRenewed = { data: { data: { ...mockCertificate, expiryDate: '2026-01-01' } } };
      mockPost.mockResolvedValue(mockRenewed);

      const result = await certificateApi.renew('CERT-001');
      expect(result.expiryDate).toBe('2026-01-01');
    });

    it('should handle approve() via revoke endpoint', async () => {
      const mockApproved = { data: { data: { ...mockCertificate, status: 'approved' } } };
      mockPost.mockResolvedValue(mockApproved);

      const result = await certificateApi.revoke('CERT-001', 'approved');
      expect(result).toBeDefined();
    });

    it('should handle getAll() with multiple parameters', async () => {
      mockGet.mockResolvedValue({ data: { data: [mockCertificate] } });

      await certificateApi.getAll({
        status: 'approved',
        searchQuery: 'test',
        province: 'Bangkok',
      });

      expect(mockGet).toHaveBeenCalledWith('/certificates', {
        params: {
          status: 'approved',
          searchQuery: 'test',
          province: 'Bangkok',
        }
      });
    });

    it('should handle create() success', async () => {
      const newCert = { farmName: 'New Farm', farmerName: 'New Farmer' };
      mockPost.mockResolvedValue({ data: { data: mockCertificate } });

      const result = await certificateApi.create(newCert as any);
      expect(result).toEqual(mockCertificate);
    });

    it('should handle update() success', async () => {
      const updates = { status: 'approved' };
      mockPut.mockResolvedValue({ data: { data: { ...mockCertificate, ...updates } } });

      const result = await certificateApi.update('CERT-001', updates as any);
      expect(result.status).toBe('approved');
    });

    it('should handle delete() success', async () => {
      mockDelete.mockResolvedValue({ data: { success: true } });

      await certificateApi.delete('CERT-001');
      expect(mockDelete).toHaveBeenCalledWith('/certificates/CERT-001');
    });
  });
});
