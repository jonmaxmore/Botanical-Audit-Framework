/**
 * GACP Platform - Reschedule Inspection Dialog Component
 *
 * Modal dialog for rescheduling farm inspections.
 * Features:
 * - Date picker with available slots
 * - Reschedule limit enforcement (1 time)
 * - Reason selection
 * - Confirmation flow
 *
 * @version 1.0.0
 * @created October 14, 2025
 */

'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, X, Check } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RescheduleDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;

  /** Callback to close dialog */
  onClose: () => void;

  /** Application ID */
  applicationId: string;

  /** Current inspection details */
  currentInspection: {
    id: string;
    scheduledDate: Date;
    inspectorName: string;
  };

  /** Current reschedule count */
  rescheduleCount: number;

  /** Maximum reschedule allowed (default: 1) */
  maxReschedule?: number;

  /** Available dates for rescheduling */
  availableDates?: Date[];

  /** Callback when reschedule is confirmed */
  onConfirm: (data: RescheduleData) => Promise<void>;

  /** Loading state */
  isLoading?: boolean;
}

export interface RescheduleData {
  applicationId: string;
  inspectionId: string;
  newDate: Date;
  reason: string;
  notes?: string;
}

export type RescheduleReason = 'weather' | 'personal' | 'emergency' | 'technical' | 'other';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatThaiDate(date: Date): string {
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isDateAvailable(date: Date, availableDates?: Date[]): boolean {
  if (!availableDates || availableDates.length === 0) return true;

  const dateStr = date.toISOString().split('T')[0];
  return availableDates.some(
    availableDate => availableDate.toISOString().split('T')[0] === dateStr
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RescheduleDialog({
  isOpen,
  onClose,
  applicationId,
  currentInspection,
  rescheduleCount,
  maxReschedule = 1,
  availableDates,
  onConfirm,
  isLoading = false,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reason, setReason] = useState<RescheduleReason>('personal');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [error, setError] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(null);
      setReason('personal');
      setNotes('');
      setStep('select');
      setError(null);
    }
  }, [isOpen]);

  // Check if reschedule is allowed
  const canReschedule = rescheduleCount < maxReschedule;
  const isLastReschedule = rescheduleCount === maxReschedule - 1;

  // Reason options
  const reasonOptions: { value: RescheduleReason; label: string; icon: string }[] = [
    { value: 'weather', label: 'สภาพอากาศไม่เอื้ออำนวย', icon: '🌧️' },
    { value: 'personal', label: 'ติดธุระส่วนตัว', icon: '👤' },
    { value: 'emergency', label: 'เหตุฉุกเฉิน', icon: '🚨' },
    { value: 'technical', label: 'ปัญหาทางเทคนิค', icon: '🔧' },
    { value: 'other', label: 'อื่นๆ', icon: '📝' },
  ];

  // Handle confirm
  const handleConfirm = async () => {
    if (!selectedDate) {
      setError('กรุณาเลือกวันที่ใหม่');
      return;
    }

    if (!canReschedule) {
      setError('คุณได้ใช้สิทธิ์เลื่อนนัดหมายครบแล้ว');
      return;
    }

    try {
      await onConfirm({
        applicationId,
        inspectionId: currentInspection.id,
        newDate: selectedDate,
        reason,
        notes: notes || undefined,
      });

      setStep('success');

      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
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
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">เลื่อนนัดหมายการตรวจประเมิน</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Cannot Reschedule Warning */}
            {!canReschedule && (
              <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">ไม่สามารถเลื่อนนัดหมายได้</p>
                    <p className="text-sm text-red-800 mt-1">
                      คุณได้ใช้สิทธิ์เลื่อนนัดหมายครบ {maxReschedule} ครั้งแล้ว
                      หากต้องการเปลี่ยนแปลง กรุณาติดต่อเจ้าหน้าที่
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Last Reschedule Warning */}
            {canReschedule && isLastReschedule && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-yellow-900">
                      ⚠️ นี่เป็นการเลื่อนนัดหมายครั้งสุดท้าย
                    </p>
                    <p className="text-sm text-yellow-800 mt-1">
                      หลังจากนี้คุณจะไม่สามารถเลื่อนนัดได้อีก หากไม่สามารถมาตามนัดใหม่
                      ใบสมัครจะกลับเข้าคิวรอใหม่
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success State */}
            {step === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">เลื่อนนัดหมายสำเร็จ!</h3>
                <p className="text-gray-600">ระบบกำลังปิดหน้าต่างนี้...</p>
              </div>
            )}

            {/* Form State */}
            {step !== 'success' && canReschedule && (
              <>
                {/* Current Inspection Info */}
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">นัดหมายปัจจุบัน</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">วันที่</p>
                        <p className="font-medium">
                          {formatThaiDate(currentInspection.scheduledDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">เวลา</p>
                        <p className="font-medium">{formatTime(currentInspection.scheduledDate)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-sm text-gray-600">
                      ผู้ตรวจประเมิน: {currentInspection.inspectorName}
                    </p>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    เลือกวันที่ใหม่ <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate?.toISOString().split('T')[0] || ''}
                    onChange={e => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      setSelectedDate(date);
                      setError(null);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                  {selectedDate && (
                    <p className="mt-2 text-sm text-gray-600">
                      วันที่เลือก: {formatThaiDate(selectedDate)}
                    </p>
                  )}
                </div>

                {/* Reason Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    เหตุผลการเลื่อนนัด <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reasonOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setReason(option.value)}
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg text-left transition-colors ${
                          reason === option.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        disabled={isLoading}
                      >
                        <span className="text-2xl">{option.icon}</span>
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    รายละเอียดเพิ่มเติม (ถ้ามี)
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="กรุณาระบุรายละเอียดเพิ่มเติม..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    disabled={isLoading}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Reschedule Counter */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>การเลื่อนนัดของคุณ:</strong> {rescheduleCount} / {maxReschedule} ครั้ง
                    {isLastReschedule && ' (ครั้งสุดท้าย)'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {step !== 'success' && canReschedule && (
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100"
                disabled={isLoading}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedDate || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'กำลังดำเนินการ...' : 'ยืนยันการเลื่อนนัด'}
              </button>
            </div>
          )}

          {!canReschedule && (
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
              >
                ปิด
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

export default RescheduleDialog;
