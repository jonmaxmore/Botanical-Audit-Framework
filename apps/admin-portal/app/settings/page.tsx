'use client';

import React from 'react';
import { Box, Container, Typography, Tabs, Tab } from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Backup as BackupIcon,
} from '@mui/icons-material';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';
import SystemSettingsForm, { SystemSettings } from '@/components/settings/SystemSettingsForm';
import SecuritySettings from '@/components/settings/SecuritySettings';
import NotificationSettings, {
  NotificationSettingsData,
} from '@/components/settings/NotificationSettings';
import EmailTemplates, { EmailTemplatesData } from '@/components/settings/EmailTemplates';
import BackupRestore from '@/components/settings/BackupRestore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSaveSettings = async (settings: SystemSettings) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Saving settings:', settings);
    setLoading(false);
  };

  const handleSaveNotifications = async (data: NotificationSettingsData) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Saving notification settings:', data);
    setLoading(false);
  };

  const handleSaveEmailTemplates = async (data: EmailTemplatesData) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Saving email templates:', data);
    setLoading(false);
  };

  const handleBackup = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Creating backup...');
    setLoading(false);
  };

  const handleRestore = async (backupId: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Restoring backup:', backupId);
    setLoading(false);
  };

  const handleDeleteBackup = async (backupId: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Deleting backup:', backupId);
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Sidebar - Desktop */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <AdminSidebar open={true} onClose={() => {}} variant="permanent" />
        </Box>

        {/* Sidebar - Mobile */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <AdminSidebar open={sidebarOpen} onClose={handleSidebarToggle} variant="temporary" />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { xs: '100%', md: 'calc(100% - 280px)' },
            minHeight: '100vh',
            bgcolor: '#f5f5f5',
          }}
        >
          <AdminHeader onMenuClick={handleSidebarToggle} title="ตั้งค่า" />

          {/* Content Area */}
          <Box sx={{ mt: 10, p: 3 }}>
            <Container maxWidth="xl">
              {/* Header */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  การตั้งค่าระบบ
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  จัดการการตั้งค่าและการกำหนดค่าระบบ
                </Typography>
              </Box>

              {/* Settings Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange} aria-label="settings tabs">
                  <Tab icon={<SettingsIcon />} label="ตั้งค่าระบบ" iconPosition="start" />
                  <Tab icon={<SecurityIcon />} label="ความปลอดภัย" iconPosition="start" />
                  <Tab icon={<NotificationsIcon />} label="การแจ้งเตือน" iconPosition="start" />
                  <Tab icon={<EmailIcon />} label="เทมเพลตอีเมล" iconPosition="start" />
                  <Tab icon={<BackupIcon />} label="สำรองข้อมูล" iconPosition="start" />
                </Tabs>
              </Box>

              {/* System Settings Tab */}
              <TabPanel value={currentTab} index={0}>
                <SystemSettingsForm onSave={handleSaveSettings} loading={loading} />
              </TabPanel>

              {/* Security Tab */}
              <TabPanel value={currentTab} index={1}>
                <SecuritySettings />
              </TabPanel>

              {/* Notification Settings Tab */}
              <TabPanel value={currentTab} index={2}>
                <NotificationSettings onSave={handleSaveNotifications} loading={loading} />
              </TabPanel>

              {/* Email Templates Tab */}
              <TabPanel value={currentTab} index={3}>
                <EmailTemplates onSave={handleSaveEmailTemplates} loading={loading} />
              </TabPanel>

              {/* Backup & Restore Tab */}
              <TabPanel value={currentTab} index={4}>
                <BackupRestore
                  onBackup={handleBackup}
                  onRestore={handleRestore}
                  onDelete={handleDeleteBackup}
                  loading={loading}
                />
              </TabPanel>
            </Container>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
