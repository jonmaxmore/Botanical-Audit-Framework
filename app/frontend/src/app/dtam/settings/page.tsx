import { Metadata } from 'next';
import { Typography, Paper, Box } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Settings,
  AdminPanelSettings,
  Notifications,
  Security,
  Language,
} from '@mui/icons-material';

export const metadata: Metadata = {
  title: 'DTAM Settings - GACP DTAM',
};

export default function DTAMSettingsPage() {
  return (
    <DashboardLayout userRole="dtam">
      <Box>
        {/* Page Header */}
        <Box className="mb-6">
          <Typography variant="h4" component="h1" className="font-bold text-gray-800">
            DTAM Settings ⚙️
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Configure system settings and administrative preferences.
          </Typography>
        </Box>

        {/* Settings Categories */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Box className="flex items-start">
              <Box className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                <AdminPanelSettings className="text-orange-600" sx={{ fontSize: 28 }} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h6" className="font-semibold mb-1">
                  System Configuration
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Configure system-wide settings and parameters
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Box className="flex items-start">
              <Box className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <Notifications className="text-blue-600" sx={{ fontSize: 28 }} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h6" className="font-semibold mb-1">
                  Notification Settings
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Configure email and system notification rules
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Box className="flex items-start">
              <Box className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <Security className="text-green-600" sx={{ fontSize: 28 }} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h6" className="font-semibold mb-1">
                  Security Settings
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Manage authentication and security policies
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Box className="flex items-start">
              <Box className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                <Settings className="text-purple-600" sx={{ fontSize: 28 }} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h6" className="font-semibold mb-1">
                  Staff Preferences
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Personal settings for DTAM staff account
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Box className="flex items-start">
              <Box className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mr-4">
                <Language className="text-pink-600" sx={{ fontSize: 28 }} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h6" className="font-semibold mb-1">
                  Language & Localization
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Configure language and regional settings
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Box className="flex items-start">
              <Box className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                <Settings className="text-indigo-600" sx={{ fontSize: 28 }} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h6" className="font-semibold mb-1">
                  Advanced Settings
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Advanced system configuration options
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Coming Soon Notice */}
        <Box className="mt-6 p-4 bg-orange-50 rounded-lg">
          <Typography variant="body2" className="text-orange-800">
            🚧 <strong>Week 3-4 Feature</strong> - DTAM settings interface will be available soon.
          </Typography>
          <Typography variant="body2" className="text-orange-800 mt-2">
            ⚙️ Features: System configuration, notification rules, security policies, staff
            preferences, and more.
          </Typography>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
