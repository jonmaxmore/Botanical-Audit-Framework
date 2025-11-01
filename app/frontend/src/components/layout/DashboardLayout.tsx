'use client';

import { useState, ReactNode } from 'react';
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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Description,
  Assessment,
  Settings,
  Logout,
  Person,
  Notifications,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const drawerWidth = 280;

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'farmer' | 'dtam';
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // TODO: Implement logout logic (Week 3-4)
    localStorage.removeItem('token');
    router.push('/');
  };

  // Menu items for Farmer
  const farmerMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/farmer/dashboard' },
    { text: 'Documents', icon: <Description />, path: '/farmer/documents' },
    { text: 'Reports', icon: <Assessment />, path: '/farmer/reports' },
    { text: 'Settings', icon: <Settings />, path: '/farmer/settings' },
  ];

  // Menu items for DTAM
  const dtamMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dtam/dashboard' },
    { text: 'Applications', icon: <Description />, path: '/dtam/documents' },
    { text: 'System Reports', icon: <Assessment />, path: '/dtam/reports' },
    { text: 'User Management', icon: <Person />, path: '/dtam/users' },
    { text: 'Settings', icon: <Settings />, path: '/dtam/settings' },
  ];

  const menuItems = userRole === 'farmer' ? farmerMenuItems : dtamMenuItems;
  const primaryColor = userRole === 'farmer' ? '#4caf50' : '#ff9800';
  const userName = userRole === 'farmer' ? 'Farmer User' : 'DTAM Staff';

  const drawer = (
    <Box>
      {/* Logo Section */}
      <Box className="p-6 bg-gradient-to-r from-green-500 to-green-600">
        <Typography variant="h5" className="text-white font-bold flex items-center gap-2">
          🌱 GACP Platform
        </Typography>
        <Typography variant="caption" className="text-green-100">
          {userRole === 'farmer' ? 'Farmer Portal' : 'DTAM Government Portal'}
        </Typography>
      </Box>

      <Divider />

      {/* User Profile Section */}
      <Box className="p-4 bg-gray-50">
        <Box className="flex items-center gap-3">
          <Avatar sx={{ bgcolor: primaryColor, width: 48, height: 48 }}>
            {userRole === 'farmer' ? '🌾' : '🏢'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" className="font-semibold">
              {userName}
            </Typography>
            <Typography variant="caption" className="text-gray-600">
              {userRole === 'farmer' ? 'Certified Farmer' : 'Government Official'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List className="px-2 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding className="mb-2">
              <ListItemButton
                component={Link}
                href={item.path}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: `${primaryColor}15`,
                    borderLeft: `4px solid ${primaryColor}`,
                    '&:hover': {
                      backgroundColor: `${primaryColor}25`,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? primaryColor : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? primaryColor : 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find((item) => item.path === pathname)?.text || 'Dashboard'}
          </Typography>

          {/* Notifications */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Notifications />
          </IconButton>

          {/* Profile Menu */}
          <IconButton onClick={handleProfileMenuOpen} color="inherit">
            <Avatar sx={{ bgcolor: primaryColor, width: 32, height: 32 }}>
              {userRole === 'farmer' ? '🌾' : '🏢'}
            </Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose}>
            <MenuItem onClick={handleProfileMenuClose}>
              <Person sx={{ mr: 2 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>
              <Settings sx={{ mr: 2 }} /> Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <Logout sx={{ mr: 2 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer - Sidebar */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}

        {/* Footer */}
        <Box component="footer" className="mt-8 py-4 text-center text-gray-600">
          <Divider className="mb-4" />
          <Typography variant="body2">
            © 2025 GACP Platform - Department of Thai Traditional and Alternative Medicine
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            Version 3.0.0 | Next.js 14 + Material-UI v6
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
