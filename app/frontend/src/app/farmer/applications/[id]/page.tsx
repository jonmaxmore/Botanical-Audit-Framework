'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Payment as PaymentIcon,
  UploadFile as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { withAuth } from '@/contexts/AuthContext';
import { useApplication } from '@/contexts/ApplicationContext';
import WorkflowProgress from '@/components/WorkflowProgress';

const ApplicationDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { fetchApplicationById, submitApplication, currentApplication } = useApplication();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const applicationId = params.id as string;

  useEffect(() => {
    loadApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const loadApplication = async () => {
    setLoading(true);
    setError('');

    try {
      await fetchApplicationById(applicationId);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลใบสมัครได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentApplication) return;

    setSubmitting(true);
    setError('');

    try {
      await submitApplication(currentApplication.id);
      alert('ยื่นคำขอสำเร็จ! กำลังไปหน้า Dashboard...');
      router.push('/farmer/dashboard');
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถยื่นคำขอได้');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<
      string,
      'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
    > = {
      DRAFT: 'default',
      SUBMITTED: 'info',
      PAYMENT_PENDING_1: 'warning',
      PAYMENT_PROCESSING_1: 'info',
      DOCUMENT_REVIEW: 'info',
      DOCUMENT_APPROVED: 'success',
      DOCUMENT_REVISION: 'warning',
      DOCUMENT_REJECTED: 'error',
      PAYMENT_PENDING_2: 'warning',
      PAYMENT_PROCESSING_2: 'info',
      INSPECTION_SCHEDULED: 'info',
      INSPECTION_VDO_CALL: 'primary',
      INSPECTION_ON_SITE: 'primary',
      INSPECTION_COMPLETED: 'success',
      PENDING_APPROVAL: 'info',
      APPROVED: 'success',
      REJECTED: 'error',
      CERTIFICATE_GENERATING: 'success',
      CERTIFICATE_ISSUED: 'success',
    };
    return statusMap[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      DRAFT: 'แบบร่าง',
      SUBMITTED: 'ยื่นคำขอแล้ว',
      PAYMENT_PENDING_1: 'รอชำระเงินรอบที่ 1',
      PAYMENT_PROCESSING_1: 'กำลังตรวจสอบการชำระเงินรอบที่ 1',
      DOCUMENT_REVIEW: 'กำลังตรวจสอบเอกสาร',
      DOCUMENT_APPROVED: 'เอกสารผ่านการตรวจสอบ',
      DOCUMENT_REVISION: 'ต้องแก้ไขเอกสาร',
      DOCUMENT_REJECTED: 'เอกสารไม่ผ่าน',
      PAYMENT_PENDING_2: 'รอชำระเงินรอบที่ 2',
      PAYMENT_PROCESSING_2: 'กำลังตรวจสอบการชำระเงินรอบที่ 2',
      INSPECTION_SCHEDULED: 'นัดหมายตรวจฟาร์มแล้ว',
      INSPECTION_VDO_CALL: 'กำลังตรวจทาง VDO Call',
      INSPECTION_ON_SITE: 'กำลังตรวจฟาร์มหน้างาน',
      INSPECTION_COMPLETED: 'ตรวจฟาร์มเสร็จสิ้น',
      PENDING_APPROVAL: 'รออนุมัติผลการตรวจ',
      APPROVED: 'ได้รับการอนุมัติ',
      REJECTED: 'ไม่ได้รับการอนุมัติ',
      CERTIFICATE_GENERATING: 'กำลังออกใบรับรอง',
      CERTIFICATE_ISSUED: 'ออกใบรับรองแล้ว',
    };
    return statusMap[status] || status;
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon color="success" />;
      case 'REJECTED':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

  const getSmartNextAction = () => {
    if (!currentApplication) return null;

    const { workflowState } = currentApplication;

    switch (workflowState) {
      case 'DRAFT':
        return (
          <Button
            variant="contained"
            color="warning"
            startIcon={<EditIcon />}
            onClick={() => router.push(`/farmer/applications/${applicationId}/edit`)}
            fullWidth
          >
            แก้ไขใบสมัคร
          </Button>
        );

      case 'SUBMITTED':
      case 'PAYMENT_PENDING_1':
        return (
          <Button
            variant="contained"
            color="error"
            startIcon={<PaymentIcon />}
            onClick={() => router.push(`/farmer/payments?app=${applicationId}&phase=1`)}
            fullWidth
          >
            ชำระเงิน 5,000 บาท
          </Button>
        );

      case 'DOCUMENT_REVIEW':
        return <Alert severity="info">เจ้าหน้าที่กำลังตรวจสอบเอกสาร กรุณารอ 3-5 วันทำการ</Alert>;

      case 'DOCUMENT_REVISION':
        return (
          <Button
            variant="contained"
            color="warning"
            startIcon={<UploadIcon />}
            onClick={() => router.push(`/farmer/documents?app=${applicationId}`)}
            fullWidth
          >
            แก้ไขและอัปโหลดเอกสารใหม่
          </Button>
        );

      case 'DOCUMENT_APPROVED':
      case 'PAYMENT_PENDING_2':
        return (
          <Button
            variant="contained"
            color="error"
            startIcon={<PaymentIcon />}
            onClick={() => router.push(`/farmer/payments?app=${applicationId}&phase=2`)}
            fullWidth
          >
            ชำระเงิน 25,000 บาท
          </Button>
        );

      case 'INSPECTION_SCHEDULED':
      case 'INSPECTION_VDO_CALL':
      case 'INSPECTION_ON_SITE':
        return <Alert severity="info">กำลังอยู่ระหว่างการตรวจฟาร์ม กรุณารอผลการตรวจสอบ</Alert>;

      case 'PENDING_APPROVAL':
        return <Alert severity="info">เจ้าหน้าที่กำลังพิจารณาผลการตรวจ กรุณารอ 5-7 วันทำการ</Alert>;

      case 'APPROVED':
      case 'CERTIFICATE_GENERATING':
        return <Alert severity="success">คุณได้รับการอนุมัติ! กำลังออกใบรับรอง GACP</Alert>;

      case 'CERTIFICATE_ISSUED':
        return (
          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={() => alert('ดาวน์โหลดใบรับรอง')}
            fullWidth
          >
            ดาวน์โหลดใบรับรอง GACP
          </Button>
        );

      case 'REJECTED':
        return (
          <Alert severity="error">
            ใบสมัครของคุณไม่ได้รับการอนุมัติ กรุณาติดต่อเจ้าหน้าที่เพื่อขอคำแนะนำ
          </Alert>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          กำลังโหลดข้อมูล...
        </Typography>
      </Container>
    );
  }

  if (error || !currentApplication) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'ไม่พบข้อมูลใบสมัคร'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/farmer/dashboard')}
        >
          กลับไปหน้า Dashboard
        </Button>
      </Container>
    );
  }

  const {
    workflowState,
    currentStep,
    createdAt,
    farmInfo,
    farmerInfo,
    documents,
    payments,
    inspection,
  } = currentApplication;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            รายละเอียดใบสมัคร
          </Typography>
          <Typography variant="body2" color="text.secondary">
            หมายเลขใบสมัคร: {applicationId}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/farmer/dashboard')}
        >
          กลับ
        </Button>
      </Box>

      {/* Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                สถานะปัจจุบัน
              </Typography>
              <Chip
                label={getStatusText(workflowState)}
                color={getStatusColor(workflowState)}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                ขั้นตอนที่
              </Typography>
              <Typography variant="h6" color="primary">
                {currentStep} / 8
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                วันที่ยื่นคำขอ
              </Typography>
              <Typography variant="body2">
                {new Date(createdAt).toLocaleDateString('th-TH')}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Workflow Progress */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ความคืบหน้า
        </Typography>
        <WorkflowProgress currentState={workflowState} currentStep={currentStep} />
      </Paper>

      {/* Smart Next Action */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ขั้นตอนถัดไป
        </Typography>
        {getSmartNextAction()}
      </Paper>

      {/* Farm Information */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          ข้อมูลฟาร์ม
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              ชื่อฟาร์ม
            </Typography>
            <Typography variant="body1">{farmInfo?.farmName || '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              พื้นที่
            </Typography>
            <Typography variant="body1">{farmInfo?.farmSize || '-'} ไร่</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              ที่อยู่
            </Typography>
            <Typography variant="body1">{farmInfo?.farmAddress || '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              จังหวัด
            </Typography>
            <Typography variant="body1">{farmInfo?.province || '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              ประเภทพืช
            </Typography>
            <Typography variant="body1">{farmInfo?.cropType || '-'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Farmer Information */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          ข้อมูลเกษตรกร
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              ชื่อ-นามสกุล
            </Typography>
            <Typography variant="body1">{farmerInfo?.farmerName || '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              เบอร์โทรศัพท์
            </Typography>
            <Typography variant="body1">{farmerInfo?.phone || '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              อีเมล
            </Typography>
            <Typography variant="body1">{farmerInfo?.email || '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              ประสบการณ์
            </Typography>
            <Typography variant="body1">{farmerInfo?.experience || '-'} ปี</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Documents Status */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          สถานะเอกสาร
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {documents && documents.length > 0 ? (
          <List>
            {documents.map((doc: any, index: number) => (
              <ListItem key={doc.id || doc._id || `doc-${index}`}>
                <ListItemIcon>{getDocumentStatusIcon(doc.status)}</ListItemIcon>
                <ListItemText
                  primary={doc.documentType}
                  secondary={`สถานะ: ${doc.status === 'APPROVED' ? 'อนุมัติ' : doc.status === 'REJECTED' ? 'ไม่อนุมัติ' : 'รอตรวจสอบ'}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Alert severity="warning">ยังไม่มีการอัปโหลดเอกสาร</Alert>
        )}
      </Paper>

      {/* Payment Status */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          สถานะการชำระเงิน
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  รอบที่ 1: ค่าตรวจสอบเอกสาร
                </Typography>
                <Typography variant="h6" color="primary">
                  5,000 บาท
                </Typography>
                <Chip
                  label={payments?.phase1?.status === "COMPLETED" ? 'ชำระแล้ว' : 'รอชำระเงิน'}
                  color={payments?.phase1?.status === "COMPLETED" ? 'success' : 'warning'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  รอบที่ 2: ค่าตรวจฟาร์ม
                </Typography>
                <Typography variant="h6" color="primary">
                  25,000 บาท
                </Typography>
                <Chip
                  label={payments?.phase2?.status === "COMPLETED" ? 'ชำระแล้ว' : 'รอชำระเงิน'}
                  color={payments?.phase2?.status === "COMPLETED" ? 'success' : 'default'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Inspection Results (if completed) */}
      {inspection && inspection.score !== undefined && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            ผลการตรวจฟาร์ม
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" color={inspection.score >= 80 ? 'success.main' : 'error.main'}>
              {inspection.score} คะแนน
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              (ผ่านเกณฑ์ ≥ 80 คะแนน)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={inspection.score}
            color={inspection.score >= 80 ? 'success' : 'error'}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Paper>
      )}

      {/* Action Button (for DRAFT status) */}
      {workflowState === 'DRAFT' && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
            onClick={handleSubmit}
            disabled={submitting}
            fullWidth
          >
            ยื่นคำขอ
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default ApplicationDetailPage;
