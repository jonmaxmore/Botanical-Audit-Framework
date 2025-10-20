'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import ProtectedRoute from '@/lib/protected-route';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import RoleManagement, { Role, Permission } from '@/components/users/RoleManagement';

export default function RolesPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [permissions, setPermissions] = React.useState<Permission[]>([]);

  React.useEffect(() => {
    // Mock permissions data
    setPermissions([
      // Applications
      {
        id: 'view_applications',
        name: 'ดูคำขอรับรอง',
        description: 'สามารถดูรายการคำขอรับรองทั้งหมด',
        category: 'applications',
      },
      {
        id: 'create_applications',
        name: 'สร้างคำขอรับรอง',
        description: 'สามารถสร้างคำขอรับรองใหม่',
        category: 'applications',
      },
      {
        id: 'edit_applications',
        name: 'แก้ไขคำขอรับรอง',
        description: 'สามารถแก้ไขข้อมูลคำขอรับรอง',
        category: 'applications',
      },
      {
        id: 'review_applications',
        name: 'ตรวจสอบคำขอ',
        description: 'สามารถตรวจสอบและให้ความเห็นคำขอรับรอง',
        category: 'applications',
      },
      {
        id: 'approve_applications',
        name: 'อนุมัติคำขอ',
        description: 'สามารถอนุมัติหรือปฏิเสธคำขอรับรอง',
        category: 'applications',
      },
      {
        id: 'delete_applications',
        name: 'ลบคำขอ',
        description: 'สามารถลบคำขอรับรอง',
        category: 'applications',
      },

      // Users
      {
        id: 'view_users',
        name: 'ดูผู้ใช้งาน',
        description: 'สามารถดูรายการผู้ใช้งานทั้งหมด',
        category: 'users',
      },
      {
        id: 'create_users',
        name: 'สร้างผู้ใช้งาน',
        description: 'สามารถเพิ่มผู้ใช้งานใหม่',
        category: 'users',
      },
      {
        id: 'edit_users',
        name: 'แก้ไขผู้ใช้งาน',
        description: 'สามารถแก้ไขข้อมูลผู้ใช้งาน',
        category: 'users',
      },
      {
        id: 'delete_users',
        name: 'ลบผู้ใช้งาน',
        description: 'สามารถลบผู้ใช้งาน',
        category: 'users',
      },
      {
        id: 'manage_roles',
        name: 'จัดการบทบาท',
        description: 'สามารถกำหนดและแก้ไขบทบาทผู้ใช้',
        category: 'users',
      },

      // Reports
      {
        id: 'view_reports',
        name: 'ดูรายงาน',
        description: 'สามารถดูรายงานต่างๆ',
        category: 'reports',
      },
      {
        id: 'generate_reports',
        name: 'สร้างรายงาน',
        description: 'สามารถสร้างและส่งออกรายงาน',
        category: 'reports',
      },
      {
        id: 'export_reports',
        name: 'ส่งออกรายงาน',
        description: 'สามารถดาวน์โหลดรายงานเป็นไฟล์',
        category: 'reports',
      },

      // Settings
      {
        id: 'view_settings',
        name: 'ดูการตั้งค่า',
        description: 'สามารถดูการตั้งค่าระบบ',
        category: 'settings',
      },
      {
        id: 'edit_settings',
        name: 'แก้ไขการตั้งค่า',
        description: 'สามารถแก้ไขการตั้งค่าระบบ',
        category: 'settings',
      },

      // System
      {
        id: 'view_audit_logs',
        name: 'ดูบันทึกการใช้งาน',
        description: 'สามารถดูบันทึกการใช้งานระบบ',
        category: 'system',
      },
      {
        id: 'manage_system',
        name: 'จัดการระบบ',
        description: 'สามารถจัดการระบบขั้นสูง',
        category: 'system',
      },
    ]);

    // Mock roles data
    setRoles([
      {
        id: '1',
        name: 'admin',
        displayName: 'ผู้ดูแลระบบ',
        description: 'มีสิทธิ์ครบถ้วนในการจัดการระบบทั้งหมด',
        permissions: [
          'view_applications',
          'create_applications',
          'edit_applications',
          'review_applications',
          'approve_applications',
          'delete_applications',
          'view_users',
          'create_users',
          'edit_users',
          'delete_users',
          'manage_roles',
          'view_reports',
          'generate_reports',
          'export_reports',
          'view_settings',
          'edit_settings',
          'view_audit_logs',
          'manage_system',
        ],
        userCount: 5,
        isSystem: true,
        color: 'error',
      },
      {
        id: '2',
        name: 'reviewer',
        displayName: 'ผู้ตรวจสอบ',
        description: 'ตรวจสอบและให้ความเห็นคำขอรับรอง ไม่สามารถอนุมัติได้',
        permissions: ['view_applications', 'review_applications', 'view_reports'],
        userCount: 12,
        isSystem: true,
        color: 'warning',
      },
      {
        id: '3',
        name: 'manager',
        displayName: 'ผู้จัดการ',
        description: 'จัดการคำขอรับรองและสามารถอนุมัติได้',
        permissions: [
          'view_applications',
          'create_applications',
          'edit_applications',
          'review_applications',
          'approve_applications',
          'view_users',
          'view_reports',
          'generate_reports',
          'export_reports',
          'view_settings',
        ],
        userCount: 8,
        isSystem: true,
        color: 'info',
      },
      {
        id: '4',
        name: 'viewer',
        displayName: 'ผู้ดูข้อมูล',
        description: 'ดูข้อมูลคำขอรับรองและรายงานเท่านั้น ไม่สามารถแก้ไขได้',
        permissions: ['view_applications', 'view_reports'],
        userCount: 25,
        isSystem: false,
        color: 'success',
      },
    ]);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAddRole = (role: Omit<Role, 'id' | 'userCount'>) => {
    const newRole: Role = {
      ...role,
      id: Date.now().toString(),
      userCount: 0,
    };
    setRoles([...roles, newRole]);
    alert(`เพิ่มบทบาท "${role.displayName}" เรียบร้อย`);
  };

  const handleEditRole = (id: string, role: Omit<Role, 'id' | 'userCount'>) => {
    setRoles(roles.map(r => (r.id === id ? { ...r, ...role } : r)));
    alert(`แก้ไขบทบาท "${role.displayName}" เรียบร้อย`);
  };

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
    alert('ลบบทบาทเรียบร้อย');
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <AdminHeader onMenuClick={handleSidebarToggle} title="จัดการบทบาทและสิทธิ์" />
          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, bgcolor: 'grey.50' }}>
            <Container maxWidth="xl">
              <RoleManagement
                roles={roles}
                permissions={permissions}
                onAddRole={handleAddRole}
                onEditRole={handleEditRole}
                onDeleteRole={handleDeleteRole}
              />
            </Container>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
