'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Assignment,
  Payment,
  Description,
  LocationOn,
  CheckCircle,
  Warning,
  Error,
  ArrowForward,
  Timeline,
} from '@mui/icons-material';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import { useApplication } from '@/contexts/ApplicationContext';
import { useRouter } from 'next/navigation';
import WorkflowProgress from '@/components/WorkflowProgress';

function FarmerDashboardPage() {
  const { user } = useAuth();
  const { applications, fetchApplications, isLoading, error } = useApplication();
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeApplication = applications.find(
    (app) => app.currentState !== 'CERTIFICATE_ISSUED' && app.currentState !== 'REJECTED'
  );

  const getNextAction = () => {
    if (!activeApplication) {
      return {
        title: 'เริ่มยื่นคำขอ GACP',
        description: 'คุณยังไม่มีใบสมัคร โปรดเริ่มยื่นคำขอใหม่',
        action: 'ยื่นคำขอ',
        path: '/farmer/applications/new',
        color: 'primary' as const,
        icon: <Assignment />,
      };
    }

    switch (activeApplication.currentState) {
      case 'DRAFT':
        return {
          title: 'กรอกข้อมูลให้ครบถ้วน',
          description: 'โปรดกรอกข้อมูลใบสมัครและอัปโหลดเอกสารให้ครบ',
          action: 'แก้ไขใบสมัคร',
          path: `/farmer/applications/${activeApplication.id}`,
          color: 'warning' as const,
          icon: <Warning />,
        };
      case 'PAYMENT_PENDING_1':
        return {
          title: 'ชำระเงินรอบแรก',
          description: 'ชำระค่าธรรมเนียมตรวจสอบเอกสาร 5,000 บาท',
          action: 'ชำระเงิน',
          path: '/farmer/payments',
          color: 'error' as const,
          icon: <Payment />,
        };
      case 'DOCUMENT_REVIEW':
        return {
          title: 'รอผลการตรวจสอบเอกสาร',
          description: 'เจ้าหน้าที่กำลังตรวจสอบเอกสารของคุณ',
          action: 'ดูสถานะ',
          path: `/farmer/applications/${activeApplication.id}`,
          color: 'info' as const,
          icon: <Description />,
        };
      case 'DOCUMENT_REVISION':
        return {
          title: 'แก้ไขเอกสาร',
          description: 'เจ้าหน้าที่ร้องขอให้แก้ไขเอกสาร',
          action: 'แก้ไขเอกสาร',
          path: '/farmer/documents',
          color: 'warning' as const,
          icon: <Warning />,
        };
      case 'PAYMENT_PENDING_2':
        return {
          title: 'ชำระเงินรอบสอง',
          description: 'ชำระค่าธรรมเนียมตรวจสอบฟาร์ม 25,000 บาท',
          action: 'ชำระเงิน',
          path: '/farmer/payments',
          color: 'error' as const,
          icon: <Payment />,
        };
      case 'INSPECTION_SCHEDULED':
      case 'INSPECTION_VDO_CALL':
      case 'INSPECTION_ON_SITE':
        return {
          title: 'รอการตรวจสอบฟาร์ม',
          description: 'ผู้ตรวจสอบจะติดต่อคุณเพื่อนัดหมาย',
          action: 'ดูตารางตรวจสอบ',
          path: `/farmer/applications/${activeApplication.id}`,
          color: 'info' as const,
          icon: <LocationOn />,
        };
      case 'PENDING_APPROVAL':
        return {
          title: 'รออนุมัติผล',
          description: 'อยู่ระหว่างพิจารณาอนุมัติผลการรับรอง',
          action: 'ดูสถานะ',
          path: `/farmer/applications/${activeApplication.id}`,
          color: 'info' as const,
          icon: <CheckCircle />,
        };
      case 'APPROVED':
      case 'CERTIFICATE_GENERATING':
        return {
          title: 'กำลังออกใบรับรอง',
          description: 'ระบบกำลังสร้างใบรับรอง GACP ของคุณ',
          action: 'ดูสถานะ',
          path: `/farmer/applications/${activeApplication.id}`,
          color: 'success' as const,
          icon: <CheckCircle />,
        };
      default:
        return {
          title: 'ดูรายละเอียดใบสมัคร',
          description: 'ตรวจสอบสถานะใบสมัครของคุณ',
          action: 'ดูใบสมัคร',
          path: `/farmer/applications/${activeApplication.id}`,
          color: 'primary' as const,
          icon: <Assignment />,
        };
    }
  };

  const getPaymentStatus = () => {
    if (!activeApplication) return null;

    const phase1 = activeApplication.payments.find((p) => p.phase === 1);
    const phase2 = activeApplication.payments.find((p) => p.phase === 2);

    return { phase1, phase2 };
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const nextAction = getNextAction();
  const paymentStatus = getPaymentStatus();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          <Timeline sx={{ fontSize: 36, verticalAlign: 'middle', mr: 1 }} />
          Dashboard เกษตรกร
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ยินดีต้อนรับ, {user?.name}
        </Typography>
      </Box>

      {!activeApplication && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1" fontWeight={600}>
            คุณยังไม่มีใบสมัคร GACP
          </Typography>
          <Typography variant="body2">เริ่มยื่นคำขอเพื่อรับการรับรองมาตรฐาน WHO-GACP</Typography>
        </Alert>
      )}

      {activeApplication && (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  ใบสมัคร: {activeApplication.applicationNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  สมัครเมื่อ: {new Date(activeApplication.createdAt).toLocaleDateString('th-TH')}
                </Typography>
              </Box>
              <Chip
                label={activeApplication.currentState}
                color={
                  activeApplication.currentState.includes('APPROVED') ||
                  activeApplication.currentState === 'CERTIFICATE_ISSUED'
                    ? 'success'
                    : activeApplication.currentState.includes('REJECTED')
                      ? 'error'
                      : activeApplication.currentState.includes('PENDING')
                        ? 'warning'
                        : 'primary'
                }
                size="medium"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <WorkflowProgress
              currentState={activeApplication.currentState}
              currentStep={activeApplication.currentStep}
            />

            <Box sx={{ mt: 3 }}>
              <LinearProgress
                variant="determinate"
                value={(activeApplication.currentStep / 8) * 100}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                ความคืบหน้า: {Math.round((activeApplication.currentStep / 8) * 100)}% (ขั้นตอน{' '}
                {activeApplication.currentStep}/8)
              </Typography>
            </Box>
          </Paper>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    📋 สถานะเอกสาร
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    เอกสารที่จำเป็น: {activeApplication.documents.length} ชิ้น
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {activeApplication.documents.length === 0 && (
                      <Alert severity="warning">
                        ยังไม่มีเอกสาร - โปรดอัปโหลด
                      </Alert>
                    )}
                    {activeApplication.documents.map((doc) => (
                      <Box
                        key={doc.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1,
                          borderBottom: '1px solid #f0f0f0',
                        }}
                      >
                        <Typography variant="body2">{doc.type}</Typography>
                        <Chip
                          label={doc.status}
                          size="small"
                          color={
                            doc.status === 'APPROVED'
                              ? 'success'
                              : doc.status === 'REJECTED'
                                ? 'error'
                                : 'default'
                          }
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    💰 สถานะการชำระเงิน
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight={600}>
                        ชำระเงินรอบแรก: 5,000 บาท
                      </Typography>
                      {paymentStatus?.phase1 ? (
                        <Chip
                          label={paymentStatus.phase1.status}
                          size="small"
                          color={
                            paymentStatus.phase1.status === 'COMPLETED' ? 'success' : 'warning'
                          }
                          sx={{ mt: 1 }}
                        />
                      ) : (
                        <Chip label="ยังไม่ชำระ" size="small" color="error" sx={{ mt: 1 }} />
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        ชำระเงินรอบสอง: 25,000 บาท
                      </Typography>
                      {paymentStatus?.phase2 ? (
                        <Chip
                          label={paymentStatus.phase2.status}
                          size="small"
                          color={
                            paymentStatus.phase2.status === 'COMPLETED' ? 'success' : 'warning'
                          }
                          sx={{ mt: 1 }}
                        />
                      ) : (
                        <Chip label="ยังไม่ชำระ" size="small" color="default" sx={{ mt: 1 }} />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      <Paper
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${
            nextAction.color === 'error'
              ? '#f44336 0%, #d32f2f 100%'
              : nextAction.color === 'warning'
                ? '#ff9800 0%, #f57c00 100%'
                : nextAction.color === 'success'
                  ? '#4caf50 0%, #388e3c 100%'
                  : '#2196f3 0%, #1976d2 100%'
          })`,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {nextAction.icon}
          <Typography variant="h5" fontWeight={600} sx={{ ml: 1 }}>
            {nextAction.title}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
          {nextAction.description}
        </Typography>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForward />}
          onClick={() => router.push(nextAction.path)}
          sx={{
            bgcolor: 'white',
            color:
              nextAction.color === 'error'
                ? '#f44336'
                : nextAction.color === 'warning'
                  ? '#ff9800'
                  : '#2196f3',
            '&:hover': { bgcolor: '#f5f5f5' },
          }}
        >
          {nextAction.action}
        </Button>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          ใบสมัครทั้งหมด ({applications.length})
        </Typography>
        <Grid container spacing={2}>
          {applications.map((app) => (
            <Grid item xs={12} sm={6} md={4} key={app.id}>
              <Card
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                onClick={() => router.push(`/farmer/applications/${app.id}`)}
              >
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {app.applicationNumber}
                  </Typography>
                  <Chip
                    label={app.currentState}
                    size="small"
                    color={
                      app.currentState === 'CERTIFICATE_ISSUED'
                        ? 'success'
                        : app.currentState === 'REJECTED'
                          ? 'error'
                          : 'primary'
                    }
                    sx={{ mt: 1 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    ขั้นตอน {app.currentStep}/8
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default FarmerDashboardPage;
