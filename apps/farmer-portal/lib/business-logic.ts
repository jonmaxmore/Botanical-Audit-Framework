/**
 * GACP Platform - Business Logic Implementation
 *
 * This module implements the 4 critical business rules:
 * 1. Recurring Payment (every 2 rejections)
 * 2. Payment Timeout (15 minutes)
 * 3. Reschedule Limit (1 time per application)
 * 4. Revocation Wait Period (30 days)
 *
 * @version 1.0.0
 * @updated October 14, 2025
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Application {
  id: string;
  userId: string;
  status: ApplicationStatus;
  submissionCount: number;
  rejectionCount: number;
  rescheduleCount: number;
  lastRejectionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certificate {
  id: string;
  applicationId: string;
  userId: string;
  certificateNumber: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  issuedDate: Date;
  expiryDate: Date;
  revokedDate?: Date;
  revokedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  id: string;
  applicationId: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  reason: PaymentReason;
  createdAt: Date;
  expiresAt: Date;
  paidAt?: Date;
  cancelledAt?: Date;
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PENDING_INSPECTION'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_TIMEOUT'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'TIMEOUT' | 'CANCELLED';

export type PaymentReason = 'INITIAL_SUBMISSION' | 'RESUBMISSION_FEE';

// ============================================================================
// BUSINESS LOGIC 1: RECURRING PAYMENT (Every 2 Rejections)
// ============================================================================

/**
 * Check if payment is required based on submission count
 *
 * Formula: Payment required when (submissionCount % 2 === 1) && (submissionCount >= 3)
 *
 * Payment Timeline:
 * - Submission 1: FREE (฿0)
 * - Submission 2: FREE (฿0)
 * - Submission 3: PAY ฿5,000 (1st rejection pair)
 * - Submission 4: FREE (฿0)
 * - Submission 5: PAY ฿5,000 (2nd rejection pair)
 * - Submission 6: FREE (฿0)
 * - Submission 7: PAY ฿5,000 (3rd rejection pair)
 *
 * @param submissionCount - Current submission count (1-indexed)
 * @returns true if payment required, false otherwise
 */
export function isPaymentRequired(submissionCount: number): boolean {
  // Payment required every 2 rejections, starting from submission #3
  return submissionCount % 2 === 1 && submissionCount >= 3;
}

/**
 * Calculate total amount paid so far based on submission count
 *
 * @param submissionCount - Current submission count
 * @returns Total amount in Thai Baht
 */
export function calculateTotalAmountPaid(submissionCount: number): number {
  if (submissionCount < 3) return 0;

  // Count how many times payment was required
  let paymentCount = 0;
  for (let i = 3; i <= submissionCount; i += 2) {
    paymentCount++;
  }

  return paymentCount * PAYMENT_AMOUNT;
}

/**
 * Get payment reason based on submission count
 */
export function getPaymentReason(submissionCount: number): PaymentReason {
  return submissionCount === 1 ? 'INITIAL_SUBMISSION' : 'RESUBMISSION_FEE';
}

/**
 * Calculate next payment submission number
 */
export function getNextPaymentSubmission(currentSubmissionCount: number): number {
  if (currentSubmissionCount < 3) return 3;

  // Find next odd number >= 3
  const next = currentSubmissionCount + 1;
  return next % 2 === 1 ? next : next + 1;
}

// ============================================================================
// BUSINESS LOGIC 2: PAYMENT TIMEOUT (15 Minutes)
// ============================================================================

// ============================================================================
// BUSINESS RULE 1: RECURRING PAYMENT
// ============================================================================

/**
 * Payment amount per submission (฿5,000)
 */
export const PAYMENT_AMOUNT = 5000;

/**
 * Payment timeout configuration
 */
export const PAYMENT_TIMEOUT_MINUTES = 15;
export const PAYMENT_TIMEOUT_MS = PAYMENT_TIMEOUT_MINUTES * 60 * 1000;

/**
 * Create payment record with 15-minute expiry
 */
export function createPaymentRecord(
  applicationId: string,
  userId: string,
  submissionCount: number
): Omit<PaymentRecord, 'id'> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + PAYMENT_TIMEOUT_MS);

  return {
    applicationId,
    userId,
    amount: PAYMENT_AMOUNT,
    status: 'PENDING',
    reason: getPaymentReason(submissionCount),
    createdAt: now,
    expiresAt,
  };
}

