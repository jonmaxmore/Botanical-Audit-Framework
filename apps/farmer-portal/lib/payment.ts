/**
 * GACP Platform - Payment Processing Module
 *
 * Handles payment workflows including:
 * - Omise integration (mock)
 * - Payment timeout management
 * - Transaction recording
 * - Receipt generation
 *
 * @version 1.0.0
 * @updated October 14, 2025
 */

import {
  PaymentRecord,
  createPaymentRecord,
  isPaymentTimedOut,
  PAYMENT_TIMEOUT_MINUTES,
  REFUND_POLICY,
} from './business-logic';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface OmiseChargeRequest {
  amount: number; // in satang (1 THB = 100 satang)
  currency: 'THB';
  description: string;
  source: string; // token from Omise.js
  metadata: {
    applicationId: string;
    userId: string;
    submissionCount: string;
  };
}

export interface OmiseChargeResponse {
  id: string;
  object: 'charge';
  amount: number;
  currency: 'THB';
  status: 'pending' | 'successful' | 'failed';
  paid: boolean;
  transaction: string | null;
  created_at: string;
  metadata: Record<string, string>;
}

export interface PaymentSession {
  id: string;
  paymentRecord: PaymentRecord;
  omisePublicKey: string;
  returnUrl: string;
  cancelUrl: string;
  expiresAt: Date;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  amount?: number;
  paidAt?: Date;
  error?: string;
}

export interface Receipt {
  id: string;
  paymentId: string;
  applicationId: string;
  userId: string;
  amount: number;
  paidAt: Date;
  receiptNumber: string;
  description: string;
  taxId: string;
}

// ============================================================================
// OMISE CONFIGURATION (MOCK)
// ============================================================================

const OMISE_CONFIG = {
  publicKey: process.env.OMISE_PUBLIC_KEY || 'pkey_test_mock_12345',
  secretKey: process.env.OMISE_SECRET_KEY || 'skey_test_mock_67890',
  apiVersion: '2019-05-29',
  baseUrl: 'https://api.omise.co',
};

// ============================================================================
// PAYMENT SESSION MANAGEMENT
// ============================================================================

/**
 * Create a new payment session
 */
export function createPaymentSession(
  applicationId: string,
  userId: string,
  submissionCount: number
): PaymentSession {
  const paymentRecord = createPaymentRecord(applicationId, userId, submissionCount);
  const sessionId = generateSessionId();

  return {
    id: sessionId,
    paymentRecord: {
      ...paymentRecord,
      id: generatePaymentId(),
    },
    omisePublicKey: OMISE_CONFIG.publicKey,
    returnUrl: `/applications/${applicationId}/payment/success`,
    cancelUrl: `/applications/${applicationId}/payment/cancel`,
    expiresAt: paymentRecord.expiresAt,
  };
}

/**
 * Check payment session validity
 */
export function isPaymentSessionValid(session: PaymentSession): {
  valid: boolean;
  reason?: string;
} {
  const now = new Date();

  if (now > session.expiresAt) {
    return {
      valid: false,
      reason: `หมดเวลาชำระเงิน (เกิน ${PAYMENT_TIMEOUT_MINUTES} นาที)`,
    };
  }

  if (session.paymentRecord.status !== 'PENDING') {
    return {
      valid: false,
      reason: 'สถานะการชำระเงินไม่ถูกต้อง',
    };
  }

  return { valid: true };
}

// ============================================================================
// OMISE INTEGRATION (MOCK)
// ============================================================================

/**
 * Create Omise charge (mock implementation)
 */
export async function createOmiseCharge(request: OmiseChargeRequest): Promise<OmiseChargeResponse> {
  // Mock implementation - In production, use real Omise API
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

  const chargeId = `chrg_mock_${Date.now()}`;
  const transactionId = `trx_mock_${Date.now()}`;

  // Simulate 95% success rate
  const isSuccess = Math.random() > 0.05;

  return {
    id: chargeId,
    object: 'charge',
    amount: request.amount,
    currency: request.currency,
    status: isSuccess ? 'successful' : 'failed',
    paid: isSuccess,
    transaction: isSuccess ? transactionId : null,
    created_at: new Date().toISOString(),
    metadata: request.metadata as unknown as Record<string, string>,
  };
}

/**
 * Verify Omise charge status
 */
export async function verifyOmiseCharge(chargeId: string): Promise<OmiseChargeResponse> {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    id: chargeId,
    object: 'charge',
    amount: 500000, // ฿5,000 in satang
    currency: 'THB',
    status: 'successful',
    paid: true,
    transaction: `trx_mock_${Date.now()}`,
    created_at: new Date().toISOString(),
    metadata: {},
  };
}

// ============================================================================
// PAYMENT PROCESSING
// ============================================================================

/**
 * Process payment
 */
export async function processPayment(
  session: PaymentSession,
  omiseToken: string
): Promise<PaymentResult> {
  // 1. Validate session
  const validation = isPaymentSessionValid(session);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.reason,
    };
  }

  // 2. Check timeout
  if (isPaymentTimedOut(session.paymentRecord)) {
    return {
      success: false,
      error: 'หมดเวลาชำระเงิน กรุณาเริ่มกระบวนการใหม่',
    };
  }

  // 3. Create Omise charge
  try {
    const chargeRequest: OmiseChargeRequest = {
      amount: session.paymentRecord.amount * 100, // Convert to satang
      currency: 'THB',
      description: `GACP Application Fee - Submission #${session.paymentRecord.id}`,
      source: omiseToken,
      metadata: {
        applicationId: session.paymentRecord.applicationId,
        userId: session.paymentRecord.userId,
        submissionCount: '0', // Should be passed from application
      },
    };

    const charge = await createOmiseCharge(chargeRequest);

    if (charge.status === 'successful' && charge.paid) {
      return {
        success: true,
        paymentId: session.paymentRecord.id,
        transactionId: charge.transaction ?? undefined,
        amount: session.paymentRecord.amount,
        paidAt: new Date(),
      };
    } else {
      return {
        success: false,
        error: 'การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
      };
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในระบบชำระเงิน กรุณาติดต่อเจ้าหน้าที่',
    };
  }
}

