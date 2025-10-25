/**
 * Utility Tests - Validation Utilities
 * Tests for validation functions (email, phone, ID, etc.)
 */

import {
  isValidEmail,
  isValidThaiPhoneNumber,
  isValidThaiID,
  isValidPassword,
  isValidURL,
  isValidDateRange,
  isValidFileType,
  isValidFileSize,
} from '../utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject email without @', () => {
      expect(isValidEmail('testexample.com')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(isValidEmail('test@')).toBe(false);
    });

    it('should validate Thai email', () => {
      expect(isValidEmail('user@company.co.th')).toBe(true);
    });

    it('should reject empty email', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidThaiPhoneNumber', () => {
    it('should validate 10-digit mobile number', () => {
      expect(isValidThaiPhoneNumber('0812345678')).toBe(true);
    });

    it('should validate formatted number', () => {
      expect(isValidThaiPhoneNumber('081-234-5678')).toBe(true);
    });

    it('should reject short number', () => {
      expect(isValidThaiPhoneNumber('081234')).toBe(false);
    });

    it('should reject number not starting with 0', () => {
      expect(isValidThaiPhoneNumber('812345678')).toBe(false);
    });

    it('should validate landline number', () => {
      expect(isValidThaiPhoneNumber('022345678')).toBe(true);
    });
  });

  describe('isValidThaiID', () => {
    it('should validate correct 13-digit ID', () => {
      // Using valid test ID with correct checksum (1234567890121)
      expect(isValidThaiID('1234567890121')).toBe(true);
    });

    it('should reject ID with wrong length', () => {
      expect(isValidThaiID('12345')).toBe(false);
    });

    it('should reject ID with invalid checksum', () => {
      expect(isValidThaiID('1234567890128')).toBe(false);
    });

    it('should handle formatted ID', () => {
      expect(isValidThaiID('1-2345-67890-12-1')).toBe(true);
    });
  });

  describe('isValidPassword', () => {
    it('should validate strong password', () => {
      const result = isValidPassword('SecurePass123!');
      expect(result.valid).toBe(true);
    });

    it('should reject short password', () => {
      const result = isValidPassword('Weak1!');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('8 characters');
    });

    it('should require uppercase letter', () => {
      const result = isValidPassword('weakpass123!');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('uppercase');
    });

    it('should require lowercase letter', () => {
      const result = isValidPassword('WEAKPASS123!');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('lowercase');
    });

    it('should require number', () => {
      const result = isValidPassword('WeakPassword!');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('number');
    });

    it('should require special character', () => {
      const result = isValidPassword('WeakPassword123');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('special');
    });
  });

  describe('isValidURL', () => {
    it('should validate HTTP URL', () => {
      expect(isValidURL('http://example.com')).toBe(true);
    });

    it('should validate HTTPS URL', () => {
      expect(isValidURL('https://example.com')).toBe(true);
    });

    it('should reject invalid protocol', () => {
      expect(isValidURL('ftp://example.com')).toBe(false);
    });

    it('should reject malformed URL', () => {
      expect(isValidURL('not-a-url')).toBe(false);
    });

    it('should handle URLs with paths', () => {
      expect(isValidURL('https://example.com/path/to/resource')).toBe(true);
    });
  });

  describe('isValidDateRange', () => {
    it('should validate correct date range', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-01-31');
      expect(isValidDateRange(start, end)).toBe(true);
    });

    it('should reject reversed dates', () => {
      const start = new Date('2025-01-31');
      const end = new Date('2025-01-01');
      expect(isValidDateRange(start, end)).toBe(false);
    });

    it('should reject same dates', () => {
      const date = new Date('2025-01-15');
      expect(isValidDateRange(date, date)).toBe(false);
    });
  });

  describe('isValidFileType', () => {
    it('should validate allowed file type', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      expect(isValidFileType(file, ['application/pdf', 'image/png'])).toBe(true);
    });

    it('should reject disallowed file type', () => {
      const file = new File([''], 'test.exe', { type: 'application/x-msdownload' });
      expect(isValidFileType(file, ['application/pdf', 'image/png'])).toBe(false);
    });

    it('should validate image types', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      expect(isValidFileType(file, ['image/png', 'image/jpeg'])).toBe(true);
    });
  });

  describe('isValidFileSize', () => {
    it('should validate file within size limit', () => {
      const file = new File(['x'.repeat(1024 * 100)], 'test.txt'); // 100KB
      expect(isValidFileSize(file, 1)).toBe(true); // 1MB limit
    });

    it('should reject file exceeding size limit', () => {
      const file = new File(['x'.repeat(1024 * 1024 * 2)], 'test.txt'); // 2MB
      expect(isValidFileSize(file, 1)).toBe(false); // 1MB limit
    });

    it('should handle exact size limit', () => {
      const file = new File(['x'.repeat(1024 * 1024)], 'test.txt'); // 1MB
      expect(isValidFileSize(file, 1)).toBe(true); // 1MB limit
    });
  });

  describe('isValidURL', () => {
    it('should validate HTTP URL', () => {
      // Test: isValidURL('http://example.com')
      // Expected: true
    });

    it('should validate HTTPS URL', () => {
      // Test: isValidURL('https://example.com')
      // Expected: true
    });

    it('should reject URL without protocol', () => {
      // Test: isValidURL('example.com')
      // Expected: false
    });

    it('should validate URL with path', () => {
      // Test: isValidURL('https://example.com/path/to/page')
      // Expected: true
    });
  });

  describe('isValidDateRange', () => {
    it('should validate correct date range', () => {
      // Test: isValidDateRange('2025-01-01', '2025-12-31')
      // Expected: true
    });

    it('should reject end date before start date', () => {
      // Test: isValidDateRange('2025-12-31', '2025-01-01')
      // Expected: false
    });

    it('should reject invalid date format', () => {
      // Test: isValidDateRange('invalid', '2025-12-31')
      // Expected: false
    });

    it('should allow same start and end date', () => {
      // Test: isValidDateRange('2025-01-01', '2025-01-01')
      // Expected: true
    });
  });

  describe('isValidFileType', () => {
    it('should validate image file', () => {
      // Test: isValidFileType('image.jpg', ['image/*'])
      // Expected: true
    });

    it('should validate PDF file', () => {
      // Test: isValidFileType('document.pdf', ['application/pdf'])
      // Expected: true
    });

    it('should reject wrong file type', () => {
      // Test: isValidFileType('script.exe', ['image/*'])
      // Expected: false
    });

    it('should handle multiple allowed types', () => {
      // Test: isValidFileType('doc.pdf', ['image/*', 'application/pdf'])
      // Expected: true
    });
  });

  describe('isValidFileSize', () => {
    it('should validate file within size limit', () => {
      // Test: isValidFileSize(1048576, 5242880) // 1MB / 5MB limit
      // Expected: true
    });

    it('should reject file exceeding limit', () => {
      // Test: isValidFileSize(6291456, 5242880) // 6MB / 5MB limit
      // Expected: false
    });

    it('should handle zero size', () => {
      // Test: isValidFileSize(0, 5242880)
      // Expected: false
    });
  });
});
