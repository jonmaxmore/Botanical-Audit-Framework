'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  Step,
  Stepper,
  StepLabel,
} from '@mui/material';
import { ArrowBack, Save, Preview } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CertificateFormData } from '@/lib/types/certificate';

const steps = ['Farm Information', 'Inspection Details', 'Review & Submit'];

const provinces = [
  'กรุงเทพมหานคร',
  'ชลบุรี',
  'สมุทรปราการ',
  'เชียงใหม',
  'ตรัง',
  'ภูเก็ต',
  // Add more provinces as needed
];

const cropTypes = [
  'มะม่วง',
  'ทุเรียน',
  'มังคุด',
  'ลำไย',
  'ลิ้นจี่',
  'ผักอินทรีย์',
  'ข้าว',
  'ไม้ดอกไม้ประดับ',
  // Add more crop types
];

export default function NewCertificatePage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CertificateFormData>({
    defaultValues: {
      farmId: '',
      farmName: '',
      farmerName: '',
      farmerNationalId: '',
      address: {
        houseNumber: '',
        village: '',
        subdistrict: '',
        district: '',
        province: '',
        postalCode: '',
      },
      farmArea: 0,
      cropType: '',
      certificationStandard: 'GACP',
      inspectionDate: '',
      inspectorName: '',
      inspectionReport: '',
      notes: '',
    },
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('cert_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleNext = () => {
    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const onSubmit = async (data: CertificateFormData) => {
    setLoading(true);
    try {
      // Submit to API (mock for now)
      console.log('Submitting certificate:', data);
      await new Promise(resolve => setTimeout(resolve, 1500));

      enqueueSnackbar('Certificate created successfully!', { variant: 'success' });
      router.push('/certificates');
    } catch (error) {
      enqueueSnackbar('Failed to create certificate', { variant: 'error' });
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
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Farm Information
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Enter the basic information about the farm and farmer
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="farmId"
                control={control}
                rules={{ required: 'Farm ID is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Farm ID"
                    placeholder="F001"
                    error={!!errors.farmId}
                    helperText={errors.farmId?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="farmName"
                control={control}
                rules={{ required: 'Farm name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Farm Name"
                    placeholder="สวนมะม่วงทองดี"
                    error={!!errors.farmName}
                    helperText={errors.farmName?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="farmerName"
                control={control}
                rules={{ required: 'Farmer name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Farmer Name"
                    placeholder="นายสมชาย ใจดี"
                    error={!!errors.farmerName}
                    helperText={errors.farmerName?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="farmerNationalId"
                control={control}
                rules={{
                  required: 'National ID is required',
                  pattern: {
                    value: /^\d{13}$/,
                    message: 'National ID must be 13 digits',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="National ID"
                    placeholder="1234567890123"
                    error={!!errors.farmerNationalId}
                    helperText={errors.farmerNationalId?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="cropType"
                control={control}
                rules={{ required: 'Crop type is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.cropType}>
                    <InputLabel>Crop Type</InputLabel>
                    <Select {...field} label="Crop Type">
                      {cropTypes.map(crop => (
                        <MenuItem key={crop} value={crop}>
                          {crop}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.cropType && <FormHelperText>{errors.cropType.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="farmArea"
                control={control}
                rules={{
                  required: 'Farm area is required',
                  min: { value: 0.1, message: 'Farm area must be greater than 0' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Farm Area (Rai)"
                    placeholder="15.5"
                    error={!!errors.farmArea}
                    helperText={errors.farmArea?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="certificationStandard"
                control={control}
                rules={{ required: 'Certification standard is required' }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Certification Standard</InputLabel>
                    <Select {...field} label="Certification Standard">
                      <MenuItem value="GACP">GACP</MenuItem>
                      <MenuItem value="GAP">GAP</MenuItem>
                      <MenuItem value="Organic">Organic</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Farm Address
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="address.houseNumber"
                control={control}
                rules={{ required: 'House number is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="House Number"
                    placeholder="123"
                    error={!!errors.address?.houseNumber}
                    helperText={errors.address?.houseNumber?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="address.village"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Village" placeholder="หมู่ 5" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="address.subdistrict"
                control={control}
                rules={{ required: 'Subdistrict is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Subdistrict"
                    placeholder="ทุ่งสุขลา"
                    error={!!errors.address?.subdistrict}
                    helperText={errors.address?.subdistrict?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="address.district"
                control={control}
                rules={{ required: 'District is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="District"
                    placeholder="ศรีราชา"
                    error={!!errors.address?.district}
                    helperText={errors.address?.district?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="address.province"
                control={control}
                rules={{ required: 'Province is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.address?.province}>
                    <InputLabel>Province</InputLabel>
                    <Select {...field} label="Province">
                      {provinces.map(province => (
                        <MenuItem key={province} value={province}>
                          {province}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.address?.province && (
                      <FormHelperText>{errors.address.province.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="address.postalCode"
                control={control}
                rules={{
                  required: 'Postal code is required',
                  pattern: {
                    value: /^\d{5}$/,
                    message: 'Postal code must be 5 digits',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Postal Code"
                    placeholder="20230"
                    error={!!errors.address?.postalCode}
                    helperText={errors.address?.postalCode?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Inspection Details
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Enter inspection information and results
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="inspectionDate"
                control={control}
                rules={{ required: 'Inspection date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Inspection Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.inspectionDate}
                    helperText={errors.inspectionDate?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="inspectorName"
                control={control}
                rules={{ required: 'Inspector name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Inspector Name"
                    placeholder="นางสาวสมหญิง ตรวจสอบ"
                    error={!!errors.inspectorName}
                    helperText={errors.inspectorName?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="inspectionReport"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={6}
                    label="Inspection Report"
                    placeholder="Enter detailed inspection report..."
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Additional Notes"
                    placeholder="Enter any additional notes or remarks..."
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 2:
        const formData = watch();
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Review & Submit
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Please review all information before submitting
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Once submitted, a certificate will be created with status "Pending" for approval.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Farm Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Farm ID
                      </Typography>
                      <Typography variant="body2">{formData.farmId}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Farm Name
                      </Typography>
                      <Typography variant="body2">{formData.farmName}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Farmer Name
                      </Typography>
                      <Typography variant="body2">{formData.farmerName}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        National ID
                      </Typography>
                      <Typography variant="body2">{formData.farmerNationalId}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Crop Type
                      </Typography>
                      <Typography variant="body2">{formData.cropType}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Farm Area
                      </Typography>
                      <Typography variant="body2">{formData.farmArea} ไร่</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body2">
                        {formData.address.houseNumber} {formData.address.village} ต.
                        {formData.address.subdistrict} อ.{formData.address.district} จ.
                        {formData.address.province} {formData.address.postalCode}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Inspection Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Inspection Date
                      </Typography>
                      <Typography variant="body2">{formData.inspectionDate}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Inspector Name
                      </Typography>
                      <Typography variant="body2">{formData.inspectorName}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Certification Standard
                      </Typography>
                      <Typography variant="body2">{formData.certificationStandard}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => router.push('/certificates')}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                New Certificate
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a new GACP certificate
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stepper */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stepper activeStep={activeStep}>
              {steps.map(label => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {renderStepContent(activeStep)}

              <Box display="flex" justifyContent="space-between" mt={4}>
                <Button disabled={activeStep === 0} onClick={handleBack}>
                  Back
                </Button>
                <Box display="flex" gap={2}>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Save />}
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Certificate'}
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={handleNext}>
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
