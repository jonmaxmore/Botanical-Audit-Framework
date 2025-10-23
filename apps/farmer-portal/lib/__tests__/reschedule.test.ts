/**
 * Jest Unit Tests: Reschedule Logic
 *
 * Tests inspection rescheduling including:
 * - Reschedule limit enforcement (1 time max)
 * - Reschedule eligibility
 * - Date validation
 */

import { canReschedule, getRemainingReschedules, MAX_RESCHEDULE_COUNT } from '../business-logic';

describe('Reschedule Logic', () => {
  describe('canReschedule', () => {
    it('should allow reschedule for first time (count = 0)', () => {
      const result = canReschedule(0);

      expect(result).toBe(true);
    });

    it('should NOT allow reschedule after max limit (count = 1)', () => {
      const result = canReschedule(1);

      expect(result).toBe(false);
    });

    it('should NOT allow reschedule after exceeding limit (count = 2)', () => {
      const result = canReschedule(2);

      expect(result).toBe(false);
    });

    it('should handle negative reschedule count (edge case)', () => {
      const result = canReschedule(-1);

      expect(result).toBe(true); // Treat as 0
    });
  });

  describe('getRemainingReschedules', () => {
    it('should return 1 remaining for new application (count = 0)', () => {
      const remaining = getRemainingReschedules(0);

      expect(remaining).toBe(1);
    });

    it('should return 0 remaining after using the quota (count = 1)', () => {
      const remaining = getRemainingReschedules(1);

      expect(remaining).toBe(0);
    });

    it('should return 0 for exceeded limit (count = 2)', () => {
      const remaining = getRemainingReschedules(2);

      expect(remaining).toBe(0);
    });

    it('should never return negative remaining', () => {
      const remaining = getRemainingReschedules(5);

      expect(remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Reschedule Constants', () => {
    it('should have max reschedule count of 1', () => {
      expect(MAX_RESCHEDULE_COUNT).toBe(1);
    });
  });
});
