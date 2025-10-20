/**
 * Reviewer Dashboard
 * Dashboard for DTAM reviewers to check applications and documents
 */
'use client';

import { Metadata } from 'next';
import { useState, useEffect } from 'react';
import DashboardLayout, { DashboardMenuItem } from '@/components/dashboard/DashboardLayout';
import { UserRole } from '@/lib/roles';
import { Dashboard, Assignment, RateReview, CheckCircle, Warning } from '@mui/icons-material';
import NotificationBell from '@/components/NotificationBell';
import NotificationPanel from '@/components/NotificationPanel';
import PaymentStatusBadge from '@/components/PaymentStatusBadge';
import SubmissionCountBadge from '@/components/SubmissionCountBadge';
import ReviewActionModal from '@/components/ReviewActionModal';

// Mock metadata (can't use export in client component)
// export const metadata: Metadata = {
//   title: 'แดชบอร์ดเจ้าหน้าที่ตรวจสอบ | GACP Platform',
//   description: 'Dashboard for DTAM reviewers',
// };

interface Application {
  id: string;
  applicationNumber: string;
  farmName: string;
  farmerName: string;
  submissionCount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'overdue';
  paymentAmount: number;
  submittedAt: string;
  status: 'pending_review' | 'reviewing' | 'completed';
  documents: any[];
}

const reviewerMenuItems: DashboardMenuItem[] = [
  {
    title: 'หน้าหลัก',
    path: '/dashboard/reviewer',
    icon: <Dashboard />,
  },
  {
    title: 'รอตรวจสอบ',
    path: '/dashboard/reviewer/pending',
    icon: <Assignment />,
    badge: 12,
  },
  {
    title: 'กำลังดำเนินการ',
    path: '/dashboard/reviewer/inprogress',
    icon: <RateReview />,
    badge: 5,
  },
  {
    title: 'ตรวจสอบแล้ว',
    path: '/dashboard/reviewer/completed',
    icon: <CheckCircle />,
  },
];

export default function ReviewerDashboardPage() {
  return (
    <DashboardLayout
      role={UserRole.REVIEWER}
      menuItems={reviewerMenuItems}
      userName="นางสาวทดสอบ ผู้ตรวจสอบ"
      userEmail="reviewer@gacp.test"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">สวัสดี, นางสาวทดสอบ ผู้ตรวจสอบ 👋</h1>
          <p className="text-blue-50">แดชบอร์ดสำหรับตรวจสอบเอกสารและให้ความเห็น</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="รอตรวจสอบ" value="12" color="orange" icon={<Warning />} />
          <StatCard title="กำลังดำเนินการ" value="5" color="blue" icon={<RateReview />} />
          <StatCard title="ตรวจสอบแล้ว" value="45" color="green" icon={<CheckCircle />} />
          <StatCard title="ทั้งหมดวันนี้" value="8" color="purple" icon={<Assignment />} />
        </div>

        {/* Pending Applications */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">เอกสารรอตรวจสอบ</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Assignment className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">คำขอรับรองฟาร์ม #{1000 + i}</p>
                  <p className="text-sm text-gray-500">
                    ฟาร์มทดสอบ {i} - ส่งเมื่อ 2 ชั่วโมงที่แล้ว
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  ตรวจสอบ
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: string;
  color: 'blue' | 'orange' | 'green' | 'purple';
  icon: React.ReactNode;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
