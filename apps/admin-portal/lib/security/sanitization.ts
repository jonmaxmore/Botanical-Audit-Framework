// @ts-nocheck
/**
 * Input Sanitization Service
 *
 * Provides comprehensive input sanitization to prevent:
 * - XSS (Cross-Site Scripting)
 * - SQL Injection
 * - HTML Injection
 * - Command Injection
 * - Path Traversal
 * - NoSQL Injection
 */

import DOMPurify from 'isomorphic-dompurify';

// ============================================================================
// XSS Prevention
// ============================================================================

/**
 * Sanitize HTML content
 */
export function sanitizeHTML(
  dirty: string,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    allowedSchemes?: string[];
  }
): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  const config = {
    ALLOWED_TAGS: options?.allowedTags || [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'a',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
    ],
    ALLOWED_ATTR: options?.allowedAttributes || {
      a: ['href', 'title'],
    },
    ALLOWED_URI_REGEXP: options?.allowedSchemes
      ? new RegExp(`^(${options.allowedSchemes.join('|')}):`, 'i')
      : /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  };

  return DOMPurify.sanitize(dirty, config);
}

/**
 * Strip all HTML tags
 */
export function stripHTML(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * Escape HTML special characters
 */
export function escapeHTML(unsafe: string): string {
  if (!unsafe || typeof unsafe !== 'string') {
    return '';
  }

  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Unescape HTML entities
 */
export function unescapeHTML(safe: string): string {
  if (!safe || typeof safe !== 'string') {
    return '';
  }

  return safe
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

/**
 * Sanitize for attribute value
 */
export function sanitizeAttribute(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  // Remove dangerous protocols
  const dangerous = /^(javascript|data|vbscript|file|about):/i;
  if (dangerous.test(value)) {
    return '';
  }

  // Escape quotes
  return value.replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

// ============================================================================
// SQL Injection Prevention
// ============================================================================

/**
 * Escape SQL string value
 * Note: Use parameterized queries instead when possible
 */
export function escapeSQLString(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value.replace(/[\0\x08\x09\x1a\n\r"'\\%]/g, char => {
    switch (char) {
      case '\0':
        return '\\0';
      case '\x08':
        return '\\b';
      case '\x09':
        return '\\t';
      case '\x1a':
        return '\\z';
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + char;
      default:
        return char;
    }
  });
}

/**
 * Validate SQL identifier (table/column name)
 */
export function validateSQLIdentifier(identifier: string): boolean {
  if (!identifier || typeof identifier !== 'string') {
    return false;
  }

  // Only allow alphanumeric and underscore
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier);
}

/**
 * Sanitize SQL LIKE pattern
 */
export function sanitizeLikePattern(pattern: string): string {
  if (!pattern || typeof pattern !== 'string') {
    return '';
  }

  // Escape special characters in LIKE patterns
  return pattern.replace(/[\\%_]/g, '\\$&');
}

// ============================================================================
// NoSQL Injection Prevention
// ============================================================================

/**
 * Sanitize MongoDB query
 */
export function sanitizeMongoQuery(query: Record<string, any>): Record<string, any> {
  if (!query || typeof query !== 'object') {
    return {};
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    // Remove operator keys
    if (key.startsWith('$')) {
      continue;
    }

    // Recursively sanitize nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Check for operator injection
      const hasOperator = Object.keys(value).some(k => k.startsWith('$'));
      if (hasOperator) {
        continue;
      }
      sanitized[key] = sanitizeMongoQuery(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// ============================================================================
// Path Traversal Prevention
// ============================================================================

/**
 * Sanitize file path
 */
export function sanitizeFilePath(path: string): string {
  if (!path || typeof path !== 'string') {
    return '';
  }

  // Remove path traversal attempts
  return path
    .replace(/\.\./g, '')
    .replace(/[\/\\]{2,}/g, '/')
    .replace(/^[\/\\]/, '')
    .trim();
}

/**
 * Validate file name
 */
export function validateFileName(fileName: string): boolean {
  if (!fileName || typeof fileName !== 'string') {
    return false;
  }

  // Only allow safe characters
  const safePattern = /^[a-zA-Z0-9._-]+$/;
  if (!safePattern.test(fileName)) {
    return false;
  }

  // Block dangerous extensions
  const dangerousExtensions = [
    '.exe',
    '.bat',
    '.cmd',
    '.com',
    '.pif',
    '.scr',
    '.vbs',
    '.js',
    '.jar',
    '.dll',
    '.so',
    '.sh',
    '.app',
  ];

  const lowerFileName = fileName.toLowerCase();
  return !dangerousExtensions.some(ext => lowerFileName.endsWith(ext));
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return 'unnamed';
  }

  // Replace unsafe characters
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

// ============================================================================
// Command Injection Prevention
// ============================================================================

/**
 * Escape shell argument
 */
export function escapeShellArg(arg: string): string {
  if (!arg || typeof arg !== 'string') {
    return "''";
  }

  // Wrap in single quotes and escape single quotes
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

/**
 * Validate shell command
 */
export function validateShellCommand(command: string): boolean {
  if (!command || typeof command !== 'string') {
    return false;
  }

  // Check for shell metacharacters
  const dangerous = /[;&|`$(){}[\]<>]/;
  return !dangerous.test(command);
}

// ============================================================================
// URL Sanitization
// ============================================================================

/**
 * Sanitize URL
 */
export function sanitizeURL(url: string, allowedProtocols: string[] = ['http', 'https']): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const parsed = new URL(url);

    // Check protocol
    if (!allowedProtocols.includes(parsed.protocol.replace(':', ''))) {
      return '';
    }

    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Validate redirect URL
 */
export function validateRedirectURL(url: string, allowedDomains: string[]): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);

    // Check protocol
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // Check domain
    return allowedDomains.some(domain => {
      return parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`);
    });
  } catch {
    return false;
  }
}

// ============================================================================
// Email Sanitization
// ============================================================================

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._+-]/g, '');
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

// ============================================================================
// Phone Number Sanitization
// ============================================================================

/**
 * Sanitize phone number (Thai format)
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Convert +66 to 0
  if (digits.startsWith('66') && digits.length === 11) {
    return '0' + digits.substring(2);
  }

  return digits;
}

/**
 * Validate Thai phone number
 */
export function validateThaiPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const sanitized = sanitizePhoneNumber(phone);
  return /^0[0-9]{9}$/.test(sanitized);
}

// ============================================================================
// JSON Sanitization
// ============================================================================

/**
 * Safe JSON parse
 */
export function safeJSONParse<T = any>(json: string, defaultValue?: T): T | null {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue ?? null;
  }
}

