/**
 * Admin Dashboard
 * Dashboard for system administrators to manage the platform
 */

import { Metadata } from 'next';
import DashboardLayout, { DashboardMenuItem } from '@/components/dashboard/DashboardLayout';
import { UserRole } from '@/lib/roles';
import {
  Dashboard,
  People,
  Settings,
  Security,
  Assessment,
  History,
  Backup,
} from '@mui/icons-material';

export const metadata: Metadata = {
  title: 'แดชบอร์ดผู้ดูแลระบบ | GACP Platform',
  description: 'Dashboard for system administrators',
};

const adminMenuItems: DashboardMenuItem[] = [
  {
    title: 'หน้าหลัก',
    path: '/dashboard/admin',
    icon: <Dashboard />,
  },
  {
    title: 'จัดการผู้ใช้',
    path: '/dashboard/admin/users',
    icon: <People />,
  },
  {
    title: 'ตั้งค่าระบบ',
    path: '/dashboard/admin/settings',
    icon: <Settings />,
  },
  {
    title: 'รายงานรวม',
    path: '/dashboard/admin/reports',
    icon: <Assessment />,
  },
  {
    title: 'Audit Logs',
    path: '/dashboard/admin/logs',
    icon: <History />,
  },
  {
    title: 'ความปลอดภัย',
    path: '/dashboard/admin/security',
    icon: <Security />,
  },
  {
    title: 'Backup',
    path: '/dashboard/admin/backup',
    icon: <Backup />,
  },
];

export default function AdminDashboardPage() {
  return (
    <DashboardLayout
      role={UserRole.ADMIN}
      menuItems={adminMenuItems}
      userName="ผู้ดูแลระบบ"
      userEmail="admin@gacp.test"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">ยินดีต้อนรับ, ผู้ดูแลระบบ ⚙️</h1>
          <p className="text-red-50">แดชบอร์ดสำหรับจัดการระบบทั้งหมด</p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="ผู้ใช้ทั้งหมด" value="1,234" color="blue" icon={<People />} />
          <StatCard title="ฟาร์มทั้งหมด" value="456" color="green" icon={<Dashboard />} />
          <StatCard title="ใบรับรองที่ออก" value="789" color="purple" icon={<Assessment />} />
          <StatCard title="ทำงานปกติ" value="100%" color="green" icon={<Security />} />
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">กิจกรรมล่าสุด</h2>
            <div className="space-y-3">
              {[
                { type: 'user', text: 'ผู้ใช้ใหม่ลงทะเบียน', time: '5 นาทีที่แล้ว', color: 'blue' },
                {
                  type: 'cert',
                  text: 'ออกใบรับรองใหม่ #789',
                  time: '15 นาทีที่แล้ว',
                  color: 'green',
                },
                {
                  type: 'error',
                  text: 'ตรวจพบการเข้าถึงที่ผิดปกติ',
                  time: '1 ชั่วโมงที่แล้ว',
                  color: 'red',
                },
                {
                  type: 'backup',
                  text: 'Backup เสร็จสมบูรณ์',
                  time: '2 ชั่วโมงที่แล้ว',
                  color: 'purple',
                },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.text}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">สถานะระบบ</h2>
            <div className="space-y-4">
              {[
                { service: 'API Server', status: 'online', uptime: '99.9%' },
                { service: 'Database', status: 'online', uptime: '99.8%' },
                { service: 'Storage', status: 'online', uptime: '100%' },
                { service: 'Email Service', status: 'online', uptime: '99.5%' },
              ].map(service => (
                <div
                  key={service.service}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">{service.service}</span>
                  </div>
                  <div className="text-sm text-gray-500">Uptime: {service.uptime}</div>
                </div>
              ))}
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
  color,
  icon,
}: {
  title: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'red';
  icon: React.ReactNode;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
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
