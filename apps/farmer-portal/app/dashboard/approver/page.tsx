/**
 * Approver Dashboard
 * Dashboard for DTAM approvers to approve/reject applications
 */

import { Metadata } from 'next';
import DashboardLayout, { DashboardMenuItem } from '@/components/dashboard/DashboardLayout';
import { UserRole } from '@/lib/roles';
import { Dashboard, Verified, Cancel, CardMembership, Assessment } from '@mui/icons-material';

export const metadata: Metadata = {
  title: 'แดชบอร์ดผู้อนุมัติ | GACP Platform',
  description: 'Dashboard for DTAM approvers',
};

const approverMenuItems: DashboardMenuItem[] = [
  {
    title: 'หน้าหลัก',
    path: '/dashboard/approver',
    icon: <Dashboard />,
  },
  {
    title: 'รออนุมัติ',
    path: '/dashboard/approver/pending',
    icon: <Verified />,
    badge: 8,
  },
  {
    title: 'อนุมัติแล้ว',
    path: '/dashboard/approver/approved',
    icon: <CardMembership />,
  },
  {
    title: 'ปฏิเสธ',
    path: '/dashboard/approver/rejected',
    icon: <Cancel />,
  },
  {
    title: 'รายงาน',
    path: '/dashboard/approver/reports',
    icon: <Assessment />,
  },
];

export default function ApproverDashboardPage() {
  return (
    <DashboardLayout
      role={UserRole.APPROVER}
      menuItems={approverMenuItems}
      userName="นางสาวทดสอบ ผู้อนุมัติ"
      userEmail="approver@gacp.test"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">สวัสดี, นางสาวทดสอบ ผู้อนุมัติ ✅</h1>
          <p className="text-purple-50">แดชบอร์ดสำหรับอนุมัติและออกใบรับรอง</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="รออนุมัติ" value="8" color="orange" icon={<Verified />} />
          <StatCard title="อนุมัติวันนี้" value="12" color="green" icon={<CardMembership />} />
          <StatCard title="ปฏิเสธ" value="3" color="red" icon={<Cancel />} />
          <StatCard title="ทั้งหมดเดือนนี้" value="156" color="purple" icon={<Assessment />} />
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">คำขอรออนุมัติ</h2>
          <div className="space-y-3">
            {[
              { id: '2024-001', farm: 'ฟาร์มผักอินทรีย์', inspector: 'นายสมชาย', score: 95 },
              { id: '2024-002', farm: 'สวนมะม่วงออร์แกนิก', inspector: 'นางสุดา', score: 88 },
              { id: '2024-003', farm: 'ฟาร์มผักไฮโดร', inspector: 'นายวิชัย', score: 92 },
            ].map(app => (
              <div
                key={app.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:border-purple-500 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium">{app.farm}</p>
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-sm font-medium">
                      คะแนน: {app.score}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    เลขที่: {app.id} | ตรวจโดย: {app.inspector}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    ปฏิเสธ
                  </button>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    อนุมัติ
                  </button>
                </div>
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
  color: 'orange' | 'green' | 'red' | 'purple';
  icon: React.ReactNode;
}) {
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
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
