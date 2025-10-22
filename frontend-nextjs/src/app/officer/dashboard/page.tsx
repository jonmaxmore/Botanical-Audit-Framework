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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { withAuth } from '@/components/auth/withAuth';
import { useApplicationContext } from '@/contexts/ApplicationContext';

/**
 * DTAM Officer Dashboard
 * 
 * หน้า Dashboard สำหรับ DTAM_OFFICER (พนักงานตรวจสอบเอกสาร)
 * แสดง:
 * - Pending Reviews (จำนวนใบสมัครรอตรวจ)
 * - Today's Tasks (งานวันนี้)
 * - Statistics (สถิติการตรวจสอบ)
 * - Quick Actions (เริ่มตรวจเอกสาร)
 */

interface PendingApplication {
  id: string;
  applicationNumber: string;
  farmerName: string;
  farmName: string;
  submittedDate: string;
  workflowState: string;
  priority: 'high' | 'medium' | 'low';
  daysWaiting: number;
}

interface Statistics {
  reviewedThisWeek: number;
  reviewedThisMonth: number;
  approvalRate: number;
  revisionRate: number;
  rejectionRate: number;
  averageReviewTime: number; // in hours
}

const OfficerDashboardPage: React.FC = () => {
  const router = useRouter();
  const { applications } = useApplicationContext();
  
  const [loading, setLoading] = useState(true);
  const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    reviewedThisWeek: 0,
    reviewedThisMonth: 0,
    approvalRate: 0,
    revisionRate: 0,
    rejectionRate: 0,
    averageReviewTime: 0,
  });

  useEffect(() => {
    // โหลดข้อมูล
    loadDashboardData();
  }, [applications]);

  const loadDashboardData = () => {
    try {
      // กรองใบสมัครที่รอตรวจ
      const pending = applications
        .filter(app => 
          app.workflowState === 'PAYMENT_PROCESSING_1' ||
          app.workflowState === 'DOCUMENT_REVIEW' ||
          app.workflowState === 'DOCUMENT_REVISION'
        )
        .map(app => {
          const submittedDate = new Date(app.submittedDate || Date.now());
          const daysWaiting = Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // กำหนด priority ตามจำนวนวันที่รอ
          let priority: 'high' | 'medium' | 'low' = 'low';
          if (daysWaiting > 5) priority = 'high';
          else if (daysWaiting > 2) priority = 'medium';

          return {
            id: app.id,
            applicationNumber: app.applicationNumber,
            farmerName: app.farmerInfo?.name || 'ไม่ระบุ',
            farmName: app.farmInfo?.name || 'ไม่ระบุ',
            submittedDate: submittedDate.toLocaleDateString('th-TH'),
            workflowState: app.workflowState,
            priority,
            daysWaiting,
          };
        })
        .sort((a, b) => b.daysWaiting - a.daysWaiting); // เรียงตามวันที่รอมากสุด

      setPendingApplications(pending);

      // คำนวณสถิติ (Mock data - ต้องเชื่อม API จริง)
      const reviewed = applications.filter(app => 
        app.workflowState === 'DOCUMENT_APPROVED' ||
        app.workflowState === 'DOCUMENT_REVISION' ||
        app.workflowState === 'DOCUMENT_REJECTED'
      );

      const approved = applications.filter(app => app.workflowState === 'DOCUMENT_APPROVED').length;
      const revision = applications.filter(app => app.workflowState === 'DOCUMENT_REVISION').length;
      const rejected = applications.filter(app => app.workflowState === 'DOCUMENT_REJECTED').length;
      const total = reviewed.length || 1; // หาร 0 ไม่ได้

      setStatistics({
        reviewedThisWeek: Math.min(reviewed.length, 12), // Mock
        reviewedThisMonth: reviewed.length,
        approvalRate: Math.round((approved / total) * 100),
        revisionRate: Math.round((revision / total) * 100),
        rejectionRate: Math.round((rejected / total) * 100),
        averageReviewTime: 4.5, // Mock: 4.5 ชั่วโมง
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const handleStartReview = (applicationId: string) => {
    router.push(`/officer/applications/${applicationId}/review`);
  };

  const handleViewAllApplications = () => {
    router.push('/officer/applications');
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
    }
  };

  const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'ด่วนมาก';
      case 'medium': return 'ปานกลาง';
      case 'low': return 'ปกติ';
    }
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'PAYMENT_PROCESSING_1': return 'รอชำระเงิน';
      case 'DOCUMENT_REVIEW': return 'รอตรวจเอกสาร';
      case 'DOCUMENT_REVISION': return 'รอแก้ไข';
      default: return state;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          📋 DTAM Officer Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          แดชบอร์ดสำหรับพนักงานตรวจสอบเอกสาร - ตรวจสอบความครบถ้วนและความถูกต้องของเอกสารคำขอรับรอง GACP
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Pending Reviews */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <DescriptionIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {pendingApplications.length}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                ใบสมัครรอตรวจ
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7 }}>
                ต้องดำเนินการ
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Reviewed This Week */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <AssignmentIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {statistics.reviewedThisWeek}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                ตรวจแล้วสัปดาห์นี้
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7 }}>
                {statistics.reviewedThisMonth} รายการในเดือนนี้
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Approval Rate */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {statistics.approvalRate}%
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                อัตราอนุมัติ
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7 }}>
                แก้ไข {statistics.revisionRate}% | ปฏิเสธ {statistics.rejectionRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Review Time */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <ScheduleIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {statistics.averageReviewTime}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                เวลาเฉลี่ย (ชั่วโมง)
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7 }}>
                ต่อใบสมัคร 1 รายการ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Tasks - Pending Reviews */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                📝 ใบสมัครรอตรวจสอบ
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleViewAllApplications}
              >
                ดูทั้งหมด
              </Button>
            </Box>

            {pendingApplications.length === 0 ? (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                ไม่มีใบสมัครรอตรวจสอบในขณะนี้ 🎉
              </Alert>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  มีใบสมัครรอตรวจ {pendingApplications.length} รายการ (เรียงตามวันที่รอนานสุด)
                </Typography>
                <List>
                  {pendingApplications.slice(0, 5).map((app, index) => (
                    <React.Fragment key={app.id}>
                      <ListItem
                        sx={{
                          bgcolor: index % 2 === 0 ? 'grey.50' : 'white',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemButton onClick={() => handleStartReview(app.id)}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="body1" fontWeight="bold">
                                  {app.applicationNumber}
                                </Typography>
                                <Chip
                                  label={getPriorityLabel(app.priority)}
                                  color={getPriorityColor(app.priority)}
                                  size="small"
                                />
                                <Chip
                                  label={getStateLabel(app.workflowState)}
                                  variant="outlined"
                                  size="small"
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  <strong>ฟาร์ม:</strong> {app.farmName} | <strong>เกษตรกร:</strong> {app.farmerName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ยื่นเมื่อ: {app.submittedDate} ({app.daysWaiting} วันที่แล้ว)
                                </Typography>
                              </Box>
                            }
                          />
                          <VisibilityIcon color="action" />
                        </ListItemButton>
                      </ListItem>
                      {index < pendingApplications.slice(0, 5).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {pendingApplications.length > 5 && (
                  <Button
                    fullWidth
                    variant="text"
                    onClick={handleViewAllApplications}
                    sx={{ mt: 2 }}
                  >
                    ดูใบสมัครทั้งหมด ({pendingApplications.length} รายการ)
                  </Button>
                )}
              </>
            )}

            {/* Quick Action */}
            {pendingApplications.length > 0 && (
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<AssignmentIcon />}
                  onClick={() => handleStartReview(pendingApplications[0].id)}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    },
                  }}
                >
                  เริ่มตรวจเอกสารใบสมัครแรก
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📊 สถิติการตรวจสอบ
            </Typography>

            <Box sx={{ mt: 3 }}>
              {/* Approval Rate */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">อนุมัติ</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {statistics.approvalRate}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={statistics.approvalRate} 
                  color="success"
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>

              {/* Revision Rate */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">ขอแก้ไข</Typography>
                  <Typography variant="body2" fontWeight="bold" color="warning.main">
                    {statistics.revisionRate}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={statistics.revisionRate} 
                  color="warning"
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>

              {/* Rejection Rate */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">ปฏิเสธ</Typography>
                  <Typography variant="body2" fontWeight="bold" color="error.main">
                    {statistics.rejectionRate}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={statistics.rejectionRate} 
                  color="error"
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Performance Metrics */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ประสิทธิภาพ
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">เวลาเฉลี่ย</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {statistics.averageReviewTime} ชม.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">ตรวจสัปดาห์นี้</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {statistics.reviewedThisWeek} รายการ
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">ตรวจเดือนนี้</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {statistics.reviewedThisMonth} รายการ
                  </Typography>
                </Box>
              </Box>

              {/* Performance Indicator */}
              <Alert 
                severity="info" 
                icon={<TrendingUpIcon />}
                sx={{ mt: 3 }}
              >
                <Typography variant="body2">
                  คุณทำงานได้ดีกว่าค่าเฉลี่ย 15% 🎯
                </Typography>
              </Alert>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Help Section */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.lighter' }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          💡 คำแนะนำการใช้งาน
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>หน้าที่ของพนักงานตรวจสอบเอกสาร:</strong>
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>
            <Typography variant="body2">
              ตรวจสอบความครบถ้วนของเอกสาร 5 ชนิด (บัตรประชาชน, ทะเบียนบ้าน, โฉนดที่ดิน, แผนที่ฟาร์ม, ใบอนุญาตแหล่งน้ำ)
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              ตรวจสอบความถูกต้องของข้อมูลในเอกสาร
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              ประเมินความเสี่ยง (Risk Assessment)
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              ตัดสินใจ: <strong>อนุมัติ</strong> / <strong>ขอแก้ไข</strong> (สูงสุด 2 ครั้ง) / <strong>ปฏิเสธ</strong>
            </Typography>
          </li>
        </Box>
      </Paper>
    </Container>
  );
};

export default withAuth(OfficerDashboardPage, ['DTAM_OFFICER']);
