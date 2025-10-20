import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SystemCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
  userRole: string;
  features: string[];
}

const systems: SystemCard[] = [
  {
    title: 'ระบบเกษตรกร (Farmer Portal)',
    description: 'ยื่นคำขอรับรอง ติดตามสถานะ และจัดการใบรับรอง GACP',
    href: '/farmer',
    icon: '🌾',
    color: 'bg-green-500',
    userRole: 'เกษตรกร / ผู้ประกอบการ',
    features: [
      'ยื่นคำขอรับรองมาตรฐาน GACP',
      'ติดตามสถานะการพิจารณา',
      'จัดการเอกสารและหลักฐาน',
      'ชำระค่าธรรมเนียม',
      'ดาวน์โหลดใบรับรอง',
    ],
  },
  {
    title: 'ระบบผู้ตรวจสอบ (Inspector Portal)',
    description: 'จัดการการตรวจประเมิน ออกรายงาน และติดตามผลการตรวจสอบ',
    href: '/inspector',
    icon: '🔍',
    color: 'bg-blue-500',
    userRole: 'ผู้ตรวจสอบ / Inspector',
    features: [
      'รับมอบหมายงานตรวจสอบ',
      'จัดตารางการตรวจประเมิน',
      'บันทึกผลการตรวจสอบ',
      'อัพโหลดรูปภาพและหลักฐาน',
      'ส่งรายงานการตรวจสอบ',
    ],
  },
  {
    title: 'ระบบผู้ประเมิน (Reviewer Portal)',
    description: 'พิจารณาคำขอ ตรวจสอบเอกสาร และอนุมัติการออกใบรับรอง',
    href: '/reviewer',
    icon: '📋',
    color: 'bg-purple-500',
    userRole: 'ผู้ประเมิน / Reviewer',
    features: [
      'พิจารณาคำขอรับรอง',
      'ตรวจสอบความถูกต้องของเอกสาร',
      'ประเมินผลการตรวจสอบ',
      'อนุมัติ/ปฏิเสธคำขอ',
      'ออกใบรับรองมาตรฐาน',
    ],
  },
  {
    title: 'ระบบผู้บริหาร (Admin Portal)',
    description: 'จัดการระบบ ผู้ใช้งาน และติดตามสถิติการดำเนินงาน',
    href: '/admin',
    icon: '⚙️',
    color: 'bg-red-500',
    userRole: 'ผู้บริหาร / Administrator',
    features: [
      'จัดการผู้ใช้งานและสิทธิ์',
      'ติดตามสถิติการดำเนินงาน',
      'จัดการมาตรฐานและเกณฑ์',
      'ตั้งค่าระบบและการแจ้งเตือน',
      'ออกรายงานสรุปผล',
    ],
  },
];

const workflows = [
  {
    step: 1,
    title: 'ยื่นคำขอ',
    description: 'เกษตรกรยื่นคำขอรับรองผ่านระบบออนไลน์',
    icon: '📝',
    color: 'bg-green-100 text-green-800',
  },
  {
    step: 2,
    title: 'ตรวจสอบเอกสาร',
    description: 'ผู้ประเมินตรวจสอบความครบถ้วนของเอกสาร',
    icon: '📄',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    step: 3,
    title: 'จัดตารางตรวจประเมิน',
    description: 'มอบหมายผู้ตรวจสอบและกำหนดวันที่ตรวจ',
    icon: '📅',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    step: 4,
    title: 'ตรวจประเมินในพื้นที่',
    description: 'ผู้ตรวจสอบลงพื้นที่ประเมินตามมาตรฐาน GACP',
    icon: '🔍',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    step: 5,
    title: 'ประเมินผล',
    description: 'ผู้ประเมินพิจารณาผลการตรวจสอบและตัดสินใจ',
    icon: '⚖️',
    color: 'bg-indigo-100 text-indigo-800',
  },
  {
    step: 6,
    title: 'ออกใบรับรอง',
    description: 'ออกใบรับรองมาตรฐาน GACP หากผ่านการประเมิน',
    icon: '🏆',
    color: 'bg-green-100 text-green-800',
  },
];

const statistics = [
  { label: 'คำขอทั้งหมด', value: '2,547', trend: '+12%', color: 'text-blue-600' },
  { label: 'ใบรับรองที่ออกแล้ว', value: '1,892', trend: '+8%', color: 'text-green-600' },
  { label: 'อยู่ระหว่างดำเนินการ', value: '325', trend: '-5%', color: 'text-yellow-600' },
  { label: 'ผู้ใช้งานทั้งหมด', value: '1,247', trend: '+15%', color: 'text-purple-600' },
];

