import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Paper,
  Chip,
  Divider,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Agriculture as AgricultureIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { ApplicationApi } from '../../../lib/api.service';
import { GACPApplication, ApplicationStatus } from '../../../types/application.types';
import { WorkflowService } from '../../../lib/workflow.service';

export default function DocumentReviewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [application, setApplication] = useState<GACPApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<'approved' | 'rejected' | ''>('');
  const [notes, setNotes] = useState('');
  const [documentChecklist, setDocumentChecklist] = useState<{
    [key: string]: boolean;
  }>({
    farmRegistration: false,
    landOwnership: false,
    farmerID: false,
    cropPlan: false,
    previousCertificates: false,
    photos: false,
  });

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApplicationApi.getById(id as string);
      setApplication(data.data.application);
    } catch (err: any) {
      console.error('Error loading application:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลคำขอได้');
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistChange = (key: string) => {
    setDocumentChecklist(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async () => {
    if (!checkResult) {
      alert('กรุณาเลือกผลการตรวจสอบ');
      return;
    }

    // Check if all documents are checked when approving
    if (checkResult === 'approved') {
      const allChecked = Object.values(documentChecklist).every(v => v);
      if (!allChecked) {
        alert('กรุณาตรวจสอบเอกสารให้ครบถ้วนก่อนอนุมัติ');
        return;
      }
    }

    if (!notes.trim()) {
      alert('กรุณาระบุหมายเหตุ');
      return;
    }

    try {
      setSubmitting(true);
      await ApplicationApi.updateStatus(id as string, {
        status: checkResult === 'approved' ? ApplicationStatus.DOCUMENT_APPROVED : ApplicationStatus.DOCUMENT_REJECTED,
        notes,
      });

      alert('บันทึกผลการตรวจสอบเรียบร้อยแล้ว');
      router.push('/document-checker/dashboard');
    } catch (err: any) {
      console.error('Error submitting review:', err);
      alert(err.message || 'ไม่สามารถบันทึกผลการตรวจสอบได้');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !application) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'ไม่พบข้อมูลคำขอ'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/document-checker/dashboard')}
        >
          กลับไปหน้าแดชบอร์ด
        </Button>
      </Container>
    );
  }

  const checklistItems = [
    { key: 'farmRegistration', label: 'ใบทะเบียนฟาร์ม / ใบรับรองการจดทะเบียน' },
    { key: 'landOwnership', label: 'เอกสารแสดงกรรมสิทธิ์ที่ดิน (โฉนด/น.ส.3)' },
    { key: 'farmerID', label: 'สำเนาบัตรประชาชนเกษตรกร' },
    { key: 'cropPlan', label: 'แผนการปลูก / ปฏิทินการผลิต' },
    { key: 'previousCertificates', label: 'ใบรับรองมาตรฐานอื่นๆ (ถ้ามี)' },
    { key: 'photos', label: 'รูปถ่ายฟาร์ม / แปลงปลูก' },
  ];

  return (
    <>
      <Head>
        <title>ตรวจสอบเอกสาร - {application.applicationNumber}</title>
      </Head>

      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: '#2e7d32' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/document-checker/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ตรวจสอบเอกสาร - {application.applicationNumber}
          </Typography>
          <Chip
            label={WorkflowService.getStatusLabel(application.status)}
            sx={{
              backgroundColor: WorkflowService.getStatusColor(application.status),
              color: '#fff',
            }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Application Details */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                ข้อมูลคำขอรับรอง
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        ชื่อเกษตรกร
                      </Typography>
                      <Typography variant="body1">{application.farmerName}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AgricultureIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        ชื่อฟาร์ม
                      </Typography>
                      <Typography variant="body1">{application.farmName}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        ที่อยู่ฟาร์ม
                      </Typography>
                      <Typography variant="body1">{application.farmAddress}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        พืชที่ปลูก
                      </Typography>
                      <Typography variant="body1">
                        {application.cropType} ({application.cropVariety})
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="textSecondary">
                    พื้นที่ปลูก
                  </Typography>
                  <Typography variant="body1">{application.farmArea} ไร่</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="textSecondary">
                    วันที่ยื่นคำขอ
                  </Typography>
                  <Typography variant="body1">
                    {application.submittedAt
                      ? new Date(application.submittedAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Document Checklist */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                รายการตรวจเอกสาร
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List>
                {checklistItems.map((item, index) => (
                  <ListItem
                    key={item.key}
                    sx={{
                      borderBottom: index < checklistItems.length - 1 ? '1px solid #e0e0e0' : 'none',
                      py: 2,
                    }}
                  >
                    <ListItemIcon>
                      <FormControlLabel
                        control={
                          <Radio
                            checked={documentChecklist[item.key]}
                            onChange={() => handleChecklistChange(item.key)}
                            color="success"
                          />
                        }
                        label=""
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={documentChecklist[item.key] ? '✓ ตรวจสอบแล้ว' : 'ยังไม่ได้ตรวจสอบ'}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Review Result */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                ผลการตรวจสอบเอกสาร
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">ผลการพิจารณา *</FormLabel>
                <RadioGroup
                  row
                  value={checkResult}
                  onChange={e => setCheckResult(e.target.value as 'approved' | 'rejected')}
                >
                  <FormControlLabel
                    value="approved"
                    control={<Radio color="success" />}
                    label={
                      <Box display="flex" alignItems="center">
                        <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                        เอกสารครบถ้วนถูกต้อง
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="rejected"
                    control={<Radio color="error" />}
                    label={
                      <Box display="flex" alignItems="center">
                        <CancelIcon sx={{ mr: 1, color: 'error.main' }} />
                        เอกสารไม่ครบ/ไม่ถูกต้อง
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="หมายเหตุ / ข้อเสนอแนะ *"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="กรุณาระบุรายละเอียดผลการตรวจสอบ หรือเอกสารที่ต้องเพิ่มเติม (กรณีไม่อนุมัติ)"
                sx={{ mb: 3 }}
              />

              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/document-checker/dashboard')}
                  disabled={submitting}
                >
                  ยกเลิก
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={submitting || !checkResult || !notes.trim()}
                  startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกผลการตรวจสอบ'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
