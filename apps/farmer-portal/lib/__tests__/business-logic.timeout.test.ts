/**
 * Unit Tests: Payment Timeout Logic
 *
 * Business Rule: Payment expires after 15 minutes (900 seconds)
 * Status on timeout: PAYMENT_TIMEOUT
 *
 * @see TEST_CASES_DOCUMENTATION.md - Payment Timeout Test Cases
 */

import {
  createPaymentRecord,
  isPaymentTimedOut,
  getRemainingPaymentTime,
  PAYMENT_TIMEOUT_MINUTES,
} from '../business-logic';

describe('Business Logic: Payment Timeout', () => {
  describe('createPaymentRecord', () => {
    test('should create payment with expiresAt set to 15 minutes from now', () => {
      // Arrange
      const applicationId = 'APP-001';
      const userId = 'USER-001';
      const submissionCount = 3;
      const beforeCreate = Date.now();

      // Act
      const payment = createPaymentRecord(applicationId, userId, submissionCount);
      const afterCreate = Date.now();

      // Assert
      expect(payment.applicationId).toBe(applicationId);
      expect(payment.userId).toBe(userId);
      expect(payment.amount).toBe(5000);
      expect(payment.status).toBe('PENDING');

      // Check expiresAt is approximately 15 minutes from now (allow 1 second tolerance)
      const expectedExpiresAt = beforeCreate + PAYMENT_TIMEOUT_MINUTES * 60 * 1000;
      const actualExpiresAt = payment.expiresAt.getTime();
      expect(actualExpiresAt).toBeGreaterThanOrEqual(expectedExpiresAt);
      expect(actualExpiresAt).toBeLessThanOrEqual(
        afterCreate + PAYMENT_TIMEOUT_MINUTES * 60 * 1000,
      );
    });

    test('should create payment with correct reason based on submission count', () => {
      // Arrange & Act
      const payment1 = createPaymentRecord('APP-001', 'USER-001', 3);
      const payment2 = createPaymentRecord('APP-001', 'USER-001', 5);

      // Assert
      expect(payment1.reason).toBeTruthy();
      expect(payment2.reason).toBeTruthy();
    });
  });

  describe('isPaymentTimedOut', () => {
    test('should detect timed out payment correctly (expired)', () => {
      // Arrange - Create payment that expired 1 minute ago
      const payment = {
        ...createPaymentRecord('APP-001', 'USER-001', 3),
        id: 'PAY-001',
        expiresAt: new Date(Date.now() - 60 * 1000), // 1 minute ago
      };

      // Act
      const result = isPaymentTimedOut(payment);

      // Assert
      expect(result).toBe(true);
    });

    test('should NOT timeout payment before 15 minutes (still valid)', () => {
      // Arrange - Create payment that expires in 5 minutes
      const payment = {
        ...createPaymentRecord('APP-001', 'USER-001', 3),
        id: 'PAY-002',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      };

      // Act
      const result = isPaymentTimedOut(payment);

      // Assert
      expect(result).toBe(false);
    });

    test('should handle exactly at expiry time (edge case)', () => {
      // Arrange - Create payment that expires exactly now
      const payment = {
        ...createPaymentRecord('APP-001', 'USER-001', 3),
        id: 'PAY-003',
        expiresAt: new Date(Date.now()),
      };

      // Act
      const result = isPaymentTimedOut(payment);

      // Assert - At exact expiry time should NOT be considered timed out (uses > not >=)
      expect(result).toBe(false);
    });

    test('should detect timeout at various past times', () => {
      // Arrange
      const testCases = [
        { minutesAgo: 1, expected: true }, // 1 minute ago
        { minutesAgo: 5, expected: true }, // 5 minutes ago
        { minutesAgo: 15, expected: true }, // 15 minutes ago
        { minutesAgo: 30, expected: true }, // 30 minutes ago
        { minutesAgo: 60, expected: true }, // 1 hour ago
      ];

      // Act & Assert
      testCases.forEach(({ minutesAgo, expected }, index) => {
        const payment = {
          ...createPaymentRecord('APP-001', 'USER-001', 3),
          id: `PAY-${index}`,
          expiresAt: new Date(Date.now() - minutesAgo * 60 * 1000),
        };

        const result = isPaymentTimedOut(payment);
        expect(result).toBe(expected);
      });
    });

    test('should handle paid payment (should not timeout)', () => {
      // Arrange - Create expired payment but status is PAID
      const payment = {
        ...createPaymentRecord('APP-001', 'USER-001', 3),
        id: 'PAY-COMPLETED',
        expiresAt: new Date(Date.now() - 60 * 1000), // 1 minute ago
        status: 'PAID' as const,
      };

      // Act
      const result = isPaymentTimedOut(payment);

      // Assert - Paid payments should not be considered timed out
      expect(result).toBe(false);
    });
  });

  describe('getRemainingPaymentTime', () => {
    test('should calculate remaining time correctly (in seconds)', () => {
      // Arrange - Create payment that expires in 10 minutes
      const payment = {
        ...createPaymentRecord('APP-001', 'USER-001', 3),
        id: 'PAY-TIME-1',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      };

      // Act
      const remainingSeconds = getRemainingPaymentTime(payment);

      // Assert - Should be approximately 600 seconds (allow 2 second tolerance)
      expect(remainingSeconds).toBeGreaterThanOrEqual(598);
      expect(remainingSeconds).toBeLessThanOrEqual(600);
    });

    test('should return 0 for expired payment', () => {
      // Arrange - Create expired payment
      const payment = {
        ...createPaymentRecord('APP-001', 'USER-001', 3),
        id: 'PAY-TIME-2',
        expiresAt: new Date(Date.now() - 60 * 1000), // 1 minute ago
      };

      // Act
      const remainingSeconds = getRemainingPaymentTime(payment);

      // Assert
      expect(remainingSeconds).toBe(0);
    });

    test('should calculate remaining time at various intervals', () => {
      // Arrange
      const testCases = [
        { minutesLeft: 15, expectedMin: 899, expectedMax: 900 }, // Just created
        { minutesLeft: 10, expectedMin: 599, expectedMax: 600 }, // 10 minutes left
        { minutesLeft: 5, expectedMin: 299, expectedMax: 300 }, // 5 minutes left
        { minutesLeft: 1, expectedMin: 59, expectedMax: 60 }, // 1 minute left
      ];

      // Act & Assert
      testCases.forEach(({ minutesLeft, expectedMin, expectedMax }, index) => {
        const payment = {
          ...createPaymentRecord('APP-001', 'USER-001', 3),
          id: `PAY-TIME-${index}`,
          expiresAt: new Date(Date.now() + minutesLeft * 60 * 1000),
        };

        const remainingSeconds = getRemainingPaymentTime(payment);
        expect(remainingSeconds).toBeGreaterThanOrEqual(expectedMin);
        expect(remainingSeconds).toBeLessThanOrEqual(expectedMax);
      });
    });

    test('should never return negative values', () => {
      // Arrange - Create very old expired payment
      const payment = {
        ...createPaymentRecord('APP-001', 'USER-001', 3),
        id: 'PAY-TIME-OLD',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      };

      // Act
      const remainingSeconds = getRemainingPaymentTime(payment);

      // Assert
      expect(remainingSeconds).toBe(0);
      expect(remainingSeconds).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Payment Timeout Constants', () => {
    test('PAYMENT_TIMEOUT_MINUTES should be 15', () => {
      // Assert
      expect(PAYMENT_TIMEOUT_MINUTES).toBe(15);
    });

    test('timeout should be 900 seconds (15 * 60)', () => {
      // Arrange
      const expectedSeconds = PAYMENT_TIMEOUT_MINUTES * 60;

      // Assert
      expect(expectedSeconds).toBe(900);
    });
  });
});
