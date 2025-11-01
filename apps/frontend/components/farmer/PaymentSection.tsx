/**
 * Payment Section Component
 * Handles payment QR code display and slip upload
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Payment as PaymentIcon,
  Upload as UploadIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';

interface PaymentSectionProps {
  applicationId: string;
  onPaymentComplete?: () => void;
}

interface PaymentData {
  amount: number;
  currency: string;
  status: string;
  method: string;
  qrCodeUrl?: string;
  referenceNumber?: string;
  slipUrl?: string;
  paidAt?: string;
}

export default function PaymentSection({ applicationId, onPaymentComplete }: PaymentSectionProps) {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchPaymentInfo = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/farmer/application/${applicationId}/payment`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลการชำระเงินได้');
      }

      const data = await response.json();
      if (data.success && data.data.payment) {
        setPayment(data.data.payment);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchPaymentInfo();
  }, [fetchPaymentInfo]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('กรุณาอัปโหลดไฟล์ JPG, PNG หรือ PDF เท่านั้น');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ไฟล์มีขนาดใหญ่เกิน 5MB');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleUploadSlip = async () => {
    if (!selectedFile) {
      setError('กรุณาเลือกไฟล์สลิปการโอนเงิน');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('slip', selectedFile);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/farmer/application/${applicationId}/payment/slip`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ไม่สามารถอัปโหลดสลิปได้');
      }

      const data = await response.json();
      setSuccess('อัปโหลดสลิปสำเร็จ! กำลังรอเจ้าหน้าที่ตรวจสอบ');
      setPayment(data.data.payment);
      setSelectedFile(null);

      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!payment) {
    return <Alert severity="error">ไม่พบข้อมูลการชำระเงิน</Alert>;
  }

  const isPaid = payment.status === 'paid' || payment.status === 'verified';

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 600 }}>
        <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        ชำระเงินค่าธรรมเนียม
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Payment Status */}
      <Card sx={{ mb: 3, bgcolor: isPaid ? '#e8f5e9' : '#fff3e0' }}>
        <CardContent>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
          >
            <Typography variant="h5" fontWeight={600}>
              ฿{payment.amount.toLocaleString()}
            </Typography>
            <Chip
              label={
                payment.status === 'pending'
                  ? 'รอชำระเงิน'
                  : payment.status === 'paid'
                    ? 'รอตรวจสอบ'
                    : payment.status === 'verified'
                      ? 'ยืนยันแล้ว'
                      : payment.status
              }
              color={
                payment.status === 'verified'
                  ? 'success'
                  : payment.status === 'paid'
                    ? 'warning'
                    : 'default'
              }
              icon={payment.status === 'verified' ? <CheckIcon /> : undefined}
            />
          </Box>
          <Typography variant="body2" color="textSecondary">
            เลขที่อ้างอิง: {payment.referenceNumber || '-'}
          </Typography>
        </CardContent>
      </Card>

      {!isPaid && (
        <>
          {/* QR Code Payment */}
          <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
            <QrCodeIcon sx={{ fontSize: 48, color: '#2e7d32', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              สแกน QR Code เพื่อชำระเงิน
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              ชำระผ่าน PromptPay หรือแอปธนาคาร
            </Typography>

            <Box
              sx={{
                width: 300,
                height: 300,
                margin: '0 auto',
                bgcolor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #ccc',
                borderRadius: 2
              }}
            >
              {payment.qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={payment.qrCodeUrl}
                  alt="QR Code"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  QR Code จะปรากฏที่นี่
                </Typography>
              )}
            </Box>

            <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
              💡 หากชำระเงินผ่าน QR Code แล้ว กรุณาอัปโหลดสลิปการโอนเงินด้านล่าง
            </Typography>
          </Paper>

          <Divider sx={{ my: 3 }}>หรือ</Divider>

          {/* Upload Slip */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              อัปโหลดสลิปการโอนเงิน
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              รองรับไฟล์ JPG, PNG, PDF (ไม่เกิน 5MB)
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button variant="outlined" component="label" disabled={uploading}>
                เลือกไฟล์
                <input type="file" hidden accept="image/*,.pdf" onChange={handleFileSelect} />
              </Button>
              {selectedFile && (
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {selectedFile.name}
                </Typography>
              )}
              <Button
                variant="contained"
                startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                onClick={handleUploadSlip}
                disabled={!selectedFile || uploading}
                sx={{ bgcolor: '#2e7d32' }}
              >
                {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
              </Button>
            </Box>

            {payment.slipUrl && (
              <Alert severity="info" sx={{ mt: 2 }}>
                ✓ อัปโหลดสลิปเรียบร้อยแล้ว กำลังรอเจ้าหน้าที่ตรวจสอบ
              </Alert>
            )}
          </Paper>
        </>
      )}

      {isPaid && (
        <Alert severity="success" icon={<CheckIcon />}>
          <strong>ชำระเงินเรียบร้อย</strong>
          <br />
          {payment.status === 'verified'
            ? 'เจ้าหน้าที่ได้ตรวจสอบการชำระเงินแล้ว คำขอของคุณกำลังดำเนินการต่อ'
            : 'กำลังรอเจ้าหน้าที่ตรวจสอบการชำระเงิน'}
        </Alert>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="caption" color="textSecondary">
          📌 <strong>หมายเหตุ:</strong> ค่าธรรมเนียมนี้ครอบคลุมการตรวจสอบเอกสาร
          การตรวจประเมินสถานที่ และการออกใบรับรอง GACP
          หลังจากชำระเงินแล้วเจ้าหน้าที่จะติดต่อกลับภายใน 3-5 วันทำการ
        </Typography>
      </Box>
    </Box>
  );
}
