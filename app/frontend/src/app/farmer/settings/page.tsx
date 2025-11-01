import { Metadata } from 'next';
import { Typography, Paper, Box } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Settings, Person, Notifications, Security } from '@mui/icons-material';

export const metadata: Metadata = {
  title: 'Settings - GACP Platform',
};

export default function FarmerSettingsPage() {
  return (
    <DashboardLayout userRole="farmer">
      <Box>
        {/* Page Header */}
        <Box className="mb-6">
          <Typography variant="h4" component="h1" className="font-bold text-gray-800">
            Settings ⚙️
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Manage your account settings and preferences.
          </Typography>
        </Box>

        {/* Settings Categories */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Box className="flex items-start">
              <Box className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <Person className="text-blue-600" sx={{ fontSize: 28 }} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h6" className="font-semibold mb-1">
                  Profile Settings
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Update your personal information and profile picture
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Box className="flex items-start">
              <Box className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                <Notifications className="text-orange-600" sx={{ fontSize: 28 }} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h6" className="font-semibold mb-1">
                  Notifications
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Configure email and system notification preferences
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
                  Security
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Change password and manage security settings
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
                  Preferences
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Language, timezone, and display preferences
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Coming Soon Notice */}
        <Box className="mt-6 p-4 bg-green-50 rounded-lg">
          <Typography variant="body2" className="text-green-800">
            🚧 <strong>Week 3-4 Feature</strong> - Settings interface will be available soon.
          </Typography>
          <Typography variant="body2" className="text-green-800 mt-2">
            ⚙️ Features: Profile editing, notification preferences, password change, and more.
          </Typography>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