/**
 * Check if payment has timed out
 */
export function isPaymentTimedOut(payment: PaymentRecord): boolean {
  const now = new Date();
  return now > payment.expiresAt && payment.status === 'PENDING';
}

/**
 * Calculate remaining time for payment (in seconds)
 */
export function getRemainingPaymentTime(payment: PaymentRecord): number {
  const now = new Date();
  const remaining = payment.expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.floor(remaining / 1000));
}

/**
 * Auto-cancel payment if timeout exceeded
 */
export function handlePaymentTimeout(payment: PaymentRecord): PaymentRecord {
  if (isPaymentTimedOut(payment)) {
    return {
      ...payment,
      status: 'TIMEOUT',
      cancelledAt: new Date(),
    };
  }
  return payment;
}

// ============================================================================
// BUSINESS LOGIC 3: RESCHEDULE LIMIT (1 Time Per Application)
// ============================================================================

/**
 * Maximum reschedule attempts per application
 */
export const MAX_RESCHEDULE_COUNT = 1;

/**
 * Check if reschedule is allowed
 */
export function canReschedule(application: Application): {
  allowed: boolean;
  reason?: string;
} {
  if (application.rescheduleCount >= MAX_RESCHEDULE_COUNT) {
    return {
      allowed: false,
      reason: `คุณได้ใช้สิทธิ์เลื่อนนัดหมายครบแล้ว (${MAX_RESCHEDULE_COUNT} ครั้ง)`,
    };
  }

  if (application.status !== 'PENDING_INSPECTION') {
    return {
      allowed: false,
      reason: 'สถานะใบสมัครไม่อนุญาตให้เลื่อนนัด',
    };
  }

  return { allowed: true };
}

/**
 * Record reschedule attempt
 */
export function recordReschedule(application: Application): Application {
  return {
    ...application,
    rescheduleCount: application.rescheduleCount + 1,
    updatedAt: new Date(),
  };
}

/**
 * Check if should rejoin queue after max reschedule
 */
export function shouldRejoinQueue(application: Application): boolean {
  return application.rescheduleCount >= MAX_RESCHEDULE_COUNT;
}

/**
 * Get remaining reschedule attempts
 */
export function getRemainingReschedules(application: Application): number {
  return Math.max(0, MAX_RESCHEDULE_COUNT - application.rescheduleCount);
}

// ============================================================================
// BUSINESS LOGIC 4: REVOCATION WAIT PERIOD (30 Days)
// ============================================================================

/**
 * Wait period after certificate revocation (in days)
 */
export const REVOCATION_WAIT_PERIOD_DAYS = 30;
export const REVOCATION_WAIT_PERIOD_MS = REVOCATION_WAIT_PERIOD_DAYS * 24 * 60 * 60 * 1000;

/**
 * Check if user can apply after revocation
 */
export function canApplyAfterRevocation(certificate: Certificate): boolean {
  if (certificate.status !== 'REVOKED' || !certificate.revokedDate) {
    return true; // Not revoked, can apply
  }

  const now = new Date();
  const revokedDate = new Date(certificate.revokedDate);
  const daysSinceRevocation = Math.floor(
    (now.getTime() - revokedDate.getTime()) / (24 * 60 * 60 * 1000)
  );

  return daysSinceRevocation >= REVOCATION_WAIT_PERIOD_DAYS;
}

/**
 * Calculate revocation wait period end date
 */
export function calculateRevocationWaitEndDate(revokedDate: Date): Date {
  return new Date(revokedDate.getTime() + REVOCATION_WAIT_PERIOD_MS);
}

/**
 * Get remaining days in revocation wait period
 */
export function getRemainingWaitDays(certificate: Certificate): number {
  if (!certificate.revokedDate) {
    return 0;
  }

  const now = new Date();
  const endDate = calculateRevocationWaitEndDate(certificate.revokedDate);
  const remainingMs = endDate.getTime() - now.getTime();
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

  return Math.max(0, remainingDays);
}

