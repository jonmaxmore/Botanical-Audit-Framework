'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TasksPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  const tasks = {
    todo: [
      { id: 1, title: 'อัปโหลดเอกสารเพิ่มเติม', app: '#001', deadline: '3 วัน', priority: 'high' },
      { id: 2, title: 'นัดตรวจสอบสถานที่', app: '#004', deadline: '20/01 10:00', priority: 'high' },
      { id: 3, title: 'ตอบคำถามจากเจ้าหน้าที่', app: '#007', deadline: '5 วัน', priority: 'medium' },
    ],
    doing: [
      { id: 4, title: 'ชำระเงินงวดที่ 1', app: '#002', deadline: '7 วัน', priority: 'high' },
      { id: 5, title: 'แก้ไขข้อมูลฟาร์ม', app: '#005', deadline: '10 วัน', priority: 'low' },
    ],
    done: [
      { id: 6, title: 'ยื่นคำขอใบรับรอง', app: '#003', deadline: 'เสร็จแล้ว', priority: 'high' },
      { id: 7, title: 'อัปโหลดเอกสารครบ', app: '#006', deadline: 'เสร็จแล้ว', priority: 'medium' },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">✅ ใบงานของฉัน</h1>
            <p className="text-gray-600 mt-1">งานที่ต้องดำเนินการ</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setView('kanban')}
              className={`px-4 py-2 rounded-lg ${view === 'kanban' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
            >
              📋 Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg ${view === 'list' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
            >
              📝 List
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{tasks.todo.length}</div>
            <div className="text-sm text-gray-600">รอดำเนินการ</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{tasks.doing.length}</div>
            <div className="text-sm text-gray-600">กำลังทำ</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{tasks.done.length}</div>
            <div className="text-sm text-gray-600">เสร็จแล้ว</div>
          </div>
        </div>

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="grid grid-cols-3 gap-4">
            {/* Todo */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-4">รอดำเนินการ ({tasks.todo.length})</h3>
              <div className="space-y-3">
                {tasks.todo.map((task) => (
                  <div key={task.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      {task.priority === 'high' && <span className="text-red-500">🔴</span>}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">คำขอ {task.app}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">⏰ {task.deadline}</span>
                      <Link href={`/applications/${task.app.replace('#', '')}`} className="text-xs text-green-600 hover:underline">
                        ดูรายละเอียด →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doing */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-4">กำลังทำ ({tasks.doing.length})</h3>
              <div className="space-y-3">
                {tasks.doing.map((task) => (
                  <div key={task.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      {task.priority === 'high' && <span className="text-red-500">🔴</span>}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">คำขอ {task.app}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">⏰ {task.deadline}</span>
                      <Link href={`/applications/${task.app.replace('#', '')}`} className="text-xs text-green-600 hover:underline">
                        ดูรายละเอียด →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Done */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-4">เสร็จแล้ว ({tasks.done.length})</h3>
              <div className="space-y-3">
                {tasks.done.map((task) => (
                  <div key={task.id} className="bg-white p-4 rounded-lg shadow opacity-75">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 line-through">{task.title}</h4>
                      <span className="text-green-500">✓</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">คำขอ {task.app}</p>
                    <span className="text-xs text-gray-500">✓ {task.deadline}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">งาน</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">คำขอ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">กำหนดเวลา</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...tasks.todo, ...tasks.doing, ...tasks.done].map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {task.priority === 'high' && <span className="mr-2">🔴</span>}
                        <span className="font-medium text-gray-900">{task.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{task.app}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tasks.todo.includes(task) ? 'bg-red-100 text-red-800' :
                        tasks.doing.includes(task) ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {tasks.todo.includes(task) ? 'รอดำเนินการ' :
                         tasks.doing.includes(task) ? 'กำลังทำ' : 'เสร็จแล้ว'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{task.deadline}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/applications/${task.app.replace('#', '')}`} className="text-green-600 hover:underline">
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
