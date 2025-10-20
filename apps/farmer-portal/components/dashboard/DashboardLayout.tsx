/**
 * Unified Dashboard Layout
 * Shared layout for all role-specific dashboards
 * Includes sidebar navigation, header, and main content area
 */

'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Badge,
} from '@mui/material';
import { Menu as MenuIcon, Notifications, Settings, Logout, Person } from '@mui/icons-material';
import { UserRole, getRoleDisplayName, getRoleColor } from '@/lib/roles';

const DRAWER_WIDTH = 280;

export interface DashboardMenuItem {
  title: string;
  path: string;
  icon: ReactNode;
  badge?: number;
  divider?: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
  menuItems: DashboardMenuItem[];
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export default function DashboardLayout({
  children,
  role,
  menuItems,
  userName = 'ผู้ใช้งาน',
  userEmail,
  userAvatar,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // TODO: Implement logout
    handleMenuClose();
    window.location.href = '/login';
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo & Title */}
      <Box className="p-6 bg-gradient-to-r from-primary-500 to-primary-600">
        <Typography variant="h5" className="font-bold text-white mb-1">
          GACP Platform
        </Typography>
        <Chip
          label={getRoleDisplayName(role)}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontWeight: 600,
          }}
        />
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List className="flex-1 overflow-y-auto py-2">
        {menuItems.map(item => (
          <Box key={item.path}>
            {item.divider && <Divider className="my-2" />}
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                selected={pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: getRoleColor(role) + '20',
                    color: getRoleColor(role),
                    '& .MuiListItemIcon-root': {
                      color: getRoleColor(role),
                    },
                  },
                }}
              >
                <ListItemIcon>
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          </Box>
        ))}
      </List>

      <Divider />

      {/* User Profile Section */}
      <Box className="p-4">
        <Box
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleMenuOpen}
        >
          <Avatar
            src={userAvatar}
            alt={userName}
            sx={{ width: 40, height: 40, bgcolor: getRoleColor(role) }}
          >
            {userName.charAt(0)}
          </Avatar>
          <Box className="flex-1 min-w-0">
            <Typography variant="body2" className="font-semibold truncate">
              {userName}
            </Typography>
            {userEmail && (
              <Typography variant="caption" className="text-gray-500 truncate block">
                {userEmail}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box className="flex h-screen overflow-hidden bg-gray-50">
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" className="flex-1 font-semibold">
            {menuItems.find(item => item.path === pathname)?.title || 'Dashboard'}
          </Typography>

          <IconButton>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton component={Link} href="/settings">
            <Settings />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer - Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      {/* Drawer - Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* User Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem component={Link} href="/profile">
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>โปรไฟล์</ListItemText>
        </MenuItem>
        <MenuItem component={Link} href="/settings">
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>ตั้งค่า</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>ออกจากระบบ</ListItemText>
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        className="flex-1 overflow-auto"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: 0 },
          mt: { xs: 7, sm: 8 },
        }}
      >
        <Box className="p-6">{children}</Box>
      </Box>
    </Box>
  );
}
