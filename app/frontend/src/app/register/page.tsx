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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phoneNumber: '',
    role: 'FARMER' as UserRole,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.name) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return false;
    }

    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phoneNumber: formData.phoneNumber || undefined,
        role: formData.role,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สมัครสมาชิกไม่สำเร็จ');
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'FARMER':
        return 'เกษตรกร';
      case 'DTAM_OFFICER':
        return 'เจ้าหน้าที่ DTAM';
      case 'INSPECTOR':
        return 'ผู้ตรวจสอบ';
      case 'ADMIN':
        return 'ผู้ดูแลระบบ';
      default:
        return role;
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
        }}
      >
        <Container maxWidth="sm">
          <Paper elevation={6} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={600} color="success.main" gutterBottom>
              ✅ สมัครสมาชิกสำเร็จ!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              ระบบกำลังนำคุณไปยังหน้า Dashboard...
            </Typography>
            <CircularProgress />
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 4,
        background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <PersonAdd sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={600} gutterBottom>
              สมัครสมาชิก
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
            <FormControl fullWidth margin="normal">
              <InputLabel>ประเภทผู้ใช้</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange as any}
                label="ประเภทผู้ใช้"
              >
                <MenuItem value="FARMER">เกษตรกร (Farmer)</MenuItem>
                <MenuItem value="DTAM_OFFICER">เจ้าหน้าที่ DTAM (Officer)</MenuItem>
                <MenuItem value="INSPECTOR">ผู้ตรวจสอบ (Inspector)</MenuItem>
                <MenuItem value="ADMIN">ผู้ดูแลระบบ (Admin)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="ชื่อ-นามสกุล"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
            />

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
            />

            <TextField
              fullWidth
              label="เบอร์โทรศัพท์"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              margin="normal"
              placeholder="0812345678"
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
              autoComplete="new-password"
              helperText="รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
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

            <TextField
              fullWidth
              label="ยืนยันรหัสผ่าน"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              disabled={isLoading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'สมัครสมาชิก'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              มีบัญชีอยู่แล้ว?{' '}
              <MuiLink component={Link} href="/login" sx={{ fontWeight: 600, cursor: 'pointer' }}>
                เข้าสู่ระบบ
              </MuiLink>
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant="text" onClick={() => router.push('/')} sx={{ textTransform: 'none' }}>
              ← กลับหน้าหลัก
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
