/**
 * Farmer Booking Page
 *
 * Interface for farmers to book inspector appointments.
 *
 * @page /farmer/booking
 * @version 1.0.0
 * @author GACP Platform Team
 * @date 2025-11-02
 */

import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import FarmerLayout from '../../components/layout/FarmerLayout';
import { BookingForm } from '../../components/calendar/BookingForm';
import { CalendarView } from '../../components/calendar/CalendarView';
import { useAuth } from '../../contexts/AuthContext';

export default function FarmerBookingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [viewCalendarOpen, setViewCalendarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleBookingSuccess = () => {
    setBookingModalOpen(false);
    setSuccessMessage('จองการตรวจสอบสำเร็จ! เจ้าหน้าที่จะติดต่อกลับในเร็วๆ นี้');
    setTimeout(() => {
      router.push('/farmer/dashboard');
    }, 2000);
  };

  return (
    <>
      <Head>
        <title>จองการตรวจสอบ - ระบบ GACP</title>
      </Head>
      <FarmerLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/farmer/dashboard')}
            >
              กลับ
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 700, flexGrow: 1 }}>
              จองการตรวจสอบ
            </Typography>
          </Box>

          {/* Success Message */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          {/* Main Content */}
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Left Side - Actions */}
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  เริ่มต้นจองการตรวจสอบ
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  เลือกผู้ตรวจประเมินและเวลาที่สะดวกสำหรับการตรวจสอบฟาร์มของคุณ
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => setBookingModalOpen(true)}
                  >
                    จองการตรวจสอบใหม่
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={<CalendarIcon />}
                    onClick={() => setViewCalendarOpen(true)}
                  >
                    ดูปฏิทินการตรวจสอบของฉัน
                  </Button>
                </Box>

                {/* Information Box */}
                <Box sx={{ mt: 4, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    💡 คำแนะนำ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • การตรวจสอบมาตรฐาน GACP ใช้เวลาประมาณ 2-3 ชั่วโมง
                    <br />
                    • ควรจองล่วงหน้าอย่างน้อย 3 วันทำการ
                    <br />
                    • เตรียมเอกสารและพื้นที่ฟาร์มให้พร้อมก่อนวันตรวจ
                    <br />• หากต้องการเปลี่ยนแปลงนัดหมาย กรุณาแจ้งล่วงหน้าอย่างน้อย 24 ชั่วโมง
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {/* Right Side - Recent Bookings */}
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  การจองล่าสุด
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ยังไม่มีการจองการตรวจสอบ
                </Typography>
              </Paper>
            </Box>
          </Box>

          {/* Booking Form Dialog */}
          <Dialog
            open={bookingModalOpen}
            onClose={() => setBookingModalOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>จองการตรวจสอบ</DialogTitle>
            <DialogContent>
              <BookingForm
                farmId={''}
                onSuccess={handleBookingSuccess}
                onCancel={() => setBookingModalOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Calendar View Dialog */}
          <Dialog
            open={viewCalendarOpen}
            onClose={() => setViewCalendarOpen(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>ปฏิทินการตรวจสอบของฉัน</DialogTitle>
            <DialogContent>
              <CalendarView
                userId={user?.id || ''}
                role="FARMER"
                onEventClick={() => {}}
              />
            </DialogContent>
          </Dialog>
        </Container>
      </FarmerLayout>
    </>
  );
}
