import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  Divider,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { LocalFlorist as LocalFloristIcon, Login as LoginIcon } from '@mui/icons-material';
import { UserRole } from '../types/user.types';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { role: urlRole, expired } = router.query;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>((urlRole as UserRole) || '');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { login, user, loading, error: authError } = useAuth();

  useEffect(() => {
    // ถ้าผู้ใช้ login อยู่แล้ว ให้ redirect ไปยังหน้าที่เหมาะสม
    if (user) {
      redirectToDashboard(user.role);
    }

    // แสดงข้อความว่าเซสชั่นหมดอายุ ถ้ามีการ redirect มาจากกรณีเซสชั่นหมดอายุ
    if (expired === 'true') {
      setError('เซสชั่นของคุณหมดอายุ กรุณาเข้าสู่ระบบใหม่');
    }
  }, [user, expired]);

  const redirectToDashboard = (role: UserRole) => {
    switch (role) {
    case UserRole.FARMER:
      router.push('/farmer/dashboard');
      break;
    case UserRole.DOCUMENT_CHECKER:
      router.push('/document-checker/dashboard');
      break;
    case UserRole.INSPECTOR:
      router.push('/inspector/dashboard');
      break;
    case UserRole.APPROVER:
      router.push('/approver/dashboard');
      break;
    case UserRole.ADMIN:
      router.push('/admin/dashboard');
      break;
    }
  };

  const handleLogin = async(e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);

    try {
      // เรียกใช้ login จาก context
      const success = await login(username, password);

      if (success) {
        // login สำเร็จ user จะถูกอัพเดทใน context และจะมีการ redirect จาก useEffect
      } else {
        // login ไม่สำเร็จ
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const roleLabels = {
    [UserRole.FARMER]: 'เกษตรกร',
    [UserRole.DOCUMENT_CHECKER]: 'ผู้ตรวจสอบเอกสาร',
    [UserRole.INSPECTOR]: 'ผู้ตรวจประเมิน',
    [UserRole.APPROVER]: 'ผู้อนุมัติ',
    [UserRole.ADMIN]: 'ผู้ดูแลระบบ'
  };

  const demoCredentials = [
    {
      role: UserRole.FARMER,
      username: 'somchai.farmer',
      password: 'password123',
      name: 'สมชาย ใจดี'
    },
    {
      role: UserRole.DOCUMENT_CHECKER,
      username: 'surapong.doc',
      password: 'password123',
      name: 'สุรพงษ์ ตรวจสอบ'
    },
    {
      role: UserRole.INSPECTOR,
      username: 'wichai.inspect',
      password: 'password123',
      name: 'วิชัย ประเมินผล'
    },
    {
      role: UserRole.APPROVER,
      username: 'somkid.approve',
      password: 'password123',
      name: 'สมคิด อนุมัติ'
    },
    { role: UserRole.ADMIN, username: 'admin', password: 'password123', name: 'ผู้ดูแลระบบ' }
  ];

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>เข้าสู่ระบบ | GACP Botanical Audit Framework</title>
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #43a047 100%)',
          display: 'flex',
          alignItems: 'center',
          py: 4
        }}
      >
        <Container maxWidth="md">
          <Paper elevation={10} sx={{ p: 4, borderRadius: 2 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LocalFloristIcon sx={{ fontSize: 60, color: '#2e7d32', mb: 2 }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#2e7d32' }}>
                เข้าสู่ระบบ
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ระบบตรวจสอบและรับรองมาตรฐาน GACP
              </Typography>
            </Box>

            {(error || authError) && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error || authError}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>บทบาท</InputLabel>
                  <Select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value as UserRole)}
                    label="บทบาท"
                  >
                    <MenuItem value="">-- เลือกบทบาท --</MenuItem>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="ชื่อผู้ใช้"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  fullWidth
                  required
                  autoComplete="username"
                />

                <TextField
                  label="รหัสผ่าน"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  fullWidth
                  required
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={
                    isLoggingIn ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />
                  }
                  fullWidth
                  disabled={isLoggingIn}
                  sx={{
                    backgroundColor: '#2e7d32',
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': { backgroundColor: '#1b5e20' }
                  }}
                >
                  {isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 3 }} />

            {/* Demo Credentials */}
            <Card variant="outlined" sx={{ backgroundColor: '#f5f5f5' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  ข้อมูลสำหรับทดสอบระบบ:
                </Typography>
                {demoCredentials.map((cred, index) => (
                  <Box key={index} sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                      {roleLabels[cred.role]} ({cred.name})
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: '#666' }}>
                      Username: <strong>{cred.username}</strong> | Password:{' '}
                      <strong>{cred.password}</strong>
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button href="/" variant="text" size="small">
                ← กลับหน้าหลัก
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
