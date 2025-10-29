/**
 * Demo Inspector Portal Page
 * หน้าสำหรับผู้ตรวจสอบในโหมด demo
 */

'use client';

import React, { useState } from 'react';
import DemoDashboard from '../../../components/DemoDashboard';
import DemoNavigation from '../../../components/DemoNavigation';

export default function DemoInspectorPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'หน้าแรก', icon: '🏠' },
    { id: 'assigned', name: 'งานที่ได้รับมอบหมาย', icon: '📋' },
    { id: 'calendar', name: 'ปCalendar', icon: '📅' },
    { id: 'reports', name: 'รายงานการตรวจสอบ', icon: '📊' },
    { id: 'profile', name: 'ข้อมูลส่วนตัว', icon: '👤' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DemoDashboard userRole="inspector" />;

      case 'assigned':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">งานที่ได้รับมอบหมาย</h2>
              <div className="flex space-x-2">
                <select className="border border-gray-300 rounded-md px-3 py-2">
                  <option>ทั้งหมด</option>
                  <option>กำหนดการแล้ว</option>
                  <option>รอดำเนินการ</option>
                  <option>เสร็จสิ้น</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">การตรวจสอบ #INS-001</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    กำหนดการแล้ว
                  </span>
                </div>
                <p className="text-sm text-gray-600">คำขอ: #001 - ฟาร์มผักออร์แกนิก สมชาย</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">วันที่ตรวจสอบ</p>
                    <p className="font-medium">20 มี.ค. 2567</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">เวลา</p>
                    <p className="font-medium">09:00 - 12:00 น.</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">สถานที่</p>
                    <p className="font-medium">อำเภอวังน้อย</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">รายการตรวจสอบ:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <input type="checkbox" className="mr-2" />
                      <span>ตรวจสอบระบบการปลูกพืช</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <input type="checkbox" className="mr-2" />
                      <span>ตรวจสอบการใช้ปุ๋ยและยาฆ่าแมลง</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <input type="checkbox" className="mr-2" />
                      <span>ตรวจสอบการจัดเก็บและขนส่ง</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <input type="checkbox" className="mr-2" />
                      <span>ตรวจสอบเอกสารและบันทึก</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    เริ่มการตรวจสอบ
                  </button>
                  <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors">
                    ดูรายละเอียด
                  </button>
                  <button className="text-blue-600 hover:underline">ติดต่อเกษตรกร</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">การตรวจสอบ #INS-002</h3>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    เสร็จสิ้นแล้ว
                  </span>
                </div>
                <p className="text-sm text-gray-600">คำขอ: #002 - แปลงข้าวอินทรีย์ สมชาย</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">วันที่ตรวจสอบ</p>
                    <p className="font-medium">15 มี.ค. 2567</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ผลการตรวจสอบ</p>
                    <p className="font-medium text-green-600">ผ่าน (85/100)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">สถานะ</p>
                    <p className="font-medium">ส่งรายงานแล้ว</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors">
                    ดูรายงาน
                  </button>
                  <button className="text-blue-600 hover:underline">แก้ไขรายงาน</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">ปฏิทินการตรวจสอบ</h2>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">มีนาคม 2567</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border rounded hover:bg-gray-50">⬅️</button>
                  <button className="px-3 py-1 border rounded hover:bg-gray-50">วันนี้</button>
                  <button className="px-3 py-1 border rounded hover:bg-gray-50">➡️</button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
                  <div key={day} className="p-2 font-semibold text-gray-600">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <div
                    key={day}
                    className={`p-2 h-16 border border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      day === 20 ? 'bg-blue-100 border-blue-300' : ''
                    } ${day === 15 ? 'bg-green-100 border-green-300' : ''}`}
                  >
                    <div className="text-sm">{day}</div>
                    {day === 20 && (
                      <div className="text-xs bg-blue-500 text-white px-1 rounded mt-1">09:00</div>
                    )}
                    {day === 15 && (
                      <div className="text-xs bg-green-500 text-white px-1 rounded mt-1">เสร็จ</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-semibold">งานวันนี้</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <div>
                      <p className="font-medium">การตรวจสอบ #INS-001</p>
                      <p className="text-sm text-gray-600">
                        09:00 - 12:00 น. | ฟาร์มผักออร์แกนิก สมชาย
                      </p>
                    </div>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                      เริ่ม
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                    <div>
                      <p className="font-medium">ส่งรายงาน #INS-003</p>
                      <p className="text-sm text-gray-600">ภายใน 17:00 น.</p>
                    </div>
                    <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                      ดำเนินการ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">รายงานการตรวจสอบ</h2>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                + สร้างรายงานใหม่
              </button>
            </div>

            <div className="bg-white rounded-lg border">
              <div className="p-4">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">23</div>
                    <div className="text-sm text-gray-600">รายงานทั้งหมด</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">18</div>
                    <div className="text-sm text-gray-600">ผ่านการตรวจสอบ</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <div className="text-sm text-gray-600">ไม่ผ่าน</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">2</div>
                    <div className="text-sm text-gray-600">รอปรับปรุง</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">รายงาน #RPT-001</h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      ผ่าน
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    การตรวจสอบ: #INS-002 | วันที่: 15 มี.ค. 2567
                  </p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">ฟาร์ม</p>
                      <p className="font-medium">แปลงข้าวอินทรีย์ สมชาย</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">คะแนนรวม</p>
                      <p className="font-medium text-green-600">85/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ข้อเสนอแนะ</p>
                      <p className="font-medium">ปรับปรุงระบบการจัดเก็บ</p>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                      ดูรายงานเต็ม
                    </button>
                    <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors">
                      ดาวน์โหลด PDF
                    </button>
                    <button className="text-blue-600 hover:underline">แก้ไข</button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">รายงาน #RPT-002</h3>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                      รอปรับปรุง
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">การตรวจสอบ: #INS-001 | วันที่: รออนุมัติ</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">ฟาร์ม</p>
                      <p className="font-medium">ฟาร์มผักออร์แกนิก สมชาย</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">คะแนนรวม</p>
                      <p className="font-medium text-yellow-600">อยู่ระหว่างตรวจสอบ</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">สถานะ</p>
                      <p className="font-medium">รายงานฉบับร่าง</p>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                      แก้ไขรายงาน
                    </button>
                    <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors">
                      บันทึกฉบับร่าง
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">ข้อมูลส่วนตัว</h2>

            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-semibold">ข้อมูลผู้ตรวจสอบ</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                    <input
                      type="text"
                      value="วิชัย รักษาทรัพย์"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      เลขประจำตัวผู้ตรวจสอบ
                    </label>
                    <input
                      type="text"
                      value="INS-2024-001"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      หมายเลขโทรศัพท์
                    </label>
                    <input
                      type="text"
                      value="082-345-6789"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                    <input
                      type="email"
                      value="vichai.inspector@gacp.go.th"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ใบรับรองผู้ตรวจสอบ
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">ใบรับรองผู้ตรวจสอบ GACP ระดับ 1</p>
                        <p className="text-sm text-gray-600">หมดอายุ: 31 ธ.ค. 2567</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        ใช้งานได้
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">ใบรับรองผู้ตรวจสอบพืชอินทรีย์</p>
                        <p className="text-sm text-gray-600">หมดอายุ: 15 มี.ค. 2568</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        ใช้งานได้
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    ยกเลิก
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <DemoDashboard userRole="inspector" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Navigation */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <DemoNavigation className="mb-4" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Portal ผู้ตรวจสอบ - โหมด Demo
          </h1>
          <p className="text-gray-600">ระบบจัดการการตรวจสอบมาตรฐาน GACP สำหรับผู้ตรวจสอบ</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
}
