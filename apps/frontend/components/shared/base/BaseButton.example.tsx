/**
 * BaseButton Example Showcase
 * 
 * Demonstrates all variations and use cases of BaseButton component
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

'use client';

import React, { useState } from 'react';
import BaseButton from './BaseButton';

// Simple SVG Icon Components
const SaveIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const DownloadIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const UploadIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12" />
  </svg>
);

const TrashIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EditIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PlusIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CheckIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const AlertIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MailIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const SearchIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UserIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const HomeIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export default function BaseButtonExample() {
  const [loading, setLoading] = useState(false);
  const [clicked, setClicked] = useState<string | null>(null);

  const handleClick = (buttonName: string) => {
    setClicked(buttonName);
    setTimeout(() => setClicked(null), 2000);
  };

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          BaseButton Component Examples
        </h1>
        <p className="text-gray-600">
          Comprehensive showcase of all BaseButton variations and use cases
        </p>
        {clicked && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
            ✅ Clicked: <strong>{clicked}</strong>
          </div>
        )}
      </div>

      {/* ========== VARIANTS ========== */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Button Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm">Contained</h3>
            <BaseButton
              variant="contained"
              onClick={() => handleClick('Contained Button')}
            >
              Contained
            </BaseButton>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm">Outlined</h3>
            <BaseButton
              variant="outlined"
              onClick={() => handleClick('Outlined Button')}
            >
              Outlined
            </BaseButton>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm">Text</h3>
            <BaseButton
              variant="text"
              onClick={() => handleClick('Text Button')}
            >
              Text Button
            </BaseButton>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm">Gradient</h3>
            <BaseButton
              variant="gradient"
              onClick={() => handleClick('Gradient Button')}
            >
              Gradient
            </BaseButton>
          </div>
        </div>
      </section>

      {/* ========== SIZES ========== */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <BaseButton
            size="small"
            onClick={() => handleClick('Small Button')}
          >
            Small
          </BaseButton>

          <BaseButton
            size="medium"
            onClick={() => handleClick('Medium Button')}
          >
            Medium
          </BaseButton>

          <BaseButton
            size="large"
            onClick={() => handleClick('Large Button')}
          >
            Large
          </BaseButton>
        </div>
      </section>

      {/* ========== COLORS ========== */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Color Themes</h2>
        
        {/* Contained Colors */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Contained</h3>
          <div className="flex flex-wrap gap-3">
            <BaseButton color="primary" onClick={() => handleClick('Primary')}>
              Primary
            </BaseButton>
            <BaseButton color="secondary" onClick={() => handleClick('Secondary')}>
              Secondary
            </BaseButton>
            <BaseButton color="success" onClick={() => handleClick('Success')}>
              Success
            </BaseButton>
            <BaseButton color="error" onClick={() => handleClick('Error')}>
              Error
            </BaseButton>
            <BaseButton color="warning" onClick={() => handleClick('Warning')}>
              Warning
            </BaseButton>
            <BaseButton color="info" onClick={() => handleClick('Info')}>
              Info
            </BaseButton>
          </div>
        </div>

        {/* Outlined Colors */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Outlined</h3>
          <div className="flex flex-wrap gap-3">
            <BaseButton variant="outlined" color="primary" onClick={() => handleClick('Primary Outlined')}>
              Primary
            </BaseButton>
            <BaseButton variant="outlined" color="secondary" onClick={() => handleClick('Secondary Outlined')}>
              Secondary
            </BaseButton>
            <BaseButton variant="outlined" color="success" onClick={() => handleClick('Success Outlined')}>
              Success
            </BaseButton>
            <BaseButton variant="outlined" color="error" onClick={() => handleClick('Error Outlined')}>
              Error
            </BaseButton>
            <BaseButton variant="outlined" color="warning" onClick={() => handleClick('Warning Outlined')}>
              Warning
            </BaseButton>
            <BaseButton variant="outlined" color="info" onClick={() => handleClick('Info Outlined')}>
              Info
            </BaseButton>
          </div>
        </div>

        {/* Gradient Colors */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Gradient</h3>
          <div className="flex flex-wrap gap-3">
            <BaseButton variant="gradient" color="primary" onClick={() => handleClick('Primary Gradient')}>
              Primary
            </BaseButton>
            <BaseButton variant="gradient" color="secondary" onClick={() => handleClick('Secondary Gradient')}>
              Secondary
            </BaseButton>
            <BaseButton variant="gradient" color="success" onClick={() => handleClick('Success Gradient')}>
              Success
            </BaseButton>
            <BaseButton variant="gradient" color="error" onClick={() => handleClick('Error Gradient')}>
              Error
            </BaseButton>
            <BaseButton variant="gradient" color="warning" onClick={() => handleClick('Warning Gradient')}>
              Warning
            </BaseButton>
            <BaseButton variant="gradient" color="info" onClick={() => handleClick('Info Gradient')}>
              Info
            </BaseButton>
          </div>
        </div>
      </section>

      {/* ========== WITH ICONS ========== */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Buttons with Icons</h2>
        
        {/* Start Icons */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Start Icon</h3>
          <div className="flex flex-wrap gap-3">
            <BaseButton startIcon={<SaveIcon />} onClick={() => handleClick('Save')}>
              บันทึก
            </BaseButton>
            <BaseButton startIcon={<DownloadIcon />} color="success" onClick={() => handleClick('Download')}>
              ดาวน์โหลด
            </BaseButton>
            <BaseButton startIcon={<UploadIcon />} variant="outlined" onClick={() => handleClick('Upload')}>
              อัปโหลด
            </BaseButton>
            <BaseButton startIcon={<TrashIcon />} color="error" variant="outlined" onClick={() => handleClick('Delete')}>
              ลบ
            </BaseButton>
            <BaseButton startIcon={<EditIcon />} color="warning" onClick={() => handleClick('Edit')}>
              แก้ไข
            </BaseButton>
            <BaseButton startIcon={<PlusIcon />} variant="gradient" onClick={() => handleClick('Add')}>
              เพิ่ม
            </BaseButton>
          </div>
        </div>

        {/* End Icons */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">End Icon</h3>
          <div className="flex flex-wrap gap-3">
            <BaseButton endIcon={<CheckIcon />} color="success" onClick={() => handleClick('Confirm')}>
              ยืนยัน
            </BaseButton>
            <BaseButton endIcon={<XIcon />} color="error" variant="outlined" onClick={() => handleClick('Cancel')}>
              ยกเลิก
            </BaseButton>
            <BaseButton endIcon={<MailIcon />} onClick={() => handleClick('Email')}>
              ส่งอีเมล
            </BaseButton>
            <BaseButton endIcon={<PhoneIcon />} color="info" onClick={() => handleClick('Call')}>
              โทร
            </BaseButton>
          </div>
        </div>

        {/* Both Icons */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Start & End Icons</h3>
          <div className="flex flex-wrap gap-3">
            <BaseButton 
              startIcon={<SearchIcon />} 
              endIcon={<AlertIcon />}
              variant="outlined"
              onClick={() => handleClick('Search with Alert')}
            >
              ค้นหา
            </BaseButton>
            <BaseButton 
              startIcon={<SettingsIcon />} 
              endIcon={<UserIcon />}
              color="secondary"
              onClick={() => handleClick('User Settings')}
            >
              ตั้งค่าผู้ใช้
            </BaseButton>
          </div>
        </div>
      </section>

      {/* ========== STATES ========== */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Button States</h2>
        
        {/* Loading State */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Loading State</h3>
          <div className="flex flex-wrap gap-3">
            <BaseButton 
              loading={loading} 
              onClick={handleLoadingClick}
            >
              {loading ? 'กำลังโหลด...' : 'คลิกเพื่อโหลด'}
            </BaseButton>
            <BaseButton 
              loading={loading}
              variant="outlined"
              color="success"
              startIcon={<SaveIcon />}
              onClick={handleLoadingClick}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </BaseButton>
            <BaseButton 
              loading={true}
              color="info"
            >
              กำลังประมวลผล...
            </BaseButton>
          </div>
        </div>

        {/* Disabled State */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Disabled State</h3>
          <div className="flex flex-wrap gap-3">
            <BaseButton disabled>
              Disabled
            </BaseButton>
            <BaseButton disabled variant="outlined" color="success">
              Disabled Outlined
            </BaseButton>
            <BaseButton disabled startIcon={<SaveIcon />} color="error">
              Disabled with Icon
            </BaseButton>
            <BaseButton disabled variant="gradient">
              Disabled Gradient
            </BaseButton>
          </div>
        </div>
      </section>

      {/* ========== FULL WIDTH ========== */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Full Width Buttons</h2>
        <div className="space-y-3 max-w-md">
          <BaseButton 
            fullWidth 
            startIcon={<SaveIcon />}
            onClick={() => handleClick('Full Width Save')}
          >
            บันทึกข้อมูล
          </BaseButton>
          <BaseButton 
            fullWidth 
            variant="outlined" 
            color="error"
            startIcon={<XIcon />}
            onClick={() => handleClick('Full Width Cancel')}
          >
            ยกเลิก
          </BaseButton>
          <BaseButton 
            fullWidth 
            variant="gradient"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => handleClick('Full Width Submit')}
          >
            ส่งข้อมูล
          </BaseButton>
        </div>
      </section>

      {/* ========== REAL WORLD EXAMPLES ========== */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Real World Examples</h2>
        
        {/* Form Actions */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Form Actions</h3>
          <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 rounded-lg">
            <BaseButton 
              variant="outlined" 
              onClick={() => handleClick('Form Cancel')}
            >
              ยกเลิก
            </BaseButton>
            <BaseButton 
              variant="outlined"
              color="secondary"
              startIcon={<SaveIcon />}
              onClick={() => handleClick('Form Draft')}
            >
              บันทึกแบบร่าง
            </BaseButton>
            <BaseButton 
              startIcon={<CheckIcon />}
              color="success"
              onClick={() => handleClick('Form Submit')}
            >
              บันทึก
            </BaseButton>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Navigation</h3>
          <div className="flex flex-wrap gap-3">
            <BaseButton 
              variant="text"
              startIcon={<HomeIcon />}
              onClick={() => handleClick('Home')}
            >
              หน้าหลัก
            </BaseButton>
            <BaseButton 
              variant="text"
              startIcon={<UserIcon />}
              onClick={() => handleClick('Profile')}
            >
              โปรไฟล์
            </BaseButton>
            <BaseButton 
              variant="text"
              startIcon={<SettingsIcon />}
              onClick={() => handleClick('Settings')}
            >
              ตั้งค่า
            </BaseButton>
          </div>
        </div>

        {/* Action Buttons */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Critical Actions</h3>
          <div className="flex flex-wrap gap-3">
            <BaseButton 
              color="error"
              startIcon={<TrashIcon />}
              onClick={() => handleClick('Delete Action')}
            >
              ลบข้อมูล
            </BaseButton>
            <BaseButton 
              color="warning"
              variant="outlined"
              startIcon={<AlertIcon />}
              onClick={() => handleClick('Warning Action')}
            >
              คำเตือน
            </BaseButton>
            <BaseButton 
              color="success"
              variant="gradient"
              startIcon={<CheckIcon />}
              onClick={() => handleClick('Approve Action')}
            >
              อนุมัติ
            </BaseButton>
          </div>
        </div>
      </section>
    </div>
  );
}
