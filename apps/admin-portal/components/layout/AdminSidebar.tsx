'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'temporary';
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface User {
  name: string;
  role: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'แดชบอร์ด',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    id: 'applications',
    label: 'คำขอรับรอง',
    icon: <AssignmentIcon />,
    path: '/applications',
  },
  {
    id: 'users',
    label: 'ผู้ใช้งาน',
    icon: <PeopleIcon />,
    path: '/users',
  },
  {
    id: 'reports',
    label: 'รายงาน',
    icon: <AssessmentIcon />,
    path: '/reports',
  },
  {
    id: 'settings',
    label: 'ตั้งค่า',
    icon: <SettingsIcon />,
    path: '/settings',
  },
];

export default function AdminSidebar({ open, onClose, variant = 'temporary' }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Logo & User Info Section */}
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'primary.dark',
              fontSize: '1.5rem',
            }}
          >
            {user?.name?.charAt(0) || 'A'}
          </Avatar>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {user?.name || 'Admin User'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {user?.role || 'Administrator'}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h6" fontWeight={600}>
          GACP Admin
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          ระบบจัดการผู้ดูแลระบบ
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map(item => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.id} disablePadding sx={{ px: 2, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'white' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Logout Button */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.light',
              color: 'error.dark',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="ออกจากระบบ" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: variant === 'permanent' ? 2 : 0,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
