'use client';

import React from 'react';

interface SubmissionCountBadgeProps {
  count: number;
  className?: string;
}

export default function SubmissionCountBadge({ count, className = '' }: SubmissionCountBadgeProps) {
  // Get color based on submission count
  const getColorConfig = (count: number) => {
    if (count === 1) {
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        icon: '✅',
        label: 'ครั้งแรก'
      };
    } else if (count === 2) {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        icon: '⚠️',
        label: 'ส่งซ้ำ'
      };
    } else if (count >= 3) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        icon: '🔴',
        label: 'ต้องชำระเพิ่ม'
      };
    } else {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-300',
        icon: '📋',
        label: 'ยังไม่ส่ง'
      };
    }
  };

  const config = getColorConfig(count);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className="text-base">{config.icon}</span>
      <span className="font-medium text-sm">ครั้งที่ {count}</span>
      {count >= 3 && (
        <span className="text-xs bg-red-200 text-red-900 px-1.5 py-0.5 rounded font-semibold">
          ค่าธรรมเนียม 5,000฿
        </span>
      )}
    </div>
  );
}

// Compact variant for table cells
export function SubmissionCountLabel({ count }: { count: number }) {
  const getColor = (count: number) => {
    if (count === 1) return 'text-green-600';
    if (count === 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIcon = (count: number) => {
    if (count === 1) return '✅';
    if (count === 2) return '⚠️';
    return '🔴';
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium ${getColor(count)}`}>
      <span className="text-sm">{getIcon(count)}</span>
      <span className="text-sm">ครั้งที่ {count}</span>
    </span>
  );
}