/**
 * Update payment record after successful payment
 */
export function updatePaymentRecordAfterSuccess(
  payment: PaymentRecord,
  _transactionId: string
): PaymentRecord {
  return {
    ...payment,
    status: 'PAID',
    paidAt: new Date(),
  };
}

/**
 * Cancel payment (timeout or user cancellation)
 */
export function cancelPayment(
  payment: PaymentRecord,
  reason: 'TIMEOUT' | 'USER_CANCELLED'
): PaymentRecord {
  return {
    ...payment,
    status: reason === 'TIMEOUT' ? 'TIMEOUT' : 'CANCELLED',
    cancelledAt: new Date(),
  };
}

// ============================================================================
// RECEIPT GENERATION
// ============================================================================

/**
 * Generate receipt after successful payment
 */
export function generateReceipt(payment: PaymentRecord, _transactionId: string): Receipt {
  const receiptNumber = generateReceiptNumber(payment.id);

  return {
    id: `rcpt_${Date.now()}`,
    paymentId: payment.id,
    applicationId: payment.applicationId,
    userId: payment.userId,
    amount: payment.amount,
    paidAt: payment.paidAt || new Date(),
    receiptNumber,
    description: 'ค่าธรรมเนียมการยื่นคำขอรับรอง GACP',
    taxId: '0-0000-00000-00-0', // Organization tax ID
  };
}

/**
 * Generate receipt number
 * Format: GACP-YYYY-MM-XXXXXXXX
 */
function generateReceiptNumber(paymentId: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const sequence = paymentId.slice(-8).toUpperCase();

  return `GACP-${year}-${month}-${sequence}`;
}

/**
 * Format receipt for display
 */
export function formatReceipt(receipt: Receipt): string {
  return `
╔═══════════════════════════════════════════════════╗
║          ใบเสร็จรับเงิน / RECEIPT                 ║
║              GACP Certification                   ║
╚═══════════════════════════════════════════════════╝

เลขที่ใบเสร็จ: ${receipt.receiptNumber}
วันที่: ${receipt.paidAt.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}

───────────────────────────────────────────────────

รายการ: ${receipt.description}
จำนวนเงิน: ฿${receipt.amount.toLocaleString('th-TH')}

───────────────────────────────────────────────────

รวมเงิน: ฿${receipt.amount.toLocaleString('th-TH')}

───────────────────────────────────────────────────

หมายเหตุ: ${REFUND_POLICY.reason}

เลขประจำตัวผู้เสียภาษี: ${receipt.taxId}
  `.trim();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique payment ID
 */
function generatePaymentId(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate payment statistics for analytics
 */
export function calculatePaymentStats(payments: PaymentRecord[]): {
  total: number;
  paid: number;
  pending: number;
  timeout: number;
  cancelled: number;
  totalRevenue: number;
  averagePaymentTime: number; // in seconds
} {
  const stats = {
    total: payments.length,
    paid: 0,
    pending: 0,
    timeout: 0,
    cancelled: 0,
    totalRevenue: 0,
    averagePaymentTime: 0,
  };

  let paymentTimeSum = 0;
  let paidCount = 0;

  for (const payment of payments) {
    switch (payment.status) {
      case 'PAID':
        stats.paid++;
        stats.totalRevenue += payment.amount;
        if (payment.paidAt) {
          const timeToPayMs = payment.paidAt.getTime() - payment.createdAt.getTime();
          paymentTimeSum += timeToPayMs / 1000; // Convert to seconds
          paidCount++;
        }
        break;
      case 'PENDING':
        stats.pending++;
        break;
      case 'TIMEOUT':
        stats.timeout++;
        break;
      case 'CANCELLED':
        stats.cancelled++;
        break;
    }
  }

  if (paidCount > 0) {
    stats.averagePaymentTime = Math.round(paymentTimeSum / paidCount);
  }

  return stats;
}

/**
 * Get payment method display name
 */
export function getPaymentMethodDisplay(method: string): string {
  const methods: Record<string, string> = {
    credit_card: 'บัตรเครดิต/เดบิต',
    promptpay: 'พร้อมเพย์',
    mobile_banking: 'Mobile Banking',
    internet_banking: 'Internet Banking',
    truemoney: 'TrueMoney Wallet',
    alipay: 'Alipay',
  };

  return methods[method] || method;
}

// ============================================================================
// EXPORTS
// ============================================================================

const paymentModule = {
  // Session
  createPaymentSession,
  isPaymentSessionValid,

  // Processing
  createOmiseCharge,
  verifyOmiseCharge,
  processPayment,
  updatePaymentRecordAfterSuccess,
  cancelPayment,

  // Receipt
  generateReceipt,
  formatReceipt,

  // Utilities
  calculatePaymentStats,
  getPaymentMethodDisplay,

  // Config
  OMISE_CONFIG,
};

export default paymentModule;
