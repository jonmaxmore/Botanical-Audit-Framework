'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">👤 โปรไฟล์ของฉัน</h1>
          <p className="text-gray-600 mt-1">จัดการข้อมูลส่วนตัวและการตั้งค่า</p>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-semibold ${activeTab === 'profile' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
            >
              ข้อมูลส่วนตัว
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-3 font-semibold ${activeTab === 'password' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
            >
              เปลี่ยนรหัสผ่าน
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-semibold ${activeTab === 'history' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
            >
              ประวัติการใช้งาน
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-4xl">
                    👤
                  </div>
                  <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                    เปลี่ยนรูปโปรไฟล์
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
                    <input
                      type="text"
                      defaultValue="สมชาย"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                    <input
                      type="text"
                      defaultValue="ใจดี"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                    <input
                      type="email"
                      defaultValue="somchai@example.com"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทร</label>
                    <input
                      type="tel"
                      defaultValue="081-234-5678"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
                    <textarea
                      defaultValue="123 หมู่ 5 ต.สันทราย อ.สันทราย จ.เชียงใหม่ 50210"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={3}
                    />
                  </div>
                </div>

                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รหัสผ่านปัจจุบัน
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รหัสผ่านใหม่
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3">
                {[
                  { action: 'เข้าสู่ระบบ', time: '15/01/2025 10:30', ip: '192.168.1.1' },
                  { action: 'ยื่นคำขอ #001', time: '15/01/2025 11:00', ip: '192.168.1.1' },
                  { action: 'อัปโหลดเอกสาร', time: '15/01/2025 14:20', ip: '192.168.1.1' },
                  { action: 'ชำระเงิน', time: '16/01/2025 09:15', ip: '192.168.1.1' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{item.action}</div>
                      <div className="text-sm text-gray-600">{item.time}</div>
                    </div>
                    <div className="text-xs text-gray-500">{item.ip}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
