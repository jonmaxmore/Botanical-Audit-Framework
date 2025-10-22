'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { withAuth } from '@/contexts/AuthContext';
import { useApplication } from '@/contexts/ApplicationContext';

// Form steps
const steps = ['ข้อมูลฟาร์ม', 'ข้อมูลเกษตรกร', 'ยืนยันข้อมูล'];

// Province list (sample)
const provinces = [
  'กรุงเทพมหานคร',
  'เชียงใหม่',
  'เชียงราย',
  'น่าน',
  'พะเยา',
  'แพร่',
  'แม่ฮ่องสอน',
  'ลำปาง',
  'ลำพูน',
  'อุตรดิตถ์',
];

// Crop types
const cropTypes = [
  'กัญชา (Cannabis)',
  'กัญชง (Hemp)',
  'พืชสมุนไพรอื่นๆ',
];

interface FormData {
  // Farm Information
  farmName: string;
  farmSize: string;
  farmAddress: string;
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  cropType: string;
  estimatedYield: string;
  
  // Farmer Information
  farmerName: string;
  idCardNumber: string;
  phone: string;
  email: string;
  experience: string;
  previousCertification: string;
  
  // Additional
  remarks: string;
}

const NewApplicationPage = () => {
  const router = useRouter();
  const { createApplication } = useApplication();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    farmName: '',
    farmSize: '',
    farmAddress: '',
    province: '',
    district: '',
    subDistrict: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    cropType: '',
    estimatedYield: '',
    farmerName: '',
    idCardNumber: '',
    phone: '',
    email: '',
    experience: '',
    previousCertification: 'no',
    remarks: '',
  });

  const handleChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
    setError('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Farm Information
        if (!formData.farmName.trim()) {
          setError('กรุณากรอกชื่อฟาร์ม');
          return false;
        }
        if (!formData.farmSize || parseFloat(formData.farmSize) <= 0) {
          setError('กรุณากรอกพื้นที่ฟาร์ม (ไร่)');
          return false;
        }
        if (!formData.farmAddress.trim()) {
          setError('กรุณากรอกที่อยู่ฟาร์ม');
          return false;
        }
        if (!formData.province) {
          setError('กรุณาเลือกจังหวัด');
          return false;
        }
        if (!formData.cropType) {
          setError('กรุณาเลือกประเภทพืชที่ปลูก');
          return false;
        }
        break;
        
      case 1: // Farmer Information
        if (!formData.farmerName.trim()) {
          setError('กรุณากรอกชื่อ-นามสกุล');
          return false;
        }
        if (!formData.idCardNumber || formData.idCardNumber.length !== 13) {
          setError('กรุณากรอกเลขบัตรประชาชน 13 หลัก');
          return false;
        }
        if (!formData.phone || formData.phone.length !== 10) {
          setError('กรุณากรอกเบอร์โทรศัพท์ 10 หลัก');
          return false;
        }
        if (!formData.email.includes('@')) {
          setError('กรุณากรอกอีเมลที่ถูกต้อง');
          return false;
        }
        if (!formData.experience || parseInt(formData.experience) < 0) {
          setError('กรุณากรอกจำนวนปีที่มีประสบการณ์');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Create application as DRAFT
      const result = await createApplication({
        ...formData,
        status: 'DRAFT',
      });
      
      setSuccess('บันทึกแบบร่างสำเร็จ! กำลังกลับไปหน้า Dashboard...');
      
      setTimeout(() => {
        router.push('/farmer/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถบันทึกแบบร่างได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Create and submit application
      const result = await createApplication({
        ...formData,
        status: 'SUBMITTED',
      });
      
      setSuccess('ยื่นคำขอสำเร็จ! กำลังกลับไปหน้า Dashboard...');
      
      setTimeout(() => {
        router.push('/farmer/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถยื่นคำขอได้');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                ข้อมูลฟาร์ม
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="ชื่อฟาร์ม"
                value={formData.farmName}
                onChange={handleChange('farmName')}
                placeholder="เช่น ฟาร์มกัญชาสวนดอกไม้"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="พื้นที่ฟาร์ม (ไร่)"
                value={formData.farmSize}
                onChange={handleChange('farmSize')}
                placeholder="เช่น 10"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={2}
                label="ที่อยู่ฟาร์ม"
                value={formData.farmAddress}
                onChange={handleChange('farmAddress')}
                placeholder="เช่น 123 หมู่ 5"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="จังหวัด"
                value={formData.province}
                onChange={handleChange('province')}
              >
                {provinces.map((prov) => (
                  <MenuItem key={prov} value={prov}>
                    {prov}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="อำเภอ/เขต"
                value={formData.district}
                onChange={handleChange('district')}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ตำบล/แขวง"
                value={formData.subDistrict}
                onChange={handleChange('subDistrict')}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="รหัสไปรษณีย์"
                value={formData.postalCode}
                onChange={handleChange('postalCode')}
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ละติจูด (Latitude)"
                value={formData.latitude}
                onChange={handleChange('latitude')}
                placeholder="เช่น 18.7883"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ลองจิจูด (Longitude)"
                value={formData.longitude}
                onChange={handleChange('longitude')}
                placeholder="เช่น 98.9853"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="ประเภทพืชที่ปลูก"
                value={formData.cropType}
                onChange={handleChange('cropType')}
              >
                {cropTypes.map((crop) => (
                  <MenuItem key={crop} value={crop}>
                    {crop}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="ผลผลิตโดยประมาณ (กก./ปี)"
                value={formData.estimatedYield}
                onChange={handleChange('estimatedYield')}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                ข้อมูลเกษตรกร
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="ชื่อ-นามสกุล"
                value={formData.farmerName}
                onChange={handleChange('farmerName')}
                placeholder="เช่น นายสมชาย ใจดี"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="เลขบัตรประชาชน"
                value={formData.idCardNumber}
                onChange={handleChange('idCardNumber')}
                placeholder="13 หลัก"
                inputProps={{ maxLength: 13 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="เบอร์โทรศัพท์"
                value={formData.phone}
                onChange={handleChange('phone')}
                placeholder="08XXXXXXXX"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="email"
                label="อีเมล"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="example@email.com"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="ประสบการณ์การทำเกษตร (ปี)"
                value={formData.experience}
                onChange={handleChange('experience')}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="เคยได้รับการรับรอง GACP มาก่อนหรือไม่"
                value={formData.previousCertification}
                onChange={handleChange('previousCertification')}
              >
                <MenuItem value="no">ไม่เคย</MenuItem>
                <MenuItem value="yes">เคย</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="หมายเหตุ (ถ้ามี)"
                value={formData.remarks}
                onChange={handleChange('remarks')}
                placeholder="ข้อมูลเพิ่มเติมหรือคำถาม"
              />
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                ยืนยันข้อมูล
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    ข้อมูลฟาร์ม
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">ชื่อฟาร์ม:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{formData.farmName}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">พื้นที่:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{formData.farmSize} ไร่</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">ที่อยู่:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{formData.farmAddress}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">จังหวัด:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{formData.province}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">ประเภทพืช:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{formData.cropType}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    ข้อมูลเกษตรกร
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">ชื่อ-นามสกุล:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{formData.farmerName}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">เลขบัตรประชาชน:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{formData.idCardNumber}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">โทรศัพท์:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{formData.phone}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">อีเมล:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{formData.email}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">ประสบการณ์:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{formData.experience} ปี</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info">
                กรุณาตรวจสอบข้อมูลให้ถูกต้อง หลังจากยื่นคำขอแล้ว คุณจะต้องชำระเงินรอบแรก 5,000 บาท
                เพื่อให้เจ้าหน้าที่ตรวจสอบเอกสารต่อไป
              </Alert>
            </Grid>
          </Grid>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            ยื่นคำขอรับรอง GACP
          </Typography>
          <Typography variant="body2" color="text.secondary">
            กรอกข้อมูลฟาร์มและข้อมูลเกษตรกรเพื่อยื่นคำขอรับรอง
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Form Content */}
        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/farmer/dashboard')}
            startIcon={<ArrowBackIcon />}
          >
            ยกเลิก
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep > 0 && (
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={loading}
              >
                ย้อนกลับ
              </Button>
            )}
            
            <Button
              variant="outlined"
              onClick={handleSaveDraft}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              บันทึกแบบร่าง
            </Button>
            
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                endIcon={<ArrowForwardIcon />}
              >
                ถัดไป
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              >
                ยื่นคำขอ
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default withAuth(NewApplicationPage, ['FARMER']);
