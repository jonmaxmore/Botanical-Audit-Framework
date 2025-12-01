'use client';

import React from 'react';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'overdue';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  amount?: number;
  dueDate?: Date;
  onClick?: () => void;
  className?: string;
}

export default function PaymentStatusBadge({
  status,
  amount,
  dueDate,
  onClick,
  className = ''
}: PaymentStatusBadgeProps) {
  // Get status color and text
  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '✅',
          text: 'ชำระแล้ว',
          textColor: 'text-green-700'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '⏳',
          text: 'รอชำระ',
          textColor: 'text-yellow-700'
        };
      case 'overdue':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '⚠️',
          text: 'เกินกำหนด',
          textColor: 'text-red-700'
        };
      case 'failed':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '❌',
          text: 'ล้มเหลว',
          textColor: 'text-red-700'
        };
      case 'cancelled':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '🚫',
          text: 'ยกเลิก',
          textColor: 'text-gray-700'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '❓',
          text: 'ไม่ทราบ',
          textColor: 'text-gray-700'
        };
    }
  };

  const config = getStatusConfig(status);

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate days overdue
  const getDaysOverdue = () => {
    if (!dueDate) return 0;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysOverdue = status === 'overdue' ? getDaysOverdue() : 0;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium text-sm transition-all ${
        config.color
      } ${onClick ? 'hover:shadow-md hover:scale-105 cursor-pointer' : 'cursor-default'} ${className}`}
    >
      <span className="text-base">{config.icon}</span>
      <span>{config.text}</span>

      {amount !== undefined && (
        <span className={`font-semibold ${config.textColor}`}>{formatAmount(amount)}</span>
      )}

      {status === 'overdue' && daysOverdue > 0 && (
        <span className="text-xs bg-red-200 text-red-900 px-1.5 py-0.5 rounded">
          +{daysOverdue} วัน
        </span>
      )}
    </button>
  );
}

// Simple variant without click handler
export function PaymentStatusLabel({ status }: { status: PaymentStatus }) {
  const config = {
    completed: { color: 'text-green-600', icon: '✅', text: 'ชำระแล้ว' },
    pending: { color: 'text-yellow-600', icon: '⏳', text: 'รอชำระ' },
    overdue: { color: 'text-red-600', icon: '⚠️', text: 'เกินกำหนด' },
    failed: { color: 'text-red-600', icon: '❌', text: 'ล้มเหลว' },
    cancelled: { color: 'text-gray-600', icon: '🚫', text: 'ยกเลิก' }
  }[status];

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${config.color}`}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </span>
  );
}