/**
 * Sanitize JSON object
 */
export function sanitizeJSON(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (typeof obj === 'string') {
    return sanitizeHTML(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeJSON(item));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip function properties
      if (typeof value === 'function') {
        continue;
      }
      sanitized[key] = sanitizeJSON(value);
    }
    return sanitized;
  }

  return null;
}

// ============================================================================
// Headers Sanitization
// ============================================================================

/**
 * Sanitize HTTP header value
 */
export function sanitizeHeaderValue(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  // Remove newlines (header injection)
  return value.replace(/[\r\n]/g, '').trim();
}

// ============================================================================
// Combined Sanitizer
// ============================================================================

export interface SanitizeOptions {
  html?: boolean;
  sql?: boolean;
  path?: boolean;
  url?: boolean;
  email?: boolean;
  phone?: boolean;
}

/**
 * General purpose sanitizer
 */
export function sanitize(input: string, options: SanitizeOptions = {}): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let result = input;

  if (options.html !== false) {
    result = stripHTML(result);
  }

  if (options.sql) {
    result = escapeSQLString(result);
  }

  if (options.path) {
    result = sanitizeFilePath(result);
  }

  if (options.url) {
    result = sanitizeURL(result);
  }

  if (options.email) {
    result = sanitizeEmail(result);
  }

  if (options.phone) {
    result = sanitizePhoneNumber(result);
  }

  return result.trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  options: SanitizeOptions = {}
): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitize(value, options);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitize(item, options) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, options);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// Example usage:
/*
// HTML sanitization
const clean = sanitizeHTML('<script>alert("xss")</script><p>Safe content</p>');
// Result: '<p>Safe content</p>'

// SQL sanitization
const safe = escapeSQLString("Robert'; DROP TABLE users--");
// Result: "Robert\\'; DROP TABLE users--"

// File path sanitization
const path = sanitizeFilePath('../../../etc/passwd');
// Result: 'etc/passwd'

// URL sanitization
const url = sanitizeURL('javascript:alert(1)');
// Result: ''

// Combined sanitization
const input = '<script>alert(1)</script>User input';
const clean = sanitize(input, { html: true });
// Result: 'User input'

// Object sanitization
const data = {
  name: '<b>John</b>',
  email: 'JOHN@EXAMPLE.COM',
  nested: {
    value: '<script>xss</script>'
  }
};
const clean = sanitizeObject(data, { html: true, email: true });
*/
