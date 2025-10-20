import { Metadata } from 'next';
import { Typography, Paper, Box, Button, Chip } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Description, FilterList } from '@mui/icons-material';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Applications Management - GACP DTAM',
};

export default function DTAMApplicationsPage() {
  return (
    <DashboardLayout userRole="dtam">
      <Box>
        {/* Page Header */}
        <Box className="mb-6 flex justify-between items-start">
          <Box>
            <Typography variant="h4" component="h1" className="font-bold text-gray-800">
              Applications Management 📋
            </Typography>
            <Typography variant="body1" className="text-gray-600 mt-1">
              Review and approve farmer certification applications.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            className="border-orange-600 text-orange-600 hover:bg-orange-50"
          >
            Filter
          </Button>
        </Box>

        {/* Status Summary */}
        <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Paper className="p-4 text-center">
            <Typography variant="h4" className="font-bold text-blue-600">
              156
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Total
            </Typography>
          </Paper>
          <Paper className="p-4 text-center">
            <Typography variant="h4" className="font-bold text-orange-600">
              42
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Pending
            </Typography>
          </Paper>
          <Paper className="p-4 text-center">
            <Typography variant="h4" className="font-bold text-green-600">
              98
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Approved
            </Typography>
          </Paper>
          <Paper className="p-4 text-center">
            <Typography variant="h4" className="font-bold text-red-600">
              16
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Rejected
            </Typography>
          </Paper>
        </Box>

        {/* Empty State */}
        <Paper className="p-12 text-center">
          <Box className="flex flex-col items-center">
            <Box className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <Description className="text-orange-600" sx={{ fontSize: 48 }} />
            </Box>

            <Typography variant="h5" className="font-semibold mb-2">
              No Applications to Review
            </Typography>

            <Typography variant="body1" className="text-gray-600 mb-4 max-w-md">
              All applications have been processed. New submissions will appear here for review.
            </Typography>

            <Box className="flex gap-2 mt-2">
              <Chip label="Pending: 42" color="warning" />
              <Chip label="Today: 18 approved" color="success" />
            </Box>

            <Box className="flex gap-3 mt-4">
              <Link href="/dtam/applications/review">
                <Button variant="contained" className="bg-orange-600 hover:bg-orange-700">
                  View All Applications
                </Button>
              </Link>
            </Box>
          </Box>
        </Paper>

        {/* Coming Soon Notice */}
        <Box className="mt-6 p-4 bg-orange-50 rounded-lg">
          <Typography variant="body2" className="text-orange-800">
            🚧 <strong>Week 2 Feature</strong> - Applications list and review interface will be
            available soon.
          </Typography>
          <Typography variant="body2" className="text-orange-800 mt-2">
            ✅ Features: View applications list, filter by status, review details, approve/reject,
            add comments.
          </Typography>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
