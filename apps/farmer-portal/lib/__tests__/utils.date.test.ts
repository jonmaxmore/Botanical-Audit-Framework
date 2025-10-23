/**
 * Utility Tests - Date Utilities
 * Tests for date manipulation and calculation functions
 */

describe('Date Utilities', () => {
  describe('addDays', () => {
    it('should add days to date', () => {
      const date = new Date('2025-01-15');
      // Test: addDays(date, 5)
      // Expected: Date('2025-01-20')
    });

    it('should handle negative days (subtract)', () => {
      const date = new Date('2025-01-15');
      // Test: addDays(date, -5)
      // Expected: Date('2025-01-10')
    });

    it('should handle month rollover', () => {
      const date = new Date('2025-01-30');
      // Test: addDays(date, 5)
      // Expected: Date('2025-02-04')
    });
  });

  describe('getDaysBetween', () => {
    it('should calculate days between dates', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-31');
      // Test: getDaysBetween(start, end)
      // Expected: 30
    });

    it('should return negative for reversed dates', () => {
      const start = new Date('2025-01-31');
      const end = new Date('2025-01-01');
      // Test: getDaysBetween(start, end)
      // Expected: -30
    });

    it('should return 0 for same date', () => {
      const date = new Date('2025-01-15');
      // Test: getDaysBetween(date, date)
      // Expected: 0
    });
  });

  describe('isExpired', () => {
    it('should return true for past date', () => {
      const pastDate = new Date('2024-01-01');
      // Test: isExpired(pastDate)
      // Expected: true
    });

    it('should return false for future date', () => {
      const futureDate = new Date('2026-01-01');
      // Test: isExpired(futureDate)
      // Expected: false
    });

    it('should handle dates with time', () => {
      const now = new Date();
      const almostExpired = new Date(now.getTime() + 1000);
      // Test: isExpired(almostExpired)
      // Expected: false
    });
  });

  describe('getDaysUntilExpiry', () => {
    it('should calculate days until expiry', () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      // Test: getDaysUntilExpiry(expiryDate)
      // Expected: 30
    });

    it('should return 0 for expired dates', () => {
      const pastDate = new Date('2024-01-01');
      // Test: getDaysUntilExpiry(pastDate)
      // Expected: 0
    });

    it('should return negative for past dates (alternative)', () => {
      // Test: getDaysUntilExpiry(pastDate, { allowNegative: true })
      // Expected: < 0
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format minutes remaining', () => {
      // Test: formatTimeRemaining(900) // 15 minutes
      // Expected: "15:00"
    });

    it('should format hours and minutes', () => {
      // Test: formatTimeRemaining(5400) // 1.5 hours
      // Expected: "1:30:00"
    });

    it('should handle zero', () => {
      // Test: formatTimeRemaining(0)
      // Expected: "00:00"
    });

    it('should pad single digits', () => {
      // Test: formatTimeRemaining(65) // 1 minute 5 seconds
      // Expected: "01:05"
    });
  });

  describe('isWeekend', () => {
    it('should return true for Saturday', () => {
      const saturday = new Date('2025-01-18'); // Saturday
      // Test: isWeekend(saturday)
      // Expected: true
    });

    it('should return true for Sunday', () => {
      const sunday = new Date('2025-01-19'); // Sunday
      // Test: isWeekend(sunday)
      // Expected: true
    });

    it('should return false for weekday', () => {
      const monday = new Date('2025-01-20'); // Monday
      // Test: isWeekend(monday)
      // Expected: false
    });
  });

  describe('getNextBusinessDay', () => {
    it('should return next day if weekday', () => {
      const monday = new Date('2025-01-20');
      // Test: getNextBusinessDay(monday)
      // Expected: Tuesday (2025-01-21)
    });

    it('should skip weekend', () => {
      const friday = new Date('2025-01-17');
      // Test: getNextBusinessDay(friday)
      // Expected: Monday (2025-01-20) - skip Sat, Sun
    });

    it('should handle holidays', () => {
      const holidays = [new Date('2025-01-21')];
      const monday = new Date('2025-01-20');
      // Test: getNextBusinessDay(monday, holidays)
      // Expected: Wednesday (2025-01-22) - skip holiday
    });
  });

  describe('toThaiYear', () => {
    it('should convert to Buddhist year', () => {
      const date = new Date('2025-01-15');
      // Test: toThaiYear(date)
      // Expected: 2568
    });

    it('should handle different years', () => {
      const date = new Date('2000-01-01');
      // Test: toThaiYear(date)
      // Expected: 2543
    });
  });

  describe('startOfDay', () => {
    it('should set time to 00:00:00', () => {
      const date = new Date('2025-01-15 14:30:45');
      // Test: startOfDay(date)
      // Expected: Date('2025-01-15 00:00:00')
    });
  });

  describe('endOfDay', () => {
    it('should set time to 23:59:59', () => {
      const date = new Date('2025-01-15 14:30:45');
      // Test: endOfDay(date)
      // Expected: Date('2025-01-15 23:59:59')
    });
  });
});
