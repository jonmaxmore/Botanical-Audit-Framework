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
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
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
  const [openPrivacyModal, setOpenPrivacyModal] = useState(false);
  const [openTermsModal, setOpenTermsModal] = useState(false);
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
    // Checkpoint 1: Registration Consents (GDPR + PDPA)
    acceptPrivacyPolicy: false,
    acceptTermsOfService: false,
    acceptMarketing: false
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
        if (!formData.acceptPrivacyPolicy || !formData.acceptTermsOfService) {
          setError('กรุณายอมรับนโยบายความเป็นส่วนตัวและข้อกำหนดการใช้งาน (บังคับ)');
          return false;
        }
        break;
      default:
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
              helperText="กรอกตัวเลข 13 หลัก"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
                inputProps: { maxLength: 13 }
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
                  checked={formData.acceptPrivacyPolicy}
                  onChange={handleCheckboxChange}
                  name="acceptPrivacyPolicy"
                  color="primary"
                  required
                />
              }
              label={
                <Typography variant="body2">
                  ✅ <strong>(บังคับ)</strong> ฉันยอมรับ{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={e => {
                      e.preventDefault();
                      setOpenPrivacyModal(true);
                    }}
                    sx={{ color: 'primary.main', textDecoration: 'underline' }}
                  >
                    นโยบายความเป็นส่วนตัว (Privacy Policy)
                  </Link>
                </Typography>
              }
              sx={{ mt: 2, alignItems: 'flex-start' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.acceptTermsOfService}
                  onChange={handleCheckboxChange}
                  name="acceptTermsOfService"
                  color="primary"
                  required
                />
              }
              label={
                <Typography variant="body2">
                  ✅ <strong>(บังคับ)</strong> ฉันยอมรับ{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={e => {
                      e.preventDefault();
                      setOpenTermsModal(true);
                    }}
                    sx={{ color: 'primary.main', textDecoration: 'underline' }}
                  >
                    ข้อกำหนดและเงื่อนไขการใช้งาน (Terms of Service)
                  </Link>
                </Typography>
              }
              sx={{ mt: 1, alignItems: 'flex-start' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.acceptMarketing}
                  onChange={handleCheckboxChange}
                  name="acceptMarketing"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  📧 <em>(ไม่บังคับ)</em> ฉันยินยอมให้ระบบส่งข่าวสารและโปรโมชั่นทางอีเมล
                </Typography>
              }
              sx={{ mt: 1, alignItems: 'flex-start' }}
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

      {/* Privacy Policy Modal */}
      <Dialog
        open={openPrivacyModal}
        onClose={() => setOpenPrivacyModal(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>
            นโยบายความเป็นส่วนตัว (Privacy Policy)
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" paragraph>
            <strong>ปรับปรุงล่าสุด:</strong> 3 พฤศจิกายน 2025
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            1. ผู้ควบคุมข้อมูลส่วนบุคคล
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>ชื่อองค์กร:</strong> ระบบตรวจสอบและรับรองมาตรฐาน GACP
            <br />
            <strong>อีเมล:</strong> privacy@gacp-system.com
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            2. ข้อมูลที่เราเก็บรวบรวม
          </Typography>
          <Typography variant="body2" paragraph>
            เราเก็บรวบรวมข้อมูลส่วนบุคคลดังนี้:
            <br />
            ✅ ข้อมูลบัญชี: ชื่อ-นามสกุล, อีเมล, เบอร์โทร, เลขบัตรประชาชน
            <br />
            ✅ ข้อมูลฟาร์ม: ชื่อฟาร์ม, ที่อยู่, พิกัด GPS, ขนาดพื้นที่
            <br />
            ✅ เอกสารประกอบ: สำเนาบัตรประชาชน, รูปภาพฟาร์ม, ผลการทดสอบ
            <br />✅ Audit Logs: บันทึกการใช้งานระบบ (IP Address, Timestamp)
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            3. วัตถุประสงค์
          </Typography>
          <Typography variant="body2" paragraph>
            เราเก็บข้อมูลเพื่อ:
            <br />
            ✅ ให้บริการระบบตรวจสอบและรับรอง GACP
            <br />
            ✅ ส่งข้อมูลให้ DTAM (กรมแพทย์แผนไทย) เพื่อตรวจสอบ
            <br />
            ✅ ปฏิบัติตามกฎหมาย PDPA และมาตรฐาน GMP
            <br />✅ เก็บข้อมูลไว้ 5 ปี ตามกฎหมาย GMP Annex 11
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            4. การแชร์ข้อมูล
          </Typography>
          <Typography variant="body2" paragraph>
            เราจะแชร์ข้อมูลกับ:
            <br />
            ✅ กรมแพทย์แผนไทย (DTAM) - เพื่อตรวจสอบ GACP
            <br />
            ✅ ห้องปฏิบัติการที่ได้รับรอง - เพื่อรับผลทดสอบ
            <br />
            ✅ MongoDB Atlas, AWS S3 - เก็บข้อมูล (มีการเข้ารหัส)
            <br />
            <br />
            ❌ เราจะไม่แชร์กับบริษัทโฆษณา (Google Ads, Facebook Ads)
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            5. ระยะเวลาเก็บข้อมูล
          </Typography>
          <Typography variant="body2" paragraph>
            เราเก็บข้อมูลไว้ <strong>5 ปี</strong> ตามกฎหมาย GMP Annex 11
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            6. สิทธิของท่าน (PDPA)
          </Typography>
          <Typography variant="body2" paragraph>
            ท่านมีสิทธิ:
            <br />
            ✅ เข้าถึงข้อมูล (Download My Data)
            <br />
            ✅ แก้ไขข้อมูล (Edit Profile)
            <br />
            ✅ ถอนความยินยอม (Privacy Settings)
            <br />
            ⚠️ ไม่สามารถลบข้อมูลได้ทันที (ต้องเก็บ 5 ปีตามกฎหมาย)
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            7. มาตรการรักษาความปลอดภัย
          </Typography>
          <Typography variant="body2" paragraph>
            ✅ HTTPS/TLS 1.3 - เข้ารหัสการสื่อสาร
            <br />
            ✅ bcrypt - เข้ารหัสรหัสผ่าน
            <br />
            ✅ JWT Token - Authentication
            <br />✅ Audit Logs - บันทึกทุกการเปลี่ยนแปลง
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            8. ติดต่อเรา
          </Typography>
          <Typography variant="body2">
            <strong>Email:</strong> privacy@gacp-system.com
            <br />
            <strong>DPO:</strong> dpo@gacp-system.com
          </Typography>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              📖 <strong>เอกสารฉบับเต็ม:</strong> สามารถดูได้ที่{' '}
              <Link href="/docs/privacy-policy" target="_blank">
                /docs/privacy-policy
              </Link>
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrivacyModal(false)} variant="contained">
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Terms of Service Modal */}
      <Dialog
        open={openTermsModal}
        onClose={() => setOpenTermsModal(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>
            ข้อกำหนดและเงื่อนไขการใช้งาน (Terms of Service)
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" paragraph>
            <strong>ปรับปรุงล่าสุด:</strong> 3 พฤศจิกายน 2025
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            1. การยอมรับข้อกำหนด
          </Typography>
          <Typography variant="body2" paragraph>
            เมื่อท่านลงทะเบียน ท่านยอมรับข้อกำหนดนี้ทั้งหมด
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            2. การใช้งานระบบ
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>ท่านสามารถ:</strong>
            <br />
            ✅ ลงทะเบียนฟาร์มและยื่นขอรับรอง GACP
            <br />
            ✅ บันทึกข้อมูลการเก็บเกี่ยว (Harvest Records)
            <br />
            ✅ อัปโหลดเอกสารประกอบ
            <br />
            ✅ ติดตามสถานะคำขอ
            <br />
            <br />
            <strong>ห้าม:</strong>
            <br />
            ❌ ให้ข้อมูลเท็จหรือปลอมแปลงเอกสาร
            <br />
            ❌ Scraping หรือ Reverse Engineering
            <br />
            ❌ แชร์บัญชีให้ผู้อื่น
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            3. ความรับผิดชอบของผู้ใช้
          </Typography>
          <Typography variant="body2" paragraph>
            ✅ ให้ข้อมูลที่ถูกต้องและครบถ้วน
            <br />
            ✅ รักษารหัสผ่านไม่ให้รั่วไหล
            <br />
            ✅ อัปเดตข้อมูลให้เป็นปัจจุบัน
            <br />
            ⚠️ หากให้ข้อมูลเท็จ อาจถูกแบนบัญชีและมีความผิดตามกฎหมาย
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            4. ค่าธรรมเนียม
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>ค่ายื่นคำขอ:</strong> 5,000 บาท
            <br />
            <strong>ค่าตรวจสอบภาคสนาม:</strong> 25,000 บาท
            <br />
            <strong>รวม:</strong> 30,000 บาท
            <br />
            <br />
            ⚠️ ชำระหลังยื่นคำขอและ DTAM ยืนยันรับเรื่อง
            <br />
            ⚠️ ค่าธรรมเนียมไม่สามารถคืนได้
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            5. สิ่งที่เราไม่รับผิดชอบ
          </Typography>
          <Typography variant="body2" paragraph>
            ❌ การตัดสินของ DTAM (Approve/Reject)
            <br />
            ❌ ความล่าช้าในการตรวจสอบ (90-180 วัน)
            <br />
            ❌ ค่าใช้จ่ายเพิ่มเติมจาก DTAM
            <br />❌ ความเสียหายจากการใช้งานผิดวิธี
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            6. การแบนบัญชี
          </Typography>
          <Typography variant="body2" paragraph>
            เราสามารถแบนบัญชีได้หาก:
            <br />
            ❌ ให้ข้อมูลเท็จ
            <br />
            ❌ ละเมิดข้อกำหนด
            <br />
            ❌ พยายาม hack ระบบ
            <br />❌ ไม่ชำระค่าธรรมเนียม
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            7. การยกเลิกบัญชี
          </Typography>
          <Typography variant="body2" paragraph>
            ✅ ท่านสามารถยกเลิกบัญชีได้ทุกเมื่อ
            <br />
            ⚠️ แต่ข้อมูลจะยังคงเก็บไว้ 5 ปีตามกฎหมาย
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            8. กฎหมายที่ใช้บังคับ
          </Typography>
          <Typography variant="body2" paragraph>
            ✅ กฎหมายไทย
            <br />
            ✅ พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
            <br />✅ ข้อพิพาทระงับโดยศาลในประเทศไทย
          </Typography>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              📖 <strong>เอกสารฉบับเต็ม:</strong> สามารถดูได้ที่{' '}
              <Link href="/docs/terms-of-service" target="_blank">
                /docs/terms-of-service
              </Link>
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTermsModal(false)} variant="contained">
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
