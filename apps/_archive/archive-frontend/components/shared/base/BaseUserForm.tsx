/**
 * Base User Form Component
 * 
 * Reusable form for creating and editing user profiles across all portals.
 * Consolidates logic from:
 * - CreateUserForm (admin-portal)
 * - EditUserForm (admin-portal)
 * - UserProfileForm (farmer-portal)
 * 
 * Features:
 * - Thai name validation (ก-ฮ, spaces)
 * - Role selection with permissions
 * - Email/phone validation
 * - Profile image upload
 * - Department/organization
 * - Password management (create mode)
 * - Real-time validation
 * 
 * @version 1.0.0
 * @created November 4, 2025
 * @author Code Refactoring - Phase 5
 */

'use client';

import React, { useState, ReactNode } from 'react';
import { User, Mail, Phone, Shield, Building, Upload, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UserRole = 'admin' | 'inspector' | 'farmer' | 'officer' | 'viewer';

export interface RoleOption {
  value: UserRole;
  label: string;
  description?: string;
  permissions?: string[];
  icon?: ReactNode;
}

export interface BaseUserFormProps {
  // Core props
  mode: 'create' | 'edit' | 'profile';
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel?: () => void;
  
  // Initial data (for edit/profile mode)
  initialData?: Partial<UserFormData>;
  userId?: string;
  
  // Configuration
  showRoleSelection?: boolean;
  showPasswordFields?: boolean;
  showDepartment?: boolean;
  showOrganization?: boolean;
  showProfileImage?: boolean;
  showPermissions?: boolean;
  
  // Role options
  availableRoles?: RoleOption[];
  
  // Validation
  requirePassword?: boolean;
  minPasswordLength?: number;
  requireThaiName?: boolean;
  
  // Customization
  className?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  title?: string;
  
  // Callbacks
  onFieldChange?: (field: string, value: any) => void;
}

export interface UserFormData {
  // Personal info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Role & permissions
  role?: UserRole;
  permissions?: string[];
  
  // Organization
  department?: string;
  organization?: string;
  
  // Authentication
  password?: string;
  confirmPassword?: string;
  
  // Profile
  profileImage?: string | File;
  
  // Additional
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

// ============================================================================
// DEFAULT ROLE OPTIONS
// ============================================================================

const DEFAULT_ROLES: RoleOption[] = [
  {
    value: 'admin',
    label: 'ผู้ดูแลระบบ',
    description: 'จัดการระบบทั้งหมด',
    permissions: ['all'],
    icon: <Shield className="w-5 h-5" />
  },
  {
    value: 'inspector',
    label: 'ผู้ตรวจสอบ',
    description: 'ตรวจสอบฟาร์มและเอกสาร',
    permissions: ['inspect', 'review', 'report'],
    icon: <User className="w-5 h-5" />
  },
  {
    value: 'farmer',
    label: 'เกษตรกร',
    description: 'ยื่นคำขอและดูสถานะ',
    permissions: ['apply', 'view_own'],
    icon: <User className="w-5 h-5" />
  },
  {
    value: 'officer',
    label: 'เจ้าหน้าที่',
    description: 'จัดการเอกสารและใบรับรอง',
    permissions: ['manage_docs', 'issue_certs'],
    icon: <Building className="w-5 h-5" />
  },
  {
    value: 'viewer',
    label: 'ผู้ดูข้อมูล',
    description: 'ดูข้อมูลเท่านั้น',
    permissions: ['view_all'],
    icon: <Eye className="w-5 h-5" />
  }
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function BaseUserForm({
  mode = 'create',
  onSubmit,
  onCancel,
  initialData = {},
  userId: _userId,
  showRoleSelection = true,
  showPasswordFields = mode === 'create',
  showDepartment = true,
  showOrganization = true,
  showProfileImage = true,
  showPermissions = false,
  availableRoles = DEFAULT_ROLES,
  requirePassword = mode === 'create',
  minPasswordLength = 8,
  requireThaiName = false,
  className = '',
  submitButtonText = mode === 'create' ? 'สร้างผู้ใช้' : 'บันทึกการแก้ไข',
  cancelButtonText = 'ยกเลิก',
  title,
  onFieldChange
}: BaseUserFormProps) {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<UserFormData>({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    role: initialData.role || 'farmer',
    department: initialData.department || '',
    organization: initialData.organization || '',
    password: '',
    confirmPassword: '',
    profileImage: initialData.profileImage || '',
    permissions: initialData.permissions || []
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [imagePreview, setImagePreview] = useState<string>(
    typeof initialData.profileImage === 'string' ? initialData.profileImage : ''
  );

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateThaiName = (name: string): boolean => {
    const thaiNameRegex = /^[ก-ฮะ-์\s]+$/;
    return thaiNameRegex.test(name);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/[-\s]/g, ''));
  };

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'firstName':
        if (!value.trim()) return 'กรุณากรอกชื่อ';
        if (requireThaiName && !validateThaiName(value)) {
          return 'กรุณากรอกชื่อเป็นภาษาไทย';
        }
        return '';
        
      case 'lastName':
        if (!value.trim()) return 'กรุณากรอกนามสกุล';
        if (requireThaiName && !validateThaiName(value)) {
          return 'กรุณากรอกนามสกุลเป็นภาษาไทย';
        }
        return '';
        
      case 'email':
        if (!value.trim()) return 'กรุณากรอกอีเมล';
        if (!validateEmail(value)) return 'รูปแบบอีเมลไม่ถูกต้อง';
        return '';
        
      case 'phone':
        if (!value.trim()) return 'กรุณากรอกเบอร์โทรศัพท์';
        if (!validatePhone(value)) return 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (0812345678)';
        return '';
        
      case 'password':
        if (requirePassword && !value) return 'กรุณากรอกรหัสผ่าน';
        if (value && value.length < minPasswordLength) {
          return `รหัสผ่านต้องมีอย่างน้อย ${minPasswordLength} ตัวอักษร`;
        }
        return '';
        
      case 'confirmPassword':
        if (requirePassword && !value) return 'กรุณายืนยันรหัสผ่าน';
        if (value !== formData.password) return 'รหัสผ่านไม่ตรงกัน';
        return '';
        
      case 'department':
        if (showDepartment && !value.trim()) return 'กรุณากรอกแผนก/หน่วยงาน';
        return '';
        
      case 'organization':
        if (showOrganization && !value.trim()) return 'กรุณากรอกองค์กร';
        return '';
        
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate all required fields
    ['firstName', 'lastName', 'email', 'phone'].forEach(field => {
      const error = validateField(field, formData[field as keyof UserFormData]);
      if (error) newErrors[field] = error;
    });
    
    // Validate password fields if shown
    if (showPasswordFields) {
      const passwordError = validateField('password', formData.password);
      if (passwordError) newErrors.password = passwordError;
      
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      if (confirmError) newErrors.confirmPassword = confirmError;
    }
    
    // Validate optional fields if shown
    if (showDepartment) {
      const deptError = validateField('department', formData.department);
      if (deptError) newErrors.department = deptError;
    }
    
    if (showOrganization) {
      const orgError = validateField('organization', formData.organization);
      if (orgError) newErrors.organization = orgError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFieldChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Validate on change if field was touched
    if (touched[field]) {
      const error = validateField(field, value);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
      }
    }
    
    // Callback
    if (onFieldChange) {
      onFieldChange(field, value);
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof UserFormData]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profileImage: 'กรุณาเลือกไฟล์รูปภาพ' }));
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profileImage: 'ขนาดไฟล์ต้องไม่เกิน 2MB' }));
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      handleFieldChange('profileImage', file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data (exclude confirmPassword)
      const { confirmPassword: _confirmPassword, ...submitData } = formData;
      
      // Remove password if not shown
      if (!showPasswordFields) {
        delete submitData.password;
      }
      
      await onSubmit(submitData);
    } catch (error) {
      setErrors({ 
        submit: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' 
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderInput = (
    field: keyof UserFormData,
    label: string,
    type: string = 'text',
    icon?: ReactNode,
    placeholder?: string
  ) => {
    const value = formData[field] || '';
    const error = errors[field as string];
    const isValid = touched[field as string] && !error && value;
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {requirePassword || field !== 'password' ? '*' : ''}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            value={value as string}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
            disabled={loading}
            placeholder={placeholder}
            className={`
              w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${icon ? 'pl-11' : ''}
              ${error ? 'border-red-500' : isValid ? 'border-green-500' : 'border-gray-300'}
              ${loading ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
            `}
          />
          {isValid && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  const renderPasswordInput = (
    field: 'password' | 'confirmPassword',
    label: string,
    show: boolean,
    setShow: (show: boolean) => void
  ) => {
    const value = formData[field] || '';
    const error = errors[field];
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {requirePassword ? '*' : ''}
        </label>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
            disabled={loading}
            className={`
              w-full px-4 py-3 pr-11 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${loading ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
            `}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        {field === 'password' && !error && value && (
          <div className="text-sm text-gray-500">
            ความแข็งแรง: {value.length < 8 ? '🔴 อ่อน' : value.length < 12 ? '🟡 ปานกลาง' : '🟢 แข็งแรง'}
          </div>
        )}
      </div>
    );
  };

  const renderRoleSelection = () => {
    if (!showRoleSelection) return null;
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          บทบาท *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableRoles.map((role) => {
            const isSelected = formData.role === role.value;
            
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => handleFieldChange('role', role.value)}
                disabled={loading}
                className={`
                  flex items-start gap-3 p-4 border-2 rounded-lg transition-all text-left
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-offset-2 ring-blue-500' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className={`mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                  {role.icon || <User className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                    {role.label}
                  </div>
                  {role.description && (
                    <div className="text-sm text-gray-600 mt-1">{role.description}</div>
                  )}
                  {showPermissions && role.permissions && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProfileImage = () => {
    if (!showProfileImage) return null;
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          รูปโปรไฟล์
        </label>
        <div className="flex items-center gap-4">
          {/* Image Preview */}
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
          
          {/* Upload Button */}
          <div className="flex-1">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">เลือกรูปภาพ</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG หรือ GIF (สูงสุด 2MB)
            </p>
            {errors.profileImage && (
              <p className="text-xs text-red-600 mt-1">{errors.profileImage}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Profile Image */}
        {renderProfileImage()}
        
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">ข้อมูลส่วนตัว</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput('firstName', 'ชื่อ', 'text', <User className="w-5 h-5" />, 'สมชาย')}
            {renderInput('lastName', 'นามสกุล', 'text', <User className="w-5 h-5" />, 'ดีมาก')}
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">ข้อมูลติดต่อ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput('email', 'อีเมล', 'email', <Mail className="w-5 h-5" />, 'example@email.com')}
            {renderInput('phone', 'เบอร์โทรศัพท์', 'tel', <Phone className="w-5 h-5" />, '0812345678')}
          </div>
        </div>
        
        {/* Organization Information */}
        {(showDepartment || showOrganization) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">ข้อมูลองค์กร</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showDepartment && renderInput('department', 'แผนก/หน่วยงาน', 'text', <Building className="w-5 h-5" />, 'ฝ่ายตรวจสอบ')}
              {showOrganization && renderInput('organization', 'องค์กร', 'text', <Building className="w-5 h-5" />, 'กรมส่งเสริมการเกษตร')}
            </div>
          </div>
        )}
        
        {/* Role Selection */}
        {renderRoleSelection()}
        
        {/* Password Fields */}
        {showPasswordFields && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">รหัสผ่าน</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderPasswordInput('password', 'รหัสผ่าน', showPassword, setShowPassword)}
              {renderPasswordInput('confirmPassword', 'ยืนยันรหัสผ่าน', showConfirmPassword, setShowConfirmPassword)}
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-red-800">เกิดข้อผิดพลาด</div>
              <div className="text-sm text-red-700 mt-1">{errors.submit}</div>
            </div>
          </div>
        )}
        
        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelButtonText}
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {loading ? 'กำลังบันทึก...' : submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Pre-configured for admin creating new user
 */
export const CreateUserForm = (props: Omit<BaseUserFormProps, 'mode'>) => (
  <BaseUserForm
    {...props}
    mode="create"
    showRoleSelection={true}
    showPasswordFields={true}
    requirePassword={true}
    title="สร้างผู้ใช้ใหม่"
  />
);

/**
 * Pre-configured for admin editing existing user
 */
export const EditUserForm = (props: Omit<BaseUserFormProps, 'mode'>) => (
  <BaseUserForm
    {...props}
    mode="edit"
    showRoleSelection={true}
    showPasswordFields={false}
    requirePassword={false}
    title="แก้ไขข้อมูลผู้ใช้"
  />
);

/**
 * Pre-configured for user editing own profile
 */
export const UserProfileForm = (props: Omit<BaseUserFormProps, 'mode' | 'showRoleSelection'>) => (
  <BaseUserForm
    {...props}
    mode="profile"
    showRoleSelection={false}
    showPasswordFields={false}
    showPermissions={false}
    title="แก้ไขโปรไฟล์"
  />
);
