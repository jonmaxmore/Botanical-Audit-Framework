/**
 * Jest Unit Tests: Certificate Revocation Logic
 *
 * Tests revocation waiting period and eligibility:
 * - 30-day waiting period after revocation
 * - Reapplication eligibility
 * - Revocation status checks
 */

import {
  canReapplyAfterRevocation,
  getDaysSinceRevocation,
  REVOCATION_WAIT_DAYS,
} from '../business-logic';

describe('Certificate Revocation Logic', () => {
  describe('canReapplyAfterRevocation', () => {
    it('should NOT allow reapplication within 30 days (10 days)', () => {
      const revokedDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago

      const result = canReapplyAfterRevocation(revokedDate);

      expect(result).toBe(false);
    });

    it('should allow reapplication after 30 days (31 days)', () => {
      const revokedDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000); // 31 days ago

      const result = canReapplyAfterRevocation(revokedDate);

      expect(result).toBe(true);
    });

    it('should NOT allow reapplication exactly at 30 days', () => {
      const revokedDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // exactly 30 days

      const result = canReapplyAfterRevocation(revokedDate);

      expect(result).toBe(false);
    });

    it('should allow reapplication after long period (100 days)', () => {
      const revokedDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000); // 100 days ago

      const result = canReapplyAfterRevocation(revokedDate);

      expect(result).toBe(true);
    });

    it('should NOT allow immediate reapplication (1 day)', () => {
      const revokedDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 1 day ago

      const result = canReapplyAfterRevocation(revokedDate);

      expect(result).toBe(false);
    });
  });

  describe('getDaysSinceRevocation', () => {
    it('should calculate 0 days for today', () => {
      const revokedDate = new Date();

      const days = getDaysSinceRevocation(revokedDate);

      expect(days).toBe(0);
    });

    it('should calculate 10 days correctly', () => {
      const revokedDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

      const days = getDaysSinceRevocation(revokedDate);

      expect(days).toBe(10);
    });

    it('should calculate 30 days correctly', () => {
      const revokedDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const days = getDaysSinceRevocation(revokedDate);

      expect(days).toBe(30);
    });

    it('should calculate 31 days correctly', () => {
      const revokedDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);

      const days = getDaysSinceRevocation(revokedDate);

      expect(days).toBe(31);
    });
  });

  describe('Revocation Constants', () => {
    it('should have 30 days waiting period', () => {
      expect(REVOCATION_WAIT_DAYS).toBe(30);
    });
  });
});
