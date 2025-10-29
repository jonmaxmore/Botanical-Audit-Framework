'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Divider,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusTimeline, { StatusHistory } from '@/components/applications/StatusTimeline';
import ReviewDialog, { ReviewData } from '@/components/applications/ReviewDialog';
import CommentsList, { Comment } from '@/components/applications/CommentsList';
import ActivityLog, { Activity } from '@/components/applications/ActivityLog';
import { getApplicationById, completeReview, approveApplication, rejectApplication, addComment } from '@/lib/api/applications';
import { Alert, Snackbar } from '@mui/material';

interface Application {
  id: string;
  farmName: string;
  farmer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  farm: {
    size: string;
    location: string;
    cropType: string;
    certification: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'reviewing';
  submittedDate: string;
  reviewedDate?: string;
  reviewer?: string;
  documents: {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
  }[];
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [application, setApplication] = React.useState<Application | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = React.useState(false);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  React.useEffect(() => {
    loadApplicationData();
  }, [params?.id]);

  const loadApplicationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getApplicationById(params?.id as string);
      const appData = response.data;
      
      setApplication({
        id: appData.id,
        farmName: appData.farmName,
        farmer: {
          name: appData.farmerName || appData.farmerFirstName + ' ' + appData.farmerLastName,
          email: appData.farmerEmail,
          phone: appData.farmerPhoneNumber,
          address: `${appData.farmAddress?.subDistrict || ''} ${appData.farmAddress?.district || ''} ${appData.farmAddress?.province || ''}`,
        },
        farm: {
          size: `${appData.farmSize} ${appData.farmSizeUnit}`,
          location: `${appData.farmLocation?.province || ''} ${appData.farmLocation?.district || ''}`,
          cropType: appData.cropType,
          certification: 'GACP (Good Agricultural and Collection Practices)',
        },
        status: appData.status,
        submittedDate: appData.submittedAt,
        documents: appData.documents || [],
      });

      setComments(appData.comments || []);
      setActivities(appData.timeline || []);
      
    } catch (err: any) {
      console.error('Failed to load application:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลคำขอได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleBack = () => {
    router.push('/applications');
  };

  const handleOpenReviewDialog = () => {
    setReviewDialogOpen(true);
  };

  const handleReviewSubmit = async (data: ReviewData) => {
    try {
      if (!params?.id) throw new Error('Application ID is missing');

      await completeReview(params.id as string, {
        decision: data.decision === 'approve' ? 'approve' : data.decision === 'reject' ? 'reject' : 'request_changes',
        comments: data.comment,
        documentsVerified: true,
        inspectionRequired: data.decision === 'approve',
      });

      setSnackbar({ open: true, message: 'บันทึกผลการตรวจสอบสำเร็จ', severity: 'success' });
      setReviewDialogOpen(false);
      loadApplicationData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'เกิดข้อผิดพลาด', severity: 'error' });
    }
  };

  const handleAddComment = async (content: string) => {
    try {
      if (!params?.id) throw new Error('Application ID is missing');
      
      await addComment(params.id as string, {
        message: content,
        type: 'general',
      });
      
      loadApplicationData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'เกิดข้อผิดพลาด', severity: 'error' });
    }
  };

  const handleEditComment = (id: string, content: string) => {
    setComments(comments.map(c => (c.id === id ? { ...c, content, edited: true } : c)));
  };

  const handleDeleteComment = (id: string) => {
    setComments(comments.filter(c => c.id !== id));
  };

  const handleReplyComment = (parentId: string, content: string) => {
    const reply: Comment = {
      id: Date.now().toString(),
      user: { name: 'Admin User', role: 'Administrator' },
      content,
      timestamp: new Date().toISOString(),
    };

    setComments(
      comments.map(c => (c.id === parentId ? { ...c, replies: [...(c.replies || []), reply] } : c))
    );
  };

  const handleApprove = async () => {
    try {
      if (!params?.id) throw new Error('Application ID is missing');
      
      await approveApplication(params.id as string, {
        comments: 'อนุมัติคำขอ',
        certificateData: {
          certificateType: 'gacp',
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });
      
      setSnackbar({ open: true, message: 'อนุมัติคำขอสำเร็จ', severity: 'success' });
      loadApplicationData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'เกิดข้อผิดพลาด', severity: 'error' });
    }
  };

  const handleReject = async () => {
    try {
      if (!params?.id) throw new Error('Application ID is missing');
      
      await rejectApplication(params.id as string, {
        reason: 'ไม่ผ่านการตรวจสอบ',
        comments: 'ไม่ผ่านการตรวจสอบ',
      });
      
      setSnackbar({ open: true, message: 'ปฏิเสธคำขอสำเร็จ', severity: 'success' });
      loadApplicationData();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'เกิดข้อผิดพลาด', severity: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'reviewing':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอพิจารณา';
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'rejected':
        return 'ไม่อนุมัติ';
      case 'reviewing':
        return 'กำลังตรวจสอบ';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <PendingIcon />;
      case 'approved':
        return <ApproveIcon />;
      case 'rejected':
        return <RejectIcon />;
      case 'reviewing':
        return <EditIcon />;
      default:
        return <PendingIcon />;
    }
  };

  if (loading || !application) {
    return (
      <ProtectedRoute>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <AdminSidebar open={true} onClose={() => {}} variant="permanent" />
          </Box>
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <AdminSidebar open={sidebarOpen} onClose={handleSidebarToggle} variant="temporary" />
          </Box>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: { xs: '100%', md: 'calc(100% - 280px)' },
            }}
          >
            <AdminHeader onMenuClick={handleSidebarToggle} title="รายละเอียดคำขอ" />
            <Box sx={{ mt: 10, p: 3 }}>
              <LoadingSpinner message="กำลังโหลดข้อมูลคำขอ..." fullScreen={false} />
            </Box>
          </Box>
        </Box>
      </ProtectedRoute>
    );
  }

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
          <AdminHeader onMenuClick={handleSidebarToggle} title="รายละเอียดคำขอ" />

          {/* Content Area */}
          <Box sx={{ mt: 10, p: 3 }}>
            <Container maxWidth="xl">
              {/* Back Button & Header */}
              <Box sx={{ mb: 3 }}>
                <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
                  กลับไปหน้ารายการ
                </Button>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {application.farmName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Chip
                        icon={getStatusIcon(application.status)}
                        label={getStatusText(application.status)}
                        color={getStatusColor(application.status)}
                        size="medium"
                      />
                      <Typography variant="body2" color="text.secondary">
                        ยื่นคำขอเมื่อ:{' '}
                        {new Date(application.submittedDate).toLocaleDateString('th-TH')}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      onClick={handleReject}
                    >
                      ไม่อนุมัติ
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ApproveIcon />}
                      onClick={handleApprove}
                    >
                      อนุมัติ
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Review Dialog */}
              <ReviewDialog
                open={reviewDialogOpen}
                onClose={() => setReviewDialogOpen(false)}
                onSubmit={handleReviewSubmit}
                applicationName={application.farmName}
              />

              <Grid container spacing={3}>
                {/* Farmer Information */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ boxShadow: 2, height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        ข้อมูลเกษตรกร
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: 'primary.main',
                            mr: 2,
                          }}
                        >
                          {application.farmer.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {application.farmer.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            เกษตรกรผู้ยื่นคำขอ
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            อีเมล
                          </Typography>
                          <Typography variant="body1">{application.farmer.email}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            เบอร์โทรศัพท์
                          </Typography>
                          <Typography variant="body1">{application.farmer.phone}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            ที่อยู่
                          </Typography>
                          <Typography variant="body1">{application.farmer.address}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Farm Information */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ boxShadow: 2, height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        ข้อมูลฟาร์ม
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            ชื่อฟาร์ม
                          </Typography>
                          <Typography variant="h6" fontWeight={600}>
                            {application.farmName}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            ขนาดพื้นที่
                          </Typography>
                          <Typography variant="body1">{application.farm.size}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            ที่ตั้ง
                          </Typography>
                          <Typography variant="body1">{application.farm.location}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            พืชที่ปลูก
                          </Typography>
                          <Typography variant="body1">{application.farm.cropType}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            มาตรฐานที่ขอรับรอง
                          </Typography>
                          <Chip
                            label={application.farm.certification}
                            color="primary"
                            size="small"
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Documents */}
                <Grid item xs={12}>
                  <Card sx={{ boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        เอกสารประกอบการขอรับรอง ({application.documents.length})
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={2}>
                        {application.documents.map(doc => (
                          <Grid item xs={12} sm={6} md={4} key={doc.id}>
                            <Card variant="outlined">
                              <CardContent>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                  }}
                                >
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body1" fontWeight={600} gutterBottom>
                                      {doc.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      อัพโหลดเมื่อ:{' '}
                                      {new Date(doc.uploadDate).toLocaleDateString('th-TH')}
                                    </Typography>
                                  </Box>
                                  <IconButton size="small" color="primary">
                                    <DownloadIcon />
                                  </IconButton>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Status History Timeline */}
                <Grid item xs={12}>
                  <Card sx={{ boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        ประวัติการดำเนินการ
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <StatusTimeline
                        history={
                          [
                            {
                              id: '1',
                              status: 'pending',
                              date: '2025-10-10',
                              time: '09:30',
                              user: 'นายสมชาย ใจดี (ผู้ยื่นคำขอ)',
                              comment: 'ยื่นคำขอรับรองมาตรฐาน GACP',
                            },
                          ] as StatusHistory[]
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Comments Section */}
                <Grid item xs={12} md={8}>
                  <CommentsList
                    comments={comments}
                    onAddComment={handleAddComment}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                    onReplyComment={handleReplyComment}
                  />
                </Grid>

                {/* Activity Log */}
                <Grid item xs={12} md={4}>
                  <ActivityLog activities={activities} />
                </Grid>
              </Grid>
            </Container>
          </Box>
          
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
    </ProtectedRoute>
  );
}
