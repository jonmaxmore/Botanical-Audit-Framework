'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Link as MuiLink,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  const handleDemoLogin = async (role: 'FARMER' | 'DTAM_OFFICER' | 'INSPECTOR' | 'ADMIN') => {
    const demoAccounts = {
      FARMER: { email: 'farmer@gacp.th', password: 'demo1234' },
      DTAM_OFFICER: { email: 'officer@gacp.th', password: 'demo1234' },
      INSPECTOR: { email: 'inspector@gacp.th', password: 'demo1234' },
      ADMIN: { email: 'admin@gacp.th', password: 'demo1234' }
    };

    try {
      await login(demoAccounts[role]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)'
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={600} gutterBottom>
              เข้าสู่ระบบ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ระบบรับรองมาตรฐาน GACP
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="อีเมล"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
            />

            <TextField
              fullWidth
              label="รหัสผ่าน"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              ยังไม่มีบัญชี?{' '}
              <MuiLink
                component={Link}
                href="/register"
                sx={{ fontWeight: 600, cursor: 'pointer' }}
              >
                สมัครสมาชิก
              </MuiLink>
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block', textAlign: 'center' }}>
              🎮 สำหรับทดสอบ (Demo Accounts):
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDemoLogin('FARMER')}
                disabled={isLoading}
              >
                เกษตรกร (Farmer)
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDemoLogin('DTAM_OFFICER')}
                disabled={isLoading}
              >
                เจ้าหน้าที่ DTAM (Officer)
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDemoLogin('INSPECTOR')}
                disabled={isLoading}
              >
                ผู้ตรวจสอบ (Inspector)
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDemoLogin('ADMIN')}
                disabled={isLoading}
              >
                ผู้ดูแลระบบ (Admin)
              </Button>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="text"
              onClick={() => router.push('/')}
              sx={{ textTransform: 'none' }}
            >
              ← กลับหน้าหลัก
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
