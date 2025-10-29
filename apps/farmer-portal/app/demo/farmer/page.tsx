/**
 * Demo Farmer Portal Page
 * หน้าสำหรับเกษตรกรในโหมด demo
 */

'use client';

import React, { useState } from 'react';
import DemoDashboard from '../../../components/DemoDashboard';
import DemoNavigation from '../../../components/DemoNavigation';

export default function DemoFarmerPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'หน้าแรก', icon: '🏠' },
    { id: 'applications', name: 'คำขอของฉัน', icon: '📝' },
    { id: 'inspections', name: 'การตรวจสอบ', icon: '🔍' },
    { id: 'certificates', name: 'ใบรับรอง', icon: '🏆' },
    { id: 'profile', name: 'ข้อมูลส่วนตัว', icon: '👤' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DemoDashboard userRole="farmer" />;

      case 'applications':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">คำขอของฉัน</h2>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                + ยื่นคำขอใหม่
              </button>
            </div>

            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-semibold">คำขอ GACP #001</h3>
                <p className="text-sm text-gray-600">ยื่นเมื่อ: 15 มี.ค. 2567</p>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">ฟาร์มผักออร์แกนิก สมชาย</p>
                    <p className="text-sm text-gray-600">พืชผัก - 5 ไร่</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                    รอการตรวจสอบ
                  </span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="text-blue-600 hover:underline text-sm">ดูรายละเอียด</button>
                  <button className="text-green-600 hover:underline text-sm">แก้ไขเอกสาร</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-semibold">คำขอ GACP #002</h3>
                <p className="text-sm text-gray-600">ยื่นเมื่อ: 1 มี.ค. 2567</p>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">แปลงข้าวอินทรีย์ สมชาย</p>
                    <p className="text-sm text-gray-600">ข้าว - 10 ไร่</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    อนุมัติแล้ว
                  </span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="text-blue-600 hover:underline text-sm">ดูใบรับรอง</button>
                  <button className="text-purple-600 hover:underline text-sm">ดาวน์โหลด PDF</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'inspections':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">การตรวจสอบ</h2>

            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-semibold">การตรวจสอบ #INS-001</h3>
                <p className="text-sm text-gray-600">คำขอ: #001</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">วันที่นัดหมาย</p>
                    <p className="font-medium">20 มี.ค. 2567</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">เวลา</p>
                    <p className="font-medium">09:00 - 12:00 น.</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ผู้ตรวจสอบ</p>
                    <p className="font-medium">วิชัย รักษาทรัพย์</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">สถานะ</p>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      กำหนดการแล้ว
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">เอกสารที่ต้องเตรียม:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• ใบอนุญาตประกอบการเกษตร</li>
                    <li>• บันทึกการใช้ปุ๋ยและยาฆ่าแมลง</li>
                    <li>• แผนผังแปลงเกษตร</li>
                    <li>• ใบรับรองการตรวจสอบดิน</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'certificates':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">ใบรับรอง</h2>

            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">ใบรับรอง GACP #CERT-001</h3>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    ใช้งานได้
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ฟาร์ม</p>
                    <p className="font-medium">แปลงข้าวอินทรีย์ สมชาย</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ชนิดพืช</p>
                    <p className="font-medium">ข้าว</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">วันที่ออกใบรับรอง</p>
                    <p className="font-medium">5 มี.ค. 2567</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">วันหมดอายุ</p>
                    <p className="font-medium">4 มี.ค. 2570</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    ดูใบรับรอง
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                    ดาวน์โหลด PDF
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                    แชร์ QR Code
                  </button>
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
                <h3 className="font-semibold">ข้อมูลเกษตรกร</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                    <input
                      type="text"
                      value="สมชาย ใจดี"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      เลขบัตรประชาชน
                    </label>
                    <input
                      type="text"
                      value="1-2345-67890-12-3"
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
                      value="081-234-5678"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                    <input
                      type="email"
                      value="somchai.farmer@email.com"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ที่อยู่</label>
                  <textarea
                    value="123 หมู่ 4 ตำบลแสงทอง อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา 13170"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 h-20"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-semibold">ข้อมูลฟาร์ม</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ชื่อฟาร์ม</label>
                    <input
                      type="text"
                      value="ฟาร์มผักออร์แกนิก สมชาย"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ขนาดพื้นที่ (ไร่)
                    </label>
                    <input
                      type="text"
                      value="15"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ชนิดพืชที่ปลูก</label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" checked />
                      <span>ข้าว</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" checked />
                      <span>ผักใบเขียว</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>ผลไม้</span>
                    </label>
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
        return <DemoDashboard userRole="farmer" />;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🌾 Portal เกษตรกร - โหมด Demo</h1>
          <p className="text-gray-600">ระบบจัดการคำขอใบรับรอง GACP สำหรับเกษตรกร</p>
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
