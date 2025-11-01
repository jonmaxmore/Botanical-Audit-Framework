import { Metadata } from 'next';
import { Typography, Paper, Box, Button } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Description, CloudUpload } from '@mui/icons-material';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Documents - GACP Platform',
};

export default function FarmerDocumentsPage() {
  return (
    <DashboardLayout userRole="farmer">
      <Box>
        {/* Page Header */}
        <Box className="mb-6">
          <Typography variant="h4" component="h1" className="font-bold text-gray-800">
            My Documents 📄
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Upload and manage your GACP certification documents.
          </Typography>
        </Box>

        {/* Empty State */}
        <Paper className="p-12 text-center">
          <Box className="flex flex-col items-center">
            <Box className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Description className="text-blue-600" sx={{ fontSize: 48 }} />
            </Box>

            <Typography variant="h5" className="font-semibold mb-2">
              No Documents Yet
            </Typography>

            <Typography variant="body1" className="text-gray-600 mb-6 max-w-md">
              Start by uploading your first document. All your GACP certification documents will
              appear here.
            </Typography>

            <Link href="/farmer/documents/upload">
              <Button
                variant="contained"
                size="large"
                startIcon={<CloudUpload />}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Upload Document
              </Button>
            </Link>
          </Box>
        </Paper>

        {/* Coming Soon Notice */}
        <Box className="mt-6 p-4 bg-blue-50 rounded-lg">
          <Typography variant="body2" className="text-blue-800">
            🚧 <strong>Week 2 Feature</strong> - Document upload and management interface is now
            available!
          </Typography>
          <Typography variant="body2" className="text-blue-800 mt-2">
            📋 Try it now:{' '}
            <Link href="/farmer/documents/list" className="underline font-semibold">
              View Document List
            </Link>{' '}
            |{' '}
            <Link href="/farmer/documents/upload" className="underline font-semibold">
              Upload Document
            </Link>
          </Typography>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
