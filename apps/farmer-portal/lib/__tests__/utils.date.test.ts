/**
 * Utility Tests - Date Utilities
 * Tests for date manipulation and calculation functions
 */

import {
  addDays,
  getDaysBetween,
  isExpired,
  getDaysUntilExpiry,
  formatTimeRemaining,
  isWeekend,
  getNextBusinessDay,
  toThaiYear,
  startOfDay,
  endOfDay
} from '../utils/date';

describe('Date Utilities', () => {
  describe('addDays', () => {
    it('should add days to date', () => {
      const date = new Date('2025-01-15');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(20);
      expect(result.getMonth()).toBe(0); // January
    });

    it('should handle negative days (subtract)', () => {
      const date = new Date('2025-01-15');
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(10);
    });

    it('should handle month rollover', () => {
      const date = new Date('2025-01-30');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(4);
      expect(result.getMonth()).toBe(1); // February
    });

    it('should handle year rollover', () => {
      const date = new Date('2024-12-30');
      const result = addDays(date, 5);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January
    });
  });

  describe('getDaysBetween', () => {
    it('should calculate days between dates', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-31');
      const days = getDaysBetween(start, end);
      expect(days).toBe(30);
    });

    it('should return negative for reversed dates', () => {
      const start = new Date('2025-01-31');
      const end = new Date('2025-01-01');
      const days = getDaysBetween(start, end);
      expect(days).toBe(-30);
    });

    it('should return 0 for same date', () => {
      const date = new Date('2025-01-15');
      const days = getDaysBetween(date, date);
      expect(days).toBe(0);
    });

    it('should handle dates across years', () => {
      const start = new Date('2024-12-25');
      const end = new Date('2025-01-05');
      const days = getDaysBetween(start, end);
      expect(days).toBe(11);
    });
  });

  describe('isExpired', () => {
    it('should return true for past date', () => {
      const pastDate = new Date('2024-01-01');
      expect(isExpired(pastDate)).toBe(true);
    });

    it('should return false for future date', () => {
      const futureDate = new Date('2026-01-01');
      expect(isExpired(futureDate)).toBe(false);
    });

    it('should handle dates with time', () => {
      const now = new Date();
      const almostExpired = new Date(now.getTime() + 1000);
      expect(isExpired(almostExpired)).toBe(false);
    });

    it('should handle current date', () => {
      const now = new Date();
      // Current time should not be expired
      expect(isExpired(now)).toBe(false);
    });
  });

  describe('getDaysUntilExpiry', () => {
    it('should calculate days until expiry', () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      const days = getDaysUntilExpiry(expiryDate);
      expect(days).toBe(30);
    });

    it('should return 0 for expired dates', () => {
      const pastDate = new Date('2024-01-01');
      const days = getDaysUntilExpiry(pastDate);
      expect(days).toBe(0);
    });

    it('should handle same day expiry', () => {
      const today = new Date();
      const days = getDaysUntilExpiry(today);
      expect(days).toBe(0);
    });

    it('should round down partial days', () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      expiryDate.setHours(23, 59, 59);
      const days = getDaysUntilExpiry(expiryDate);
      expect(days).toBeGreaterThanOrEqual(6);
      expect(days).toBeLessThanOrEqual(7);
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format minutes remaining', () => {
      const result = formatTimeRemaining(900); // 15 minutes
      expect(result).toBe('15:00');
    });

    it('should format hours and minutes', () => {
      const result = formatTimeRemaining(5400); // 1.5 hours
      expect(result).toBe('1:30:00');
    });

    it('should handle zero', () => {
      const result = formatTimeRemaining(0);
      expect(result).toBe('00:00');
    });

    it('should pad single digits', () => {
      const result = formatTimeRemaining(65); // 1 minute 5 seconds
      expect(result).toBe('01:05');
    });

    it('should handle hours correctly', () => {
      const result = formatTimeRemaining(3661); // 1 hour 1 minute 1 second
      expect(result).toBe('1:01:01');
    });
  });

  describe('isWeekend', () => {
    it('should return true for Saturday', () => {
      const saturday = new Date('2025-01-18'); // Saturday
      expect(isWeekend(saturday)).toBe(true);
    });

    it('should return true for Sunday', () => {
      const sunday = new Date('2025-01-19'); // Sunday
      expect(isWeekend(sunday)).toBe(true);
    });

    it('should return false for weekday', () => {
      const monday = new Date('2025-01-20'); // Monday
      expect(isWeekend(monday)).toBe(false);
    });

    it('should return false for Friday', () => {
      const friday = new Date('2025-01-17'); // Friday
      expect(isWeekend(friday)).toBe(false);
    });
  });

  describe('getNextBusinessDay', () => {
    it('should return next day if weekday', () => {
      const monday = new Date('2025-01-20');
      const result = getNextBusinessDay(monday);
      expect(result.getDate()).toBe(21); // Tuesday
    });

    it('should skip weekend', () => {
      const friday = new Date('2025-01-17');
      const result = getNextBusinessDay(friday);
      expect(result.getDate()).toBe(20); // Monday (skip Sat, Sun)
      expect(result.getDay()).toBe(1); // Monday
    });

    it('should handle holidays', () => {
      const holidays = [new Date('2025-01-21')];
      const monday = new Date('2025-01-20');
      const result = getNextBusinessDay(monday, holidays);
      expect(result.getDate()).toBe(22); // Wednesday (skip holiday)
    });

    it('should handle multiple weekends', () => {
      const saturday = new Date('2025-01-18');
      const result = getNextBusinessDay(saturday);
      expect(result.getDate()).toBe(20); // Monday
      expect(result.getDay()).toBe(1);
    });
  });

  describe('toThaiYear', () => {
    it('should convert to Buddhist year', () => {
      const date = new Date('2025-01-15');
      const year = toThaiYear(date);
      expect(year).toBe(2568); // 2025 + 543
    });

    it('should handle different years', () => {
      const date = new Date('2000-01-01');
      const year = toThaiYear(date);
      expect(year).toBe(2543); // 2000 + 543
    });

    it('should handle leap year', () => {
      const date = new Date('2024-02-29');
      const year = toThaiYear(date);
      expect(year).toBe(2567); // 2024 + 543
    });
  });

  describe('startOfDay', () => {
    it('should set time to 00:00:00', () => {
      const date = new Date('2025-01-15T14:30:45');
      const result = startOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should preserve the date', () => {
      const date = new Date('2025-01-15T23:59:59');
      const result = startOfDay(date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });
  });

  describe('endOfDay', () => {
    it('should set time to 23:59:59', () => {
      const date = new Date('2025-01-15T14:30:45');
      const result = endOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    it('should preserve the date', () => {
      const date = new Date('2025-01-15T00:00:00');
      const result = endOfDay(date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });
  });
});
