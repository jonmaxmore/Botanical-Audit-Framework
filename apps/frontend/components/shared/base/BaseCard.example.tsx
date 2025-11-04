/**
 * BaseCard Example Showcase
 * 
 * Demonstrates all variations and use cases of BaseCard component
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

'use client';

import React, { useState } from 'react';
import BaseCard from './BaseCard';

// Simple SVG Icon Components
const UserIcon = () => (
  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MoreIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
  </svg>
);

export default function BaseCardExample() {
  const [clicked, setClicked] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = (cardName: string) => {
    setClicked(cardName);
    setTimeout(() => setClicked(null), 2000);
  };

  const handleAction = (actionName: string) => {
    handleClick(actionName);
  };

  const handleLoadingAction = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          BaseCard Component Examples
        </h1>
        <p className="text-gray-600">
          Comprehensive showcase of all BaseCard variations and use cases
        </p>
        {clicked && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
            ✅ Clicked: <strong>{clicked}</strong>
          </div>
        )}
      </div>

      {/* ========== BASIC CARDS ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Basic Cards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BaseCard>
            <h3 className="text-lg font-semibold mb-2">Simple Card</h3>
            <p className="text-gray-600">
              This is a basic card with just content. Perfect for simple displays.
            </p>
          </BaseCard>

          <BaseCard variant="outlined">
            <h3 className="text-lg font-semibold mb-2">Outlined Card</h3>
            <p className="text-gray-600">
              Card with border and transparent background.
            </p>
          </BaseCard>

          <BaseCard variant="elevated">
            <h3 className="text-lg font-semibold mb-2">Elevated Card</h3>
            <p className="text-gray-600">
              Card with shadow elevation effect.
            </p>
          </BaseCard>
        </div>
      </section>

      {/* ========== CARDS WITH TITLE ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Cards with Header</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseCard
            title="ข้อมูลผู้ใช้"
            subtitle="จัดการข้อมูลส่วนตัว"
          >
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ชื่อ:</span>
                <span className="font-medium">สมชาย ใจดี</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">อีเมล:</span>
                <span className="font-medium">somchai@example.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">สถานะ:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </BaseCard>

          <BaseCard
            title="สถิติการใช้งาน"
            headerIcon={<ChartIcon />}
            subtitle="ข้อมูลสถิติประจำเดือน"
          >
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">การใช้งาน</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">ความสำเร็จ</span>
                  <span className="text-sm font-medium">90%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </section>

      {/* ========== CARDS WITH HEADER ACTIONS ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Cards with Header Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseCard
            title="เอกสารสำคัญ"
            headerIcon={<DocumentIcon />}
            headerActions={
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreIcon />
              </button>
            }
          >
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                📄 ใบรับรอง.pdf
              </div>
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                📄 สัญญา.docx
              </div>
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                📄 รายงาน.xlsx
              </div>
            </div>
          </BaseCard>

          <BaseCard
            title="การตั้งค่า"
            headerIcon={<SettingsIcon />}
            headerActions={
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAction('Save Settings')}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  บันทึก
                </button>
              </div>
            }
          >
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span>รับการแจ้งเตือนทางอีเมล</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>แจ้งเตือนทาง SMS</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span>อัพเดทข่าวสารอัตโนมัติ</span>
              </label>
            </div>
          </BaseCard>
        </div>
      </section>

      {/* ========== CARDS WITH ACTIONS ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Cards with Footer Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseCard
            title="ยืนยันการลบ"
            subtitle="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
            actions={[
              {
                label: 'ยกเลิก',
                onClick: () => handleAction('Cancel Delete'),
                variant: 'secondary'
              },
              {
                label: 'ลบ',
                onClick: () => handleAction('Confirm Delete'),
                variant: 'primary'
              }
            ]}
          >
            <p className="text-gray-600">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลจะถูกลบถาวร
            </p>
          </BaseCard>

          <BaseCard
            title="บันทึกข้อมูล"
            loading={loading}
            actions={[
              {
                label: 'ยกเลิก',
                onClick: () => handleAction('Cancel'),
                variant: 'text'
              },
              {
                label: 'บันทึกแบบร่าง',
                onClick: () => handleAction('Save Draft'),
                variant: 'secondary'
              },
              {
                label: 'บันทึก',
                onClick: handleLoadingAction,
                variant: 'primary'
              }
            ]}
          >
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="ชื่อ" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea 
                placeholder="รายละเอียด" 
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </BaseCard>
        </div>
      </section>

      {/* ========== INTERACTIVE CARDS ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Interactive Cards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BaseCard
            hoverable
            onClick={() => handleClick('Hoverable Card')}
          >
            <div className="text-center py-4">
              <UserIcon />
              <h3 className="text-lg font-semibold mt-3 mb-2">ผู้ใช้งาน</h3>
              <p className="text-gray-600 text-sm">คลิกเพื่อดูรายละเอียด</p>
            </div>
          </BaseCard>

          <BaseCard
            hoverable
            variant="outlined"
            onClick={() => handleClick('Documents Card')}
          >
            <div className="text-center py-4">
              <DocumentIcon />
              <h3 className="text-lg font-semibold mt-3 mb-2">เอกสาร</h3>
              <p className="text-gray-600 text-sm">จำนวน 24 รายการ</p>
            </div>
          </BaseCard>

          <BaseCard
            hoverable
            variant="elevated"
            onClick={() => handleClick('Statistics Card')}
          >
            <div className="text-center py-4">
              <ChartIcon />
              <h3 className="text-lg font-semibold mt-3 mb-2">สถิติ</h3>
              <p className="text-gray-600 text-sm">ดูรายงานทั้งหมด</p>
            </div>
          </BaseCard>
        </div>
      </section>

      {/* ========== PADDING VARIANTS ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Padding Variants</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BaseCard padding="small">
            <h3 className="font-semibold mb-1">Small Padding</h3>
            <p className="text-sm text-gray-600">Compact card with minimal padding</p>
          </BaseCard>

          <BaseCard padding="medium">
            <h3 className="font-semibold mb-1">Medium Padding</h3>
            <p className="text-sm text-gray-600">Default balanced padding</p>
          </BaseCard>

          <BaseCard padding="large">
            <h3 className="font-semibold mb-1">Large Padding</h3>
            <p className="text-sm text-gray-600">Spacious card with generous padding</p>
          </BaseCard>
        </div>
      </section>

      {/* ========== REAL WORLD EXAMPLES ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Real World Examples</h2>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <BaseCard hoverable padding="medium">
            <div>
              <p className="text-sm text-gray-600 mb-1">ผู้ใช้ทั้งหมด</p>
              <p className="text-3xl font-bold text-blue-600">2,543</p>
              <p className="text-xs text-green-600 mt-2">↑ 12% จากเดือนที่แล้ว</p>
            </div>
          </BaseCard>

          <BaseCard hoverable padding="medium">
            <div>
              <p className="text-sm text-gray-600 mb-1">เอกสารใหม่</p>
              <p className="text-3xl font-bold text-green-600">847</p>
              <p className="text-xs text-green-600 mt-2">↑ 8% จากเดือนที่แล้ว</p>
            </div>
          </BaseCard>

          <BaseCard hoverable padding="medium">
            <div>
              <p className="text-sm text-gray-600 mb-1">รออนุมัติ</p>
              <p className="text-3xl font-bold text-yellow-600">23</p>
              <p className="text-xs text-gray-600 mt-2">→ ไม่เปลี่ยนแปลง</p>
            </div>
          </BaseCard>

          <BaseCard hoverable padding="medium">
            <div>
              <p className="text-sm text-gray-600 mb-1">เสร็จสิ้น</p>
              <p className="text-3xl font-bold text-purple-600">1,256</p>
              <p className="text-xs text-green-600 mt-2">↑ 15% จากเดือนที่แล้ว</p>
            </div>
          </BaseCard>
        </div>

        {/* User Profile Card */}
        <BaseCard
          title="โปรไฟล์ผู้ใช้"
          headerIcon={<UserIcon />}
          subtitle="ข้อมูลส่วนตัวและการตั้งค่า"
          actions={[
            {
              label: 'แก้ไข',
              onClick: () => handleAction('Edit Profile'),
              variant: 'secondary'
            },
            {
              label: 'บันทึก',
              onClick: () => handleAction('Save Profile'),
              variant: 'primary'
            }
          ]}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                SC
              </div>
              <div>
                <h4 className="font-semibold">สมชาย ใจดี</h4>
                <p className="text-sm text-gray-600">somchai@example.com</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">เบอร์โทร</p>
                <p className="font-medium">081-234-5678</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">สถานะ</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>

      {/* ========== CUSTOM FOOTER ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Cards with Custom Footer</h2>
        
        <BaseCard
          title="ความคืบหน้าโครงการ"
          footer={
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">อัพเดทล่าสุด: 4 พ.ย. 2025</span>
              <span className="text-blue-600 font-medium">เสร็จสิ้น 75%</span>
            </div>
          }
        >
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Phase 1: Planning</span>
                <span className="text-sm text-green-600">✓ Complete</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Phase 2: Development</span>
                <span className="text-sm text-blue-600">● In Progress</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Phase 3: Testing</span>
                <span className="text-sm text-gray-400">○ Pending</span>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>
    </div>
  );
}
