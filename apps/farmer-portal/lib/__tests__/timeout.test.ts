/**
 * Jest Unit Tests: Payment Timeout Logic
 *
 * Tests timeout management including:
 * - Payment timeout detection (15 minutes)
 * - Timeout status updates
 * - Expired session handling
 */

import {
  isPaymentTimedOut,
  canRetryAfterTimeout,
  PAYMENT_TIMEOUT_MINUTES,
} from '../business-logic';

describe('Payment Timeout Logic', () => {
  describe('isPaymentTimedOut', () => {
    it('should return false for payment within timeout period (10 minutes)', () => {
      const now = new Date();
      const createdAt = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago

      const result = isPaymentTimedOut(createdAt);

      expect(result).toBe(false);
    });

    it('should return true for payment after timeout period (20 minutes)', () => {
      const now = new Date();
      const createdAt = new Date(now.getTime() - 20 * 60 * 1000); // 20 minutes ago

      const result = isPaymentTimedOut(createdAt);

      expect(result).toBe(true);
    });

    it('should return true exactly at timeout boundary (15 minutes)', () => {
      const now = new Date();
      const createdAt = new Date(now.getTime() - PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

      const result = isPaymentTimedOut(createdAt);

      expect(result).toBe(true);
    });

    it('should return false for very recent payment (1 minute)', () => {
      const now = new Date();
      const createdAt = new Date(now.getTime() - 1 * 60 * 1000); // 1 minute ago

      const result = isPaymentTimedOut(createdAt);

      expect(result).toBe(false);
    });

    it('should return true for old payment (60 minutes)', () => {
      const now = new Date();
      const createdAt = new Date(now.getTime() - 60 * 60 * 1000); // 60 minutes ago

      const result = isPaymentTimedOut(createdAt);

      expect(result).toBe(true);
    });

    it('should handle edge case at 14 minutes 59 seconds (not timed out)', () => {
      const now = new Date();
      const createdAt = new Date(now.getTime() - (14 * 60 + 59) * 1000); // 14:59

      const result = isPaymentTimedOut(createdAt);

      expect(result).toBe(false);
    });
  });

  describe('canRetryAfterTimeout', () => {
    it('should allow retry immediately after timeout', () => {
      const timedOutAt = new Date(Date.now() - 1000); // 1 second ago

      const result = canRetryAfterTimeout(timedOutAt);

      expect(result).toBe(true);
    });

    it('should allow retry after long timeout period', () => {
      const timedOutAt = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago

      const result = canRetryAfterTimeout(timedOutAt);

      expect(result).toBe(true);
    });
  });

  describe('Timeout Constants', () => {
    it('should have 15 minutes timeout period', () => {
      expect(PAYMENT_TIMEOUT_MINUTES).toBe(15);
    });
  });
});
