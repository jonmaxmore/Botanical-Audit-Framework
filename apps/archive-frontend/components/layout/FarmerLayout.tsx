import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery
} from '@mui/material';
import {
  Agriculture,
  AssignmentOutlined,
  DashboardOutlined,
  DescriptionOutlined,
  Logout,
  Menu as MenuIcon,
  PersonOutline,
  Verified,
  FolderShared
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/user.types';
import FullScreenLoader from '../common/FullScreenLoader';

interface FarmerLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 260;

const FarmerLayout: React.FC<FarmerLayoutProps> = ({ children }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      setRedirecting(true);
      router.replace('/login?role=farmer');
      return;
    }

    if (user.role !== UserRole.FARMER) {
      setRedirecting(true);
      router.replace('/');
    }
  }, [loading, router, user]);

  const navigationItems = useMemo(
    () => [
      { label: 'แดชบอร์ด', href: '/farmer/dashboard', icon: <DashboardOutlined /> },
      { label: 'คำขอรับรอง', href: '/farmer/applications', icon: <AssignmentOutlined /> },
      { label: 'ฟาร์มของฉัน', href: '/farmer/farms', icon: <Agriculture /> },
      { label: 'เอกสาร', href: '/farmer/documents', icon: <DescriptionOutlined /> },
      { label: 'ใบรับรอง', href: '/farmer/certificates', icon: <Verified /> },
      { label: 'ข้อมูลโปรไฟล์', href: '/farmer/profile', icon: <FolderShared /> }
    ],
    []
  );

  const toggleDrawer = () => {
    setMobileOpen(prev => !prev);
  };

  const handleNavigate = (href: string) => {
    router.push(href);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const closeProfileMenu = () => setProfileAnchor(null);

  const handleLogout = () => {
    closeProfileMenu();
    logout();
  };

  const isActive = (href: string) => {
    if (router.pathname === href) {
      return true;
    }
    return router.pathname.startsWith(`${href}/`);
  };

  if (loading || redirecting) {
    return <FullScreenLoader />;
  }

  if (!user || user.role !== UserRole.FARMER) {
    return null;
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'common.white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'common.white', color: 'primary.main' }}>
            {user.fullName?.charAt(0) || 'F'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {user.fullName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              เกษตรกร GACP
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List>
          {navigationItems.map(item => (
            <ListItemButton
              key={item.href}
              onClick={() => handleNavigate(item.href)}
              selected={isActive(item.href)}
              sx={{
                borderRadius: 1,
                mx: 1,
                mt: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider sx={{ mx: 3 }} />
      <Box sx={{ p: 3, pt: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="ออกจากระบบ" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          borderBottom: theme => `1px solid ${theme.palette.divider}`,
          boxShadow: 'none'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton edge="start" onClick={toggleDrawer}>
                <MenuIcon />
              </IconButton>
            )}
            <Agriculture color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              ระบบเกษตรกร GACP
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                เกษตรกร
              </Typography>
            </Box>
            <IconButton onClick={handleProfileMenu}>
              <Avatar>
                <PersonOutline />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={toggleDrawer}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { width: drawerWidth }
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                top: 64,
                height: 'calc(100% - 64px)'
              }
            }}
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          pt: 10,
          pb: 6,
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        {children}
      </Box>

      <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={closeProfileMenu}>
        <MenuItem disabled>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {user.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/farmer/profile')}>
          <PersonOutline fontSize="small" style={{ marginRight: 8 }} />
          โปรไฟล์ของฉัน
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Logout fontSize="small" style={{ marginRight: 8 }} />
          ออกจากระบบ
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FarmerLayout;
