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
import { Refresh as RefreshIcon, Assignment as AssignIcon } from '@mui/icons-material';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function ApplicationsPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  // Dialog states
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = React.useState(false);
  const [documentViewerOpen, setDocumentViewerOpen] = React.useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [reviewersList] = React.useState([
    { id: '1', name: 'ดร.สมชาย ใจดี' },
    { id: '2', name: 'ดร.สมหญิง มั่นคง' },
    { id: '3', name: 'ดร.วิชัย ชาญฉลาด' },
  ]);
  const [selectedReviewer, setSelectedReviewer] = React.useState('');

  // Snackbar state
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  React.useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationsApi.getApplications();
      setApplications(response.data);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('ไม่สามารถโหลดข้อมูลคำขอได้ กำลังใช้ข้อมูลจำลอง');
      // Fallback to mock data
      const mockData = await applicationsApi.getMockApplicationsData();
      setApplications(mockData);
    } finally {
      setLoading(false);
    }
  };

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

    try {
      await applicationsApi.assignReviewer(selectedApplication.id, selectedReviewer);
      setSnackbar({
        open: true,
        message: 'มอบหมายผู้ตรวจสอบสำเร็จ',
        severity: 'success',
      });
      setAssignDialogOpen(false);
      loadApplications();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการมอบหมาย',
        severity: 'error',
      });
    }
  };

  const handleStartReview = async (application: Application) => {
    try {
      await applicationsApi.startReview(application.id);
      setSnackbar({
        open: true,
        message: 'เริ่มการตรวจสอบสำเร็จ',
        severity: 'success',
      });
      loadApplications();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาด',
        severity: 'error',
      });
    }
  };

  const handleCompleteReview = (application: Application) => {
    setSelectedApplication(application);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async (reviewData: ReviewData) => {
    if (!selectedApplication) return;

    try {
      await applicationsApi.completeReview(selectedApplication.id, {
        decision: reviewData.decision,
        comments: reviewData.comment,
        documentsVerified: true,
        inspectionRequired: reviewData.decision === 'approve',
      });
      setSnackbar({
        open: true,
        message: 'บันทึกผลการตรวจสอบสำเร็จ',
        severity: 'success',
      });
      setReviewDialogOpen(false);
      loadApplications();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาด',
        severity: 'error',
      });
    }
  };

  const handleApprove = async (application: Application) => {
    try {
      await applicationsApi.approveApplication(application.id, {
        comments: 'อนุมัติคำขอ',
        certificateData: {
          certificateType: 'gacp',
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });
      setSnackbar({
        open: true,
        message: 'อนุมัติคำขอสำเร็จ',
        severity: 'success',
      });
      loadApplications();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาด',
        severity: 'error',
      });
    }
  };

  const handleReject = async (application: Application) => {
    try {
      await applicationsApi.rejectApplication(application.id, {
        reason: 'ไม่ผ่านการตรวจสอบ',
        comments: 'ไม่ผ่านการตรวจสอบ',
      });
      setSnackbar({
        open: true,
        message: 'ปฏิเสธคำขอสำเร็จ',
        severity: 'success',
      });
      loadApplications();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาด',
        severity: 'error',
      });
    }
  };

  const handleVerifyDocument = async (documentId: string, verified: boolean) => {
    if (!selectedApplication) return;

    try {
      await applicationsApi.verifyDocument(
        selectedApplication.id,
        documentId,
        verified,
        verified ? undefined : 'ยกเลิกการยืนยัน',
      );
      setSnackbar({
        open: true,
        message: verified ? 'ยืนยันเอกสารสำเร็จ' : 'ยกเลิกการยืนยันสำเร็จ',
        severity: 'success',
      });
      loadApplications();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาด',
        severity: 'error',
      });
    }
  };

  return (
    <ErrorBoundary>
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
                    onClick={loadApplications}
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
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ErrorBoundary>
  );
}
