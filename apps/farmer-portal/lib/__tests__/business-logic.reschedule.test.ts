/**
 * Unit Tests: Reschedule Logic (1 Time Limit)
 *
 * Business Rule: Farmers can reschedule inspection ONCE per application
 * After 1 reschedule, must proceed with scheduled date or face rejection
 *
 * @see TEST_CASES_DOCUMENTATION.md - Reschedule Test Cases
 */

import { canReschedule, recordReschedule, getRemainingReschedules } from '../business-logic';
import type { Application, ApplicationStatus } from '../business-logic';

describe('Business Logic: Reschedule Limit (1 Time)', () => {
  describe('canReschedule', () => {
    test('should allow FIRST reschedule (rescheduleCount = 0)', () => {
      // Arrange
      const application: Application = {
        id: 'APP-001',
        userId: 'USER-001',
        status: 'PENDING_INSPECTION',
        submissionCount: 1,
        rejectionCount: 0,
        rescheduleCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = canReschedule(application);

      // Assert
      expect(result.allowed).toBe(true);
    });

    test('should BLOCK second reschedule (rescheduleCount = 1)', () => {
      // Arrange
      const application: Application = {
        id: 'APP-002',
        userId: 'USER-002',
        status: 'PENDING_INSPECTION',
        submissionCount: 1,
        rejectionCount: 0,
        rescheduleCount: 1, // Already rescheduled once
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = canReschedule(application);

      // Assert
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('ครบแล้ว');
    });

    test('should block if rescheduleCount >= 1', () => {
      // Arrange - Test edge cases
      const testCases = [
        { rescheduleCount: 1, expected: false },
        { rescheduleCount: 2, expected: false },
        { rescheduleCount: 5, expected: false },
        { rescheduleCount: 10, expected: false },
      ];

      testCases.forEach(({ rescheduleCount, expected }) => {
        const application: Application = {
          id: 'APP-TEST',
          userId: 'USER-TEST',
          status: 'PENDING_INSPECTION',
          submissionCount: 1,
          rejectionCount: 0,
          rescheduleCount,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Act
        const result = canReschedule(application);

        // Assert
        expect(result.allowed).toBe(expected);
      });
    });

    test('should only allow reschedule for PENDING_INSPECTION status', () => {
      // Arrange - Test various application statuses
      const validStatuses = ['PENDING_INSPECTION'];
      const invalidStatuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

      // Act & Assert - Valid statuses
      validStatuses.forEach(status => {
        const application: Application = {
          id: 'APP-VALID',
          userId: 'USER-001',
          status: status as ApplicationStatus,
          submissionCount: 1,
          rejectionCount: 0,
          rescheduleCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = canReschedule(application);
        expect(result.allowed).toBe(true);
      });

      // Act & Assert - Invalid statuses
      invalidStatuses.forEach(status => {
        const application: Application = {
          id: 'APP-INVALID',
          userId: 'USER-001',
          status: status as ApplicationStatus,
          submissionCount: 1,
          rejectionCount: 0,
          rescheduleCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = canReschedule(application);
        expect(result.allowed).toBe(false);
      });
    });
  });

  describe('recordReschedule', () => {
    test('should increment rescheduleCount by 1', () => {
      // Arrange
      const application: Application = {
        id: 'APP-003',
        userId: 'USER-003',
        status: 'PENDING_INSPECTION',
        submissionCount: 1,
        rejectionCount: 0,
        rescheduleCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = recordReschedule(application);

      // Assert
      expect(result.rescheduleCount).toBe(1);
      expect(result.updatedAt).not.toBe(application.updatedAt);
    });

    test('should preserve all other application properties', () => {
      // Arrange
      const application: Application = {
        id: 'APP-004',
        userId: 'USER-004',
        status: 'PENDING_INSPECTION',
        submissionCount: 3,
        rejectionCount: 2,
        rescheduleCount: 0,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
      };

      // Act
      const result = recordReschedule(application);

      // Assert
      expect(result.id).toBe(application.id);
      expect(result.userId).toBe(application.userId);
      expect(result.status).toBe(application.status);
      expect(result.submissionCount).toBe(application.submissionCount);
      expect(result.rejectionCount).toBe(application.rejectionCount);
      expect(result.createdAt).toBe(application.createdAt);
    });

    test('should update rescheduleCount from 0 to 1 (first reschedule)', () => {
      // Arrange
      const application: Application = {
        id: 'APP-005',
        userId: 'USER-005',
        status: 'PENDING_INSPECTION',
        submissionCount: 1,
        rejectionCount: 0,
        rescheduleCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = recordReschedule(application);

      // Assert
      expect(result.rescheduleCount).toBe(1);
    });
  });

  describe('getRemainingReschedules', () => {
    test('should return 1 for new application (rescheduleCount = 0)', () => {
      // Arrange
      const application: Application = {
        id: 'APP-006',
        userId: 'USER-006',
        status: 'PENDING_INSPECTION',
        submissionCount: 1,
        rejectionCount: 0,
        rescheduleCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = getRemainingReschedules(application);

      // Assert
      expect(result).toBe(1);
    });

    test('should return 0 after first reschedule (rescheduleCount = 1)', () => {
      // Arrange
      const application: Application = {
        id: 'APP-007',
        userId: 'USER-007',
        status: 'PENDING_INSPECTION',
        submissionCount: 1,
        rejectionCount: 0,
        rescheduleCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = getRemainingReschedules(application);

      // Assert
      expect(result).toBe(0);
    });

    test('should return 0 for any rescheduleCount >= 1', () => {
      // Arrange - Test various reschedule counts
      const testCases = [
        { rescheduleCount: 1, expected: 0 },
        { rescheduleCount: 2, expected: 0 },
        { rescheduleCount: 5, expected: 0 },
      ];

      testCases.forEach(({ rescheduleCount, expected }) => {
        const application: Application = {
          id: 'APP-TEST',
          userId: 'USER-TEST',
          status: 'PENDING_INSPECTION',
          submissionCount: 1,
          rejectionCount: 0,
          rescheduleCount,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Act
        const result = getRemainingReschedules(application);

        // Assert
        expect(result).toBe(expected);
      });
    });

    test('should never return negative values', () => {
      // Arrange
      const application: Application = {
        id: 'APP-008',
        userId: 'USER-008',
        status: 'PENDING_INSPECTION',
        submissionCount: 1,
        rejectionCount: 0,
        rescheduleCount: 5, // Exceeds limit
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = getRemainingReschedules(application);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBe(0);
    });
  });

  describe('Reschedule Limit Constant', () => {
    test('should enforce 1 reschedule limit', () => {
      // Arrange
      const application: Application = {
        id: 'APP-009',
        userId: 'USER-009',
        status: 'PENDING_INSPECTION',
        submissionCount: 1,
        rejectionCount: 0,
        rescheduleCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act - First reschedule
      const afterFirst = recordReschedule(application);
      const canRescheduleAgain = canReschedule(afterFirst);

      // Assert
      expect(afterFirst.rescheduleCount).toBe(1);
      expect(canRescheduleAgain.allowed).toBe(false);
    });
  });
});
