/**
 * Unit Tests: Payment Logic (Recurring Payment)
 *
 * Business Rule: Payment required every 2 rejections starting from submission 3
 * Formula: (submissionCount % 2 === 1) && (submissionCount >= 3)
 *
 * @see TEST_CASES_DOCUMENTATION.md - Payment Logic Test Cases
 */

import {
  isPaymentRequired,
  calculateTotalAmountPaid,
  getNextPaymentSubmission,
  PAYMENT_AMOUNT,
} from '../business-logic';

describe('Business Logic: Recurring Payment', () => {
  describe('isPaymentRequired', () => {
    test('should NOT require payment for submissions 1-2 (free submissions)', () => {
      // Arrange & Act
      const submission1 = isPaymentRequired(1);
      const submission2 = isPaymentRequired(2);

      // Assert
      expect(submission1).toBe(false);
      expect(submission2).toBe(false);
    });

    test('should require payment at submission 3 (first payment)', () => {
      // Arrange & Act
      const result = isPaymentRequired(3);

      // Assert
      expect(result).toBe(true);
    });

    test('should follow recurring payment pattern (3, 5, 7, 9, 11...)', () => {
      // Arrange
      const testCases = [
        { submission: 3, expected: true }, // 1st payment
        { submission: 4, expected: false }, // Free
        { submission: 5, expected: true }, // 2nd payment
        { submission: 6, expected: false }, // Free
        { submission: 7, expected: true }, // 3rd payment
        { submission: 8, expected: false }, // Free
        { submission: 9, expected: true }, // 4th payment
        { submission: 10, expected: false }, // Free
        { submission: 11, expected: true }, // 5th payment
        { submission: 12, expected: false }, // Free
      ];

      // Act & Assert
      testCases.forEach(({ submission, expected }) => {
        const result = isPaymentRequired(submission);
        expect(result).toBe(expected);
      });
    });

    test('should handle edge cases (0, negative, very large numbers)', () => {
      // Arrange & Act & Assert
      expect(isPaymentRequired(0)).toBe(false);
      expect(isPaymentRequired(-1)).toBe(false);
      expect(isPaymentRequired(-5)).toBe(false);
      expect(isPaymentRequired(101)).toBe(true); // Odd number >= 3
      expect(isPaymentRequired(1000)).toBe(false); // Even number
      expect(isPaymentRequired(1001)).toBe(true); // Odd number >= 3
    });
  });

  describe('calculateTotalAmountPaid', () => {
    test('should calculate total correctly for submissions 1-2 (฿0)', () => {
      // Arrange & Act
      const total1 = calculateTotalAmountPaid(1);
      const total2 = calculateTotalAmountPaid(2);

      // Assert
      expect(total1).toBe(0);
      expect(total2).toBe(0);
    });

    test('should calculate total correctly after first payment (submission 3 = ฿5,000)', () => {
      // Arrange & Act
      const total = calculateTotalAmountPaid(3);

      // Assert
      expect(total).toBe(5000);
    });

    test('should calculate cumulative total correctly', () => {
      // Arrange
      const testCases = [
        { submission: 1, expected: 0 }, // No payments
        { submission: 2, expected: 0 }, // No payments
        { submission: 3, expected: 5000 }, // 1 payment
        { submission: 4, expected: 5000 }, // 1 payment (no new payment at 4)
        { submission: 5, expected: 10000 }, // 2 payments
        { submission: 6, expected: 10000 }, // 2 payments
        { submission: 7, expected: 15000 }, // 3 payments
        { submission: 8, expected: 15000 }, // 3 payments
        { submission: 9, expected: 20000 }, // 4 payments
        { submission: 10, expected: 20000 }, // 4 payments
        { submission: 11, expected: 25000 }, // 5 payments
        { submission: 20, expected: 45000 }, // 9 payments (3,5,7,9,11,13,15,17,19)
      ];

      // Act & Assert
      testCases.forEach(({ submission, expected }) => {
        const result = calculateTotalAmountPaid(submission);
        expect(result).toBe(expected);
      });
    });

    test('should match formula: paymentCount * PAYMENT_AMOUNT', () => {
      // Arrange
      const submission = 11; // Should have made 5 payments
      const expectedPayments = 5;

      // Act
      const total = calculateTotalAmountPaid(submission);

      // Assert
      expect(total).toBe(expectedPayments * PAYMENT_AMOUNT);
      expect(total).toBe(25000);
    });
  });

  describe('getNextPaymentSubmission', () => {
    test('should predict next payment submission correctly', () => {
      // Arrange
      const testCases = [
        { current: 1, next: 3 }, // From submission 1 → next payment at 3
        { current: 2, next: 3 }, // From submission 2 → next payment at 3
        { current: 3, next: 5 }, // From submission 3 → next payment at 5
        { current: 4, next: 5 }, // From submission 4 → next payment at 5
        { current: 5, next: 7 }, // From submission 5 → next payment at 7
        { current: 6, next: 7 }, // From submission 6 → next payment at 7
        { current: 7, next: 9 }, // From submission 7 → next payment at 9
        { current: 10, next: 11 }, // From submission 10 → next payment at 11
      ];

      // Act & Assert
      testCases.forEach(({ current, next }) => {
        const result = getNextPaymentSubmission(current);
        expect(result).toBe(next);
      });
    });

    test('should handle edge cases', () => {
      // Arrange & Act & Assert
      expect(getNextPaymentSubmission(0)).toBe(3); // Start from 0 → first payment at 3
      expect(getNextPaymentSubmission(100)).toBe(101); // Even → next odd
      expect(getNextPaymentSubmission(101)).toBe(103); // Odd → next odd
    });
  });

  describe('Payment Amount Constant', () => {
    test('PAYMENT_AMOUNT should be ฿5,000', () => {
      // Assert
      expect(PAYMENT_AMOUNT).toBe(5000);
    });
  });
});
