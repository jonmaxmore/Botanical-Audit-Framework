/**
 * Format date to Thai locale
 */
export function formatDateThai(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date to short Thai format
 */
export function formatDateShortThai(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('th-TH', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format number with Thai locale
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Calculate days until expiry
 */
export function getDaysUntilExpiry(expiryDate: string | Date): number {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if certificate is expiring soon (within 30 days)
 */
export function isExpiringSoon(expiryDate: string | Date): boolean {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
}

/**
 * Check if certificate is expired
 */
export function isExpired(expiryDate: string | Date): boolean {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  return daysUntilExpiry < 0;
}

/**
 * Validate Thai National ID
 */
export function validateNationalId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i)) * (13 - i);
  }
  const mod = sum % 11;
  const check = (11 - mod) % 10;
  return check === parseInt(id.charAt(12));
}

/**
 * Validate Thai postal code
 */
export function validatePostalCode(postalCode: string): boolean {
  return /^\d{5}$/.test(postalCode);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generate certificate number
 */
export function generateCertificateNumber(
  standard: string,
  year: number,
  sequence: number
): string {
  const paddedSequence = sequence.toString().padStart(4, '0');
  return `${standard}-${year}-${paddedSequence}`;
}

/**
 * Parse certificate number
 */
export function parseCertificateNumber(certificateNumber: string): {
  standard: string;
  year: number;
  sequence: number;
} | null {
  const match = certificateNumber.match(/^([A-Z]+)-(\d{4})-(\d{4})$/);
  if (!match) return null;

  return {
    standard: match[1],
    year: parseInt(match[2]),
    sequence: parseInt(match[3]),
  };
}

/**
 * Get certificate status color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'approved':
      return '#4caf50';
    case 'pending':
      return '#ff9800';
    case 'rejected':
      return '#f44336';
    case 'expired':
      return '#9e9e9e';
    case 'revoked':
      return '#f44336';
    default:
      return '#2196f3';
  }
}

/**
 * Get certificate status label in Thai
 */
export function getStatusLabelThai(status: string): string {
  switch (status) {
    case 'approved':
      return 'อนุมัติแล้ว';
    case 'pending':
      return 'รออนุมัติ';
    case 'rejected':
      return 'ปฏิเสธ';
    case 'expired':
      return 'หมดอายุ';
    case 'revoked':
      return 'ยกเลิก';
    default:
      return status;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: any): boolean {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim().length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

export default {
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
  isEmpty,
};
