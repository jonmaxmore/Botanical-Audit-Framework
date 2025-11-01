/**
 * Payment Page
 * Farmer payment for application
 */

import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Container, Box, Typography, Button, Card, CardContent } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import FarmerLayout from '../../../components/layout/FarmerLayout';
import PaymentSection from '../../../components/farmer/PaymentSection';

export default function PaymentPage() {
  const router = useRouter();
  const { id } = router.query;

  const handlePaymentComplete = () => {
    setTimeout(() => {
      router.push(`/farmer/application/${id}`);
    }, 2000);
  };

  if (!id || typeof id !== 'string') {
    return (
      <FarmerLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h5" color="error">
            ไม่พบหมายเลขคำขอ
          </Typography>
        </Container>
      </FarmerLayout>
    );
  }

  return (
    <>
      <Head>
        <title>ชำระเงินค่าธรรมเนียม | ระบบเกษตรกร</title>
      </Head>

      <FarmerLayout>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(`/farmer/application/${id}`)}
            >
              กลับไปยังคำขอ
            </Button>
          </Box>

          <Card>
            <CardContent sx={{ p: 4 }}>
              <PaymentSection applicationId={id} onPaymentComplete={handlePaymentComplete} />
            </CardContent>
          </Card>
        </Container>
      </FarmerLayout>
    </>
  );
}
