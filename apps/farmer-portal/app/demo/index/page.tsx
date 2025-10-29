/**
 * Demo Main Page
 * หน้าหลักสำหรับระบบ demo แบบครบวงจร
 */

import React from 'react';
import Link from 'next/link';

export default function DemoMainPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🎭 ระบบ Demo GACP Platform</h1>
              <p className="text-gray-600">
                ทดลองใช้งานระบบ Good Agricultural and Collection Practices
              </p>
            </div>
            <Link href="/" className="text-blue-600 hover:underline">
              ← กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">ยินดีต้อนรับสู่ระบบ Demo</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            สำรวจคุณสมบัติต่างๆ ของระบบ GACP Platform ผ่านการจำลองการทำงานแบบ Interactive
            ที่ครอบคลุมทุกบทบาทผู้ใช้และขั้นตอนการทำงาน
          </p>
        </div>

        {/* User Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/demo/farmer" className="group">
            <div className="bg-white rounded-lg border shadow-sm hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              <div className="p-6">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-lg mb-4 mx-auto">
                  <span className="text-3xl">🌾</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  Portal เกษตรกร
                </h3>
                <p className="text-gray-600 text-sm text-center mb-4">
                  จัดการคำขอใบรับรอง ติดตามสถานะ และดูผลการตรวจสอบ
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• ยื่นคำขอใหม่</li>
                  <li>• ติดตามสถานะ</li>
                  <li>• จัดการใบรับรอง</li>
                  <li>• ดูข้อมูลการตรวจสอบ</li>
                </ul>
                <div className="mt-4 flex items-center justify-center text-green-600 text-sm font-medium">
                  เข้าสู่ระบบ
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/demo/inspector" className="group">
            <div className="bg-white rounded-lg border shadow-sm hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              <div className="p-6">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-4 mx-auto">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  Portal ผู้ตรวจสอบ
                </h3>
                <p className="text-gray-600 text-sm text-center mb-4">
                  รับงานตรวจสอบ จัดทำรายงาน และส่งผลการประเมิน
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• งานที่ได้รับมอบหมาย</li>
                  <li>• ปฏิทินการตรวจสอบ</li>
                  <li>• จัดทำรายงาน</li>
                  <li>• อัปโหลดหลักฐาน</li>
                </ul>
                <div className="mt-4 flex items-center justify-center text-blue-600 text-sm font-medium">
                  เข้าสู่ระบบ
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/demo/reviewer" className="group">
            <div className="bg-white rounded-lg border shadow-sm hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              <div className="p-6">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-lg mb-4 mx-auto">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  Portal ผู้ประเมิน
                </h3>
                <p className="text-gray-600 text-sm text-center mb-4">
                  ประเมินรายงาน อนุมัติคำขอ และออกใบรับรอง
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• ประเมินรายงาน</li>
                  <li>• อนุมัติคำขอ</li>
                  <li>• ออกใบรับรอง</li>
                  <li>• ตรวจสอบคุณภาพ</li>
                </ul>
                <div className="mt-4 flex items-center justify-center text-purple-600 text-sm font-medium">
                  เข้าสู่ระบบ
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/demo/admin" className="group">
            <div className="bg-white rounded-lg border shadow-sm hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              <div className="p-6">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-lg mb-4 mx-auto">
                  <span className="text-3xl">⚙️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  Portal ผู้บริหาร
                </h3>
                <p className="text-gray-600 text-sm text-center mb-4">
                  จัดการระบบ ดูรายงานสถิติ และบริหารผู้ใช้งาน
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• ภาพรวมระบบ</li>
                  <li>• รายงานสถิติ</li>
                  <li>• จัดการผู้ใช้</li>
                  <li>• ตั้งค่าระบบ</li>
                </ul>
                <div className="mt-4 flex items-center justify-center text-red-600 text-sm font-medium">
                  เข้าสู่ระบบ
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Workflow Visualization */}
        <div className="bg-white rounded-lg border shadow-sm p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ขั้นตอนการทำงานในระบบ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[
              { step: 1, title: 'ยื่นคำขอ', icon: '📝', role: 'เกษตรกร' },
              { step: 2, title: 'ตรวจเอกสาร', icon: '📄', role: 'เจ้าหน้าที่' },
              { step: 3, title: 'นัดตรวจสอบ', icon: '📅', role: 'ผู้ตรวจสอบ' },
              { step: 4, title: 'ตรวจพื้นที่', icon: '🔍', role: 'ผู้ตรวจสอบ' },
              { step: 5, title: 'ประเมินผล', icon: '⚖️', role: 'ผู้ประเมิน' },
              { step: 6, title: 'ออกใบรับรอง', icon: '🏆', role: 'ผู้ประเมิน' }
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3 mx-auto">
                  <span className="text-xl">{item.icon}</span>
                </div>
                <div className="text-sm font-medium text-gray-900 mb-1">{item.title}</div>
                <div className="text-xs text-gray-500">{item.role}</div>
                {index < 5 && (
                  <div className="hidden md:block mt-2">
                    <span className="text-gray-400">→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'คำขอทั้งหมด', value: '2,547', color: 'bg-blue-50 text-blue-600', icon: '📊' },
            {
              label: 'ใบรับรองที่ออกแล้ว',
              value: '1,892',
              color: 'bg-green-50 text-green-600',
              icon: '🏆'
            },
            {
              label: 'อยู่ระหว่างดำเนินการ',
              value: '325',
              color: 'bg-yellow-50 text-yellow-600',
              icon: '⏳'
            },
            {
              label: 'ผู้ใช้งานทั้งหมด',
              value: '1,247',
              color: 'bg-purple-50 text-purple-600',
              icon: '👥'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border p-6 text-center">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${stat.color}`}
              >
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Highlight */}
        <div className="bg-white rounded-lg border shadow-sm p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            คุณสมบัติหลักของระบบ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">ระบบความปลอดภัย</h4>
              <p className="text-gray-600 text-sm">
                ระบบรักษาความปลอดภัยระดับสูง พร้อมการยืนยันตัวตนแบบหลายขั้นตอน
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">ใช้งานง่าย</h4>
              <p className="text-gray-600 text-sm">
                อินเทอร์เฟซที่ใช้งานง่าย รองรับการใช้งานบนทุกอุปกรณ์
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">รายงานแบบ Real-time</h4>
              <p className="text-gray-600 text-sm">ติดตามสถานะและดูรายงานได้แบบเรียลไทม์</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">พร้อมที่จะเริ่มต้นใช้งานระบบ GACP แล้วหรือยัง?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              สมัครสมาชิก
            </Link>
            <Link
              href="/login"
              className="border border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
