'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ApplicationsTable from '@/components/applications/ApplicationsTable';
import ReviewDialog, { type ReviewData } from '@/components/applications/ReviewDialog';
import DocumentViewer from '@/components/applications/DocumentViewer';
import type { Application } from '@/lib/api/applications';
import { useApplications } from '@/hooks/useApplications';
import { useApplicationActions } from '@/hooks/useApplicationActions';

export default function ApplicationsPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Custom Hooks
  const { applications, loading, error, refreshApplications } = useApplications();
  const {
    snackbar,
    handleCloseSnackbar,
    assignReviewer,
    startReview,
    submitReview,
    approveApplication,
    rejectApplication,
    verifyDocument,
  } = useApplicationActions(refreshApplications);

  // Dialog states
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = React.useState(false);
  const [documentViewerOpen, setDocumentViewerOpen] = React.useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);

  // Local UI state
  const [reviewersList] = React.useState([
    { id: '1', name: 'ดร.สมชาย ใจดี' },
    { id: '2', name: 'ดร.สมหญิง มั่นคง' },
    { id: '3', name: 'ดร.วิชัย ชาญฉลาด' },
  ]);
  const [selectedReviewer, setSelectedReviewer] = React.useState('');

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setDocumentViewerOpen(true);
  };

  const handleAssignReviewer = (application: Application) => {
    setSelectedApplication(application);
    setAssignDialogOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedApplication || !selectedReviewer) return;
    const success = await assignReviewer(selectedApplication, selectedReviewer);
    if (success) {
      setAssignDialogOpen(false);
      setSelectedReviewer('');
    }
  };

  const handleStartReview = async (application: Application) => {
    await startReview(application);
  };

  const handleCompleteReview = (application: Application) => {
    setSelectedApplication(application);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async (reviewData: ReviewData) => {
    if (!selectedApplication) return;
    const success = await submitReview(selectedApplication, reviewData);
    if (success) {
      setReviewDialogOpen(false);
    }
  };

  const handleApprove = async (application: Application) => {
    await approveApplication(application);
  };

  const handleReject = async (application: Application) => {
    await rejectApplication(application);
  };

  const handleVerifyDocument = async (documentId: string, verified: boolean) => {
    if (!selectedApplication) return;
    await verifyDocument(selectedApplication, documentId, verified);
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
          }}
        >
          <AdminHeader onMenuClick={handleSidebarToggle} title="คำขอรับรอง" />

          {/* Content Area */}
          <Box sx={{ mt: 10, p: 3 }}>
            <Container maxWidth="xl">
              {/* Page Header */}
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      คิวตรวจสอบคำขอ
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      จัดการและตรวจสอบคำขอรับรองมาตรฐาน GACP (กัญชาและสมุนไพร 6 ชนิด)
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={refreshApplications}
                    disabled={loading}
                  >
                    รีเฟรช
                  </Button>
                </Stack>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Loading State */}
              {loading ? (
                <LoadingSpinner message="กำลังโหลดคำขอรับรอง..." />
              ) : (
                /* Applications Table */
                <ApplicationsTable
                  applications={applications}
                  onViewApplication={handleViewApplication}
                  onAssignReviewer={handleAssignReviewer}
                  onStartReview={handleStartReview}
                  onCompleteReview={handleCompleteReview}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              )}
            </Container>
          </Box>

          {/* Dialogs */}
          <ReviewDialog
            open={reviewDialogOpen}
            application={selectedApplication}
            onClose={() => setReviewDialogOpen(false)}
            onSubmit={handleSubmitReview}
          />

          <DocumentViewer
            open={documentViewerOpen}
            application={selectedApplication}
            onClose={() => setDocumentViewerOpen(false)}
            onVerifyDocument={handleVerifyDocument}
          />

          <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>มอบหมายผู้ตรวจสอบ</DialogTitle>
            <DialogContent>
              <TextField
                select
                fullWidth
                label="เลือกผู้ตรวจสอบ"
                value={selectedReviewer}
                onChange={(e) => setSelectedReviewer(e.target.value)}
                sx={{ mt: 2 }}
              >
                {reviewersList.map((reviewer) => (
                  <MenuItem key={reviewer.id} value={reviewer.id}>
                    {reviewer.name}
                  </MenuItem>
                ))}
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAssignDialogOpen(false)}>ยกเลิก</Button>
              <Button
                variant="contained"
                onClick={handleConfirmAssign}
                disabled={!selectedReviewer}
              >
                ยืนยัน
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
