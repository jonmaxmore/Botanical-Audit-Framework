/**
 * Jest Unit Tests: Payment Module
 *
 * Tests payment processing logic including:
 * - Payment calculation
 * - Payment session creation
 * - Timeout management
 * - Receipt generation
 * - Refund policy
 */

import {
  createPaymentSession,
  processPayment,
  generateReceipt,
  checkPaymentTimeout,
  calculateRefundAmount,
} from '../payment';
import { PAYMENT_TIMEOUT_MINUTES, REFUND_POLICY } from '../business-logic';

describe('Payment Module', () => {
  describe('createPaymentSession', () => {
    it('should create payment session for first submission (5,000 THB)', () => {
      const session = createPaymentSession('APP001', 'USER001', 1);

      expect(session).toBeDefined();
      expect(session.paymentRecord.amount).toBe(5000);
      expect(session.paymentRecord.status).toBe('pending');
      expect(session.paymentRecord.submissionCount).toBe(1);
      expect(session.paymentRecord.applicationId).toBe('APP001');
    });

    it('should create payment session for resubmission (25,000 THB)', () => {
      const session = createPaymentSession('APP002', 'USER002', 2);

      expect(session).toBeDefined();
      expect(session.paymentRecord.amount).toBe(25000);
      expect(session.paymentRecord.status).toBe('pending');
      expect(session.paymentRecord.submissionCount).toBe(2);
    });

    it('should include expiration time (30 minutes from creation)', () => {
      const now = new Date();
      const session = createPaymentSession('APP003', 'USER003', 1);

      const expectedExpiry = new Date(now.getTime() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000);
      const timeDiff = Math.abs(session.expiresAt.getTime() - expectedExpiry.getTime());

      // Allow 1 second tolerance
      expect(timeDiff).toBeLessThan(1000);
    });

    it('should include Omise public key', () => {
      const session = createPaymentSession('APP004', 'USER004', 1);

      expect(session.omisePublicKey).toBeDefined();
      expect(typeof session.omisePublicKey).toBe('string');
    });

    it('should generate unique session IDs', () => {
      const session1 = createPaymentSession('APP005', 'USER005', 1);
      const session2 = createPaymentSession('APP006', 'USER006', 1);

      expect(session1.id).not.toBe(session2.id);
    });
  });

  describe('processPayment', () => {
    it('should process payment successfully with valid token', async () => {
      const result = await processPayment({
        applicationId: 'APP001',
        userId: 'USER001',
        amount: 5000,
        token: 'tokn_test_valid',
        submissionCount: 1,
      });

      expect(result.success).toBe(true);
      expect(result.paymentId).toBeDefined();
      expect(result.amount).toBe(5000);
      expect(result.paidAt).toBeInstanceOf(Date);
    });

    it('should fail payment with invalid token', async () => {
      const result = await processPayment({
        applicationId: 'APP002',
        userId: 'USER002',
        amount: 5000,
        token: 'tokn_test_invalid',
        submissionCount: 1,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.paymentId).toBeUndefined();
    });

    it('should handle network errors gracefully', async () => {
      const result = await processPayment({
        applicationId: 'APP003',
        userId: 'USER003',
        amount: 5000,
        token: 'tokn_test_network_error',
        submissionCount: 1,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('network');
    });

    it('should record transaction ID on successful payment', async () => {
      const result = await processPayment({
        applicationId: 'APP004',
        userId: 'USER004',
        amount: 25000,
        token: 'tokn_test_valid',
        submissionCount: 2,
      });

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(typeof result.transactionId).toBe('string');
    });
  });

  describe('checkPaymentTimeout', () => {
    it('should return false for payment within timeout period', () => {
      const now = new Date();
      const paymentCreatedAt = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago

      const isTimedOut = checkPaymentTimeout(paymentCreatedAt);

      expect(isTimedOut).toBe(false);
    });

    it('should return true for payment after timeout period', () => {
      const now = new Date();
      const paymentCreatedAt = new Date(now.getTime() - 40 * 60 * 1000); // 40 minutes ago

      const isTimedOut = checkPaymentTimeout(paymentCreatedAt);

      expect(isTimedOut).toBe(true);
    });

    it('should return true exactly at timeout boundary (30 minutes)', () => {
      const now = new Date();
      const paymentCreatedAt = new Date(now.getTime() - PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

      const isTimedOut = checkPaymentTimeout(paymentCreatedAt);

      expect(isTimedOut).toBe(true);
    });
  });

  describe('generateReceipt', () => {
    it('should generate receipt with correct format', () => {
      const receipt = generateReceipt({
        paymentId: 'PAY001',
        applicationId: 'APP001',
        userId: 'USER001',
        amount: 5000,
        paidAt: new Date('2025-10-23T10:00:00Z'),
      });

      expect(receipt.id).toBeDefined();
      expect(receipt.receiptNumber).toMatch(/^RCP-\d{8}-\d{6}$/);
      expect(receipt.amount).toBe(5000);
      expect(receipt.description).toContain('GACP');
    });

    it('should include Thai tax ID', () => {
      const receipt = generateReceipt({
        paymentId: 'PAY002',
        applicationId: 'APP002',
        userId: 'USER002',
        amount: 25000,
        paidAt: new Date(),
      });

      expect(receipt.taxId).toMatch(/^\d{13}$/); // Thai tax ID format: 13 digits
    });

    it('should generate unique receipt numbers', () => {
      const receipt1 = generateReceipt({
        paymentId: 'PAY003',
        applicationId: 'APP003',
        userId: 'USER003',
        amount: 5000,
        paidAt: new Date(),
      });

      const receipt2 = generateReceipt({
        paymentId: 'PAY004',
        applicationId: 'APP004',
        userId: 'USER004',
        amount: 5000,
        paidAt: new Date(),
      });

      expect(receipt1.receiptNumber).not.toBe(receipt2.receiptNumber);
    });
  });

  describe('calculateRefundAmount', () => {
    it('should refund 100% if cancelled within 3 days', () => {
      const paidAt = new Date('2025-10-20T10:00:00Z');
      const cancelledAt = new Date('2025-10-22T10:00:00Z'); // 2 days later

      const refund = calculateRefundAmount(5000, paidAt, cancelledAt);

      expect(refund.refundAmount).toBe(5000);
      expect(refund.refundPercentage).toBe(100);
      expect(refund.deductedAmount).toBe(0);
    });

    it('should refund 50% if cancelled between 3-7 days', () => {
      const paidAt = new Date('2025-10-15T10:00:00Z');
      const cancelledAt = new Date('2025-10-20T10:00:00Z'); // 5 days later

      const refund = calculateRefundAmount(10000, paidAt, cancelledAt);

      expect(refund.refundAmount).toBe(5000);
      expect(refund.refundPercentage).toBe(50);
      expect(refund.deductedAmount).toBe(5000);
    });

    it('should refund 0% if cancelled after 7 days', () => {
      const paidAt = new Date('2025-10-10T10:00:00Z');
      const cancelledAt = new Date('2025-10-23T10:00:00Z'); // 13 days later

      const refund = calculateRefundAmount(25000, paidAt, cancelledAt);

      expect(refund.refundAmount).toBe(0);
      expect(refund.refundPercentage).toBe(0);
      expect(refund.deductedAmount).toBe(25000);
    });

    it('should handle edge case: exactly 3 days (still 100%)', () => {
      const paidAt = new Date('2025-10-20T10:00:00Z');
      const cancelledAt = new Date('2025-10-23T10:00:00Z'); // exactly 3 days

      const refund = calculateRefundAmount(5000, paidAt, cancelledAt);

      expect(refund.refundAmount).toBe(5000);
      expect(refund.refundPercentage).toBe(100);
    });

    it('should handle edge case: exactly 7 days (50%)', () => {
      const paidAt = new Date('2025-10-16T10:00:00Z');
      const cancelledAt = new Date('2025-10-23T10:00:00Z'); // exactly 7 days

      const refund = calculateRefundAmount(10000, paidAt, cancelledAt);

      expect(refund.refundAmount).toBe(5000);
      expect(refund.refundPercentage).toBe(50);
    });
  });

  describe('Refund Policy Constants', () => {
    it('should have correct refund policy configuration', () => {
      expect(REFUND_POLICY.fullRefund.days).toBe(3);
      expect(REFUND_POLICY.fullRefund.percentage).toBe(100);

      expect(REFUND_POLICY.partialRefund.days).toBe(7);
      expect(REFUND_POLICY.partialRefund.percentage).toBe(50);

      expect(REFUND_POLICY.noRefund.percentage).toBe(0);
    });
  });

  describe('Payment Timeout Constants', () => {
    it('should have 30 minutes timeout period', () => {
      expect(PAYMENT_TIMEOUT_MINUTES).toBe(30);
    });
  });
});
