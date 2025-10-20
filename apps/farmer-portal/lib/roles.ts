/**
 * Role Management System
 * Define user roles and permissions for GACP Platform
 */

export enum UserRole {
  FARMER = 'farmer',
  REVIEWER = 'reviewer',
  INSPECTOR = 'inspector',
  APPROVER = 'approver',
  ADMIN = 'admin',
  PUBLIC = 'public',
}

export interface RoleConfig {
  name: string;
  displayName: string;
  description?: string;
  dashboardRoute: string;
  permissions: string[];
  color: string;
  icon: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  [UserRole.FARMER]: {
    name: UserRole.FARMER,
    displayName: 'เกษตรกร',
    description: 'สำหรับเจ้าของฟาร์มที่ต้องการยื่นขอรับรอง GACP',
    dashboardRoute: '/dashboard/farmer',
    permissions: [
      'farm:read',
      'farm:write',
      'application:create',
      'application:read',
      'survey:submit',
      'trace:read',
    ],
    color: '#4caf50',
    icon: 'agriculture',
  },
  [UserRole.REVIEWER]: {
    name: UserRole.REVIEWER,
    displayName: 'เจ้าหน้าที่ตรวจสอบเอกสาร',
    description: 'สำหรับเจ้าหน้าที่ตรวจสอบเอกสารและข้อมูล',
    dashboardRoute: '/dashboard/reviewer',
    permissions: [
      'application:read',
      'application:review',
      'application:comment',
      'farm:read',
      'document:verify',
    ],
    color: '#2196f3',
    icon: 'assignment',
  },
  [UserRole.INSPECTOR]: {
    name: UserRole.INSPECTOR,
    displayName: 'เจ้าหน้าที่ตรวจฟาร์ม',
    description: 'สำหรับเจ้าหน้าที่ออกตรวจสอบฟาร์มจริง',
    dashboardRoute: '/dashboard/inspector',
    permissions: [
      'farm:read',
      'farm:inspect',
      'application:read',
      'inspection:create',
      'inspection:update',
      'trace:read',
      'trace:verify',
    ],
    color: '#ff9800',
    icon: 'search',
  },
  [UserRole.APPROVER]: {
    name: UserRole.APPROVER,
    displayName: 'ผู้อนุมัติ',
    description: 'สำหรับเจ้าหน้าที่อนุมัติและออกใบรับรอง',
    dashboardRoute: '/dashboard/approver',
    permissions: [
      'application:read',
      'application:approve',
      'application:reject',
      'certificate:issue',
      'certificate:revoke',
      'farm:read',
      'inspection:read',
    ],
    color: '#9c27b0',
    icon: 'verified',
  },
  [UserRole.ADMIN]: {
    name: UserRole.ADMIN,
    displayName: 'ผู้ดูแลระบบ',
    description: 'สำหรับผู้ดูแลระบบทั้งหมด',
    dashboardRoute: '/dashboard/admin',
    permissions: [
      'user:read',
      'user:create',
      'user:update',
      'user:delete',
      'role:manage',
      'system:settings',
      'audit:read',
      'logs:read',
      'reports:all',
    ],
    color: '#f44336',
    icon: 'admin_panel_settings',
  },
  [UserRole.PUBLIC]: {
    name: UserRole.PUBLIC,
    displayName: 'ผู้เยี่ยมชม',
    description: 'ผู้เข้าชมทั่วไป',
    dashboardRoute: '/',
    permissions: ['trace:read'],
    color: '#757575',
    icon: 'public',
  },
};

/**
 * Get dashboard route based on user role
 */
export function getDashboardRoute(role: UserRole): string {
  return ROLE_CONFIGS[role]?.dashboardRoute || '/';
}

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const config = ROLE_CONFIGS[userRole];
  if (!config) return false;

  // Admin has all permissions
  if (userRole === UserRole.ADMIN) return true;

  return config.permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(userRole: UserRole, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(userRole: UserRole, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Get role display name in Thai
 */
export function getRoleDisplayName(role: UserRole): string {
  return ROLE_CONFIGS[role]?.displayName || 'ไม่ระบุ';
}

/**
 * Get role color for UI
 */
export function getRoleColor(role: UserRole): string {
  return ROLE_CONFIGS[role]?.color || '#757575';
}

/**
 * Validate if role exists
 */
export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return Object.values(UserRole).filter(role => role !== UserRole.PUBLIC);
}