// ============================================================================
// CANCELLATION & REFUND POLICY
// ============================================================================

/**
 * Refund policy: NO REFUNDS
 */
export const REFUND_POLICY = {
  allowed: false,
  reason: 'ไม่มีการคืนเงินทุกกรณี',
};

/**
 * Get refund amount (always 0 - no refunds policy)
 */
export function getRefundAmount(_application: Application): number {
  // Business Rule: NO REFUNDS under any circumstances
  return 0;
}

/**
 * Check if application can be cancelled
 */
export function canCancelApplication(application: Application): boolean {
  const cancellableStatuses: ApplicationStatus[] = [
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'PENDING_INSPECTION',
    'PENDING_PAYMENT',
    'REJECTED',
  ];

  return cancellableStatuses.includes(application.status);
}

/**
 * Cancel application (no refund)
 */
export function cancelApplication(application: Application): Application {
  return {
    ...application,
    status: 'CANCELLED',
    updatedAt: new Date(),
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate application state before submission
 */
export function validateApplicationSubmission(application: Application): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (application.status !== 'DRAFT' && application.status !== 'REJECTED') {
    errors.push('สถานะใบสมัครไม่อนุญาตให้ส่งใหม่');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get application status display text
 */
export function getStatusDisplayText(status: ApplicationStatus): string {
  const statusMap: Record<ApplicationStatus, string> = {
    DRAFT: 'แบบร่าง',
    SUBMITTED: 'ส่งแล้ว',
    UNDER_REVIEW: 'กำลังตรวจสอบ',
    PENDING_INSPECTION: 'รอการตรวจประเมิน',
    PENDING_PAYMENT: 'รอชำระเงิน',
    PAYMENT_TIMEOUT: 'หมดเวลาชำระเงิน',
    APPROVED: 'อนุมัติแล้ว',
    REJECTED: 'ไม่ผ่าน',
    CANCELLED: 'ยกเลิกแล้ว',
  };

  return statusMap[status] || status;
}

// ============================================================================
// BUSINESS RULES SUMMARY
// ============================================================================

/**
 * Get business rules summary for display
 */
export function getBusinessRulesSummary() {
  return {
    payment: {
      recurring: {
        description: 'ค่าธรรมเนียมการส่งซ้ำทุก 2 ครั้งที่ไม่ผ่าน',
        amount: 5000,
        formula: '(submissionCount % 2 === 1) && (submissionCount >= 3)',
        examples: 'ครั้งที่ 3, 5, 7, 9, 11...',
      },
      timeout: {
        description: 'ต้องชำระภายใน 15 นาที',
        minutes: PAYMENT_TIMEOUT_MINUTES,
        autoCancel: true,
      },
      refund: REFUND_POLICY,
    },
    reschedule: {
      limit: MAX_RESCHEDULE_COUNT,
      description: 'เลื่อนนัดหมายได้สูงสุด 1 ครั้งต่อใบสมัคร',
      afterLimit: 'กลับเข้าคิวใหม่',
    },
    revocation: {
      waitPeriod: REVOCATION_WAIT_PERIOD_DAYS,
      description: 'ต้องรอ 30 วันหลังใบรับรองถูกเพิกถอน',
      unit: 'วัน',
    },
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

const businessLogic = {
  // Payment
  isPaymentRequired,
  calculateTotalAmountPaid,
  getPaymentReason,
  getNextPaymentSubmission,
  createPaymentRecord,
  isPaymentTimedOut,
  getRemainingPaymentTime,
  handlePaymentTimeout,

  // Reschedule
  canReschedule,
  recordReschedule,
  shouldRejoinQueue,
  getRemainingReschedules,

  // Revocation
  canApplyAfterRevocation,
  calculateRevocationWaitEndDate,
  getRemainingWaitDays,

  // Cancellation
  canCancelApplication,
  getRefundAmount,

  // Validation
  validateApplicationSubmission,
  getStatusDisplayText,
  getBusinessRulesSummary,

  // Constants
  PAYMENT_TIMEOUT_MINUTES,
  MAX_RESCHEDULE_COUNT,
  REVOCATION_WAIT_PERIOD_DAYS,
  REFUND_POLICY,
};

export default businessLogic;
