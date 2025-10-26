'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  IconButton,
  Stack,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  QrCode as QrCodeIcon,
  AccountBalance as BankIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ContentCopy as CopyIcon,
  Info as InfoIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';

interface PaymentData {
  applicationId: string;
  phase: '1' | '2';
  amount: number;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'expired';
  qrCodeData?: string;
  promptPayId?: string;
  referenceNumber?: string;
  expiresAt?: Date;
}

const PaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'bank'>('qr');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes

  const applicationId = searchParams.get('app');
  const phase = (searchParams.get('phase') || '1') as '1' | '2';

  // Initialize payment data
  useEffect(() => {
    initializePayment();
  }, [applicationId, phase]);

  // QR Code generation
  useEffect(() => {
    if (paymentData && paymentMethod === 'qr' && qrCanvasRef.current) {
      generateQRCode();
    }
  }, [paymentData, paymentMethod]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const initializePayment = async () => {
    setLoading(true);
    setError('');

    try {
      if (!applicationId) {
        throw new Error('ไม่พบเลขที่ใบสมัคร');
      }

      // Mock payment data (replace with API call)
      const mockPayment: PaymentData = {
        applicationId,
        phase,
        amount: phase === '1' ? 5000 : 25000,
        title: phase === '1' ? 'ค่าตรวจสอบเอกสาร' : 'ค่าตรวจสอบฟาร์ม',
        description:
          phase === '1'
            ? 'ค่าธรรมเนียมการตรวจสอบเอกสารและข้อมูลใบสมัคร (ไม่คืนเงินหากไม่ผ่านการอนุมัติ)'
            : 'ค่าธรรมเนียมการตรวจสอบฟาร์ม (VDO Call และ On-site Inspection)',
        status: 'pending',
        promptPayId: '0123456789012',
        referenceNumber: `GACP${applicationId?.slice(-6)}P${phase}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };

      setPaymentData(mockPayment);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลการชำระเงินได้');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!paymentData || !qrCanvasRef.current) return;

    try {
      // Generate PromptPay QR Code data
      // Format: promptpay-[id]-[amount]-[reference]
      const qrData = JSON.stringify({
        type: 'promptpay',
        merchantId: paymentData.promptPayId,
        amount: paymentData.amount,
        reference: paymentData.referenceNumber,
        currency: 'THB',
      });

      // Generate QR code on canvas
      await QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    } catch (err) {
      console.error('QR Code generation error:', err);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)');
        return;
      }

      setReceipt(file);
      setError('');
    }
  };

  const handleSubmitPayment = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (paymentMethod === 'bank') {
        if (!transactionRef) {
          throw new Error('กรุณาระบุหมายเลขอ้างอิง');
        }
        if (!receipt) {
          throw new Error('กรุณาอัปโหลดหลักฐานการชำระเงิน');
        }
      }

      // Mock API call - Replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful response
      const mockResponse = {
        success: true,
        message: 'บันทึกข้อมูลการชำระเงินสำเร็จ',
        data: {
          paymentId: `PAY-${Date.now()}`,
          status: 'processing',
        },
      };

      if (mockResponse.success) {
        setSuccess('✅ บันทึกข้อมูลการชำระเงินสำเร็จ! เจ้าหน้าที่จะตรวจสอบภายใน 1-2 วันทำการ');

        // Redirect after 3 seconds
        setTimeout(() => {
          router.push(`/farmer/dashboard`);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('คัดลอกแล้ว!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!paymentData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">ไม่พบข้อมูลการชำระเงิน</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            ชำระเงิน
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ใบสมัครเลขที่: {applicationId}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          กลับ
        </Button>
      </Box>

      {/* Error/Success Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Payment Amount Card */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" gutterBottom>
                {paymentData.title}
              </Typography>
              <Typography variant="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
                ฿{paymentData.amount.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {paymentData.description}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <TimerIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {formatTime(timeRemaining)}
              </Typography>
              <Typography variant="caption">เวลาที่เหลือ</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">
            <Typography variant="h6" gutterBottom>
              เลือกวิธีการชำระเงิน
            </Typography>
          </FormLabel>
          <RadioGroup
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as 'qr' | 'bank')}
          >
            <FormControlLabel
              value="qr"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QrCodeIcon />
                  <Typography>QR Code PromptPay (แนะนำ - รวดเร็ว)</Typography>
                  <Chip label="ยอดนิยม" size="small" color="primary" />
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

      {/* QR Code Payment */}
      {paymentMethod === 'qr' && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            สแกน QR Code เพื่อชำระเงิน
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <canvas
                  ref={qrCanvasRef}
                  style={{
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    maxWidth: '100%',
                  }}
                />
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mt: 1, color: 'text.secondary' }}
                >
                  หมายเลขอ้างอิง: {paymentData.referenceNumber}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  ขั้นตอนการชำระเงิน:
                </Typography>
                <Typography variant="body2" component="ol" sx={{ pl: 2, m: 0 }}>
                  <li>เปิดแอปธนาคารของคุณ</li>
                  <li>เลือกเมนู &quot;สแกน QR&quot; หรือ &quot;PromptPay&quot;</li>
                  <li>สแกน QR Code ด้านซ้าย</li>
                  <li>ตรวจสอบยอดเงิน: ฿{paymentData.amount.toLocaleString()}</li>
                  <li>ยืนยันการชำระเงิน</li>
                  <li>บันทึกหมายเลขอ้างอิงจากแอปธนาคาร</li>
                </Typography>
              </Alert>

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>⚠️ หมายเหตุ:</strong> QR Code นี้จะหมดอายุใน {formatTime(timeRemaining)}{' '}
                  นาที กรุณาชำระเงินภายในเวลาที่กำหนด
                </Typography>
              </Alert>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              หลังจากชำระเงินแล้ว ระบบจะตรวจสอบการชำระเงินโดยอัตโนมัติภายใน 5-10 นาที
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Bank Transfer Payment */}
      {paymentMethod === 'bank' && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            โอนเงินผ่านธนาคาร
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ธนาคารกรุงเทพ
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      ชื่อบัญชี
                    </Typography>
                    <Typography variant="h6">กรมวิชาการเกษตร</Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      เลขที่บัญชี
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h6">123-4-56789-0</Typography>
                      <IconButton
                        size="small"
                        sx={{ color: 'white' }}
                        onClick={() => handleCopy('123-4-56789-0')}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      จำนวนเงิน
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      ฿{paymentData.amount.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      หมายเลขอ้างอิง
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h6">{paymentData.referenceNumber}</Typography>
                      <IconButton
                        size="small"
                        sx={{ color: 'white' }}
                        onClick={() => handleCopy(paymentData.referenceNumber || '')}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  ขั้นตอนการโอนเงิน:
                </Typography>
                <Typography variant="body2" component="ol" sx={{ pl: 2, m: 0 }}>
                  <li>โอนเงิน ฿{paymentData.amount.toLocaleString()} ไปยังบัญชีด้านซ้าย</li>
                  <li>บันทึกหมายเลขอ้างอิงจากธนาคาร (Transaction Reference)</li>
                  <li>ถ่ายภาพหรือ Screenshot หลักฐานการโอนเงิน</li>
                  <li>กรอกข้อมูลด้านล่างและอัปโหลดหลักฐาน</li>
                </Typography>
              </Alert>

              <TextField
                fullWidth
                label="หมายเลขอ้างอิงจากธนาคาร"
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                placeholder="เช่น 123456789012"
                sx={{ mb: 2 }}
                required
              />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  อัปโหลดหลักฐานการโอนเงิน
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<UploadIcon />}
                  sx={{ py: 2 }}
                >
                  {receipt ? receipt.name : 'เลือกไฟล์ (JPG, PNG - สูงสุด 5MB)'}
                  <input type="file" hidden accept="image/*" onChange={handleFileSelect} />
                </Button>
                {receipt && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1 }} />
                    อัปโหลดไฟล์แล้ว: {receipt.name}
                  </Alert>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Submit Button */}
      {paymentMethod === 'bank' && (
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmitPayment}
            disabled={submitting || !transactionRef || !receipt}
            startIcon={submitting ? <CircularProgress size={20} /> : <PaymentIcon />}
            sx={{ px: 6, py: 1.5 }}
          >
            {submitting ? 'กำลังบันทึก...' : 'ยืนยันการชำระเงิน'}
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            เจ้าหน้าที่จะตรวจสอบการชำระเงินภายใน 1-2 วันทำการ
          </Typography>
        </Box>
      )}

      {/* Important Notes */}
      <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <InfoIcon color="primary" />
          ข้อมูลสำคัญ
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>
            <strong>นโยบายการคืนเงิน:</strong> ค่าธรรมเนียมที่ชำระแล้ว
            <strong>ไม่สามารถขอคืนได้</strong>
            ในทุกกรณี แม้ใบสมัครจะไม่ผ่านการอนุมัติ
          </li>
          <li>
            <strong>ระยะเวลา:</strong> เจ้าหน้าที่จะตรวจสอบการชำระเงินภายใน 1-2 วันทำการ
            (ไม่นับเสาร์-อาทิตย์และวันหยุดนักขัตฤกษ์)
          </li>
          <li>
            <strong>การติดตาม:</strong> คุณสามารถติดตามสถานะการชำระเงินได้ที่หน้าแดชบอร์ด
          </li>
          <li>
            <strong>ติดต่อ:</strong> หากมีปัญหาเกี่ยวกับการชำระเงิน โทร 02-XXX-XXXX (จันทร์-ศุกร์
            08:30-16:30 น.)
          </li>
        </Typography>
      </Paper>
    </Container>
  );
};

const PaymentPageWrapper = () => {
  return (
    <React.Suspense
      fallback={
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      }
    >
      <PaymentPage />
    </React.Suspense>
  );
};

export default PaymentPageWrapper;
