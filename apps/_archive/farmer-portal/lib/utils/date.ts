/**
 * Date Utilities
 * Date manipulation and calculation functions
 */

/**
 * Add days to a date
 * @param date - Base date
 * @param days - Number of days to add (negative to subtract)
 * @returns New date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days (negative if start > end)
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return Math.floor(diffDays);
}

/**
 * Check if date is expired
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isExpired(date: Date): boolean {
  return date < new Date();
}

/**
 * Calculate days until expiry
 * @param expiryDate - Expiry date
 * @returns Days remaining (0 if expired)
 */
export function getDaysUntilExpiry(expiryDate: Date): number {
  const nowStart = startOfDay(new Date());
  const expiryStart = startOfDay(expiryDate);
  const diffMs = expiryStart.getTime() - nowStart.getTime();

  if (diffMs <= 0) {
    return 0;
  }

  // Round to smooth out DST transitions while preserving whole-day differences
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format time remaining in MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time (e.g., "15:00")
 */
export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Check if date is weekend
 * @param date - Date to check
 * @returns True if Saturday or Sunday
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Get next business day (skip weekends and holidays)
 * @param date - Start date
 * @param holidays - Array of holiday dates
 * @returns Next business day
 */
export function getNextBusinessDay(date: Date, holidays: Date[] = []): Date {
  let nextDay = addDays(date, 1);

  while (isWeekend(nextDay) || isHoliday(nextDay, holidays)) {
    nextDay = addDays(nextDay, 1);
  }

  return nextDay;
}

/**
 * Check if date is a holiday
 * @param date - Date to check
 * @param holidays - Array of holiday dates
 * @returns True if date is a holiday
 */
function isHoliday(date: Date, holidays: Date[]): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return holidays.some(holiday => holiday.toISOString().split('T')[0] === dateStr);
}

/**
 * Convert date to Thai Buddhist calendar year
 * @param date - Date to convert
 * @returns Buddhist year (Gregorian year + 543)
 */
export function toThaiYear(date: Date): number {
  return date.getFullYear() + 543;
}

/**
 * Get start of day (00:00:00)
 * @param date - Date to normalize
 * @returns Date at start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day (23:59:59)
 * @param date - Date to normalize
 * @returns Date at end of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
