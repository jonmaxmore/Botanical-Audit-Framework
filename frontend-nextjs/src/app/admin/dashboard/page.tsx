'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Certificate as CertificateIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { withAuth } from '@/components/auth/withAuth';
import { useApplicationContext, type Application } from '@/contexts/ApplicationContext';

/**
 * Admin Dashboard Page
 * 
 * แดชบอร์ดหลักสำหรับ ADMIN/APPROVER (Step 7)
 * - System Overview
 * - Application Statistics (by status)
 * - Financial Overview
 * - User Statistics
 * - Pending Approvals List
 * - System Health
 */

const AdminDashboardPage: React.FC = () => {
  const router = useRouter();
  const { applications } = useApplicationContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [applications]);

  // Filter applications by workflow state
  const pendingApprovalApps = applications.filter(app => 
    app.workflowState === 'PENDING_APPROVAL'
  );
  const approvedApps = applications.filter(app => 
    app.workflowState === 'APPROVED'
  );
  const rejectedApps = applications.filter(app => 
    app.workflowState === 'DOCUMENT_REJECTED' || 
    app.workflowState === 'REJECTED'
  );
  const inProgressApps = applications.filter(app => 
    ![
      'PENDING_APPROVAL',
      'APPROVED',
      'DOCUMENT_REJECTED',
      'REJECTED',
      'CERTIFICATE_ISSUED'
    ].includes(app.workflowState)
  );

  // Calculate statistics
  const totalApplications = applications.length;
  const approvalRate = totalApplications > 0 
    ? ((approvedApps.length / totalApplications) * 100).toFixed(1)
    : 0;
  const avgProcessingTime = 12; // Mock: days

  // Financial statistics (Mock)
  const totalRevenue = applications.filter(app => 
    app.workflowState !== 'DOCUMENT_REJECTED' && 
    app.workflowState !== 'REJECTED'
  ).length * 5000; // 5000 THB per application
  const pendingPayments = applications.filter(app => 
    app.workflowState === 'PAYMENT_PROCESSING_1' || 
    app.workflowState === 'PAYMENT_PROCESSING_2'
  ).length * 5000;

  // Certificate statistics
  const issuedCertificates = applications.filter(app => 
    app.workflowState === 'CERTIFICATE_ISSUED'
  ).length;

  // User statistics (Mock)
  const totalUsers = 156;
  const activeFarmers = 89;
  const activeOfficers = 12;
  const activeInspectors = 8;

  // System health (Mock)
  const systemHealth = {
    status: 'healthy',
    uptime: '99.8%',
    responseTime: '245ms',
    lastBackup: '2 hours ago',
  };

  // Priority scoring for pending approvals
  const getPriority = (app: Application) => {
    const inspectionScore = app.inspectionData?.totalScore || 0;
    const daysWaiting = Math.floor(
      (Date.now() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (inspectionScore >= 90 && daysWaiting > 3) return { level: 'high', label: 'สูง', color: 'error' };
    if (inspectionScore >= 80 && daysWaiting > 5) return { level: 'medium', label: 'ปานกลาง', color: 'warning' };
    return { level: 'low', label: 'ปกติ', color: 'success' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Typography>กำลังโหลด...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          🎛️ Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ภาพรวมระบบและการจัดการ GACP Certificate
        </Typography>
      </Box>

      {/* System Health Alert */}
      {systemHealth.status === 'healthy' ? (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            ระบบทำงานปกติ - Uptime: {systemHealth.uptime} | Response Time: {systemHealth.responseTime}
          </Typography>
        </Alert>
      ) : (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            ระบบมีปัญหา - โปรดตรวจสอบ
          </Typography>
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Applications */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DescriptionIcon sx={{ mr: 1 }} />
                <Typography variant="body2">ใบสมัครทั้งหมด</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {totalApplications}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                +{inProgressApps.length} กำลังดำเนินการ
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Approvals */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <HourglassEmptyIcon sx={{ mr: 1 }} />
                <Typography variant="body2">รออนุมัติ</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {pendingApprovalApps.length}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {pendingApprovalApps.filter(app => {
                  const days = Math.floor(
                    (Date.now() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return days > 3;
                }).length} รายการเร่งด่วน
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Approval Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssessmentIcon sx={{ mr: 1 }} />
                <Typography variant="body2">อัตราอนุมัติ</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {approvalRate}%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {approvedApps.length} อนุมัติ / {rejectedApps.length} ปฏิเสธ
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Certificates Issued */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CertificateIcon sx={{ mr: 1 }} />
                <Typography variant="body2">ใบรับรองที่ออก</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {issuedCertificates}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                ออกแล้วทั้งหมด
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Pending Approvals List */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                📋 รออนุมัติ ({pendingApprovalApps.length})
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => router.push('/admin/applications')}
              >
                ดูทั้งหมด
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {pendingApprovalApps.length === 0 ? (
              <Alert severity="info">
                ไม่มีใบสมัครรออนุมัติในขณะนี้
              </Alert>
            ) : (
              <List>
                {pendingApprovalApps.slice(0, 5).map((app) => {
                  const priority = getPriority(app);
                  const daysWaiting = Math.floor(
                    (Date.now() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const inspectionScore = app.inspectionData?.totalScore || 0;

                  return (
                    <ListItem
                      key={app.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
                      }}
                      onClick={() => router.push(`/admin/applications/${app.id}/approve`)}
                    >
                      <ListItemIcon>
                        <CheckCircleIcon color={priority.color as any} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {app.applicationNumber}
                            </Typography>
                            <Chip 
                              label={priority.label} 
                              color={priority.color as any} 
                              size="small" 
                            />
                            {inspectionScore >= 90 && (
                              <Chip 
                                label={`⭐ ${inspectionScore} คะแนน`}
                                color="success" 
                                size="small" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {app.farmInfo?.name} - {app.farmerInfo?.name} | รอ {daysWaiting} วัน
                          </Typography>
                        }
                      />
                      <Button variant="contained" size="small">
                        อนุมัติ
                      </Button>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>

          {/* Application Statistics by Step */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📊 สถิติตามขั้นตอน
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {[
                { step: 1, label: 'ยื่นใบสมัคร', count: applications.filter(a => a.currentStep === 1).length },
                { step: 2, label: 'ชำระเงินครั้งที่ 1', count: applications.filter(a => a.currentStep === 2).length },
                { step: 3, label: 'ตรวจเอกสาร', count: applications.filter(a => a.currentStep === 3).length },
                { step: 4, label: 'เอกสารอนุมัติ', count: applications.filter(a => a.currentStep === 4).length },
                { step: 5, label: 'ชำระเงินครั้งที่ 2', count: applications.filter(a => a.currentStep === 5).length },
                { step: 6, label: 'ตรวจฟาร์ม', count: applications.filter(a => a.currentStep === 6).length },
                { step: 7, label: 'อนุมัติสุดท้าย', count: applications.filter(a => a.currentStep === 7).length },
                { step: 8, label: 'ออกใบรับรอง', count: applications.filter(a => a.currentStep === 8).length },
              ].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.step}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {item.count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Step {item.step}: {item.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Financial Overview */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              💰 ภาพรวมการเงิน
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  รายได้รวม
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  ฿{totalRevenue.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  รอชำระ
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="warning.main">
                  ฿{pendingPayments.toLocaleString()}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="bold">
                  เดือนนี้
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary.main">
                  ฿{(totalRevenue * 0.3).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" icon={<AttachMoneyIcon />}>
              <Typography variant="caption">
                ค่าธรรมเนียม: 5,000 บาท/ใบสมัคร (แบ่งชำระ 2 ครั้ง)
              </Typography>
            </Alert>
          </Paper>

          {/* User Statistics */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              👥 ผู้ใช้งาน
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ทั้งหมด
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {totalUsers}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  เกษตรกร
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {activeFarmers}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  เจ้าหน้าที่ตรวจเอกสาร
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {activeOfficers}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  เจ้าหน้าที่ตรวจฟาร์ม
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {activeInspectors}
                </Typography>
              </Box>
            </Box>

            <Button 
              fullWidth 
              variant="outlined" 
              size="small"
              onClick={() => router.push('/admin/users')}
            >
              จัดการผู้ใช้
            </Button>
          </Paper>

          {/* System Performance */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              ⚡ ประสิทธิภาพระบบ
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avg. Processing Time
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                  color="success"
                />
                <Typography variant="body2" fontWeight="bold">
                  {avgProcessingTime} วัน
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                System Uptime
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={99.8} 
                  sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                  color="success"
                />
                <Typography variant="body2" fontWeight="bold">
                  {systemHealth.uptime}
                </Typography>
              </Box>
            </Box>

            <Alert severity="success" icon={<SpeedIcon />}>
              <Typography variant="caption">
                Response Time: {systemHealth.responseTime} | Last Backup: {systemHealth.lastBackup}
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default withAuth(AdminDashboardPage, ['ADMIN']);
