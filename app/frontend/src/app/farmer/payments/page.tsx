'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Chip,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  QrCode as QrCodeIcon,
  AccountBalance as BankIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { withAuth } from '@/contexts/AuthContext';
import { useApplication } from '@/contexts/ApplicationContext';
import Image from 'next/image';

const PaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchApplicationById, recordPayment, currentApplication } = useApplication();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'bank'>('qr');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [transactionRef, setTransactionRef] = useState('');

  const applicationId = searchParams.get('app');
  const phase = searchParams.get('phase'); // '1' or '2'

  useEffect(() => {
    loadData();
  }, [applicationId]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      if (applicationId) {
        await fetchApplicationById(applicationId);
      }
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('กรุณาอัปโหลดไฟล์ JPG, PNG หรือ PDF เท่านั้น');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5 MB');
      return;
    }

    setReceipt(file);
  };

  const handleSubmit = async () => {
    if (!applicationId || !phase || !receipt) {
      setError('กรุณาอัปโหลดหลักฐานการชำระเงิน');
      return;
    }

    if (paymentMethod === 'bank' && !transactionRef.trim()) {
      setError('กรุณากรอกหมายเลขอ้างอิง');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await recordPayment(applicationId, parseInt(phase), {
        method: paymentMethod,
        receiptFile: receipt,
        transactionRef: transactionRef || undefined,
      });

      alert('บันทึกการชำระเงินสำเร็จ! เจ้าหน้าที่จะตรวจสอบภายใน 1-2 วันทำการ');
      router.push(`/farmer/applications/${applicationId}`);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถบันทึกการชำระเงินได้');
    } finally {
      setSubmitting(false);
    }
  };

  const getPaymentAmount = () => {
    return phase === '1' ? 5000 : 25000;
  };

  const getPaymentTitle = () => {
    return phase === '1' ? 'ค่าตรวจสอบเอกสาร' : 'ค่าตรวจสอบฟาร์ม';
  };

  const getPaymentDescription = () => {
    return phase === '1'
      ? 'ค่าธรรมเนียมการตรวจสอบเอกสารและข้อมูลใบสมัคร (ไม่คืนเงินหากไม่ผ่านการอนุมัติ)'
      : 'ค่าธรรมเนียมการตรวจสอบฟาร์ม (VDO Call และ On-site Inspection)';
  };

  const isPaymentPaid = () => {
    if (!currentApplication?.payments) return false;
    if (phase === '1') {
      return currentApplication.payments.find(p => p.phase === 1)?.status === "COMPLETED";
    }
    return currentApplication.payments.find(p => p.phase === 2)?.status === "COMPLETED";
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

  if (!applicationId || !phase || !currentApplication) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          ไม่พบข้อมูลใบสมัครหรือระบุ phase ไม่ถูกต้อง
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

  if (isPaymentPaid()) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 2 }}>
          ชำระเงินเรียบร้อยแล้ว! ({getPaymentTitle()})
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/farmer/applications/${applicationId}`)}
        >
          กลับไปดูใบสมัคร
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            ชำระเงิน
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ใบสมัครเลขที่: {applicationId}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/farmer/applications/${applicationId}`)}
        >
          กลับ
        </Button>
      </Box>

      {/* Payment Amount Card */}
      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {getPaymentTitle()}
          </Typography>
          <Typography variant="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
            ฿{getPaymentAmount().toLocaleString()}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {getPaymentDescription()}
          </Typography>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">
            <Typography variant="h6" gutterBottom>
              เลือกวิธีการชำระเงิน
            </Typography>
          </FormLabel>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as 'qr' | 'bank')}
          >
            <FormControlLabel
              value="qr"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QrCodeIcon />
                  <Typography>QR Code PromptPay (แนะนำ - รวดเร็ว)</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="bank"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BankIcon />
                  <Typography>โอนเงินผ่านธนาคาร</Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
      </Paper>

      {/* Payment Instructions */}
      {paymentMethod === 'qr' && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            สแกน QR Code เพื่อชำระเงิน
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ textAlign: 'center', mb: 2 }}>
            {/* Mock QR Code - Replace with real QR generator */}
            <Box
              sx={{
                width: 300,
                height: 300,
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                border: '2px solid',
                borderColor: 'grey.300',
              }}
            >
              <QrCodeIcon sx={{ fontSize: 100, color: 'grey.400' }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              สแกน QR Code ด้วยแอปธนาคารของคุณ
            </Typography>
          </Box>

          <Alert severity="info">
            <Typography variant="body2">
              <strong>ขั้นตอน:</strong>
            </Typography>
            <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
              <li>เปิดแอปธนาคารของคุณ</li>
              <li>เลือกเมนู "สแกน QR"</li>
              <li>สแกน QR Code ด้านบน</li>
              <li>ตรวจสอบจำนวนเงิน {getPaymentAmount().toLocaleString()} บาท</li>
              <li>ยืนยันการชำระเงิน</li>
              <li>ถ่ายภาพหรือ Screenshot หลักฐานการโอนเงิน</li>
            </Typography>
          </Alert>
        </Paper>
      )}

      {paymentMethod === 'bank' && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            ข้อมูลบัญชีธนาคาร
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    ธนาคาร
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    ธนาคารกรุงไทย (KTB)
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    ชื่อบัญชี
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    กรมวิชาการเกษตร กระทรวงเกษตรและสหกรณ์
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    เลขที่บัญชี
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" color="primary">
                      123-4-56789-0
                    </Typography>
                    <Chip
                      label="คัดลอก"
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText('1234567890');
                        alert('คัดลอกเลขบัญชีแล้ว');
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>ขั้นตอน:</strong>
            </Typography>
            <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
              <li>โอนเงิน {getPaymentAmount().toLocaleString()} บาท ไปยังบัญชีด้านบน</li>
              <li>บันทึกหมายเลขอ้างอิง (Transaction Reference)</li>
              <li>ถ่ายภาพหรือ Screenshot หลักฐานการโอนเงิน</li>
            </Typography>
          </Alert>

          <TextField
            fullWidth
            label="หมายเลขอ้างอิง (Transaction Reference)"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            placeholder="เช่น 202310221234567890"
            sx={{ mt: 2 }}
          />
        </Paper>
      )}

      {/* Upload Receipt */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          อัปโหลดหลักฐานการชำระเงิน
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Button
          variant="outlined"
          component="label"
          fullWidth
          startIcon={<UploadIcon />}
          sx={{ mb: 2 }}
        >
          เลือกไฟล์
          <input type="file" hidden accept="image/*,.pdf" onChange={handleFileSelect} />
        </Button>

        {receipt && (
          <Alert severity="success">
            เลือกไฟล์: {receipt.name} ({(receipt.size / 1024).toFixed(2)} KB)
          </Alert>
        )}

        {!receipt && (
          <Alert severity="warning">
            กรุณาอัปโหลดสลิปหรือหลักฐานการโอนเงิน (JPG, PNG หรือ PDF)
          </Alert>
        )}
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        variant="contained"
        color="success"
        size="large"
        fullWidth
        startIcon={submitting ? <CircularProgress size={20} /> : <PaymentIcon />}
        onClick={handleSubmit}
        disabled={!receipt || submitting}
      >
        ยืนยันการชำระเงิน
      </Button>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        หลังจากยืนยันแล้ว เจ้าหน้าที่จะตรวจสอบการชำระเงินภายใน 1-2 วันทำการ
      </Typography>
    </Container>
  );
};

export default PaymentPage;
