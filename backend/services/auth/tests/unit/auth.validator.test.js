/**
 * Authentication Validator Unit Tests
 *
 * Tests for Joi validation schemas.
 *
 * Coverage:
 * - Registration validation
 * - Login validation
 * - Thai ID validation (Mod 11)
 * - Password complexity
 * - Thai address validation
 * - Error messages
 *
 * @module tests/unit/auth.validator.test
 */

const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateThaiID,
} = require('../../validators/auth.validator');

describe('Authentication Validator', () => {
  describe('validateThaiID', () => {
    test('should validate correct Thai ID with Mod 11 checksum', () => {
      const validIds = [
        '1234567890121', // checksum = 1
        '3101234567893', // checksum = 3
      ];

      validIds.forEach(id => {
        const result = validateThaiID(id);
        expect(result).toBe(true);
      });
    });

    test('should reject Thai ID with incorrect checksum', () => {
      const invalidIds = [
        '1234567890123', // Wrong checksum
        '1111111111111', // Wrong checksum
        '9999999999999', // Wrong checksum
      ];

      invalidIds.forEach(id => {
        const result = validateThaiID(id);
        expect(result).toBe(false);
      });
    });

    test('should reject Thai ID with wrong length', () => {
      expect(validateThaiID('123456789012')).toBe(false); // 12 digits
      expect(validateThaiID('12345678901234')).toBe(false); // 14 digits
    });

    test('should reject non-numeric Thai ID', () => {
      expect(validateThaiID('123456789012A')).toBe(false);
      expect(validateThaiID('ABCDEFGHIJKLM')).toBe(false);
    });

    test('should generate valid Thai IDs from test utils', () => {
      for (let i = 0; i < 10; i++) {
        const thaiId = global.testUtils.generateValidThaiId();
        expect(validateThaiID(thaiId)).toBe(true);
      }
    });
  });

  describe('registerSchema', () => {
    const validData = {
      email: 'test@example.com',
      password: 'Test@1234',
      confirmPassword: 'Test@1234',
      fullName: 'สมชาย ใจดี',
      thaiId: global.testUtils.generateValidThaiId(),
      phoneNumber: '0812345678',
      address: {
        houseNumber: '123',
        subDistrict: 'แขวงทดสอบ',
        district: 'เขตทดสอบ',
        province: 'กรุงเทพมหานคร',
        postalCode: '10110',
      },
    };

    test('should validate correct registration data', () => {
      const { error } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should require email', () => {
      const data = { ...validData };
      delete data.email;

      const { error } = registerSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    test('should validate email format', () => {
      const invalidEmails = ['notanemail', 'test@', '@example.com', 'test..@example.com'];

      invalidEmails.forEach(email => {
        const data = { ...validData, email };
        const { error } = registerSchema.validate(data);
        expect(error).toBeDefined();
      });
    });

    test('should require password', () => {
      const data = { ...validData };
      delete data.password;

      const { error } = registerSchema.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('password');
    });

    test('should validate password complexity', () => {
      const weakPasswords = [
        'short', // Too short
        'nouppercase1!', // No uppercase
        'NOLOWERCASE1!', // No lowercase
        'NoNumber!', // No number
        'NoSpecial123', // No special character
        'a'.repeat(129), // Too long
      ];

      weakPasswords.forEach(password => {
        const data = { ...validData, password };
        const { error } = registerSchema.validate(data);
        expect(error).toBeDefined();
      });
    });

    test('should accept strong passwords', () => {
      const strongPasswords = ['Test@1234', 'MyP@ssw0rd', 'C0mpl3x!Pass', 'Secur3$Password'];

      strongPasswords.forEach(password => {
        const data = { ...validData, password, confirmPassword: password };
        const { error } = registerSchema.validate(data);
        expect(error).toBeUndefined();
      });
    });

    test('should require fullName', () => {
      const data = { ...validData };
      delete data.fullName;
      expect(registerSchema.validate(data).error).toBeDefined();
    });

    test('should validate Thai ID format and checksum', () => {
      // Invalid format
      const data1 = { ...validData, thaiId: '123' };
      expect(registerSchema.validate(data1).error).toBeDefined();

      // Invalid checksum
      const data2 = { ...validData, thaiId: '1234567890123' };
      expect(registerSchema.validate(data2).error).toBeDefined();

      // Valid Thai ID
      const data3 = { ...validData, thaiId: global.testUtils.generateValidThaiId() };
      expect(registerSchema.validate(data3).error).toBeUndefined();
    });

    test('should validate phone number format', () => {
      const invalidPhones = [
        '123', // Too short
        '081234567', // Too short
        '08123456789', // Too long
        '1812345678', // Doesn't start with 0
      ];

      invalidPhones.forEach(phoneNumber => {
        const data = { ...validData, phoneNumber };
        const { error } = registerSchema.validate(data);
        expect(error).toBeDefined();
      });
    });

    test('should accept valid phone numbers', () => {
      const validPhones = ['0812345678', '0923456789', '0634567890'];

      validPhones.forEach(phoneNumber => {
        const data = { ...validData, phoneNumber };
        const { error } = registerSchema.validate(data);
        expect(error).toBeUndefined();
      });
    });

    test('should require address fields', () => {
      const requiredFields = ['houseNumber', 'subDistrict', 'district', 'province', 'postalCode'];

      requiredFields.forEach(field => {
        const data = { ...validData, address: { ...validData.address } };
        delete data.address[field];
        const { error } = registerSchema.validate(data, { abortEarly: false });
        expect(error).toBeDefined();
        // Check that the error is related to the deleted field
        const hasFieldError = error.details.some(detail => detail.path.includes(field));
        if (!hasFieldError) {
          console.log(`Field: ${field}`);
          console.log(
            'Errors:',
            error.details.map(d => d.path.join('.')),
          );
        }
        expect(hasFieldError).toBe(true);
      });
    });

    test('should validate postal code format', () => {
      const invalidPostalCodes = ['123', '1234', '123456', 'ABCDE', '1234A'];

      invalidPostalCodes.forEach(postalCode => {
        const data = { ...validData };
        data.address.postalCode = postalCode;
        const { error } = registerSchema.validate(data);
        expect(error).toBeDefined();
      });
    });

    test('should accept optional address fields', () => {
      const data = {
        ...validData,
        address: {
          houseNumber: '123',
          village: 'หมู่บ้านทดสอบ', // Optional
          lane: 'ซอย 1', // Optional
          road: 'ถนนทดสอบ', // Optional
          subDistrict: 'แขวงทดสอบ',
          district: 'เขตทดสอบ',
          province: 'กรุงเทพมหานคร',
          postalCode: '10110',
        },
      };

      const { error } = registerSchema.validate(data);
      expect(error).toBeUndefined();
    });
  });

  describe('loginSchema', () => {
    test('should validate correct login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'Test@1234',
      };

      const { error } = loginSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should require email and password', () => {
      const data1 = { password: 'Test@1234' };
      expect(loginSchema.validate(data1).error).toBeDefined();

      const data2 = { email: 'test@example.com' };
      expect(loginSchema.validate(data2).error).toBeDefined();
    });

    test('should validate email format', () => {
      const data = {
        email: 'notanemail',
        password: 'Test@1234',
      };

      const { error } = loginSchema.validate(data);
      expect(error).toBeDefined();
    });

    test('should not validate password complexity (security)', () => {
      // Login should accept any password to avoid revealing password requirements
      const data = {
        email: 'test@example.com',
        password: 'weak',
      };

      const { error } = loginSchema.validate(data);
      expect(error).toBeUndefined();
    });
  });

  describe('verifyEmailSchema', () => {
    test('should validate correct token', () => {
      const data = {
        token: 'a'.repeat(64), // 64-character hex token
      };

      const { error } = verifyEmailSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should require token', () => {
      const data = {};
      const { error } = verifyEmailSchema.validate(data);
      expect(error).toBeDefined();
    });

    test('should validate token format', () => {
      const invalidTokens = [
        'short',
        'a'.repeat(63), // Too short
        'a'.repeat(65), // Too long
        'not-hex-' + 'a'.repeat(56), // Invalid characters
      ];

      invalidTokens.forEach(token => {
        const data = { token };
        const { error } = verifyEmailSchema.validate(data);
        expect(error).toBeDefined();
      });
    });
  });

  describe('forgotPasswordSchema', () => {
    test('should validate correct email', () => {
      const data = { email: 'test@example.com' };
      const { error } = forgotPasswordSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should require email', () => {
      const data = {};
      const { error } = forgotPasswordSchema.validate(data);
      expect(error).toBeDefined();
    });

    test('should validate email format', () => {
      const data = { email: 'notanemail' };
      const { error } = forgotPasswordSchema.validate(data);
      expect(error).toBeDefined();
    });
  });

  describe('resetPasswordSchema', () => {
    test('should validate correct data', () => {
      const data = {
        token: 'a'.repeat(64),
        newPassword: 'Test@1234',
        confirmPassword: 'Test@1234',
      };

      const { error } = resetPasswordSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should require token and newPassword', () => {
      const data1 = { newPassword: 'Test@1234' };
      expect(resetPasswordSchema.validate(data1).error).toBeDefined();

      const data2 = { token: 'a'.repeat(64) };
      expect(resetPasswordSchema.validate(data2).error).toBeDefined();
    });

    test('should validate new password complexity', () => {
      const data = {
        token: 'a'.repeat(64),
        newPassword: 'weak',
      };

      const { error } = resetPasswordSchema.validate(data);
      expect(error).toBeDefined();
    });
  });

  describe('Error Messages', () => {
    test('should return Thai language error messages', () => {
      const data = {};
      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();

      // Check if error message is in Thai (contains Thai characters)
      const thaiRegex = /[\u0E00-\u0E7F]/;
      const hasThaiMessage = error.details.some(detail => thaiRegex.test(detail.message));

      expect(hasThaiMessage).toBe(true);
    });

    test('should provide specific field names in errors', () => {
      const data = { ...global.testUtils.createTestUserData() };
      delete data.email;

      const { error } = registerSchema.validate(data);
      expect(error.details[0].path).toContain('email');
      expect(error.details[0].context.key).toBe('email');
    });
  });
});
