import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Email, LockReset } from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('ไม่พบอีเมลนี้ในระบบ');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>ลืมรหัสผ่าน - ระบบตรวจสอบและรับรอง GACP</title>
        <meta name="description" content="รีเซ็ตรหัสผ่านของคุณ" />
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #2e7d32 0%, #4caf50 100%)',
              },
            }}
          >
            {/* Logo and Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                  color: 'white',
                }}
              >
                <LockReset sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                ลืมรหัสผ่าน
              </Typography>
              <Typography variant="body2" color="text.secondary">
                กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
              </Typography>
            </Box>

            {/* Success Message */}
            {success ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว
                  <br />
                  กรุณาตรวจสอบอีเมลของคุณ
                </Alert>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/login')}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Button>
              </Box>
            ) : (
              <>
                {/* Error Alert */}
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="อีเมล"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: 3,
                      '&:hover': {
                        boxShadow: 6,
                      },
                    }}
                  >
                    {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
                  </Button>
                </form>

                {/* Back to Login */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    จำรหัสผ่านได้แล้ว?{' '}
                    <Link
                      href="/login"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontWeight: 600,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      เข้าสู่ระบบ
                    </Link>
                  </Typography>
                </Box>
              </>
            )}
          </Paper>

          {/* Back to Home */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="text"
              onClick={() => router.push('/')}
              sx={{
                color: 'white',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              ← กลับหน้าหลัก
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}
