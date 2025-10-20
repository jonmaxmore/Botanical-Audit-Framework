/**
 * GACP Platform - Payment Fees Configuration
 * ค่าธรรมเนียมตามระบบเดิมที่ได้รับการทดสอบและอนุมัติแล้ว
 */

const PAYMENT_FEES = {
  // ระบบค่าธรรมเนียม 2 เฟส (อัพเดท October 2025)
  DOCUMENT_REVIEW_FEE: 5000, // ค่าธรรมเนียมตรวจสอบเอกสาร (Phase 1)
  FIELD_AUDIT_FEE: 25000, // ค่าธรรมเนียมตรวจสอบภาคสนาม (Phase 2)
  // CERTIFICATE_FEE: 2000,     // ❌ ยกเลิก - ไม่มี Phase 3

  // ค่าธรรมเนียมพิเศษ
  RE_SUBMISSION_FEE: 5000, // ค่าธรรมเนียมยื่นซ้ำ (ครั้งที่ 3)
  URGENT_PROCESSING_FEE: 3000, // ค่าธรรมเนียมเร่งด่วน (เสริม)

  // การคำนวณยอดรวม
  TOTAL_STANDARD_FEE: 30000, // รวมทั้งหมด (5000 + 25000)

  // ขั้นตอนการชำระเงิน (2 Phase เท่านั้น)
  PAYMENT_PHASES: {
    PHASE_1: {
      amount: 5000,
      description: 'ค่าธรรมเนียมตรวจสอบเอกสาร',
      when: 'หลังจากส่งใบสมัคร',
      status_before: 'submitted',
      status_after: 'payment_pending_1',
    },
    PHASE_2: {
      amount: 25000,
      description: 'ค่าธรรมเนียมตรวจสอบภาคสนาม',
      when: 'หลังจากเอกสารผ่านการตรวจสอบ',
      status_before: 'reviewing',
      status_after: 'payment_pending_2',
    },
    // PHASE_3 ถูกยกเลิก - ไม่มีค่าธรรมเนียมออกใบรับรองแล้ว
  },

  // สถานะการชำระเงิน
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    EXPIRED: 'expired',
    REFUNDED: 'refunded',
  },

  // ระยะเวลาชำระเงิน
  PAYMENT_TIMEOUT: {
    PHASE_1: 7 * 24 * 60 * 60 * 1000, // 7 วัน
    PHASE_2: 14 * 24 * 60 * 60 * 1000, // 14 วัน
  },

  // Gateway และช่องทางการชำระเงิน
  PAYMENT_METHODS: {
    CREDIT_CARD: 'credit_card',
    INTERNET_BANKING: 'internet_banking',
    MOBILE_BANKING: 'mobile_banking',
    QR_CODE: 'qr_code',
    BANK_TRANSFER: 'bank_transfer',
    COUNTER_SERVICE: 'counter_service',
  },

  // ข้อมูลธนาคารรับเงิน
  BANK_ACCOUNTS: {
    PRIMARY: {
      bank: 'ธนาคารกรุงไทย',
      account_number: '123-4-56789-0',
      account_name: 'กรมวิชาการเกษตร',
      branch: 'สำนักงานใหญ่',
    },
  },
};

module.exports = {
  PAYMENT_FEES,

  // Helper functions
  getTotalFee: () => PAYMENT_FEES.TOTAL_STANDARD_FEE,

  getPhaseAmount: phase => {
    const phases = PAYMENT_FEES.PAYMENT_PHASES;
    switch (phase) {
      case 1:
        return phases.PHASE_1.amount;
      case 2:
        return phases.PHASE_2.amount;
      // case 3: Phase 3 ถูกยกเลิก
      default:
        return 0;
    }
  },

  getPhaseDescription: phase => {
    const phases = PAYMENT_FEES.PAYMENT_PHASES;
    switch (phase) {
      case 1:
        return phases.PHASE_1.description;
      case 2:
        return phases.PHASE_2.description;
      // case 3: Phase 3 ถูกยกเลิก
      default:
        return 'Unknown phase';
    }
  },

  isValidPhase: phase => {
    return [1, 2].includes(parseInt(phase)); // เหลือแค่ Phase 1 และ 2
  },

  calculateTotalPaid: (paidPhases = []) => {
    return paidPhases.reduce((total, phase) => {
      return total + (PAYMENT_FEES.PAYMENT_PHASES[`PHASE_${phase}`]?.amount || 0);
    }, 0);
  },

  getNextPhase: currentPhase => {
    const phase = parseInt(currentPhase);
    return phase < 2 ? phase + 1 : null; // เหลือแค่ Phase 1 → 2
  },

  getRemainingAmount: (paidPhases = []) => {
    const totalPaid = calculateTotalPaid(paidPhases);
    return PAYMENT_FEES.TOTAL_STANDARD_FEE - totalPaid;
  },
};