export default function GACPHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image
                src="/images/thai-govt-logo.png"
                alt="Thai Government Logo"
                width={60}
                height={60}
                className="mr-4"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ระบบรับรองมาตรฐาน GACP</h1>
                <p className="text-sm text-gray-600">
                  Good Agricultural and Collection Practices Certification System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
                <p className="text-xs text-gray-500">กระทรวงสาธารณสุข</p>
              </div>
              <Image src="/images/moph-logo.png" alt="MOPH Logo" width={50} height={50} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">ระบบรับรองมาตรฐาน GACP</h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            ระบบครบวงจรสำหรับการขอรับรองมาตรฐานการปฏิบัติทางการเกษตรและการเก็บรวบรวมที่ดี
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/farmer/register"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              เริ่มยื่นคำขอรับรอง
            </Link>
            <Link
              href="/demo"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              ทดลองใช้ระบบ
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">สถิติการดำเนินงาน</h3>
            <p className="text-lg text-gray-600">
              ข้อมูลการดำเนินงานของระบบ ณ วันที่ {new Date().toLocaleDateString('th-TH')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {statistics.map((stat, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 text-center">
                <h4 className="text-2xl font-bold mb-2 text-gray-900">{stat.value}</h4>
                <p className="text-gray-600 mb-2">{stat.label}</p>
                <span className={`text-sm font-medium ${stat.color}`}>
                  {stat.trend} จากเดือนที่แล้ว
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Systems Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">ระบบงานทั้งหมด</h3>
            <p className="text-lg text-gray-600">เลือกระบบที่เหมาะสมกับบทบาทของคุณ</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {systems.map((system, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className={`${system.color} p-6 text-white text-center`}>
                  <div className="text-4xl mb-2">{system.icon}</div>
                  <h4 className="text-xl font-bold">{system.title}</h4>
                  <p className="text-sm opacity-90 mt-2">{system.userRole}</p>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{system.description}</p>
                  <ul className="space-y-2 mb-6">
                    {system.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={system.href}
                    className={`block text-center py-2 px-4 rounded ${system.color} text-white hover:opacity-90 transition-opacity`}
                  >
                    เข้าสู่ระบบ
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              ขั้นตอนการขอรับรองมาตรฐาน GACP
            </h3>
            <p className="text-lg text-gray-600">กระบวนการทำงานตั้งแต่ยื่นคำขอจนได้รับใบรับรอง</p>
          </div>
          <div className="relative">
            {/* Desktop Flow */}
            <div className="hidden lg:block">
              <div className="flex justify-between items-center relative">
                {/* Connection Line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2"></div>

                {workflows.map((workflow, index) => (
                  <div key={index} className="relative z-10 bg-white">
                    <div className="flex flex-col items-center max-w-xs">
                      <div
                        className={`w-16 h-16 rounded-full ${workflow.color} flex items-center justify-center text-2xl mb-4`}
                      >
                        {workflow.icon}
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-gray-900 mb-2">
                          {workflow.step}. {workflow.title}
                        </h4>
                        <p className="text-sm text-gray-600">{workflow.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Flow */}
            <div className="lg:hidden space-y-8">
              {workflows.map((workflow, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 rounded-full ${workflow.color} flex items-center justify-center text-xl flex-shrink-0`}
                  >
                    {workflow.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      {workflow.step}. {workflow.title}
                    </h4>
                    <p className="text-sm text-gray-600">{workflow.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">ทดลองใช้ระบบ</h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            ลองใช้ระบบกับข้อมูลตัวอย่างเพื่อทำความเข้าใจการทำงาน
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/demo/farmer"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              🌾 ทดลองระบบเกษตรกร
            </Link>
            <Link
              href="/demo/inspector"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              🔍 ทดลองระบบผู้ตรวจสอบ
            </Link>
            <Link
              href="/demo/reviewer"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              📋 ทดลองระบบผู้ประเมิน
            </Link>
            <Link
              href="/demo/admin"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              ⚙️ ทดลองระบบผู้บริหาร
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">เกี่ยวกับระบบ</h4>
              <p className="text-gray-300 text-sm">
                ระบบรับรองมาตรฐาน GACP พัฒนาโดยกรมการแพทย์แผนไทยและการแพทย์ทางเลือก
                เพื่อยกระดับมาตรฐานการผลิตสมุนไพรไทย
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">ติดต่อเรา</h4>
              <div className="text-gray-300 text-sm space-y-2">
                <p>📞 โทร: 02-xxx-xxxx</p>
                <p>📧 อีเมล: gacp@moph.go.th</p>
                <p>🌐 เว็บไซต์: www.gacp.moph.go.th</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">ลิงก์ที่เกี่ยวข้อง</h4>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>
                  <a href="#" className="hover:text-white">
                    กรมการแพทย์แผนไทยฯ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    กระทรวงสาธารณสุข
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    คู่มือการใช้งาน
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    ช่วยเหลือ
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 กรมการแพทย์แผนไทยและการแพทย์ทางเลือก กระทรวงสาธารณสุข</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
