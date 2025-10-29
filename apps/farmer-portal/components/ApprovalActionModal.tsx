'use client';

import React, { useState } from 'react';
import { X, Award, CheckCircle, XCircle, RotateCcw, FileText, MessageSquare } from 'lucide-react';

export interface ApprovalFormData {
  decision: 'approve' | 'reject' | 'send_back';
  stage?: 'review' | 'inspection'; // For send_back
  comments: string;
  feedbackScore?: number;
  certificateNumber?: string;
}

interface ApprovalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  applicationData: {
    farmerId: string;
    farmerName: string;
    farmName: string;
    reviewStatus?: {
      decision: string;
      comments: string;
      reviewedAt: Date;
      reviewedBy: string;
    };
    inspectionStatus?: {
      decision: string;
      lotId: string;
      comments: string;
      inspectedAt: Date;
      inspectedBy: string;
    };
    paymentStatus?: {
      status: string;
      amount: number;
      paidAt?: Date;
    };
  };
  onSubmit: (data: ApprovalFormData) => Promise<void>;
}

export default function ApprovalActionModal({
  isOpen,
  onClose,
  applicationId,
  applicationData,
  onSubmit
}: ApprovalActionModalProps) {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'reject' | 'send_back'>('approve');
  const [sendBackStage, setSendBackStage] = useState<'review' | 'inspection'>('review');
  const [comments, setComments] = useState('');
  const [feedbackScore, setFeedbackScore] = useState(3);
  const [certificateNumber, setCertificateNumber] = useState(
    `GACP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  );

  const handleSubmit = async () => {
    if (!comments.trim()) {
      alert('กรุณากรอกความคิดเห็น');
      return;
    }

    if (decision === 'approve' && !certificateNumber.trim()) {
      alert('กรุณากรอกเลขที่ใบรับรอง');
      return;
    }

    try {
      setLoading(true);

      const formData: ApprovalFormData = {
        decision,
        stage: decision === 'send_back' ? sendBackStage : undefined,
        comments: comments.trim(),
        feedbackScore,
        certificateNumber: decision === 'approve' ? certificateNumber : undefined
      };

      await onSubmit(formData);

      // Reset form
      setComments('');
      setFeedbackScore(3);
      onClose();
    } catch (error) {
      console.error('Failed to submit approval:', error);
      alert('เกิดข้อผิดพลาดในการส่งผลการอนุมัติ');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">อนุมัติใบรับรอง</h2>
                  <p className="text-sm text-gray-600">รหัสใบสมัคร: {applicationId}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="ปิด"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Applicant info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">ข้อมูลผู้สมัคร</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">ชื่อเกษตรกร:</span>
                  <span className="ml-2 font-medium">{applicationData.farmerName}</span>
                </div>
                <div>
                  <span className="text-gray-600">ชื่อฟาร์ม:</span>
                  <span className="ml-2 font-medium">{applicationData.farmName}</span>
                </div>
              </div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Payment Status */}
              {applicationData.paymentStatus && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        applicationData.paymentStatus.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}
                    />
                    <h4 className="font-semibold text-gray-900">สถานะการชำระเงิน</h4>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>
                      สถานะ:{' '}
                      {applicationData.paymentStatus.status === 'completed'
                        ? '✓ ชำระแล้ว'
                        : '⏳ รอชำระ'}
                    </div>
                    <div>จำนวน: {applicationData.paymentStatus.amount.toLocaleString()} บาท</div>
                    {applicationData.paymentStatus.paidAt && (
                      <div>
                        ชำระเมื่อ:{' '}
                        {new Date(applicationData.paymentStatus.paidAt).toLocaleDateString('th-TH')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Review Status */}
              {applicationData.reviewStatus && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        applicationData.reviewStatus.decision === 'approve'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <h4 className="font-semibold text-gray-900">ผลการตรวจสอบเอกสาร</h4>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>
                      ผลการตรวจ:{' '}
                      {applicationData.reviewStatus.decision === 'approve'
                        ? '✓ อนุมัติ'
                        : '✗ ไม่อนุมัติ'}
                    </div>
                    <div>โดย: {applicationData.reviewStatus.reviewedBy}</div>
                    <div className="mt-1 text-xs line-clamp-2">
                      {applicationData.reviewStatus.comments}
                    </div>
                  </div>
                </div>
              )}

              {/* Inspection Status */}
              {applicationData.inspectionStatus && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        applicationData.inspectionStatus.decision === 'pass'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <h4 className="font-semibold text-gray-900">ผลการตรวจแปลง</h4>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>
                      ผลการตรวจ:{' '}
                      {applicationData.inspectionStatus.decision === 'pass'
                        ? '✓ ผ่าน'
                        : '✗ ไม่ผ่าน'}
                    </div>
                    <div>Lot ID: {applicationData.inspectionStatus.lotId}</div>
                    <div>โดย: {applicationData.inspectionStatus.inspectedBy}</div>
                    <div className="mt-1 text-xs line-clamp-2">
                      {applicationData.inspectionStatus.comments}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Decision */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">การตัดสินใจ</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setDecision('approve')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    decision === 'approve'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <CheckCircle
                    className={`w-8 h-8 mx-auto mb-2 ${
                      decision === 'approve' ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="text-sm font-medium">อนุมัติและออกใบรับรอง</div>
                </button>

                <button
                  onClick={() => setDecision('reject')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    decision === 'reject'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <XCircle
                    className={`w-8 h-8 mx-auto mb-2 ${
                      decision === 'reject' ? 'text-red-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="text-sm font-medium">ไม่อนุมัติ</div>
                </button>

                <button
                  onClick={() => setDecision('send_back')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    decision === 'send_back'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <RotateCcw
                    className={`w-8 h-8 mx-auto mb-2 ${
                      decision === 'send_back' ? 'text-yellow-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="text-sm font-medium">ส่งกลับแก้ไข</div>
                </button>
              </div>
            </div>

            {/* Send back stage (if send_back) */}
            {decision === 'send_back' && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">ส่งกลับไปยังขั้นตอน</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSendBackStage('review')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      sendBackStage === 'review'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <FileText
                      className={`w-6 h-6 mx-auto mb-1 ${
                        sendBackStage === 'review' ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                    <div className="text-sm font-medium">ตรวจสอบเอกสาร</div>
                  </button>

                  <button
                    onClick={() => setSendBackStage('inspection')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      sendBackStage === 'inspection'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <Award
                      className={`w-6 h-6 mx-auto mb-1 ${
                        sendBackStage === 'inspection' ? 'text-green-600' : 'text-gray-400'
                      }`}
                    />
                    <div className="text-sm font-medium">ตรวจแปลง</div>
                  </button>
                </div>
              </div>
            )}

            {/* Certificate Number (if approve) */}
            {decision === 'approve' && (
              <div className="mb-6">
                <label className="block font-semibold text-gray-900 mb-2">
                  <Award className="w-4 h-4 inline mr-1" />
                  เลขที่ใบรับรอง *
                </label>
                <input
                  type="text"
                  value={certificateNumber}
                  onChange={e => setCertificateNumber(e.target.value)}
                  placeholder="GACP-YYYY-XXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  เลขที่ใบรับรองจะถูกสร้างขึ้นโดยอัตโนมัติ สามารถแก้ไขได้หากต้องการ
                </p>
              </div>
            )}

            {/* Feedback score */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">คะแนนความพึงพอใจ (1-5)</h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(score => (
                  <button
                    key={score}
                    onClick={() => setFeedbackScore(score)}
                    className={`w-12 h-12 rounded-lg font-bold transition-all ${
                      feedbackScore >= score
                        ? 'bg-yellow-400 text-yellow-900 scale-110'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-900 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                ความคิดเห็น *
              </label>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="กรุณากรอกความคิดเห็นเกี่ยวกับการอนุมัติ..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !comments.trim() ||
                  (decision === 'approve' && !certificateNumber.trim())
                }
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  decision === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : decision === 'reject'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {loading
                  ? 'กำลังบันทึก...'
                  : decision === 'approve'
                    ? 'อนุมัติและออกใบรับรอง'
                    : decision === 'reject'
                      ? 'ไม่อนุมัติ'
                      : 'ส่งกลับแก้ไข'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
