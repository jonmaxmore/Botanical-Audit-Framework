import { apiClient } from '@/lib/api-client';

describe('API Integration Tests', () => {
  describe('Plants API', () => {
    it('should fetch plants list', async () => {
      const plants = await apiClient.get('/plants');
      expect(Array.isArray(plants)).toBe(true);
    });

    it('should create a new plant', async () => {
      const newPlant = {
        scientificName: 'Rosa canina',
        commonName: 'Dog Rose',
        family: 'Rosaceae',
        status: 'active'
      };

      const created = await apiClient.post('/plants', newPlant);
      expect(created).toHaveProperty('id');
      expect(created).toMatchObject(newPlant);
    });

    it('should handle validation errors', async () => {
      const invalidPlant = {
        scientificName: '',
        commonName: ''
      };

      await expect(apiClient.post('/plants', invalidPlant)).rejects.toThrow();
    });
  });

  describe('Audits API', () => {
    it('should fetch audits list', async () => {
      const audits = await apiClient.get('/audits');
      expect(Array.isArray(audits)).toBe(true);
    });

    it('should create a new audit', async () => {
      const newAudit = {
        plantId: 'plant-123',
        auditDate: new Date().toISOString(),
        auditor: 'John Doe',
        status: 'pending'
      };

      const created = await apiClient.post('/audits', newAudit);
      expect(created).toHaveProperty('id');
    });
  });
});
