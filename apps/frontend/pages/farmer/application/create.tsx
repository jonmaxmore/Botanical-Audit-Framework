/**
 * Create Application Page
 * Farmer application creation form for GACP certification
 * Production-ready with validation and error handling
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Paper,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Agriculture as AgricultureIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Send as SendIcon
} from '@mui/icons-material';

// Types
interface FarmerData {
  fullName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  address: string;
  province: string;
  district: string;
  subdistrict: string;
  postalCode: string;
}

interface FarmData {
  farmName: string;
  farmAddress: string;
  farmProvince: string;
  farmDistrict: string;
  farmSubdistrict: string;
  farmPostalCode: string;
  farmSize: string;
  farmSizeUnit: string;
  cultivationType: string;
  cropType: string;
  latitude: string;
  longitude: string;
}

const steps = ['ข้อมูลเกษตรกร', 'ข้อมูลฟาร์ม', 'ตรวจสอบข้อมูล'];

const provinces = [
  'กรุงเทพมหานคร',
  'เชียงใหม่',
  'เชียงราย',
  'ลำปาง',
  'น่าน',
  'พะเยา',
  'แพร่',
  'แม่ฮ่องสอน',
  'ลำพูน'
  // เพิ่มจังหวัดอื่นๆ ตามต้องการ
];

const cultivationTypes = [
  { value: 'OUTDOOR', label: 'กลางแจ้ง (Outdoor)' },
  { value: 'INDOOR', label: 'ในโรงเรือน (Indoor)' },
  { value: 'GREENHOUSE', label: 'โรงเรือนเกษตร (Greenhouse)' },
  { value: 'MIXED', label: 'แบบผสม (Mixed)' }
];

const cropTypes = [
  'กัญชา (Cannabis)',
  'กัญชง (Hemp)',
  'ฟ้าทะลายโจร',
  'ขมิ้นชัน',
  'ว่านหางจระเข้',
  'มะรุม',
  'อื่นๆ'
];

export default function CreateApplicationPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [farmerData, setFarmerData] = useState<FarmerData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    nationalId: '',
    address: '',
    province: '',
    district: '',
    subdistrict: '',
    postalCode: ''
  });

  const [farmData, setFarmData] = useState<FarmData>({
    farmName: '',
    farmAddress: '',
    farmProvince: '',
    farmDistrict: '',
    farmSubdistrict: '',
    farmPostalCode: '',
    farmSize: '',
    farmSizeUnit: 'ไร่',
    cultivationType: '',
    cropType: '',
    latitude: '',
    longitude: ''
  });

  // Load user data on mount
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/login?role=farmer');
      return;
    }

    const user = JSON.parse(userStr);
    setFarmerData({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      nationalId: user.nationalId || '',
      address: user.address || '',
      province: user.province || '',
      district: user.district || '',
      subdistrict: user.subdistrict || '',
      postalCode: user.postalCode || ''
    });
  }, [router]);

  const handleNext = () => {
    // Validate current step
    if (activeStep === 0 && !validateFarmerData()) {
      setError('กรุณากรอกข้อมูลเกษตรกรให้ครบถ้วน');
      return;
    }
    if (activeStep === 1 && !validateFarmData()) {
      setError('กรุณากรอกข้อมูลฟาร์มให้ครบถ้วน');
      return;
    }

    setError('');
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const validateFarmerData = (): boolean => {
    return !!(
      farmerData.fullName &&
      farmerData.email &&
      farmerData.phoneNumber &&
      farmerData.nationalId &&
      farmerData.address &&
      farmerData.province
    );
  };

  const validateFarmData = (): boolean => {
    return !!(
      farmData.farmName &&
      farmData.farmAddress &&
      farmData.farmProvince &&
      farmData.farmSize &&
      farmData.cultivationType &&
      farmData.cropType
    );
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          farmer: farmerData,
          farm: farmData,
          status: 'DRAFT'
        })
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถบันทึกแบบร่างได้');
      }

      const data = await response.json();
      setSuccess('บันทึกแบบร่างสำเร็จ');

      setTimeout(() => {
        router.push('/farmer/applications');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          farmer: farmerData,
          farm: farmData,
          status: 'SUBMITTED'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ไม่สามารถส่งคำขอได้');
      }

      const data = await response.json();
      setSuccess('ส่งคำขอสำเร็จ! กำลังเปลี่ยนหน้า...');

      setTimeout(() => {
        router.push('/farmer/applications');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการส่งคำขอ');
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="ชื่อ-นามสกุล"
                value={farmerData.fullName}
                onChange={e => setFarmerData({ ...farmerData, fullName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="เลขบัตรประชาชน"
                value={farmerData.nationalId}
                onChange={e => setFarmerData({ ...farmerData, nationalId: e.target.value })}
                inputProps={{ maxLength: 13 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="email"
                label="อีเมล"
                value={farmerData.email}
                onChange={e => setFarmerData({ ...farmerData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="เบอร์โทรศัพท์"
                value={farmerData.phoneNumber}
                onChange={e => setFarmerData({ ...farmerData, phoneNumber: e.target.value })}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={2}
                label="ที่อยู่"
                value={farmerData.address}
                onChange={e => setFarmerData({ ...farmerData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="จังหวัด"
                value={farmerData.province}
                onChange={e => setFarmerData({ ...farmerData, province: e.target.value })}
              >
                {provinces.map(province => (
                  <MenuItem key={province} value={province}>
                    {province}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="อำเภอ/เขต"
                value={farmerData.district}
                onChange={e => setFarmerData({ ...farmerData, district: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ตำบล/แขวง"
                value={farmerData.subdistrict}
                onChange={e => setFarmerData({ ...farmerData, subdistrict: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="รหัสไปรษณีย์"
                value={farmerData.postalCode}
                onChange={e => setFarmerData({ ...farmerData, postalCode: e.target.value })}
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="ชื่อฟาร์ม"
                value={farmData.farmName}
                onChange={e => setFarmData({ ...farmData, farmName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="ประเภทการปลูก"
                value={farmData.cultivationType}
                onChange={e => setFarmData({ ...farmData, cultivationType: e.target.value })}
              >
                {cultivationTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={2}
                label="ที่อยู่ฟาร์ม"
                value={farmData.farmAddress}
                onChange={e => setFarmData({ ...farmData, farmAddress: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="จังหวัด"
                value={farmData.farmProvince}
                onChange={e => setFarmData({ ...farmData, farmProvince: e.target.value })}
              >
                {provinces.map(province => (
                  <MenuItem key={province} value={province}>
                    {province}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="อำเภอ/เขต"
                value={farmData.farmDistrict}
                onChange={e => setFarmData({ ...farmData, farmDistrict: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ตำบล/แขวง"
                value={farmData.farmSubdistrict}
                onChange={e => setFarmData({ ...farmData, farmSubdistrict: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="รหัสไปรษณีย์"
                value={farmData.farmPostalCode}
                onChange={e => setFarmData({ ...farmData, farmPostalCode: e.target.value })}
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                type="number"
                label="ขนาดพื้นที่"
                value={farmData.farmSize}
                onChange={e => setFarmData({ ...farmData, farmSize: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="หน่วย"
                value={farmData.farmSizeUnit}
                onChange={e => setFarmData({ ...farmData, farmSizeUnit: e.target.value })}
              >
                <MenuItem value="ไร่">ไร่</MenuItem>
                <MenuItem value="งาน">งาน</MenuItem>
                <MenuItem value="ตารางวา">ตารางวา</MenuItem>
                <MenuItem value="เฮกตาร์">เฮกตาร์</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="ประเภทพืช"
                value={farmData.cropType}
                onChange={e => setFarmData({ ...farmData, cropType: e.target.value })}
              >
                {cropTypes.map(crop => (
                  <MenuItem key={crop} value={crop}>
                    {crop}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ละติจูด (Latitude)"
                value={farmData.latitude}
                onChange={e => setFarmData({ ...farmData, latitude: e.target.value })}
                placeholder="เช่น 18.7883"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ลองจิจูด (Longitude)"
                value={farmData.longitude}
                onChange={e => setFarmData({ ...farmData, longitude: e.target.value })}
                placeholder="เช่น 98.9853"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 600 }}>
              ข้อมูลเกษตรกร
            </Typography>
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    ชื่อ-นามสกุล
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmerData.fullName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    เลขบัตรประชาชน
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmerData.nationalId}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    อีเมล
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmerData.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    เบอร์โทรศัพท์
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmerData.phoneNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    ที่อยู่
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmerData.address} {farmerData.subdistrict} {farmerData.district}{' '}
                    {farmerData.province} {farmerData.postalCode}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 600 }}>
              ข้อมูลฟาร์ม
            </Typography>
            <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    ชื่อฟาร์ม
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmData.farmName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    ประเภทการปลูก
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {cultivationTypes.find(t => t.value === farmData.cultivationType)?.label}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    ที่อยู่ฟาร์ม
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmData.farmAddress} {farmData.farmSubdistrict} {farmData.farmDistrict}{' '}
                    {farmData.farmProvince} {farmData.farmPostalCode}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    ขนาดพื้นที่
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmData.farmSize} {farmData.farmSizeUnit}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    ประเภทพืช
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {farmData.cropType}
                  </Typography>
                </Grid>
                {farmData.latitude && farmData.longitude && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      พิกัด GPS
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {farmData.latitude}, {farmData.longitude}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>สร้างคำขอรับรอง GACP | ระบบเกษตรกร</title>
      </Head>

      <AppBar position="sticky" sx={{ backgroundColor: '#2e7d32' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.push('/farmer/dashboard')}>
            <ArrowBackIcon />
          </IconButton>
          <AgricultureIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            สร้างคำขอรับรอง GACP
          </Typography>
          <IconButton color="inherit">
            <Avatar sx={{ bgcolor: '#1b5e20' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map(label => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Box sx={{ minHeight: 400 }}>{renderStepContent(activeStep)}</Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
                variant="outlined"
              >
                ย้อนกลับ
              </Button>

              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep === steps.length - 1 && (
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveDraft}
                    disabled={loading}
                  >
                    บันทึกแบบร่าง
                  </Button>
                )}

                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                    sx={{ bgcolor: '#2e7d32' }}
                  >
                    {loading ? 'กำลังส่ง...' : 'ส่งคำขอ'}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext} sx={{ bgcolor: '#2e7d32' }}>
                    ถัดไป
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
