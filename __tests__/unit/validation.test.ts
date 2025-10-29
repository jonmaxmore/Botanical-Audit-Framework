import { plantSchema, auditSchema } from '@/lib/validation-schemas';

describe('Validation Schemas', () => {
  describe('plantSchema', () => {
    it('should validate a correct plant object', () => {
      const validPlant = {
        scientificName: 'Quercus robur',
        commonName: 'English Oak',
        family: 'Fagaceae',
        status: 'active'
      };

      const result = plantSchema.safeParse(validPlant);
      expect(result.success).toBe(true);
    });

    it('should reject plant with missing required fields', () => {
      const invalidPlant = {
        scientificName: ''
      };

      const result = plantSchema.safeParse(invalidPlant);
      expect(result.success).toBe(false);
    });
  });

  describe('auditSchema', () => {
    it('should validate a correct audit object', () => {
      const validAudit = {
        plantId: 'plant-123',
        auditDate: new Date().toISOString(),
        auditor: 'Jane Smith',
        status: 'pending'
      };

      const result = auditSchema.safeParse(validAudit);
      expect(result.success).toBe(true);
    });

    it('should reject audit with invalid status', () => {
      const invalidAudit = {
        plantId: 'plant-123',
        auditDate: new Date().toISOString(),
        auditor: 'Jane Smith',
        status: 'invalid-status'
      };

      const result = auditSchema.safeParse(invalidAudit);
      expect(result.success).toBe(false);
    });
  });
});
