'use client';

import React, { useState } from 'react';
import { X, FileText, CheckCircle, XCircle, MessageSquare, AlertCircle } from 'lucide-react';

export interface ReviewFormData {
  decision: 'approve' | 'reject' | 'request_info';
  comments: string;
  feedbackScore?: number;
  requestedDocuments?: string[];
}

interface ReviewActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  applicationData: {
    farmerId: string;
    farmerName: string;
    farmName: string;
    documents: Array<{
      type: string;
      name: string;
      url: string;
      uploadedAt: Date;
    }>;
  };
  onSubmit: (data: ReviewFormData) => Promise<void>;
}

export default function ReviewActionModal({
  isOpen,
  onClose,
  applicationId,
  applicationData,
  onSubmit,
}: ReviewActionModalProps) {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'reject' | 'request_info'>('approve');
  const [comments, setComments] = useState('');
  const [feedbackScore, setFeedbackScore] = useState(3);
  const [requestedDocuments, setRequestedDocuments] = useState<string[]>([]);

  const documentTypes = [
    'หนังสือรับรองแปลง',
    'แผนที่แปลง',
    'ทะเบียนบ้าน',
    'บัตรประชาชน',
    'สำเนาโฉนดที่ดิน',
    'ใบอนุญาตประกอบกิจการ',
    'อื่นๆ',
  ];

  const handleSubmit = async () => {
    if (!comments.trim()) {
      alert('กรุณากระบวนความคิดเห็น');
      return;
    }

    try {
      setLoading(true);

      const formData: ReviewFormData = {
        decision,
        comments: comments.trim(),
        feedbackScore,
        requestedDocuments: decision === 'request_info' ? requestedDocuments : undefined,
      };

      await onSubmit(formData);

      // Reset form
      setComments('');
      setFeedbackScore(3);
      setRequestedDocuments([]);
      onClose();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('เกิดข้อผิดพลาดในการส่งผลการตรวจสอบ');
    } finally {
      setLoading(false);
    }
  };

  const toggleDocument = (doc: string) => {
    if (requestedDocuments.includes(doc)) {
      setRequestedDocuments(requestedDocuments.filter(d => d !== doc));
    } else {
      setRequestedDocuments([...requestedDocuments, doc]);
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">ตรวจสอบเอกสาร</h2>
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

            {/* Documents */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">เอกสารประกอบ</h3>
              <div className="space-y-2">
                {applicationData.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{doc.name}</div>
                        <div className="text-xs text-gray-500">{doc.type}</div>
                      </div>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      ดูเอกสาร
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">ผลการตรวจสอบ</h3>
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
                  <div className="text-sm font-medium">อนุมัติ</div>
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
                  onClick={() => setDecision('request_info')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    decision === 'request_info'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <AlertCircle
                    className={`w-8 h-8 mx-auto mb-2 ${
                      decision === 'request_info' ? 'text-yellow-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="text-sm font-medium">ขอเอกสารเพิ่มเติม</div>
                </button>
              </div>
            </div>

            {/* Requested documents (if request_info) */}
            {decision === 'request_info' && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">เอกสารที่ต้องการเพิ่มเติม</h3>
                <div className="grid grid-cols-2 gap-2">
                  {documentTypes.map(docType => (
                    <label
                      key={docType}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={requestedDocuments.includes(docType)}
                        onChange={() => toggleDocument(docType)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm">{docType}</span>
                    </label>
                  ))}
                </div>
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
                placeholder="กรุณากรอกความคิดเห็นเกี่ยวกับเอกสาร..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                disabled={loading || !comments.trim()}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  decision === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : decision === 'reject'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึกผลการตรวจสอบ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
