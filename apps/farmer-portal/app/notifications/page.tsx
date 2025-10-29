'use client';

import { useState } from 'react';

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      title: 'คำขอ #001 เปลี่ยนสถานะ',
      message: 'คำขอของคุณเปลี่ยนเป็น "ตรวจเอกสาร"',
      time: '2 ชั่วโมงที่แล้ว',
      read: false,
      type: 'status'
    },
    {
      id: 2,
      title: 'กรุณาอัปโหลดเอกสาร',
      message: 'กรุณาอัปโหลดเอกสารเพิ่มเติมสำหรับคำขอ #001',
      time: '5 ชั่วโมงที่แล้ว',
      read: false,
      type: 'action'
    },
    {
      id: 3,
      title: 'นัดตรวจสอบสถานที่',
      message: 'นัดตรวจสอบวันที่ 20/01 เวลา 10:00 น.',
      time: '1 วันที่แล้ว',
      read: true,
      type: 'schedule'
    },
    {
      id: 4,
      title: 'ชำระเงินสำเร็จ',
      message: 'ชำระเงินงวดที่ 1 จำนวน 15,000 บาท สำเร็จ',
      time: '2 วันที่แล้ว',
      read: true,
      type: 'payment'
    },
    {
      id: 5,
      title: 'ใบรับรองออกแล้ว',
      message: 'ใบรับรอง GACP-003 ออกแล้ว สามารถดาวน์โหลดได้',
      time: '3 วันที่แล้ว',
      read: true,
      type: 'certificate'
    }
  ];

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const typeIcons: Record<string, string> = {
    status: '📋',
    action: '⚠️',
    schedule: '📅',
    payment: '💰',
    certificate: '🏆'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🔔 การแจ้งเตือน</h1>
          <p className="text-gray-600 mt-1">การแจ้งเตือนทั้งหมดของคุณ</p>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
            >
              ทั้งหมด ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg ${filter === 'unread' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
            >
              ยังไม่อ่าน ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg ${filter === 'read' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
            >
              อ่านแล้ว ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotifs.map(notif => (
            <div
              key={notif.id}
              className={`bg-white rounded-lg shadow p-4 hover:shadow-md transition ${
                !notif.read ? 'border-l-4 border-green-500' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{typeIcons[notif.type]}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3
                      className={`font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}
                    >
                      {notif.title}
                    </h3>
                    {!notif.read && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{notif.time}</span>
                    <div className="flex space-x-2">
                      {!notif.read && (
                        <button className="text-xs text-green-600 hover:underline">
                          ทำเครื่องหมายว่าอ่านแล้ว
                        </button>
                      )}
                      <button className="text-xs text-red-600 hover:underline">ลบ</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifs.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ไม่มีการแจ้งเตือน</h3>
            <p className="text-gray-600">คุณไม่มีการแจ้งเตือนในขณะนี้</p>
          </div>
        )}
      </div>
    </div>
  );
}
