/**
 * Farmer Dashboard
 * Main dashboard for farmers to manage their farms and applications
 */

import { Metadata } from 'next';
import DashboardLayout, { DashboardMenuItem } from '@/components/dashboard/DashboardLayout';
import { UserRole } from '@/lib/roles';
import { Dashboard, Agriculture, Description, Assessment, Settings } from '@mui/icons-material';

export const metadata: Metadata = {
  title: 'แดชบอร์ดเกษตรกร | GACP Platform',
  description: 'Dashboard for farmers to manage their farms and applications',
};

const farmerMenuItems: DashboardMenuItem[] = [
  {
    title: 'หน้าหลัก',
    path: '/dashboard/farmer',
    icon: <Dashboard />,
  },
  {
    title: 'จัดการฟาร์ม',
    path: '/farm',
    icon: <Agriculture />,
  },
  {
    title: 'ยื่นเอกสาร',
    path: '/application',
    icon: <Description />,
    badge: 2,
  },
  {
    title: 'แบบสอบถาม',
    path: '/survey',
    icon: <Assessment />,
  },
  {
    title: 'ตั้งค่า',
    path: '/settings',
    icon: <Settings />,
    divider: true,
  },
];

export default function FarmerDashboardPage() {
  return (
    <DashboardLayout
      role={UserRole.FARMER}
      menuItems={farmerMenuItems}
      userName="นายทดสอบ เกษตรกร"
      userEmail="farmer@gacp.test"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">สวัสดี, นายทดสอบ เกษตรกร 👋</h1>
          <p className="text-primary-50">ยินดีต้อนรับสู่ระบบ GACP Platform</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="ฟาร์มทั้งหมด"
            value="3"
            icon={<Agriculture className="w-8 h-8" />}
            color="blue"
          />
          <StatCard
            title="เอกสารรออนุมัติ"
            value="2"
            icon={<Description className="w-8 h-8" />}
            color="orange"
          />
          <StatCard
            title="แบบสอบถามที่ทำ"
            value="5"
            icon={<Assessment className="w-8 h-8" />}
            color="green"
          />
          <StatCard
            title="ใบรับรองที่ได้รับ"
            value="1"
            icon={<Dashboard className="w-8 h-8" />}
            color="purple"
          />
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">กิจกรรมล่าสุด</h2>
          <div className="space-y-3">
            {/* Activity items */}
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">เอกสารได้รับการอนุมัติ</p>
                <p className="text-sm text-gray-500">2 ชั่วโมงที่แล้ว</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">อัพเดตข้อมูลฟาร์มสำเร็จ</p>
                <p className="text-sm text-gray-500">5 ชั่วโมงที่แล้ว</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'orange' | 'green' | 'purple';
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
