/**
 * Validation Utilities
 * Validation functions for email, phone numbers, Thai ID, passwords, etc.
 */

/**
 * Validate email address
 * @param email - Email to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Thai phone number
 * @param phone - Phone number to validate
 * @returns True if valid Thai phone number
 */
export function isValidThaiPhoneNumber(phone: string): boolean {
  if (!phone) return false;

  const cleaned = phone.replace(/\D/g, '');

  // Must be 9-10 digits starting with 0
  if (cleaned.length < 9 || cleaned.length > 10 || !cleaned.startsWith('0')) {
    return false;
  }

  // Valid prefixes
  const prefix = cleaned.substring(0, 2);

  // Mobile: 06/08/09 (must be 10 digits)
  if (['06', '08', '09'].includes(prefix)) {
    return cleaned.length === 10;
  }

  // Landline: 02/03/04/05/07 (can be 9 or 10 digits)
  if (['02', '03', '04', '05', '07'].includes(prefix)) {
    return cleaned.length === 9 || cleaned.length === 10;
  }

  return false;
}

/**
 * Validate Thai National ID using Mod 11 algorithm
 * @param id - Thai ID to validate (13 digits)
 * @returns True if valid Thai ID
 */
export function isValidThaiID(id: string): boolean {
  if (!id) return false;

  const cleaned = id.replace(/\D/g, '');

  if (cleaned.length !== 13) {
    return false;
  }

  // Calculate checksum using Mod 11
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * (13 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(cleaned.charAt(12));
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with details
 */
export function isValidPassword(password: string): {
  valid: boolean;
  reason?: string;
} {
  if (!password) {
    return { valid: false, reason: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: 'Password must contain lowercase letter' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain uppercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain number' };
  }

  if (!/[@$!%*?&]/.test(password)) {
    return { valid: false, reason: 'Password must contain special character' };
  }

  return { valid: true };
}

/**
 * Validate URL
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidURL(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns True if start is before end
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate < endDate;
}

/**
 * Validate file type
 * @param file - File object
 * @param allowedTypes - Allowed MIME types
 * @returns True if file type is allowed
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 * @param file - File object
 * @param maxSizeMB - Maximum size in MB
 * @returns True if file size is within limit
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}
