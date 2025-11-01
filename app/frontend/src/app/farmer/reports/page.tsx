import { Metadata } from 'next';
import { Typography, Paper, Box, Button } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Assessment, AddCircle } from '@mui/icons-material';

export const metadata: Metadata = {
  title: 'My Reports - GACP Platform',
};

export default function FarmerReportsPage() {
  return (
    <DashboardLayout userRole="farmer">
      <Box>
        {/* Page Header */}
        <Box className="mb-6">
          <Typography variant="h4" component="h1" className="font-bold text-gray-800">
            My Reports 📊
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Generate and view your GACP certification reports.
          </Typography>
        </Box>

        {/* Empty State */}
        <Paper className="p-12 text-center">
          <Box className="flex flex-col items-center">
            <Box className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Assessment className="text-purple-600" sx={{ fontSize: 48 }} />
            </Box>

            <Typography variant="h5" className="font-semibold mb-2">
              No Reports Generated
            </Typography>

            <Typography variant="body1" className="text-gray-600 mb-6 max-w-md">
              Generate your first certification report. Reports can be downloaded in PDF, Excel, or
              CSV format.
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<AddCircle />}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Generate Report
            </Button>
          </Box>
        </Paper>

        {/* Coming Soon Notice */}
        <Box className="mt-6 p-4 bg-purple-50 rounded-lg">
          <Typography variant="body2" className="text-purple-800">
            🚧 <strong>Week 2 Feature</strong> - Report generation interface will be available soon.
          </Typography>
          <Typography variant="body2" className="text-purple-800 mt-2">
            📈 Features: Generate reports, select date range, choose format (PDF/Excel/CSV), and
            download.
          </Typography>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
