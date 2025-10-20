'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, VerifiedUser } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

export default function LoginPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Demo credentials
      if (email === 'cert@gacp.test' && password === 'password123') {
        // Save token
        localStorage.setItem('cert_token', 'demo-token-certificate-officer');
        localStorage.setItem(
          'cert_user',
          JSON.stringify({
            id: '1',
            email: 'cert@gacp.test',
            name: 'Certificate Officer',
            role: 'certificate_officer',
          }),
        );

        enqueueSnackbar('เข้าสู่ระบบสำเร็จ!', { variant: 'success' });
        router.push('/dashboard');
      } else {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                mb: 2,
              }}
            >
              <VerifiedUser sx={{ fontSize: 48, color: 'white' }} />
            </Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Certificate Portal
            </Typography>
            <Typography variant="body1" color="text.secondary">
              เข้าสู่ระบบสำหรับเจ้าหน้าที่ออกใบรับรอง
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="อีเมล"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              margin="normal"
              autoComplete="email"
              autoFocus
            />

            <TextField
              fullWidth
              label="รหัสผ่าน"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              margin="normal"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: 'info.lighter',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'info.light',
            }}
          >
            <Typography variant="caption" color="info.dark" fontWeight={600}>
              🧪 บัญชีทดสอบ:
            </Typography>
            <Typography variant="body2" color="info.dark" sx={{ mt: 1 }}>
              อีเมล: cert@gacp.test
              <br />
              รหัสผ่าน: password123
            </Typography>
          </Box>

          {/* Footer */}
          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mt: 3 }}>
            © 2025 GACP Certificate Portal
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
