import React from 'react';
import Head from 'next/head';
import { Box, Container, Typography, Button } from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>ไม่มีสิทธิ์เข้าถึง | GACP System</title>
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            <BlockIcon sx={{ fontSize: 100, color: '#f44336', mb: 2 }} />
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              ไม่มีสิทธิ์เข้าถึง
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ
            </Typography>
            <Button variant="contained" onClick={() => router.push('/')} sx={{ mt: 2 }}>
              กลับหน้าหลัก
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}
