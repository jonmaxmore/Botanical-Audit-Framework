/**
 * Helper Functions Tests
 * Comprehensive tests for utility functions
 */

import {
  formatDateThai,
  formatDateShortThai,
  formatNumber,
  getDaysUntilExpiry,
  isExpiringSoon,
  isExpired,
  validateNationalId,
  validatePostalCode,
  truncateText,
  generateCertificateNumber,
  parseCertificateNumber,
  getStatusColor,
  getStatusLabelThai,
  debounce,
  deepClone,
  isEmpty
} from '../helpers';

describe('Helper Functions', () => {
  describe('Date Formatting', () => {
    it('should format date to Thai locale', () => {
      const date = new Date('2025-10-25');
      const result = formatDateThai(date);
      expect(result).toContain('2568'); // Thai year
    });

    it('should format string date to Thai locale', () => {
      const result = formatDateThai('2025-10-25');
      expect(result).toContain('2568');
    });

    it('should format date to short Thai format', () => {
      const date = new Date('2025-10-25');
      const result = formatDateShortThai(date);
      expect(result).toBeTruthy();
    });

    it('should format string date to short Thai format', () => {
      const result = formatDateShortThai('2025-10-25');
      expect(result).toBeTruthy();
    });
  });

  describe('Number Formatting', () => {
    it('should format number with default 2 decimals', () => {
      const result = formatNumber(1234.5);
      expect(result).toContain('1,234.50');
    });

    it('should format number with custom decimals', () => {
      const result = formatNumber(1234.567, 3);
      expect(result).toContain('1,234.567');
    });

    it('should format integer', () => {
      const result = formatNumber(1000, 0);
      expect(result).toContain('1,000');
    });
  });

  describe('Expiry Calculations', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-25'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate days until expiry (future date)', () => {
      const expiryDate = '2025-11-25';
      const result = getDaysUntilExpiry(expiryDate);
      expect(result).toBeGreaterThan(0);
    });

    it('should calculate days until expiry (past date)', () => {
      const expiryDate = '2025-09-25';
      const result = getDaysUntilExpiry(expiryDate);
      expect(result).toBeLessThan(0);
    });

    it('should work with Date objects', () => {
      const expiryDate = new Date('2025-11-25');
      const result = getDaysUntilExpiry(expiryDate);
      expect(result).toBeGreaterThan(0);
    });

    it('should detect expiring soon (within 30 days)', () => {
      const expiryDate = '2025-11-15'; // 21 days from now
      const result = isExpiringSoon(expiryDate);
      expect(result).toBe(true);
    });

    it('should not detect expiring soon (more than 30 days)', () => {
      const expiryDate = '2025-12-25'; // 61 days from now
      const result = isExpiringSoon(expiryDate);
      expect(result).toBe(false);
    });

    it('should not detect expiring soon (already expired)', () => {
      const expiryDate = '2025-09-25';
      const result = isExpiringSoon(expiryDate);
      expect(result).toBe(false);
    });

    it('should detect expired certificate', () => {
      const expiryDate = '2025-09-25';
      const result = isExpired(expiryDate);
      expect(result).toBe(true);
    });

    it('should not detect expired for future date', () => {
      const expiryDate = '2025-11-25';
      const result = isExpired(expiryDate);
      expect(result).toBe(false);
    });
  });

  describe('Validation Functions', () => {
    describe('validateNationalId', () => {
      it('should validate correct Thai National ID', () => {
        // Valid ID: 1101701544722 (calculated checksum = 2)
        const result = validateNationalId('1101701544722');
        expect(result).toBe(true);
      });

      it('should validate another correct Thai National ID', () => {
        // Valid ID: 1234567890121 (calculated checksum = 1)
        const result = validateNationalId('1234567890121');
        expect(result).toBe(true);
      });

      it('should reject ID with wrong length', () => {
        expect(validateNationalId('12345')).toBe(false);
        expect(validateNationalId('12345678901234')).toBe(false);
      });

      it('should reject non-numeric ID', () => {
        expect(validateNationalId('123456789012A')).toBe(false);
      });

      it('should reject ID with invalid checksum', () => {
        const result = validateNationalId('1234567890124');
        expect(result).toBe(false);
      });

      it('should handle empty string', () => {
        expect(validateNationalId('')).toBe(false);
      });
    });

    describe('validatePostalCode', () => {
      it('should validate correct postal code', () => {
        expect(validatePostalCode('10100')).toBe(true);
        expect(validatePostalCode('50000')).toBe(true);
      });

      it('should reject wrong length', () => {
        expect(validatePostalCode('101')).toBe(false);
        expect(validatePostalCode('1010000')).toBe(false);
      });

      it('should reject non-numeric', () => {
        expect(validatePostalCode('1010A')).toBe(false);
      });

      it('should handle empty string', () => {
        expect(validatePostalCode('')).toBe(false);
      });
    });
  });

  describe('Text Utilities', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      const result = truncateText(text, 20);
      expect(result).toBe('This is a very long ...');
      expect(result.length).toBe(23); // 20 + '...'
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      const result = truncateText(text, 20);
      expect(result).toBe('Short text');
    });

    it('should handle exact length', () => {
      const text = '12345678901234567890';
      const result = truncateText(text, 20);
      expect(result).toBe(text);
    });
  });

  describe('Certificate Number', () => {
    it('should generate certificate number', () => {
      const result = generateCertificateNumber('GACP', 2025, 1);
      expect(result).toBe('GACP-2025-0001');
    });

    it('should pad sequence number', () => {
      const result = generateCertificateNumber('GAP', 2025, 42);
      expect(result).toBe('GAP-2025-0042');
    });

    it('should handle large sequence', () => {
      const result = generateCertificateNumber('GACP', 2025, 9999);
      expect(result).toBe('GACP-2025-9999');
    });

    it('should parse valid certificate number', () => {
      const result = parseCertificateNumber('GACP-2025-0001');
      expect(result).toEqual({
        standard: 'GACP',
        year: 2025,
        sequence: 1
      });
    });

    it('should parse certificate with large sequence', () => {
      const result = parseCertificateNumber('GAP-2024-9999');
      expect(result).toEqual({
        standard: 'GAP',
        year: 2024,
        sequence: 9999
      });
    });

    it('should return null for invalid format', () => {
      expect(parseCertificateNumber('INVALID')).toBeNull();
      expect(parseCertificateNumber('GACP-2025')).toBeNull();
      expect(parseCertificateNumber('GACP-25-0001')).toBeNull();
    });
  });

  describe('Status Utilities', () => {
    it('should return correct colors for each status', () => {
      expect(getStatusColor('approved')).toBe('#4caf50');
      expect(getStatusColor('pending')).toBe('#ff9800');
      expect(getStatusColor('rejected')).toBe('#f44336');
      expect(getStatusColor('expired')).toBe('#9e9e9e');
      expect(getStatusColor('revoked')).toBe('#f44336');
    });

    it('should return default color for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('#2196f3');
    });

    it('should return Thai labels for each status', () => {
      expect(getStatusLabelThai('approved')).toBe('อนุมัติแล้ว');
      expect(getStatusLabelThai('pending')).toBe('รออนุมัติ');
      expect(getStatusLabelThai('rejected')).toBe('ปฏิเสธ');
      expect(getStatusLabelThai('expired')).toBe('หมดอายุ');
      expect(getStatusLabelThai('revoked')).toBe('ยกเลิก');
    });

    it('should return status itself for unknown status', () => {
      expect(getStatusLabelThai('custom-status')).toBe('custom-status');
    });
  });

  describe('Utility Functions', () => {
    describe('debounce', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should debounce function calls', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 1000);

        debouncedFn();
        debouncedFn();
        debouncedFn();

        expect(mockFn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1000);

        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should pass arguments to debounced function', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 1000);

        debouncedFn('arg1', 'arg2');

        jest.advanceTimersByTime(1000);

        expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      });

      it('should reset timer on subsequent calls', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 1000);

        debouncedFn();
        jest.advanceTimersByTime(500);
        debouncedFn();
        jest.advanceTimersByTime(500);

        expect(mockFn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(500);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });

    describe('deepClone', () => {
      it('should clone simple object', () => {
        const obj = { a: 1, b: 2 };
        const cloned = deepClone(obj);

        expect(cloned).toEqual(obj);
        expect(cloned).not.toBe(obj);
      });

      it('should clone nested object', () => {
        const obj = { a: 1, b: { c: 2, d: { e: 3 } } };
        const cloned = deepClone(obj);

        expect(cloned).toEqual(obj);
        expect(cloned.b).not.toBe(obj.b);
      });

      it('should clone array', () => {
        const arr = [1, 2, [3, 4]];
        const cloned = deepClone(arr);

        expect(cloned).toEqual(arr);
        expect(cloned).not.toBe(arr);
      });

      it('should modify cloned object without affecting original', () => {
        const obj = { a: 1, b: { c: 2 } };
        const cloned = deepClone(obj);

        cloned.b.c = 999;

        expect(obj.b.c).toBe(2);
        expect(cloned.b.c).toBe(999);
      });
    });

    describe('isEmpty', () => {
      it('should detect null and undefined', () => {
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty(undefined)).toBe(true);
      });

      it('should detect empty string', () => {
        expect(isEmpty('')).toBe(true);
        expect(isEmpty('  ')).toBe(true);
      });

      it('should detect non-empty string', () => {
        expect(isEmpty('hello')).toBe(false);
        expect(isEmpty(' hello ')).toBe(false);
      });

      it('should detect empty array', () => {
        expect(isEmpty([])).toBe(true);
      });

      it('should detect non-empty array', () => {
        expect(isEmpty([1, 2, 3])).toBe(false);
      });

      it('should detect empty object', () => {
        expect(isEmpty({})).toBe(true);
      });

      it('should detect non-empty object', () => {
        expect(isEmpty({ a: 1 })).toBe(false);
      });

      it('should handle numbers and booleans', () => {
        expect(isEmpty(0)).toBe(false);
        expect(isEmpty(false)).toBe(false);
      });
    });
  });
});
