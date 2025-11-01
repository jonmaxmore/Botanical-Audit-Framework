import { Metadata } from 'next';
import { Typography, Paper, Box, Button } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Assessment, Download, DateRange } from '@mui/icons-material';

export const metadata: Metadata = {
  title: 'System Reports - GACP DTAM',
};

export default function DTAMReportsPage() {
  return (
    <DashboardLayout userRole="dtam">
      <Box>
        {/* Page Header */}
        <Box className="mb-6 flex justify-between items-start">
          <Box>
            <Typography variant="h4" component="h1" className="font-bold text-gray-800">
              System Reports 📈
            </Typography>
            <Typography variant="body1" className="text-gray-600 mt-1">
              Generate and download system-wide reports.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<DateRange />}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Generate Report
          </Button>
        </Box>

        {/* Report Types */}
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Box className="flex items-start">
              <Box className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <Assessment className="text-blue-600" sx={{ fontSize: 28 }} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h6" className="font-semibold mb-1">
                  Applications Report
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Summary of all applications by status
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Box className="flex items-start">
              <Box className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <Assessment className="text-green-600" sx={{ fontSize: 28 }} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h6" className="font-semibold mb-1">
                  Approval Statistics
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Approval rates and trends over time
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Box className="flex items-start">
              <Box className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                <Assessment className="text-purple-600" sx={{ fontSize: 28 }} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h6" className="font-semibold mb-1">
                  User Activity
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  User registration and activity logs
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Empty State */}
        <Paper className="p-12 text-center">
          <Box className="flex flex-col items-center">
            <Box className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Download className="text-purple-600" sx={{ fontSize: 48 }} />
            </Box>

            <Typography variant="h5" className="font-semibold mb-2">
              No Reports Generated Yet
            </Typography>

            <Typography variant="body1" className="text-gray-600 mb-6 max-w-md">
              Generate system reports to analyze application trends, approval rates, and user
              activity.
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<DateRange />}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Generate Your First Report
            </Button>
          </Box>
        </Paper>

        {/* Coming Soon Notice */}
        <Box className="mt-6 p-4 bg-purple-50 rounded-lg">
          <Typography variant="body2" className="text-purple-800">
            🚧 <strong>Week 2 Feature</strong> - System reports generation will be available soon.
          </Typography>
          <Typography variant="body2" className="text-purple-800 mt-2">
            📊 Features: Generate reports, select date range, choose format (PDF/Excel/CSV),
            download and export.
          </Typography>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
