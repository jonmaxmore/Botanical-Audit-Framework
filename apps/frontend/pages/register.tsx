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
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd,
  Lock,
  Email,
  Phone,
  Person,
  Home,
  Business,
  Map
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';

const steps = ['ข้อมูลบัญชี', 'ข้อมูลส่วนตัว', 'ข้อมูลฟาร์ม'];

export default function RegisterPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Step 1: Account Info
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Personal Info
    firstName: '',
    lastName: '',
    idCard: '',
    phone: '',
    // Step 3: Farm Info
    farmName: '',
    farmAddress: '',
    province: '',
    district: '',
    subDistrict: '',
    zipCode: '',
    farmSize: '',
    acceptTerms: false
  });

  const provinces = [
    'เชียงใหม่',
    'เชียงราย',
    'ลำปาง',
    'แม่ฮ่องสอน',
    'น่าน',
    'พะเยา',
    'แพร่',
    'อุตรดิตถ์',
    'กรุงเทพมหานคร'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setError('กรุณากรอกข้อมูลให้ครบถ้วน');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('รหัสผ่านไม่ตรงกัน');
          return false;
        }
        if (formData.password.length < 8) {
          setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
          return false;
        }
        break;
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.idCard || !formData.phone) {
          setError('กรุณากรอกข้อมูลให้ครบถ้วน');
          return false;
        }
        if (formData.idCard.length !== 13) {
          setError('เลขบัตรประชาชนต้องมี 13 หลัก');
          return false;
        }
        break;
      case 2:
        if (
          !formData.farmName ||
          !formData.farmAddress ||
          !formData.province ||
          !formData.farmSize
        ) {
          setError('กรุณากรอกข้อมูลให้ครบถ้วน');
          return false;
        }
        if (!formData.acceptTerms) {
          setError('กรุณายอมรับข้อกำหนดและเงื่อนไข');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    setError('');

    try {
      // Try API call
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          idCard: formData.idCard,
          phone: formData.phone,
          farmName: formData.farmName,
          farmAddress: formData.farmAddress,
          province: formData.province,
          district: formData.district,
          subDistrict: formData.subDistrict,
          zipCode: formData.zipCode,
          farmSize: parseFloat(formData.farmSize)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      }

      // Redirect to login with success message
      router.push('/login?registered=true');
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setError(
          '⚠️ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาเริ่มเซิร์ฟเวอร์ backend หรือใช้บัญชีทดสอบที่มีอยู่แล้วเพื่อเข้าสู่ระบบ'
        );
      } else {
        setError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              ข้อมูลบัญชี
            </Typography>
            <TextField
              fullWidth
              label="อีเมล"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="รหัสผ่าน"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              helperText="รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="ยืนยันรหัสผ่าน"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              ข้อมูลส่วนตัว
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ชื่อ"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="นามสกุล"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="เลขบัตรประชาชน"
              name="idCard"
              value={formData.idCard}
              onChange={handleChange}
              required
              margin="normal"
              inputProps={{ maxLength: 13 }}
              helperText="กรอกตัวเลข 13 หลัก"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="เบอร์โทรศัพท์"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              ข้อมูลฟาร์ม
            </Typography>
            <TextField
              fullWidth
              label="ชื่อฟาร์ม"
              name="farmName"
              value={formData.farmName}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business color="action" />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="ที่อยู่ฟาร์ม"
              name="farmAddress"
              value={formData.farmAddress}
              onChange={handleChange}
              required
              margin="normal"
              multiline
              rows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home color="action" />
                  </InputAdornment>
                )
              }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="จังหวัด"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Map color="action" />
                      </InputAdornment>
                    )
                  }}
                >
                  {provinces.map(province => (
                    <MenuItem key={province} value={province}>
                      {province}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="อำเภอ"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ตำบล"
                  name="subDistrict"
                  value={formData.subDistrict}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="รหัสไปรษณีย์"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  margin="normal"
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="ขนาดพื้นที่ (ไร่)"
              name="farmSize"
              type="number"
              value={formData.farmSize}
              onChange={handleChange}
              required
              margin="normal"
              inputProps={{ min: 0, step: 0.01 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.acceptTerms}
                  onChange={handleCheckboxChange}
                  name="acceptTerms"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  ฉันยอมรับ{' '}
                  <Link href="/terms" target="_blank" sx={{ color: 'primary.main' }}>
                    ข้อกำหนดและเงื่อนไข
                  </Link>{' '}
                  และ{' '}
                  <Link href="/privacy" target="_blank" sx={{ color: 'primary.main' }}>
                    นโยบายความเป็นส่วนตัว
                  </Link>
                </Typography>
              }
              sx={{ mt: 2 }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>ลงทะเบียนเกษตรกร - ระบบตรวจสอบและรับรอง GACP</title>
        <meta name="description" content="ลงทะเบียนเข้าใช้งานระบบตรวจสอบและรับรองมาตรฐาน GACP" />
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          py: 4
        }}
      >
        <Container maxWidth="md">
          <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
            {/* Header */}
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
                  color: 'white'
                }}
              >
                <PersonAdd sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                ลงทะเบียนเกษตรกร
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ลงทะเบียนเข้าใช้งานระบบตรวจสอบและรับรองมาตรฐาน GACP
              </Typography>
            </Box>

            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map(label => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Form Content */}
            {renderStepContent(activeStep)}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                size="large"
                sx={{ minWidth: 120 }}
              >
                ย้อนกลับ
              </Button>
              <Button
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {activeStep === steps.length - 1
                  ? loading
                    ? 'กำลังลงทะเบียน...'
                    : 'ลงทะเบียน'
                  : 'ถัดไป'}
              </Button>
            </Box>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                มีบัญชีอยู่แล้ว?{' '}
                <Link
                  href="/login"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  เข้าสู่ระบบ
                </Link>
              </Typography>
            </Box>
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
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
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
