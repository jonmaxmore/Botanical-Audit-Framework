/**
 * Unit Tests: Revocation Wait Period (30 Days)
 *
 * Business Rule: After certificate revocation, farmer must wait 30 days before reapplying
 * Enforced to maintain GACP standards and prevent abuse
 *
 * @see TEST_CASES_DOCUMENTATION.md - Revocation Test Cases
 */

import {
  canApplyAfterRevocation,
  calculateRevocationWaitEndDate,
  getRemainingWaitDays,
} from '../business-logic';
import type { Certificate } from '../business-logic';

describe('Business Logic: Revocation Wait Period (30 Days)', () => {
  describe('canApplyAfterRevocation', () => {
    test('should BLOCK application during 30-day wait period', () => {
      // Arrange - Certificate revoked 10 days ago
      const certificate: Certificate = {
        id: 'CERT-001',
        applicationId: 'APP-001',
        userId: 'USER-001',
        certificateNumber: 'GACP-2025-001',
        status: 'REVOKED',
        issuedDate: new Date('2025-01-01'),
        expiryDate: new Date('2026-01-01'),
        revokedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date(),
      };

      // Act
      const result = canApplyAfterRevocation(certificate);

      // Assert
      expect(result).toBe(false);
    });

    test('should ALLOW application after 30-day wait period', () => {
      // Arrange - Certificate revoked 31 days ago
      const certificate: Certificate = {
        id: 'CERT-002',
        applicationId: 'APP-002',
        userId: 'USER-002',
        certificateNumber: 'GACP-2025-002',
        status: 'REVOKED',
        issuedDate: new Date('2024-12-01'),
        expiryDate: new Date('2025-12-01'),
        revokedDate: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date(),
      };

      // Act
      const result = canApplyAfterRevocation(certificate);

      // Assert
      expect(result).toBe(true);
    });

    test('should handle exactly 30 days (edge case)', () => {
      // Arrange - Certificate revoked exactly 30 days ago
      const certificate: Certificate = {
        id: 'CERT-003',
        applicationId: 'APP-003',
        userId: 'USER-003',
        certificateNumber: 'GACP-2025-003',
        status: 'REVOKED',
        issuedDate: new Date('2024-12-15'),
        expiryDate: new Date('2025-12-15'),
        revokedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Exactly 30 days ago
        createdAt: new Date('2024-12-15'),
        updatedAt: new Date(),
      };

      // Act
      const result = canApplyAfterRevocation(certificate);

      // Assert - At exactly 30 days, should be allowed (>= 30)
      expect(result).toBe(true);
    });

    test('should block at various times during wait period', () => {
      // Arrange - Test multiple days within 30-day period
      const testCases = [
        { daysAgo: 1, expected: false },
        { daysAgo: 7, expected: false },
        { daysAgo: 15, expected: false },
        { daysAgo: 20, expected: false },
        { daysAgo: 29, expected: false },
        { daysAgo: 30, expected: true },
        { daysAgo: 31, expected: true },
        { daysAgo: 60, expected: true },
      ];

      testCases.forEach(({ daysAgo, expected }) => {
        const certificate: Certificate = {
          id: `CERT-${daysAgo}`,
          applicationId: `APP-${daysAgo}`,
          userId: 'USER-TEST',
          certificateNumber: `GACP-2025-${daysAgo}`,
          status: 'REVOKED',
          issuedDate: new Date('2024-12-01'),
          expiryDate: new Date('2025-12-01'),
          revokedDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          createdAt: new Date('2024-12-01'),
          updatedAt: new Date(),
        };

        // Act
        const result = canApplyAfterRevocation(certificate);

        // Assert
        expect(result).toBe(expected);
      });
    });

    test('should return true if revokedDate is undefined', () => {
      // Arrange - Certificate not revoked (should allow application)
      const certificate: Certificate = {
        id: 'CERT-004',
        applicationId: 'APP-004',
        userId: 'USER-004',
        certificateNumber: 'GACP-2025-004',
        status: 'ACTIVE',
        issuedDate: new Date('2025-01-01'),
        expiryDate: new Date('2026-01-01'),
        revokedDate: undefined,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date(),
      };

      // Act
      const result = canApplyAfterRevocation(certificate);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('calculateRevocationWaitEndDate', () => {
    test('should calculate correct end date (30 days from revocation)', () => {
      // Arrange
      const revokedDate = new Date('2025-01-01T00:00:00Z');

      // Act
      const result = calculateRevocationWaitEndDate(revokedDate);

      // Assert
      const expectedEndDate = new Date('2025-01-31T00:00:00Z');
      expect(result.toISOString().split('T')[0]).toBe(expectedEndDate.toISOString().split('T')[0]);
    });

    test('should add exactly 30 days to revocation date', () => {
      // Arrange
      const revokedDate = new Date('2025-02-15T12:00:00Z');

      // Act
      const result = calculateRevocationWaitEndDate(revokedDate);

      // Assert
      const daysDifference = Math.floor(
        (result.getTime() - revokedDate.getTime()) / (24 * 60 * 60 * 1000),
      );
      expect(daysDifference).toBe(30);
    });

    test('should handle month boundaries correctly', () => {
      // Arrange - Test various month boundaries
      const testCases = [
        { revoked: new Date('2025-01-15'), expectedDay: 14 }, // Jan 15 + 30 = Feb 14
        { revoked: new Date('2025-03-01'), expectedDay: 31 }, // Mar 1 + 30 = Mar 31
        { revoked: new Date('2025-12-20'), expectedDay: 19 }, // Dec 20 + 30 = Jan 19
      ];

      testCases.forEach(({ revoked, expectedDay }) => {
        // Act
        const result = calculateRevocationWaitEndDate(revoked);

        // Assert
        expect(result.getDate()).toBe(expectedDay);
      });
    });

    test('should handle leap year correctly', () => {
      // Arrange - 2024 is a leap year
      const revokedDate = new Date('2024-02-01T00:00:00Z');

      // Act
      const result = calculateRevocationWaitEndDate(revokedDate);

      // Assert - Should account for Feb 29
      expect(result.toISOString().split('T')[0]).toBe('2024-03-02');
    });
  });

  describe('getRemainingWaitDays', () => {
    test('should return 0 if wait period has passed', () => {
      // Arrange - Revoked 31 days ago
      const certificate: Certificate = {
        id: 'CERT-005',
        applicationId: 'APP-005',
        userId: 'USER-005',
        certificateNumber: 'GACP-2025-005',
        status: 'REVOKED',
        issuedDate: new Date('2024-12-01'),
        expiryDate: new Date('2025-12-01'),
        revokedDate: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date(),
      };

      // Act
      const result = getRemainingWaitDays(certificate);

      // Assert
      expect(result).toBe(0);
    });

    test('should calculate remaining days correctly during wait period', () => {
      // Arrange - Revoked 10 days ago (20 days remaining)
      const certificate: Certificate = {
        id: 'CERT-006',
        applicationId: 'APP-006',
        userId: 'USER-006',
        certificateNumber: 'GACP-2025-006',
        status: 'REVOKED',
        issuedDate: new Date('2025-01-01'),
        expiryDate: new Date('2026-01-01'),
        revokedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date(),
      };

      // Act
      const result = getRemainingWaitDays(certificate);

      // Assert - Should be approximately 20 days
      expect(result).toBeGreaterThanOrEqual(19);
      expect(result).toBeLessThanOrEqual(21);
    });

    test('should return 0 if revokedDate is undefined', () => {
      // Arrange
      const certificate: Certificate = {
        id: 'CERT-007',
        applicationId: 'APP-007',
        userId: 'USER-007',
        certificateNumber: 'GACP-2025-007',
        status: 'ACTIVE',
        issuedDate: new Date('2025-01-01'),
        expiryDate: new Date('2026-01-01'),
        revokedDate: undefined,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date(),
      };

      // Act
      const result = getRemainingWaitDays(certificate);

      // Assert
      expect(result).toBe(0);
    });

    test('should never return negative values', () => {
      // Arrange - Revoked 60 days ago
      const certificate: Certificate = {
        id: 'CERT-008',
        applicationId: 'APP-008',
        userId: 'USER-008',
        certificateNumber: 'GACP-2025-008',
        status: 'REVOKED',
        issuedDate: new Date('2024-11-01'),
        expiryDate: new Date('2025-11-01'),
        revokedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date(),
      };

      // Act
      const result = getRemainingWaitDays(certificate);

      // Assert
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Revocation Wait Period Constant', () => {
    test('should enforce 30-day wait period', () => {
      // Arrange - Revoked exactly 30 days ago
      const revokedDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Act
      const endDate = calculateRevocationWaitEndDate(revokedDate);
      const daysDiff = Math.floor(
        (endDate.getTime() - revokedDate.getTime()) / (24 * 60 * 60 * 1000),
      );

      // Assert
      expect(daysDiff).toBe(30);
    });
  });
});
