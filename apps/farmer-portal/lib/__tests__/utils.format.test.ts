/**
 * Utility Tests - Format Utilities
 * Tests for formatting functions (dates, currency, numbers)
 */

import {
  formatCurrency,
  formatDate,
  formatPhoneNumber,
  formatDuration,
  formatFileSize,
  formatPercentage,
  truncateText,
} from '../utils/format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('should format Thai Baht correctly', () => {
      expect(formatCurrency(5000)).toBe('฿5,000');
    });

    it('should handle decimal places', () => {
      expect(formatCurrency(1234.56)).toBe('฿1,234.56');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('฿0');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('฿1,000,000');
    });

    it('should handle negative numbers', () => {
      const result = formatCurrency(-500);
      expect(result).toContain('500');
    });
  });

  describe('formatDate', () => {
    it('should format date in Thai format', () => {
      const date = new Date('2025-01-15');
      const result = formatDate(date);
      expect(result).toContain('15');
      expect(result).toContain('ม.ค.');
      expect(result).toContain('2568'); // Buddhist year
    });

    it('should handle different formats', () => {
      const date = new Date('2025-01-15');
      const fullFormat = formatDate(date, 'full');
      expect(fullFormat).toContain('2568');
    });

    it('should handle short format', () => {
      const date = new Date('2025-01-15');
      const shortFormat = formatDate(date, 'short');
      expect(shortFormat).toContain('/');
    });

    it('should handle time inclusion', () => {
      const date = new Date('2025-01-15T14:30:00');
      const result = formatDate(date, 'medium');
      expect(result).toBeTruthy();
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format Thai mobile number', () => {
      expect(formatPhoneNumber('0812345678')).toBe('081-234-5678');
    });

    it('should handle landline numbers', () => {
      expect(formatPhoneNumber('022345678')).toBe('02-234-5678');
    });

    it('should remove non-numeric characters', () => {
      expect(formatPhoneNumber('081-234-5678')).toBe('081-234-5678');
    });
  });

  describe('formatDuration', () => {
    it('should format duration in minutes', () => {
      expect(formatDuration(900)).toBe('15 นาที');
    });

    it('should format duration in hours', () => {
      expect(formatDuration(3600)).toBe('1 ชั่วโมง');
    });

    it('should format mixed hours and minutes', () => {
      expect(formatDuration(5400)).toBe('1 ชั่วโมง 30 นาที');
    });

    it('should handle days', () => {
      expect(formatDuration(86400 * 3)).toBe('3 วัน');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('should handle decimal places', () => {
      const result = formatFileSize(1536000);
      expect(result).toContain('MB');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage', () => {
      expect(formatPercentage(0.85)).toBe('85%');
    });

    it('should handle decimal places', () => {
      expect(formatPercentage(0.8567, 2)).toBe('85.67%');
    });

    it('should handle 100%', () => {
      expect(formatPercentage(1)).toBe('100%');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('This is a very long text', 10)).toBe('This is...');
    });

    it('should not truncate short text', () => {
      expect(truncateText('Short', 10)).toBe('Short');
    });

    it('should handle custom ellipsis', () => {
      expect(truncateText('Long text here', 9, '...')).toBe('Long t...');
    });
  });
});
