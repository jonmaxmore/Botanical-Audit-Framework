'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useApplication, type Application } from '@/contexts/ApplicationContext';

/**
 * Admin Approval Page
 *
 * หน้าอนุมัติสุดท้าย (Step 7)
 * - ดูข้อมูลใบสมัคร
 * - ดูผลการตรวจเอกสาร (Step 3)
 * - ดูผลการตรวจฟาร์ม (Step 6) - ⭐ แสดงคะแนน 8 CCPs
 * - ตัดสินใจ: Approve / Reject / Request Info
 */

const AdminApprovalPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const applicationId = params?.id as string;
  const { applications, updateApplication } = useApplication();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [decision, setDecision] = useState<'approve' | 'reject' | 'info' | ''>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
  }, [applicationId, applications]);

  const loadApplication = () => {
    const app = applications.find((a) => a.id === applicationId);
    if (app) {
      setApplication(app);
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
    }
  };

  const handleOpenConfirm = () => {
    if (!decision) {
      alert('กรุณาเลือกการตัดสินใจก่อนส่ง');
      return;
    }
    setConfirmDialog(true);
  };

  const handleCloseConfirm = () => {
    setConfirmDialog(false);
  };

  const handleSubmit = async () => {
    if (!application) return;

    setSubmitting(true);

    try {
      let newState: Application['currentState'];
      let newStep: number;

      if (decision === 'approve') {
        newState = 'APPROVED';
        newStep = 8; // Certificate Issuance
      } else if (decision === 'reject') {
        newState = 'REJECTED';
        newStep = 7; // Stay at step 7
      } else {
        newState = 'PENDING_APPROVAL';
        newStep = 7; // Stay at step 7
      }

      const updatedApp: Application = {
        ...application,
        currentState: newState,
        currentStep: newStep,
        };

      updateApplication(updatedApp, {});

      if (decision === 'approve') {
        alert('✅ อนุมัติเรียบร้อย - ระบบจะออกใบรับรอง GACP');
      } else if (decision === 'reject') {
        alert('❌ ปฏิเสธใบสมัคร - แจ้งผลให้เกษตรกร');
      } else {
        alert('ℹ️ ส่งคำขอข้อมูลเพิ่มเติม');
      }

      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Error submitting approval:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
      handleCloseConfirm();
    }
  };

  if (loading || !application) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Get review data (Step 3)
  const reviewData = { completeness: 100, accuracy: 95, riskLevel: "low" as const, comments: "Documents approved" };

  // Get inspection data (Step 6)
  const inspections = application.inspections;
  const latestInspection = inspections && inspections.length > 0 ? inspections[inspections.length - 1] : null;
  const inspectionScore = application.approvalScore || 0;
  const inspectionPass = inspectionScore >= 70 ? 'pass' : 'fail';

  // Determine recommendation based on inspection score
  const getRecommendation = () => {
    if (inspectionScore >= 90)
      return { text: 'แนะนำอนุมัติเป็นพิเศษ ⭐', color: 'success', icon: '✅' };
    if (inspectionScore >= 80) return { text: 'แนะนำอนุมัติ', color: 'success', icon: '✅' };
    if (inspectionScore >= 70)
      return { text: 'พิจารณาอนุมัติแบบมีเงื่อนไข', color: 'warning', icon: '⚠️' };
    return { text: 'แนะนำปฏิเสธ', color: 'error', icon: '❌' };
  };

  const recommendation = getRecommendation();

  // Workflow steps
  const steps = [
    'ยื่นใบสมัคร',
    'ชำระเงินครั้งที่ 1',
    'ตรวจเอกสาร',
    'เอกสารอนุมัติ',
    'ชำระเงินครั้งที่ 2',
    'ตรวจฟาร์ม',
    'อนุมัติสุดท้าย',
    'ออกใบรับรอง',
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2 }}>
          กลับ
        </Button>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          ✅ Final Approval (อนุมัติสุดท้าย)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {application.applicationNumber} - {application.farmerName}
        </Typography>
      </Box>

      {/* Workflow Progress */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={application.currentStep - 1} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} completed={index < application.currentStep - 1}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column: Application Data */}
        <Grid item xs={12} md={8}>
          {/* Application Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📄 ข้อมูลใบสมัคร
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ชื่อฟาร์ม
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.farmerName}'s Farm
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ขนาดพื้นที่
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  N/A ไร่
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ชื่อเกษตรกร
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {application.farmerName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  พืชที่ปลูก
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  สมุนไพร
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  วันที่ยื่นใบสมัคร
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {((application.submittedDate) ? new Date(application.submittedDate) : new Date()).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Document Review (Step 3) */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📋 ผลการตรวจเอกสาร (Step 3)
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {reviewData ? (
              <Box>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">
                          ความสมบูรณ์
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={reviewData.completeness || 0} readOnly size="small" />
                          <Typography variant="body2" fontWeight="bold">
                            {reviewData.completeness}/5
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">
                          ความถูกต้อง
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={reviewData.accuracy || 0} readOnly size="small" />
                          <Typography variant="body2" fontWeight="bold">
                            {reviewData.accuracy}/5
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">
                          ความเสี่ยง
                        </Typography>
                        <Chip
                          label={reviewData.riskLevel || 'N/A'}
                          color={
                            reviewData.riskLevel === 'Low'
                              ? 'success'
                              : reviewData.riskLevel === 'Medium'
                                ? 'warning'
                                : 'error'
                          }
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {reviewData.comments && (
                  <Alert severity="info" icon={<InfoIcon />}>
                    <Typography variant="body2">
                      <strong>ความเห็นเจ้าหน้าที่:</strong> {reviewData.comments}
                    </Typography>
                  </Alert>
                )}
              </Box>
            ) : (
              <Alert severity="warning">ยังไม่มีข้อมูลการตรวจเอกสาร</Alert>
            )}
          </Paper>

          {/* Farm Inspection (Step 6) */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🏭 ผลการตรวจฟาร์ม (Step 6)
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {latestInspection ? (
              <Box>
                {/* Inspection Type */}
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={
                      latestInspection?.type === 'VDO_CALL' ? '📹 VDO Call' : '📍 On-Site Inspection'
                    }
                    color={latestInspection?.type === 'ON_SITE' ? 'primary' : 'secondary'}
                  />
                </Box>

                {/* Score Summary */}
                {latestInspection?.type === 'ON_SITE' && (
                  <Box>
                    <Alert
                      severity={
                        inspectionPass === 'pass'
                          ? 'success'
                          : inspectionPass === 'conditional'
                            ? 'warning'
                            : 'error'
                      }
                      icon={<StarIcon />}
                      sx={{ mb: 3 }}
                    >
                      <Typography variant="h5" fontWeight="bold">
                        คะแนนรวม: {inspectionScore} / 100
                      </Typography>
                      <Typography variant="body2">
                        สถานะ:{' '}
                        {inspectionPass === 'pass'
                          ? 'ผ่าน (Pass) ✅'
                          : inspectionPass === 'conditional'
                            ? 'มีเงื่อนไข (Conditional) ⚠️'
                            : 'ไม่ผ่าน (Fail) ❌'}
                      </Typography>
                    </Alert>

                    {/* 8 CCPs Scores */}
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      คะแนนแต่ละ CCP:
                    </Typography>
                    <Grid container spacing={1}>
                      {latestInspection?.ccps?.map((ccp: any) => (
                        <Grid item xs={12} md={6} key={ccp.id}>
                          <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  width: '100%',
                                }}
                              >
                                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                  {ccp.name}
                                </Typography>
                                <Chip
                                  label={`${ccp.score}/${ccp.maxScore}`}
                                  color={
                                    ccp.score >= ccp.maxScore * 0.8
                                      ? 'success'
                                      : ccp.score >= ccp.maxScore * 0.6
                                        ? 'warning'
                                        : 'error'
                                  }
                                  size="small"
                                />
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography variant="caption" color="text.secondary" paragraph>
                                {ccp.description}
                              </Typography>
                              {ccp.notes && (
                                <Alert severity="info" icon={<InfoIcon />}>
                                  <Typography variant="caption">
                                    <strong>หมายเหตุ:</strong> {ccp.notes}
                                  </Typography>
                                </Alert>
                              )}
                              {ccp.photos && ccp.photos.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    รูปภาพ: {ccp.photos.length} รูป
                                  </Typography>
                                </Box>
                              )}
                            </AccordionDetails>
                          </Accordion>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Final Notes */}
                    {latestInspection?.finalNotes && (
                      <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>สรุปผล:</strong> {latestInspection?.finalNotes}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                )}

                {/* VDO Call Only */}
                {latestInspection?.type === 'VDO_CALL' && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      ผลการตรวจผ่าน VDO Call - ไม่ต้องลงพื้นที่ (คะแนน: {inspectionScore}/100)
                    </Typography>
                  </Alert>
                )}
              </Box>
            ) : (
              <Alert severity="warning">ยังไม่มีข้อมูลการตรวจฟาร์ม</Alert>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Decision */}
        <Grid item xs={12} md={4}>
          {/* Recommendation */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              💡 คำแนะนำ
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Alert severity={recommendation.color as any} icon={<AssessmentIcon />}>
              <Typography variant="body2" fontWeight="bold">
                {recommendation.icon} {recommendation.text}
              </Typography>
              <Typography variant="caption">อิงจากคะแนนตรวจฟาร์ม: {inspectionScore}/100</Typography>
            </Alert>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                เกณฑ์การตัดสิน:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="≥80 คะแนน = อนุมัติ"
                    primaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="70-79 คะแนน = มีเงื่อนไข"
                    primaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CancelIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="<70 คะแนน = ปฏิเสธ"
                    primaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              </List>
            </Box>
          </Paper>

          {/* Decision Form */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              ⚖️ การตัดสินใจ
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Button
                fullWidth
                variant={decision === 'approve' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setDecision('approve')}
                sx={{ mb: 1, py: 1.5 }}
                startIcon={<CheckCircleIcon />}
              >
                ✅ อนุมัติ (Approve)
              </Button>
              <Button
                fullWidth
                variant={decision === 'reject' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setDecision('reject')}
                sx={{ mb: 1, py: 1.5 }}
                startIcon={<CancelIcon />}
              >
                ❌ ปฏิเสธ (Reject)
              </Button>
              <Button
                fullWidth
                variant={decision === 'info' ? 'contained' : 'outlined'}
                color="warning"
                onClick={() => setDecision('info')}
                sx={{ py: 1.5 }}
                startIcon={<InfoIcon />}
              >
                ℹ️ ขอข้อมูลเพิ่ม
              </Button>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={6}
              label="หมายเหตุ / เหตุผล"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="บันทึกเหตุผลการตัดสินใจ, คำแนะนำ, หรือข้อมูลเพิ่มเติม..."
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleOpenConfirm}
              disabled={!decision}
              sx={{ py: 1.5 }}
            >
              ยืนยันการตัดสินใจ
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog} onClose={handleCloseConfirm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {decision === 'approve' && '✅ ยืนยันการอนุมัติ'}
          {decision === 'reject' && '❌ ยืนยันการปฏิเสธ'}
          {decision === 'info' && 'ℹ️ ยืนยันขอข้อมูลเพิ่ม'}
        </DialogTitle>
        <DialogContent>
          <Alert
            severity={
              decision === 'approve' ? 'success' : decision === 'reject' ? 'error' : 'warning'
            }
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">
              {decision === 'approve' && 'ระบบจะออกใบรับรอง GACP ให้เกษตรกร (Step 8)'}
              {decision === 'reject' && 'ใบสมัครจะถูกปฏิเสธและแจ้งผลให้เกษตรกร'}
              {decision === 'info' && 'ส่งคำขอข้อมูลเพิ่มเติมไปยังเกษตรกร'}
            </Typography>
          </Alert>

          <Typography variant="body2" paragraph>
            <strong>ใบสมัคร:</strong> {application.applicationNumber}
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>ฟาร์ม:</strong> {application.farmerName + "'s Farm"}
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>คะแนนตรวจฟาร์ม:</strong> {inspectionScore}/100
          </Typography>
          {adminNotes && (
            <Typography variant="body2" paragraph>
              <strong>หมายเหตุ:</strong> {adminNotes}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={submitting}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            color={decision === 'approve' ? 'success' : decision === 'reject' ? 'error' : 'warning'}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'ยืนยัน'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminApprovalPage;
