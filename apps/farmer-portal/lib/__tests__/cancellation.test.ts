/**
 * Jest Unit Tests: Application Cancellation Logic
 *
 * Tests cancellation and refund policies:
 * - Cancellation eligibility
 * - Refund calculation
 * - Status updates
 */

import { canCancelApplication, calculateCancellationRefund } from '../business-logic';

describe('Application Cancellation Logic', () => {
  describe('canCancelApplication', () => {
    it('should allow cancellation for SUBMITTED status', () => {
      const result = canCancelApplication('SUBMITTED');

      expect(result).toBe(true);
    });

    it('should allow cancellation for UNDER_REVIEW status', () => {
      const result = canCancelApplication('UNDER_REVIEW');

      expect(result).toBe(true);
    });

    it('should allow cancellation for PENDING_PAYMENT status', () => {
      const result = canCancelApplication('PENDING_PAYMENT');

      expect(result).toBe(true);
    });

    it('should NOT allow cancellation for APPROVED status', () => {
      const result = canCancelApplication('APPROVED');

      expect(result).toBe(false);
    });

    it('should NOT allow cancellation for REJECTED status', () => {
      const result = canCancelApplication('REJECTED');

      expect(result).toBe(false);
    });

    it('should NOT allow cancellation for already CANCELLED status', () => {
      const result = canCancelApplication('CANCELLED');

      expect(result).toBe(false);
    });
  });

  describe('calculateCancellationRefund', () => {
    it('should calculate 100% refund within 3 days', () => {
      const paidAt = new Date('2025-10-20T10:00:00Z');
      const cancelledAt = new Date('2025-10-22T10:00:00Z'); // 2 days later
      const amount = 5000;

      const refund = calculateCancellationRefund(amount, paidAt, cancelledAt);

      expect(refund.refundAmount).toBe(5000);
      expect(refund.refundPercentage).toBe(100);
      expect(refund.canRefund).toBe(true);
    });

    it('should calculate 50% refund between 3-7 days', () => {
      const paidAt = new Date('2025-10-15T10:00:00Z');
      const cancelledAt = new Date('2025-10-20T10:00:00Z'); // 5 days later
      const amount = 10000;

      const refund = calculateCancellationRefund(amount, paidAt, cancelledAt);

      expect(refund.refundAmount).toBe(5000);
      expect(refund.refundPercentage).toBe(50);
      expect(refund.canRefund).toBe(true);
    });

    it('should calculate 0% refund after 7 days', () => {
      const paidAt = new Date('2025-10-10T10:00:00Z');
      const cancelledAt = new Date('2025-10-23T10:00:00Z'); // 13 days later
      const amount = 25000;

      const refund = calculateCancellationRefund(amount, paidAt, cancelledAt);

      expect(refund.refundAmount).toBe(0);
      expect(refund.refundPercentage).toBe(0);
      expect(refund.canRefund).toBe(false);
    });
  });
});
