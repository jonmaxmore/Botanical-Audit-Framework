'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Badge,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

interface User {
  name: string;
  email: string;
  role: string;
}

export default function AdminHeader({ onMenuClick, title = 'แดชบอร์ด' }: AdminHeaderProps) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = React.useState<null | HTMLElement>(null);

  React.useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotifMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifMenuClose = () => {
    setNotifAnchorEl(null);
  };

  const handleSettings = () => {
    handleProfileMenuClose();
    router.push('/settings');
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1,
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          {/* Menu Button (Mobile) */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Title */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {title}
          </Typography>

          {/* Notification Bell */}
          <IconButton
            color="inherit"
            aria-label="notifications"
            onClick={handleNotifMenuOpen}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Settings Icon */}
          <IconButton color="inherit" aria-label="settings" onClick={handleSettings} sx={{ mr: 1 }}>
            <SettingsIcon />
          </IconButton>

          {/* User Avatar & Name */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
            onClick={handleProfileMenuOpen}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                mr: 1,
              }}
            >
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.name || 'Admin User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role || 'Administrator'}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleSettings}>
          <SettingsIcon sx={{ mr: 2 }} fontSize="small" />
          ตั้งค่าบัญชี
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutIcon sx={{ mr: 2 }} fontSize="small" />
          ออกจากระบบ
        </MenuItem>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={handleNotifMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ px: 2, py: 1.5, minWidth: 300 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            การแจ้งเตือน
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleNotifMenuClose}>
          <Box>
            <Typography variant="body2">คำขอรับรองใหม่ #1234</Typography>
            <Typography variant="caption" color="text.secondary">
              5 นาทีที่แล้ว
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotifMenuClose}>
          <Box>
            <Typography variant="body2">อนุมัติเรียบร้อย #1233</Typography>
            <Typography variant="caption" color="text.secondary">
              1 ชั่วโมงที่แล้ว
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotifMenuClose}>
          <Box>
            <Typography variant="body2">ผู้ใช้ใหม่ลงทะเบียน</Typography>
            <Typography variant="caption" color="text.secondary">
              2 ชั่วโมงที่แล้ว
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
}
