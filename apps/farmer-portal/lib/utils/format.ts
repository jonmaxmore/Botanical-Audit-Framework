/**
 * Format Utilities
 * Formatting functions for currency, dates, phone numbers, file sizes, etc.
 */

/**
 * Format Thai Baht currency
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "฿5,000")
 */
export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '฿0';
  }

  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date in Thai format with Buddhist calendar
 * @param date - Date to format
 * @param format - Format type ('short' | 'full' | 'medium')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'full' | 'medium' = 'medium',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return d.toLocaleDateString('th-TH', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  }

  if (format === 'full') {
    return d.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Default: medium
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format Thai phone number
 * @param phone - Phone number (10 digits)
 * @returns Formatted phone number (e.g., "081-234-5678")
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length !== 10 && cleaned.length !== 9) {
    return phone;
  }

  // Landline (9 digits): 02-234-5678
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  }

  // Mobile: 081-234-5678
  if (cleaned.startsWith('06') || cleaned.startsWith('08') || cleaned.startsWith('09')) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Landline: 02-234-5678
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
}

/**
 * Format duration in seconds to human-readable Thai format
 * @param seconds - Duration in seconds
 * @returns Formatted duration (e.g., "1 ชั่วโมง 30 นาที")
 */
export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days} วัน`;
  }

  if (hours > 0 && minutes > 0) {
    return `${hours} ชั่วโมง ${minutes} นาที`;
  }

  if (hours > 0) {
    return `${hours} ชั่วโมง`;
  }

  return `${minutes} นาที`;
}

/**
 * Format file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size (e.g., "1.46 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format percentage
 * @param value - Decimal value (0.85 for 85%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage (e.g., "85%")
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param ellipsis - Ellipsis string (default: "...")
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}
