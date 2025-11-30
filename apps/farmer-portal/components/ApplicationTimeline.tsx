/**
 * Application Timeline Component (V2)
 * Visual progress bar for the 8-step GACP application flow
 *
 * Steps:
 * 1. Draft
 * 2. Pending Payment 1 (Document Review Fee)
 * 3. Document Review (Waiting/Correction)
 * 4. Pending Payment 2 (Field Audit Fee)
 * 5. Ready for Virtual Audit (Video Call Scheduled)
 * 6. Audit in Progress
 * 7. On-site Pending (if needed - Free)
 * 8. Approved / Rejected
 */

import React from 'react';

export type ApplicationStatus =
  | 'draft'
  | 'pending_payment_1'
  | 'document_review'
  | 'pending_payment_2'
  | 'ready_for_audit'
  | 'audit_in_progress'
  | 'onsite_pending'
  | 'approved'
  | 'rejected';

interface TimelineStep {
  id: string;
  label: string;
  description: string;
  icon: string;
  status: 'completed' | 'current' | 'pending' | 'skipped';
}

interface ApplicationTimelineProps {
  currentStatus: ApplicationStatus;
  className?: string;
}

const TIMELINE_STEPS: Record<ApplicationStatus, number> = {
  draft: 0,
  pending_payment_1: 1,
  document_review: 2,
  pending_payment_2: 3,
  ready_for_audit: 4,
  audit_in_progress: 5,
  onsite_pending: 6,
  approved: 7,
  rejected: 7,
};

const STEPS: TimelineStep[] = [
  {
    id: 'draft',
    label: 'แบบร่าง',
    description: 'Draft',
    icon: '📝',
    status: 'pending',
  },
  {
    id: 'pending_payment_1',
    label: 'ชำระค่าตรวจเอกสาร',
    description: 'Payment 1: Document Review',
    icon: '💳',
    status: 'pending',
  },
  {
    id: 'document_review',
    label: 'ตรวจสอบเอกสาร',
    description: 'Document Review',
    icon: '📋',
    status: 'pending',
  },
  {
    id: 'pending_payment_2',
    label: 'ชำระค่าตรวจประเมิน',
    description: 'Payment 2: Field Audit',
    icon: '💰',
    status: 'pending',
  },
  {
    id: 'ready_for_audit',
    label: 'พร้อมตรวจประเมิน',
    description: 'Ready for Virtual Audit',
    icon: '📹',
    status: 'pending',
  },
  {
    id: 'audit_in_progress',
    label: 'กำลังตรวจประเมิน',
    description: 'Audit in Progress',
    icon: '🔍',
    status: 'pending',
  },
  {
    id: 'onsite_pending',
    label: 'รอตรวจสอบเพิ่มเติม',
    description: 'On-site Pending (Optional)',
    icon: '🚗',
    status: 'pending',
  },
  {
    id: 'result',
    label: 'ผลการพิจารณา',
    description: 'Result',
    icon: '✅',
    status: 'pending',
  },
];

export default function ApplicationTimeline({
  currentStatus,
  className = '',
}: ApplicationTimelineProps) {
  const currentStepIndex = TIMELINE_STEPS[currentStatus] || 0;

  const getStepStatus = (index: number): 'completed' | 'current' | 'pending' => {
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'pending';
  };

  const getStatusColor = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'current':
        return 'bg-blue-500 text-white animate-pulse';
      case 'pending':
        return 'bg-gray-200 text-gray-500';
    }
  };

  const getLineColor = (index: number) => {
    return index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-300 hidden md:block" />

        {/* Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {STEPS.map((step, index) => {
            const status = getStepStatus(index);
            const isOnsite = step.id === 'onsite_pending';
            const shouldSkipOnsite = isOnsite && currentStatus !== 'onsite_pending';

            return (
              <div
                key={step.id}
                className={`relative flex flex-col items-center ${
                  shouldSkipOnsite ? 'opacity-50' : ''
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`
                    relative z-10 w-16 h-16 rounded-full flex items-center justify-center
                    text-2xl font-bold transition-all duration-300
                    ${getStatusColor(status)}
                    ${status === 'current' ? 'ring-4 ring-blue-300' : ''}
                  `}
                >
                  {status === 'completed' ? '✓' : step.icon}
                </div>

                {/* Connecting Line (Mobile) */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`
                      md:hidden absolute top-8 left-1/2 w-full h-1
                      ${getLineColor(index)}
                    `}
                    style={{ transform: 'translateX(50%)' }}
                  />
                )}

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <div className="text-sm font-semibold text-gray-800">{step.label}</div>
                  <div className="text-xs text-gray-500 hidden md:block">{step.description}</div>
                </div>

                {/* Optional Badge */}
                {isOnsite && (
                  <div className="mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    ถ้าจำเป็น
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-sm text-blue-800">
          <strong>สถานะปัจจุบัน:</strong> {STEPS[currentStepIndex]?.label || 'ไม่ทราบสถานะ'}
        </p>
      </div>
    </div>
  );
}
