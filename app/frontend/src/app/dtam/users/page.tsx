import { Metadata } from 'next';
import { Typography, Paper, Box, Button } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { People, PersonAdd, Search } from '@mui/icons-material';

export const metadata: Metadata = {
  title: 'User Management - GACP DTAM',
};

export default function DTAMUsersPage() {
  return (
    <DashboardLayout userRole="dtam">
      <Box>
        {/* Page Header */}
        <Box className="mb-6 flex justify-between items-start">
          <Box>
            <Typography variant="h4" component="h1" className="font-bold text-gray-800">
              User Management 👥
            </Typography>
            <Typography variant="body1" className="text-gray-600 mt-1">
              Manage farmer accounts and DTAM staff users.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Add User
          </Button>
        </Box>

        {/* User Statistics */}
        <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Paper className="p-4 text-center">
            <Typography variant="h4" className="font-bold text-blue-600">
              89
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Total Users
            </Typography>
          </Paper>
          <Paper className="p-4 text-center">
            <Typography variant="h4" className="font-bold text-green-600">
              51
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Farmers
            </Typography>
          </Paper>
          <Paper className="p-4 text-center">
            <Typography variant="h4" className="font-bold text-orange-600">
              38
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              DTAM Staff
            </Typography>
          </Paper>
          <Paper className="p-4 text-center">
            <Typography variant="h4" className="font-bold text-purple-600">
              12
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Active Today
            </Typography>
          </Paper>
        </Box>

        {/* Empty State */}
        <Paper className="p-12 text-center">
          <Box className="flex flex-col items-center">
            <Box className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <People className="text-blue-600" sx={{ fontSize: 48 }} />
            </Box>

            <Typography variant="h5" className="font-semibold mb-2">
              User Management Interface
            </Typography>

            <Typography variant="body1" className="text-gray-600 mb-6 max-w-md">
              Manage all user accounts in the system. View farmer profiles, create DTAM staff
              accounts, and manage permissions.
            </Typography>

            <Box className="flex gap-3">
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add New User
              </Button>
              <Button
                variant="outlined"
                startIcon={<Search />}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Search Users
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Coming Soon Notice */}
        <Box className="mt-6 p-4 bg-blue-50 rounded-lg">
          <Typography variant="body2" className="text-blue-800">
            🚧 <strong>Week 3 Feature</strong> - User management interface will be available soon.
          </Typography>
          <Typography variant="body2" className="text-blue-800 mt-2">
            👥 Features: View user list, add/edit/delete users, manage roles and permissions, view
            activity logs.
          </Typography>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
