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
  Badge,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Videocam as VideocamIcon,
  LocationOn as LocationOnIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarMonthIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useApplication } from '@/contexts/ApplicationContext';

/**
 * Inspector Dashboard
 *
 * หน้า Dashboard สำหรับ INSPECTOR (พนักงานตรวจสอบพื้นที่/ฟาร์ม)
 * แสดง:
 * - Upcoming Inspections (นัดตรวจที่กำลังจะถึง)
 * - Active Inspections (งานที่กำลังทำอยู่)
 * - Statistics (สถิติการตรวจสอบ)
 * - Calendar View (ตารางนัดหมาย)
 */

interface Inspection {
  id: string;
  applicationId: string;
  applicationNumber: string;
  farmerName: string;
  farmName: string;
  type: 'VDO_CALL' | 'ON_SITE';
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduledDate: string;
  scheduledTime: string;
  address?: string;
  score?: number;
}

interface Statistics {
  completedThisWeek: number;
  completedThisMonth: number;
  averageScore: number;
  passRate: number;
  vdoCallCount: number;
  onSiteCount: number;
}

const InspectorDashboardPage: React.FC = () => {
  const router = useRouter();
  const { applications } = useApplication();

  const [loading, setLoading] = useState(true);
  const [upcomingInspections, setUpcomingInspections] = useState<Inspection[]>([]);
  const [activeInspections, setActiveInspections] = useState<Inspection[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    completedThisWeek: 0,
    completedThisMonth: 0,
    averageScore: 0,
    passRate: 0,
    vdoCallCount: 0,
    onSiteCount: 0,
  });

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications]);

  const loadDashboardData = () => {
    try {
      // กรองใบสมัครที่อยู่ในขั้นตอนตรวจสอบ
      const inspectionApplications = applications.filter(
        (app) =>
          app.currentState === 'INSPECTION_SCHEDULED' ||
          app.currentState === 'INSPECTION_VDO_CALL' ||
          app.currentState === 'INSPECTION_ON_SITE' ||
          app.currentState === 'INSPECTION_COMPLETED'
      );

      // Mock inspections data
      const mockInspections: Inspection[] = inspectionApplications.map((app, index) => {
        const today = new Date();
        const scheduledDate = new Date(today);
        scheduledDate.setDate(today.getDate() + index);

        return {
          id: `INS-${app.id}`,
          applicationId: app.id,
          applicationNumber: app.applicationNumber,
          farmerName: app.farmerName || 'ไม่ระบุ',
          farmName: app.farmerName || 'ไม่ระบุ',
          type: app.currentState === 'INSPECTION_VDO_CALL' ? 'VDO_CALL' : 'ON_SITE',
          status:
            app.currentState === 'INSPECTION_COMPLETED'
              ? 'completed'
              : app.currentState === 'INSPECTION_VDO_CALL' ||
                  app.currentState === 'INSPECTION_ON_SITE'
                ? 'in_progress'
                : 'scheduled',
          scheduledDate: scheduledDate.toISOString().split('T')[0],
          scheduledTime: `${9 + (index % 6)}:00`,
          address: "[Address]",
          score: app.currentState === 'INSPECTION_COMPLETED' ? 85 + (index % 15) : undefined,
        };
      });

      // แยก upcoming และ active
      const upcoming = mockInspections.filter((ins) => ins.status === 'scheduled');
      const active = mockInspections.filter((ins) => ins.status === 'in_progress');

      // Sort by date
      upcoming.sort(
        (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );

      setUpcomingInspections(upcoming);
      setActiveInspections(active);

      // Calculate statistics (Mock data)
      const completed = mockInspections.filter((ins) => ins.status === 'completed');
      const scores = completed.filter((ins) => ins.score).map((ins) => ins.score!);
      const avgScore =
        scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const passCount = scores.filter((s) => s >= 80).length;

      setStatistics({
        completedThisWeek: Math.min(completed.length, 5),
        completedThisMonth: completed.length,
        averageScore: avgScore,
        passRate: scores.length > 0 ? Math.round((passCount / scores.length) * 100) : 0,
        vdoCallCount: mockInspections.filter((ins) => ins.type === 'VDO_CALL').length,
        onSiteCount: mockInspections.filter((ins) => ins.type === 'ON_SITE').length,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const handleStartInspection = (inspection: Inspection) => {
    if (inspection.type === 'VDO_CALL') {
      router.push(`/inspector/inspections/${inspection.applicationId}/vdo-call`);
    } else {
      router.push(`/inspector/inspections/${inspection.applicationId}/on-site`);
    }
  };

  const handleViewSchedule = () => {
    router.push('/inspector/schedule');
  };

  const getInspectionTypeLabel = (type: 'VDO_CALL' | 'ON_SITE') => {
    return type === 'VDO_CALL' ? 'VDO Call' : 'ลงพื้นที่';
  };

  const getInspectionTypeIcon = (type: 'VDO_CALL' | 'ON_SITE') => {
    return type === 'VDO_CALL' ? <VideocamIcon /> : <LocationOnIcon />;
  };

  const getInspectionTypeColor = (type: 'VDO_CALL' | 'ON_SITE'): 'primary' | 'secondary' => {
    return type === 'VDO_CALL' ? 'primary' : 'secondary';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (dateStr: string) => {
    const date = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          🔍 Inspector Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          แดชบอร์ดสำหรับพนักงานตรวจสอบพื้นที่ - ตรวจสอบฟาร์มผ่าน VDO Call และ On-Site Inspection
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Upcoming Inspections */}
        <Grid item xs={12} md={3}>
          <Card
            sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <ScheduleIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
                <Badge
                  badgeContent={
                    upcomingInspections.filter((ins) => isToday(ins.scheduledDate)).length
                  }
                  color="error"
                >
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {upcomingInspections.length}
                  </Typography>
                </Badge>
              </Box>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                นัดตรวจที่กำลังจะถึง
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7 }}>
                {upcomingInspections.filter((ins) => isToday(ins.scheduledDate)).length} นัดวันนี้
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Completed This Week */}
        <Grid item xs={12} md={3}>
          <Card
            sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {statistics.completedThisWeek}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                ตรวจแล้วสัปดาห์นี้
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7 }}>
                {statistics.completedThisMonth} รายการในเดือนนี้
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Score */}
        <Grid item xs={12} md={3}>
          <Card
            sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <StarIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {statistics.averageScore}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                คะแนนเฉลี่ย (จาก 100)
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7 }}>
                Pass Rate: {statistics.passRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Inspections */}
        <Grid item xs={12} md={3}>
          <Card
            sx={{ height: '100%', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <AssignmentIcon sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {activeInspections.length}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                งานที่กำลังทำอยู่
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7 }}>
                VDO: {statistics.vdoCallCount} | ลงพื้นที่: {statistics.onSiteCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Schedule & Upcoming */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6" fontWeight="bold">
                📅 ตารางนัดตรวจ
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CalendarMonthIcon />}
                onClick={handleViewSchedule}
              >
                ดูปฏิทิน
              </Button>
            </Box>

            {upcomingInspections.length === 0 ? (
              <Alert severity="info" icon={<ScheduleIcon />}>
                ไม่มีนัดตรวจในขณะนี้ 🎉
              </Alert>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  มีนัดตรวจ {upcomingInspections.length} รายการ
                </Typography>
                <List>
                  {upcomingInspections.slice(0, 5).map((inspection, index) => (
                    <React.Fragment key={inspection.id}>
                      <ListItem
                        sx={{
                          bgcolor: index % 2 === 0 ? 'grey.50' : 'white',
                          borderRadius: 1,
                          mb: 1,
                          ...(isToday(inspection.scheduledDate) && {
                            bgcolor: 'primary.lighter',
                            border: '2px solid',
                            borderColor: 'primary.main',
                          }),
                        }}
                      >
                        <ListItemButton onClick={() => handleStartInspection(inspection)}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                            {getInspectionTypeIcon(inspection.type)}
                          </Box>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  flexWrap: 'wrap',
                                }}
                              >
                                <Typography variant="body1" fontWeight="bold">
                                  {inspection.farmName}
                                </Typography>
                                <Chip
                                  label={getInspectionTypeLabel(inspection.type)}
                                  color={getInspectionTypeColor(inspection.type)}
                                  size="small"
                                />
                                {isToday(inspection.scheduledDate) && (
                                  <Chip label="วันนี้" color="error" size="small" />
                                )}
                                {isTomorrow(inspection.scheduledDate) && (
                                  <Chip label="พรุ่งนี้" color="warning" size="small" />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  <strong>เกษตรกร:</strong> {inspection.farmerName} |{' '}
                                  <strong>เลขที่:</strong> {inspection.applicationNumber}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  📅 {formatDate(inspection.scheduledDate)} เวลา{' '}
                                  {inspection.scheduledTime} น.
                                </Typography>
                                {inspection.type === 'ON_SITE' && inspection.address && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    📍 {inspection.address}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < upcomingInspections.slice(0, 5).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {upcomingInspections.length > 5 && (
                  <Button fullWidth variant="text" onClick={handleViewSchedule} sx={{ mt: 2 }}>
                    ดูนัดตรวจทั้งหมด ({upcomingInspections.length} รายการ)
                  </Button>
                )}
              </>
            )}

            {/* Active Inspections */}
            {activeInspections.length > 0 && (
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  🔄 งานที่กำลังทำอยู่
                </Typography>
                <List>
                  {activeInspections.map((inspection) => (
                    <ListItem
                      key={inspection.id}
                      sx={{ bgcolor: 'warning.lighter', borderRadius: 1, mb: 1 }}
                    >
                      <ListItemButton onClick={() => handleStartInspection(inspection)}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" fontWeight="bold">
                                {inspection.farmName}
                              </Typography>
                              <Chip
                                label={getInspectionTypeLabel(inspection.type)}
                                color={getInspectionTypeColor(inspection.type)}
                                size="small"
                              />
                              <Chip label="กำลังทำ" color="warning" size="small" />
                            </Box>
                          }
                          secondary={`เกษตรกร: ${inspection.farmerName}`}
                        />
                        <Button size="small" variant="contained" color="warning">
                          ดำเนินการต่อ
                        </Button>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
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
              {/* Average Score */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">คะแนนเฉลี่ย</Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary.main">
                    {statistics.averageScore}/100
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={statistics.averageScore}
                  color="primary"
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>

              {/* Pass Rate */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">อัตราผ่าน (≥80 คะแนน)</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {statistics.passRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={statistics.passRate}
                  color="success"
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Inspection Types */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ประเภทการตรวจ
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VideocamIcon fontSize="small" color="primary" />
                    <Typography variant="body2">VDO Call</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {statistics.vdoCallCount} รายการ
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon fontSize="small" color="secondary" />
                    <Typography variant="body2">ลงพื้นที่</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {statistics.onSiteCount} รายการ
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Performance Metrics */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ประสิทธิภาพ
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">ตรวจสัปดาห์นี้</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {statistics.completedThisWeek} รายการ
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">ตรวจเดือนนี้</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {statistics.completedThisMonth} รายการ
                  </Typography>
                </Box>
              </Box>

              {/* Performance Indicator */}
              <Alert severity="success" icon={<TrendingUpIcon />} sx={{ mt: 3 }}>
                <Typography variant="body2">คุณตรวจได้เร็วกว่าค่าเฉลี่ย 10% 🎯</Typography>
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
          <strong>หน้าที่ของพนักงานตรวจสอบพื้นที่:</strong>
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>
            <Typography variant="body2">
              <strong>Phase 6A - VDO Call:</strong> ตรวจสอบเบื้องต้นผ่าน Video Conference →
              ตัดสินใจว่าเพียงพอหรือต้องลงพื้นที่
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Phase 6B - On-Site:</strong> ลงพื้นที่ตรวจฟาร์ม → ให้คะแนน 8 Critical Control
              Points (CCPs) รวม 100 คะแนน
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>เกณฑ์ผ่าน:</strong> ≥80 คะแนน = ผ่าน (Pass) | 70-79 = มีเงื่อนไข (Conditional)
              | &lt;70 = ไม่ผ่าน (Fail)
            </Typography>
          </li>
          <li>
            <Typography variant="body2">ถ่ายรูปหลักฐานทุก CCP และเขียนรายงานสรุปผล</Typography>
          </li>
        </Box>
      </Paper>
    </Container>
  );
};

export default InspectorDashboardPage;
