/**
 * Validation Utilities
 * Comprehensive validation functions for various data types
 */

const { ValidationError } = require('./error-handler-utils');

/**
 * Email Validation
 */
const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password Validation
 */
const isValidPassword = password => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Phone Number Validation (Thai format)
 */
const isValidPhone = phone => {
  // Thai phone numbers: 08/09/06 followed by 8 digits
  const phoneRegex = /^(08|09|06)\d{8}$/;
  return phoneRegex.test(phone);
};

/**
 * Thai National ID Validation
 */
const isValidThaiID = id => {
  if (!/^\d{13}$/.test(id)) return false;

  // Checksum validation
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id[i]) * (13 - i);
  }

  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;

  return checkDigit === parseInt(id[12]);
};

/**
 * URL Validation
 */
const isValidURL = url => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * MongoDB ObjectId Validation
 */
const isValidObjectId = id => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * File Extension Validation
 */
const isValidFileExtension = (filename, allowedExtensions) => {
  if (!filename || !allowedExtensions) return false;

  const extension = filename.toLowerCase().split('.').pop();
  return allowedExtensions.includes(extension);
};

/**
 * Date Validation
 */
const isValidDate = dateString => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Age Validation
 */
const isValidAge = (birthDate, minAge = 0, maxAge = 150) => {
  if (!isValidDate(birthDate)) return false;

  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();

  return age >= minAge && age <= maxAge;
};

/**
 * Coordinate Validation (Thailand bounds)
 */
const isValidCoordinate = (lat, lng) => {
  // Thailand approximate bounds
  const thaiLat = { min: 5.5, max: 20.5 };
  const thaiLng = { min: 97, max: 106 };

  return lat >= thaiLat.min && lat <= thaiLat.max && lng >= thaiLng.min && lng <= thaiLng.max;
};

/**
 * Sanitize String
 */
const sanitizeString = str => {
  if (typeof str !== 'string') return '';

  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/'/g, "\\'") // Escape single quotes
    .slice(0, 1000); // Limit length
};

/**
 * Sanitize Object
 */
const sanitizeObject = (obj, allowedFields = []) => {
  if (!obj || typeof obj !== 'object') return {};

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (allowedFields.length === 0 || allowedFields.includes(key)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
};

/**
 * Validation Schema Builder
 */
class ValidationSchema {
  constructor() {
    this.rules = {};
  }

  required(field, message) {
    this.rules[field] = this.rules[field] || [];
    this.rules[field].push({
      type: 'required',
      message: message || `${field} is required`,
    });
    return this;
  }

  email(field, message) {
    this.rules[field] = this.rules[field] || [];
    this.rules[field].push({
      type: 'email',
      validator: isValidEmail,
      message: message || `${field} must be a valid email`,
    });
    return this;
  }

  password(field, message) {
    this.rules[field] = this.rules[field] || [];
    this.rules[field].push({
      type: 'password',
      validator: isValidPassword,
      message:
        message || `${field} must be at least 8 characters with uppercase, lowercase, and number`,
    });
    return this;
  }

  phone(field, message) {
    this.rules[field] = this.rules[field] || [];
    this.rules[field].push({
      type: 'phone',
      validator: isValidPhone,
      message: message || `${field} must be a valid Thai phone number`,
    });
    return this;
  }

  thaiId(field, message) {
    this.rules[field] = this.rules[field] || [];
    this.rules[field].push({
      type: 'thaiId',
      validator: isValidThaiID,
      message: message || `${field} must be a valid Thai national ID`,
    });
    return this;
  }

  objectId(field, message) {
    this.rules[field] = this.rules[field] || [];
    this.rules[field].push({
      type: 'objectId',
      validator: isValidObjectId,
      message: message || `${field} must be a valid ObjectId`,
    });
    return this;
  }

  minLength(field, length, message) {
    this.rules[field] = this.rules[field] || [];
    this.rules[field].push({
      type: 'minLength',
      validator: value => value && value.length >= length,
      message: message || `${field} must be at least ${length} characters`,
    });
    return this;
  }

  maxLength(field, length, message) {
    this.rules[field] = this.rules[field] || [];
    this.rules[field].push({
      type: 'maxLength',
      validator: value => !value || value.length <= length,
      message: message || `${field} must not exceed ${length} characters`,
    });
    return this;
  }

  custom(field, validator, message) {
    this.rules[field] = this.rules[field] || [];
    this.rules[field].push({
      type: 'custom',
      validator,
      message: message || `${field} is invalid`,
    });
    return this;
  }

  validate(data) {
    const errors = [];

    for (const [field, rules] of Object.entries(this.rules)) {
      const value = data[field];

      for (const rule of rules) {
        if (rule.type === 'required') {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push({ field, message: rule.message });
            break; // Skip other rules if required validation fails
          }
        } else if (rule.validator && value) {
          if (!rule.validator(value)) {
            errors.push({ field, message: rule.message });
          }
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    return true;
  }
}

/**
 * Common Validation Schemas
 */
const schemas = {
  user: new ValidationSchema()
    .required('email')
    .email('email')
    .required('password')
    .password('password')
    .required('firstName')
    .minLength('firstName', 2)
    .maxLength('firstName', 50)
    .required('lastName')
    .minLength('lastName', 2)
    .maxLength('lastName', 50),

  farmer: new ValidationSchema()
    .required('farmName')
    .minLength('farmName', 2)
    .maxLength('farmName', 100)
    .required('location')
    .required('certification')
    .phone('phone'),

  login: new ValidationSchema().required('email').email('email').required('password'),

  certificate: new ValidationSchema()
    .required('farmerId')
    .objectId('farmerId')
    .required('certificationLevel')
    .required('issueDate'),

  survey: new ValidationSchema()
    .required('farmerId')
    .objectId('farmerId')
    .required('surveyType')
    .required('responses'),
};

/**
 * Validation Middleware
 */
const validateRequest = schema => {
  return (req, res, next) => {
    try {
      if (typeof schema === 'string') {
        schemas[schema].validate(req.body);
      } else {
        schema.validate(req.body);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  // Validation Functions
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidThaiID,
  isValidURL,
  isValidObjectId,
  isValidFileExtension,
  isValidDate,
  isValidAge,
  isValidCoordinate,

  // Sanitization
  sanitizeString,
  sanitizeObject,

  // Schema Builder
  ValidationSchema,

  // Common Schemas
  schemas,

  // Middleware
  validateRequest,
};
