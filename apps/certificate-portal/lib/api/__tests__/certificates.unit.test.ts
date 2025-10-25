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

describe('Certificate API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all certificates', async () => {
      const mockData = [
        { id: '1', farmName: 'Farm 1' },
        { id: '2', farmName: 'Farm 2' }
      ];

      mockGet.mockResolvedValue({
        data: { success: true, data: mockData }
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
        data: { success: true, data: mockCert }
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
          postalCode: '10100'
        },
        farmArea: 10,
        cropType: 'Rice',
        certificationStandard: 'GACP' as const,
        inspectionDate: '2025-10-25',
        inspectorName: 'Inspector'
      };

      mockPost.mockResolvedValue({
        data: {
          success: true,
          data: { id: '123', ...newCert }
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
        data: { success: true, data: { id: '123', ...updateData } }
      });

      const result = await certificateApi.update('123', updateData);
      expect(result.farmName).toBe('Updated Farm');
    });
  });

  describe('delete', () => {
    it('should delete certificate', async () => {
      mockDelete.mockResolvedValue({
        data: { success: true }
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
            certificate: { id: '123', farmName: 'Test' }
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
          data: { valid: false, message: 'Not found' }
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
        issuedThisMonth: 15
      };

      mockGet.mockResolvedValue({
        data: { success: true, data: mockStats }
      });

      const result = await certificateApi.getStats();
      expect(result.total).toBe(100);
    });
  });
});
