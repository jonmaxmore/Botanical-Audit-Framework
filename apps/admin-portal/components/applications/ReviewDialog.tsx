'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { BaseActionModal, BaseActionModalProps, ActionFormData, DecisionOption } from '@gacp/ui';
import type { Application } from '../../lib/api/applications';

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (_data: ReviewData) => void;
  application: Application | null;
  loading?: boolean;
}

export interface ReviewData {
  decision: 'approve' | 'reject' | 'request_changes';
  comment: string;
  rating?: number;
  requiredChanges?: string;
  rejectionReason?: string;
}

const cropTypeLabels: Record<string, string> = {
  cannabis: 'กัญชา',
  turmeric: 'ขมิ้นชัน',
  ginger: 'ขิง',
  black_galingale: 'กระชายดำ',
  plai: 'ไพล',
  kratom: 'กระท่อม',
};

export default function ReviewDialog({
  open,
  onClose,
  onSubmit,
  application,
  loading = false,
}: ReviewDialogProps) {
  if (!application) return null;

  const handleActionSubmit = async (formData: ActionFormData) => {
    // Map BaseActionModal decision to ReviewData decision
    const decisionMap: Record<string, 'approve' | 'reject' | 'request_changes'> = {
      approve: 'approve',
      reject: 'reject',
      'request-changes': 'request_changes',
    };

    onSubmit({
      decision: decisionMap[formData.decision] || 'approve',
      comment: formData.comments,
      rating: formData.rating,
      requiredChanges: formData.requiredChanges,
      rejectionReason: formData.rejectionReason,
    });
  };

  const decisionOptions: DecisionOption[] = [
    {
      value: 'approve',
      label: 'อนุมัติ',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'success',
    },
    {
      value: 'request-changes',
      label: 'ขอให้แก้ไข',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'warning',
      requiresReason: true,
    },
    {
      value: 'reject',
      label: 'ไม่อนุมัติ',
      icon: <XCircle className="w-5 h-5" />,
      color: 'error',
      requiresReason: true,
    },
  ];

  return (
    <BaseActionModal
      isOpen={open}
      onClose={onClose}
      onSubmit={handleActionSubmit}
      type="review"
      title="พิจารณาคำขอรับรอง"
      subtitle={`${application.applicationNumber} - ${application.farmerName}`}
      decisionOptions={decisionOptions}
      defaultDecision="approve"
      itemId={application.id}
      itemData={{
        name: application.farmerName,
        identifier: application.applicationNumber,
        cropType: cropTypeLabels[application.cropType],
        farmSize: application.farmSize,
      }}
      showRating={true}
      minCommentLength={10}
      submitButtonText={loading ? 'กำลังบันทึก...' : 'ยืนยัน'}
    />
  );
}
