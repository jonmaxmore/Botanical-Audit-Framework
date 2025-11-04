/**
 * Usage Examples for BaseUserForm
 * 
 * This file demonstrates how to migrate from old duplicate user forms
 * to the new unified BaseUserForm component.
 */

'use client';

import React, { useState } from 'react';
import BaseUserForm, { CreateUserForm, EditUserForm, UserProfileForm } from './BaseUserForm';

// ============================================================================
// EXAMPLE 1: Create New User (Admin Portal)
// ============================================================================

export function CreateUserExample() {
  const handleSubmit = async (data: any) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    
    // Redirect or show success
    window.location.href = '/admin/users';
  };

  return (
    <CreateUserForm
      onSubmit={handleSubmit}
      onCancel={() => window.history.back()}
      showDepartment={true}
      showOrganization={true}
      requireThaiName={true}
    />
  );
}

// ============================================================================
// EXAMPLE 2: Edit Existing User (Admin Portal)
// ============================================================================

export function EditUserExample() {
  const [userData, setUserData] = useState({
    firstName: 'สมชาย',
    lastName: 'ดีมาก',
    email: 'somchai@example.com',
    phone: '0812345678',
    role: 'inspector' as const,
    department: 'ฝ่ายตรวจสอบ',
    organization: 'กรมส่งเสริมการเกษตร'
  });

  const handleSubmit = async (data: any) => {
    const response = await fetch(`/api/users/USR-001`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    
    alert('บันทึกข้อมูลสำเร็จ');
  };

  return (
    <EditUserForm
      initialData={userData}
      userId="USR-001"
      onSubmit={handleSubmit}
      onCancel={() => window.history.back()}
    />
  );
}

// ============================================================================
// EXAMPLE 3: User Profile (Farmer Portal)
// ============================================================================

export function UserProfileExample() {
  const [userData, setUserData] = useState({
    firstName: 'สมศรี',
    lastName: 'ใจดี',
    email: 'somsri@example.com',
    phone: '0898765432',
    department: 'เกษตรกรอิสระ',
    organization: 'สวนลำไยบ้านสวนดอกไม้',
    profileImage: '/images/profile.jpg'
  });

  const handleSubmit = async (data: any) => {
    // Handle file upload for profile image
    let imageUrl = userData.profileImage;
    
    if (data.profileImage instanceof File) {
      const formData = new FormData();
      formData.append('image', data.profileImage);
      
      const uploadResponse = await fetch('/api/upload/profile-image', {
        method: 'POST',
        body: formData
      });
      
      const { url } = await uploadResponse.json();
      imageUrl = url;
    }
    
    // Update profile
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        profileImage: imageUrl
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    alert('อัปเดตโปรไฟล์สำเร็จ');
  };

  return (
    <UserProfileForm
      initialData={userData}
      userId="current-user"
      onSubmit={handleSubmit}
      showProfileImage={true}
      showDepartment={true}
      showOrganization={true}
    />
  );
}

// ============================================================================
// EXAMPLE 4: Custom Role Options
// ============================================================================

export function CustomRolesExample() {
  const customRoles = [
    {
      value: 'farmer' as const,
      label: 'เกษตรกร',
      description: 'เกษตรกรผู้สมัครขอใบรับรอง',
      permissions: ['apply', 'view_own']
    },
    {
      value: 'inspector' as const,
      label: 'ผู้ตรวจสอบ',
      description: 'ผู้ตรวจสอบฟาร์มและเอกสาร',
      permissions: ['inspect', 'review', 'report']
    }
  ];

  const handleSubmit = async (data: any) => {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };

  return (
    <BaseUserForm
      mode="create"
      onSubmit={handleSubmit}
      availableRoles={customRoles}
      showPermissions={true}
      title="สร้างบัญชีผู้ใช้"
    />
  );
}

// ============================================================================
// EXAMPLE 5: With Field Change Callback
// ============================================================================

export function WithCallbackExample() {
  const [email, setEmail] = useState('');
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  const handleFieldChange = async (field: string, value: any) => {
    if (field === 'email') {
      setEmail(value);
      
      // Check email availability
      if (value.includes('@')) {
        const response = await fetch(`/api/check-email?email=${value}`);
        const { available } = await response.json();
        setEmailAvailable(available);
      }
    }
  };

  const handleSubmit = async (data: any) => {
    if (!emailAvailable) {
      throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
    }
    
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };

  return (
    <div>
      <CreateUserForm
        onSubmit={handleSubmit}
        onFieldChange={handleFieldChange}
      />
      
      {email && emailAvailable !== null && (
        <div className="mt-4 p-4 rounded-lg">
          {emailAvailable ? (
            <p className="text-green-600">✅ อีเมลนี้สามารถใช้งานได้</p>
          ) : (
            <p className="text-red-600">❌ อีเมลนี้ถูกใช้งานแล้ว</p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Minimal Configuration (No Optional Fields)
// ============================================================================

export function MinimalFormExample() {
  const handleSubmit = async (data: any) => {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };

  return (
    <BaseUserForm
      mode="create"
      onSubmit={handleSubmit}
      showRoleSelection={false}
      showPasswordFields={false}
      showDepartment={false}
      showOrganization={false}
      showProfileImage={false}
      title="ลงทะเบียนผู้ใช้"
      submitButtonText="ลงทะเบียน"
    />
  );
}

// ============================================================================
// MIGRATION GUIDE
// ============================================================================

/**
 * BEFORE (Old CreateUserForm - Admin Portal):
 * 
 * <CreateUserForm
 *   onSuccess={handleSuccess}
 *   onCancel={handleCancel}
 *   showRoles={true}
 * />
 * 
 * AFTER (New BaseUserForm):
 * 
 * <CreateUserForm
 *   onSubmit={handleSubmit}
 *   onCancel={handleCancel}
 *   showRoleSelection={true}
 * />
 * 
 * Changes:
 * - onSuccess → onSubmit (now async, handles errors)
 * - showRoles → showRoleSelection
 * - Built-in validation (no need for separate validation logic)
 * - Built-in loading states
 */

/**
 * BEFORE (Old EditUserForm - Admin Portal):
 * 
 * <EditUserForm
 *   userId={userId}
 *   userData={userData}
 *   onUpdate={handleUpdate}
 *   onCancel={handleCancel}
 * />
 * 
 * AFTER (New BaseUserForm):
 * 
 * <EditUserForm
 *   userId={userId}
 *   initialData={userData}
 *   onSubmit={handleSubmit}
 *   onCancel={handleCancel}
 * />
 * 
 * Changes:
 * - userData → initialData
 * - onUpdate → onSubmit
 * - Automatically hides password fields in edit mode
 * - Better error handling
 */

/**
 * BEFORE (Old UserProfileForm - Farmer Portal):
 * 
 * <UserProfileForm
 *   user={currentUser}
 *   onSave={handleSave}
 *   showProfilePicture={true}
 * />
 * 
 * AFTER (New BaseUserForm):
 * 
 * <UserProfileForm
 *   initialData={currentUser}
 *   onSubmit={handleSubmit}
 *   showProfileImage={true}
 * />
 * 
 * Changes:
 * - user → initialData
 * - onSave → onSubmit
 * - showProfilePicture → showProfileImage
 * - Automatically hides role selection for profile mode
 * - Better image upload handling (max 2MB, preview)
 */

/**
 * BENEFITS OF NEW COMPONENT:
 * 
 * 1. Single source of truth (450+ lines saved)
 * 2. Consistent validation across all portals
 * 3. Real-time field validation with visual feedback
 * 4. Thai name validation built-in
 * 5. Email format validation
 * 6. Phone number validation (Thai format)
 * 7. Password strength indicator
 * 8. Profile image preview
 * 9. Loading states
 * 10. Error handling
 * 11. Type-safe with TypeScript
 * 12. Responsive design
 * 13. Accessibility features
 * 14. Pre-configured helpers (CreateUserForm, EditUserForm, UserProfileForm)
 */
