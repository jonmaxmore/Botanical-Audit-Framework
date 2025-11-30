/**
 * Auditor Workspace Component (V2)
 * For virtual audit via video call (Bilzz integration)
 *
 * Features:
 * - Video call interface
 * - GACP checklist panel
 * - Evidence snapshot capture
 * - Approve/Request On-site/Reject actions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Video, Camera, Check, X, MapPin, CheckSquare, Square } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'pending';
  notes?: string;
}

interface AuditorWorkspaceProps {
  applicationId: string;
  appointmentId?: string;
}

const GACP_CHECKLIST: ChecklistItem[] = [
  { id: '1', category: 'สถานที่', item: 'มีป้ายชื่อฟาร์มชัดเจน', status: 'pending' },
  { id: '2', category: 'สถานที่', item: 'มีรั้วหรือแนวเขตชัดเจน', status: 'pending' },
  { id: '3', category: 'แหล่งน้ำ', item: 'แหล่งน้ำสะอาด ไม่มีสิ่งปนเปื้อน', status: 'pending' },
  { id: '4', category: 'แหล่งน้ำ', item: 'มีระบบกรองน้ำ (ถ้าจำเป็น)', status: 'pending' },
  { id: '5', category: 'พื้นที่ปลูก', item: 'ดินไม่มีสารเคมีตกค้าง', status: 'pending' },
  { id: '6', category: 'พื้นที่ปลูก', item: 'ระยะห่างจากแหล่งมลพิษ > 100 เมตร', status: 'pending' },
  { id: '7', category: 'การจัดการ', item: 'มีบันทึกการปลูก/ดูแล', status: 'pending' },
  {
    id: '8',
    category: 'การจัดการ',
    item: 'มีแผนการใช้ปุ๋ย/สารป้องกันกำจัดศัตรูพืช',
    status: 'pending',
  },
];

export default function AuditorWorkspace({ applicationId, appointmentId }: AuditorWorkspaceProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(GACP_CHECKLIST);
  const [videoActive, setVideoActive] = useState(false);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const handleChecklistToggle = (id: string, status: 'pass' | 'fail') => {
    setChecklist(prev => prev.map(item => (item.id === id ? { ...item, status } : item)));
  };

  const handleSnapshot = () => {
    // Simulate snapshot capture
    const timestamp = new Date().toISOString();
    setSnapshots(prev => [...prev, `snapshot_${timestamp}.jpg`]);
    alert('บันทึกภาพหลักฐานสำเร็จ');
  };

  const handleApprove = async () => {
    const failedItems = checklist.filter(item => item.status === 'fail');
    if (failedItems.length > 0) {
      if (!confirm(`มีรายการที่ไม่ผ่าน ${failedItems.length} รายการ\nยืนยันการอนุมัติ?`)) {
        return;
      }
    }

    try {
      await fetch(`/api/applications/${applicationId}/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'approve',
          checklist,
          snapshots,
          notes,
        }),
      });
      alert('อนุมัติคำขอสำเร็จ');
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleRequestOnsite = async () => {
    const reason = prompt('กรุณาระบุเหตุผลที่ต้องตรวจสอบเพิ่มเติม:');
    if (!reason) return;

    try {
      await fetch(`/api/applications/${applicationId}/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'request_onsite',
          reason,
          checklist,
          snapshots,
          notes,
        }),
      });
      alert('สร้างใบงานลงพื้นที่สำเร็จ (ไม่มีค่าใช้จ่ายเพิ่มเติม)');
    } catch (error) {
      console.error('Failed to request on-site:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleReject = async () => {
    if (!confirm('ยืนยันการปฏิเสธคำขอ?')) return;

    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
    if (!reason) return;

    try {
      await fetch(`/api/applications/${applicationId}/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'reject',
          reason,
          checklist,
          snapshots,
          notes,
        }),
      });
      alert('ปฏิเสธคำขอสำเร็จ');
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">ตรวจประเมินออนไลน์ (Video Call)</h1>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {videoActive ? '🔴 กำลังตรวจ' : '⚪ รอเริ่ม'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video Call */}
        <div className="flex-1 p-6 bg-black flex flex-col">
          {/* Video Screen */}
          <div className="flex-1 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
            {videoActive ? (
              <div className="text-white text-center">
                <Video className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Video Call Active</p>
                <p className="text-sm text-gray-400 mt-2">(Bilzz Integration - Placeholder)</p>
              </div>
            ) : (
              <div className="text-white text-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-lg text-gray-400">รอเริ่มการตรวจ</p>
                <button
                  onClick={() => setVideoActive(true)}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  เริ่มการตรวจ
                </button>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleSnapshot}
              disabled={!videoActive}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              บันทึกภาพหลักฐาน ({snapshots.length})
            </button>
          </div>
        </div>

        {/* Right: Checklist Panel */}
        <div className="w-96 overflow-y-auto p-6 bg-white border-l border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">รายการตรวจสอบ GACP</h2>

          <div className="space-y-4">
            {Object.entries(
              checklist.reduce(
                (acc, item) => {
                  if (!acc[item.category]) acc[item.category] = [];
                  acc[item.category].push(item);
                  return acc;
                },
                {} as Record<string, ChecklistItem[]>
              )
            ).map(([category, items]) => (
              <div key={category} className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-gray-800 mb-2">{category}</h3>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-start gap-2">
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => handleChecklistToggle(item.id, 'pass')}
                          className={`p-1 rounded ${
                            item.status === 'pass'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleChecklistToggle(item.id, 'fail')}
                          className={`p-1 rounded ${
                            item.status === 'fail'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                          }`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-sm text-gray-700 flex-1">{item.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">บันทึกเพิ่มเติม</label>
            <textarea
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="บันทึกข้อสังเกตเพิ่มเติม..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={handleReject}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
        >
          <X className="w-5 h-5" />
          ไม่ผ่าน
        </button>

        <button
          onClick={handleRequestOnsite}
          className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-2"
        >
          <MapPin className="w-5 h-5" />
          ต้องตรวจเพิ่ม (On-site)
        </button>

        <button
          onClick={handleApprove}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <Check className="w-5 h-5" />
          ผ่าน
        </button>
      </div>
    </div>
  );
}
