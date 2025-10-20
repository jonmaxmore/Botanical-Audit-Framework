/**
 * Inspector Dashboard
 * Dashboard for DTAM inspectors to perform farm inspections
 */

import { Metadata } from 'next';
import DashboardLayout, { DashboardMenuItem } from '@/components/dashboard/DashboardLayout';
import { UserRole } from '@/lib/roles';
import { Dashboard, Search, VideoCall, CheckCircle, Schedule, Map } from '@mui/icons-material';

export const metadata: Metadata = {
  title: 'แดชบอร์ดเจ้าหน้าที่ตรวจฟาร์ม | GACP Platform',
  description: 'Dashboard for DTAM inspectors',
};

const inspectorMenuItems: DashboardMenuItem[] = [
  {
    title: 'หน้าหลัก',
    path: '/dashboard/inspector',
    icon: <Dashboard />,
  },
  {
    title: 'ตารางตรวจฟาร์ม',
    path: '/dashboard/inspector/schedule',
    icon: <Schedule />,
    badge: 3,
  },
  {
    title: 'Video Call',
    path: '/dashboard/inspector/videocall',
    icon: <VideoCall />,
  },
  {
    title: 'รายงานการตรวจ',
    path: '/dashboard/inspector/reports',
    icon: <Search />,
  },
  {
    title: 'แผนที่ฟาร์ม',
    path: '/dashboard/inspector/map',
    icon: <Map />,
  },
];

export default function InspectorDashboardPage() {
  return (
    <DashboardLayout
      role={UserRole.INSPECTOR}
      menuItems={inspectorMenuItems}
      userName="นายทดสอบ ผู้ตรวจสอบ"
      userEmail="inspector@gacp.test"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">สวัสดี, นายทดสอบ ผู้ตรวจสอบ 🔍</h1>
          <p className="text-orange-50">แดชบอร์ดสำหรับตรวจฟาร์มและบันทึกรายงาน</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="รอตรวจวันนี้" value="3" color="orange" icon={<Schedule />} />
          <StatCard title="กำลังตรวจ" value="1" color="blue" icon={<VideoCall />} />
          <StatCard title="ตรวจแล้ว" value="28" color="green" icon={<CheckCircle />} />
          <StatCard title="ทั้งหมดเดือนนี้" value="32" color="purple" icon={<Search />} />
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">ตารางตรวจวันนี้</h2>
          <div className="space-y-3">
            {[
              { time: '09:00', farm: 'ฟาร์มผักอินทรีย์', location: 'เชียงใหม่', type: 'video' },
              { time: '13:00', farm: 'สวนมะม่วงออร์แกนิก', location: 'ลำพูน', type: 'onsite' },
              { time: '15:30', farm: 'ฟาร์มผักไฮโดร', location: 'เชียงราย', type: 'video' },
            ].map((schedule, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border rounded-lg hover:border-orange-500 transition-colors"
              >
                <div className="w-16 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {schedule.time.split(':')[0]}
                  </p>
                  <p className="text-sm text-gray-500">{schedule.time.split(':')[1]}</p>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="flex-1">
                  <p className="font-medium">{schedule.farm}</p>
                  <p className="text-sm text-gray-500">{schedule.location}</p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      schedule.type === 'video'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {schedule.type === 'video' ? 'Video Call' : 'ตรวจลงพื้นที่'}
                  </span>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                    เริ่มตรวจ
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
