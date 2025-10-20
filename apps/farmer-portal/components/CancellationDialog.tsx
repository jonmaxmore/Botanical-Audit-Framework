/**
 * GACP Platform - Application Cancellation Dialog Component
 *
 * Modal dialog for cancelling applications.
 * Features:
 * - Confirmation flow with warnings
 * - No refund policy acknowledgment
 * - Cancellation reason selection
 * - Cannot undo warning
 *
 * @version 1.0.0
 * @created October 14, 2025
 */

'use client';

import { useState } from 'react';
import { AlertTriangle, X, Check, DollarSign, FileX } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CancellationDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;

  /** Callback to close dialog */
  onClose: () => void;

  /** Application ID */
  applicationId: string;

  /** Application status */
  applicationStatus: string;

  /** Whether user has made payment */
  hasPaidFee: boolean;

  /** Amount paid (if any) */
  paidAmount?: number;

  /** Callback when cancellation is confirmed */
  onConfirm: (data: CancellationData) => Promise<void>;

  /** Loading state */
  isLoading?: boolean;
}

export interface CancellationData {
  applicationId: string;
  reason: string;
  acknowledgedNoRefund: boolean;
  additionalNotes?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CANCELLATION_REASONS = [
  { value: 'changed_mind', label: 'เปลี่ยนใจ / ไม่ต้องการดำเนินการต่อ', icon: '🔄' },
  { value: 'cost', label: 'ค่าใช้จ่ายสูงเกินไป', icon: '💰' },
  { value: 'time', label: 'ใช้เวลานานเกินไป', icon: '⏰' },
  { value: 'requirements', label: 'ไม่สามารถปฏิบัติตามข้อกำหนดได้', icon: '📋' },
  { value: 'personal', label: 'เหตุผลส่วนตัว', icon: '👤' },
  { value: 'other', label: 'อื่นๆ', icon: '📝' },
];

const NO_REFUND_POLICY = {
  message: 'ไม่สามารถขอคืนเงินได้ในทุกกรณี',
  details: [
    'ค่าธรรมเนียมที่ชำระแล้วไม่สามารถขอคืนได้',
    'นโยบายนี้ใช้กับทุกกรณีไม่มีข้อยกเว้น',
    'กรุณาพิจารณาอย่างรอบคอบก่อนยืนยันการยกเลิก',
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export function CancellationDialog({
  isOpen,
  onClose,
  applicationId,
  applicationStatus,
  hasPaidFee,
  paidAmount = 0,
  onConfirm,
  isLoading = false,
}: CancellationDialogProps) {
  const [step, setStep] = useState<'reason' | 'confirm' | 'success'>('reason');
  const [reason, setReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [acknowledgedNoRefund, setAcknowledgedNoRefund] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens
  const resetState = () => {
    setStep('reason');
    setReason('');
    setAdditionalNotes('');
    setAcknowledgedNoRefund(false);
    setError(null);
  };

  // Handle close
  const handleClose = () => {
    if (!isLoading) {
      resetState();
      onClose();
    }
  };

  // Handle next step
  const handleNext = () => {
    if (!reason) {
      setError('กรุณาเลือกเหตุผลการยกเลิก');
      return;
    }
    setError(null);
    setStep('confirm');
  };

  // Handle back
  const handleBack = () => {
    setStep('reason');
    setError(null);
  };

  // Handle confirm
  const handleConfirm = async () => {
    if (hasPaidFee && !acknowledgedNoRefund) {
      setError('กรุณายอมรับนโยบายไม่คืนเงิน');
      return;
    }

    try {
      await onConfirm({
        applicationId,
        reason,
        acknowledgedNoRefund: hasPaidFee ? acknowledgedNoRefund : true,
        additionalNotes: additionalNotes || undefined,
      });

      setStep('success');

      // Auto close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <FileX className="w-7 h-7 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">ยกเลิกใบสมัคร</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
              aria-label="ปิด"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Reason Selection */}
            {step === 'reason' && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">เหตุผลในการยกเลิก</h3>
                  <p className="text-sm text-gray-600">
                    กรุณาเลือกเหตุผลหลักที่คุณต้องการยกเลิกใบสมัครนี้
                  </p>
                </div>

                {/* Reason Options */}
                <div className="mb-6 space-y-3">
                  {CANCELLATION_REASONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setReason(option.value);
                        setError(null);
                      }}
                      className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg text-left transition-colors ${
                        reason === option.value
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="flex-1 font-medium">{option.label}</span>
                      {reason === option.value && <Check className="w-5 h-5 text-red-600" />}
                    </button>
                  ))}
                </div>

                {/* Additional Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    รายละเอียดเพิ่มเติม (ถ้ามี)
                  </label>
                  <textarea
                    value={additionalNotes}
                    onChange={e => setAdditionalNotes(e.target.value)}
                    placeholder="กรุณาระบุรายละเอียดเพิ่มเติมเกี่ยวกับการยกเลิก..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </>
            )}

            {/* Step 2: Confirmation */}
            {step === 'confirm' && (
              <>
                {/* Warning Banner */}
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-red-900 text-lg mb-2">⚠️ คำเตือนสำคัญ</h3>
                      <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                        <li>การยกเลิกใบสมัครไม่สามารถยกเลิกได้</li>
                        <li>คุณจะต้องยื่นคำขอใหม่หากต้องการดำเนินการอีกครั้ง</li>
                        <li>ข้อมูลทั้งหมดจะถูกเก็บไว้เพื่อการอ้างอิงเท่านั้น</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* No Refund Policy (if paid) */}
                {hasPaidFee && (
                  <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-bold text-yellow-900 text-lg mb-2">นโยบายการคืนเงิน</h3>
                        <p className="text-yellow-900 font-semibold mb-3">
                          {NO_REFUND_POLICY.message}
                        </p>
                        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                          {NO_REFUND_POLICY.details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                        </ul>

                        {/* Amount Paid Display */}
                        <div className="mt-4 p-3 bg-white border border-yellow-400 rounded">
                          <p className="text-sm text-gray-700">
                            ยอดเงินที่ชำระแล้ว:{' '}
                            <strong className="text-lg">
                              ฿{paidAmount.toLocaleString('th-TH')}
                            </strong>
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            ⚠️ จะไม่ได้รับเงินคืนในทุกกรณี
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">สรุปการยกเลิก</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">รหัสใบสมัคร:</span>
                      <span className="font-medium">{applicationId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">สถานะปัจจุบัน:</span>
                      <span className="font-medium">{applicationStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">เหตุผล:</span>
                      <span className="font-medium">
                        {CANCELLATION_REASONS.find(r => r.value === reason)?.label}
                      </span>
                    </div>
                    {additionalNotes && (
                      <div className="pt-2 border-t border-gray-300">
                        <span className="text-gray-600">รายละเอียด:</span>
                        <p className="mt-1 text-gray-900">{additionalNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* No Refund Acknowledgment Checkbox (if paid) */}
                {hasPaidFee && (
                  <div className="mb-6">
                    <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={acknowledgedNoRefund}
                        onChange={e => {
                          setAcknowledgedNoRefund(e.target.checked);
                          setError(null);
                        }}
                        className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          ฉันยอมรับและเข้าใจนโยบายการไม่คืนเงิน
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          ฉันทราบดีว่าเงินที่ชำระไปแล้ว ฿{paidAmount.toLocaleString('th-TH')}
                          จะไม่ได้รับคืนไม่ว่ากรณีใดๆ
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </>
            )}

            {/* Step 3: Success */}
            {step === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">ยกเลิกใบสมัครสำเร็จ</h3>
                <p className="text-gray-600">ระบบกำลังปิดหน้าต่างนี้...</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {step === 'reason' && (
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100"
                disabled={isLoading}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleNext}
                disabled={!reason || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100"
                disabled={isLoading}
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading || (hasPaidFee && !acknowledgedNoRefund)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'กำลังดำเนินการ...' : 'ยืนยันการยกเลิก'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default CancellationDialog;
