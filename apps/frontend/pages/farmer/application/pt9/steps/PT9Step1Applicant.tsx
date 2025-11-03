/**
 * PT9 Step 1: Applicant Information
 * ข้อมูลผู้ยื่นคำขอ
 */

import React from 'react';
import {
  Box,
  TextField,
  Grid,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Divider,
} from '@mui/material';
import AddressForm, { ThaiAddress } from '@/components/farmer/application/shared/AddressForm';

export interface PT9Applicant {
  type: 'individual' | 'company';
  individual?: {
    firstNameTh: string;
    lastNameTh: string;
    nationalId: string;
    dateOfBirth: string;
  };
  company?: {
    companyNameTh: string;
    companyNameEn?: string;
    registrationNumber: string;
    taxId: string;
    representative: {
      name: string;
      nationalId: string;
      position: string;
    };
  };
  address: ThaiAddress;
  phone: string;
  email: string;
}

interface PT9Step1Props {
  data: PT9Applicant;
  onChange: (data: PT9Applicant) => void;
}

const PT9Step1Applicant: React.FC<PT9Step1Props> = ({ data, onChange }) => {
  const handleTypeChange = (type: 'individual' | 'company') => {
    onChange({
      ...data,
      type,
      individual: type === 'individual' ? {
        firstNameTh: '',
        lastNameTh: '',
        nationalId: '',
        dateOfBirth: '',
      } : undefined,
      company: type === 'company' ? {
        companyNameTh: '',
        registrationNumber: '',
        taxId: '',
        representative: {
          name: '',
          nationalId: '',
          position: '',
        },
      } : undefined,
    });
  };

  const handleIndividualChange = (field: string, value: string) => {
    onChange({
      ...data,
      individual: {
        ...data.individual!,
        [field]: value,
      },
    });
  };

  const handleCompanyChange = (field: string, value: string) => {
    onChange({
      ...data,
      company: {
        ...data.company!,
        [field]: value,
      },
    });
  };

  const handleRepresentativeChange = (field: string, value: string) => {
    onChange({
      ...data,
      company: {
        ...data.company!,
        representative: {
          ...data.company!.representative,
          [field]: value,
        },
      },
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ข้อมูลผู้ยื่นคำขอ
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        กรุณากรอกข้อมูลผู้ยื่นคำขอให้ครบถ้วน
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Applicant Type */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          ประเภทผู้ยื่นคำขอ <Typography component="span" color="error">*</Typography>
        </Typography>
        <RadioGroup
          row
          value={data.type}
          onChange={(e) => handleTypeChange(e.target.value as 'individual' | 'company')}
        >
          <FormControlLabel
            value="individual"
            control={<Radio />}
            label="บุคคลธรรมดา"
          />
          <FormControlLabel
            value="company"
            control={<Radio />}
            label="นิติบุคคล (บริษัท/ห้างหุ้นส่วน)"
          />
        </RadioGroup>
      </Paper>

      {/* Individual Form */}
      {data.type === 'individual' && data.individual && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            ข้อมูลบุคคลธรรมดา
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ชื่อ (ภาษาไทย)"
                required
                value={data.individual.firstNameTh}
                onChange={(e) => handleIndividualChange('firstNameTh', e.target.value)}
                placeholder="เช่น สมชาย"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="นามสกุล (ภาษาไทย)"
                required
                value={data.individual.lastNameTh}
                onChange={(e) => handleIndividualChange('lastNameTh', e.target.value)}
                placeholder="เช่น ใจดี"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="เลขบัตรประชาชน"
                required
                value={data.individual.nationalId}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                  handleIndividualChange('nationalId', value);
                }}
                placeholder="1234567890123"
                inputProps={{ maxLength: 13 }}
                helperText="13 หลัก"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="วันเกิด"
                type="date"
                required
                value={data.individual.dateOfBirth}
                onChange={(e) => handleIndividualChange('dateOfBirth', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Company Form */}
      {data.type === 'company' && data.company && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            ข้อมูลนิติบุคคล
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ชื่อบริษัท (ภาษาไทย)"
                required
                value={data.company.companyNameTh}
                onChange={(e) => handleCompanyChange('companyNameTh', e.target.value)}
                placeholder="เช่น บริษัท สมุนไพรไทย จำกัด"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ชื่อบริษัท (ภาษาอังกฤษ)"
                value={data.company.companyNameEn || ''}
                onChange={(e) => handleCompanyChange('companyNameEn', e.target.value)}
                placeholder="Thai Herb Co., Ltd."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="เลขทะเบียนนิติบุคคล"
                required
                value={data.company.registrationNumber}
                onChange={(e) => handleCompanyChange('registrationNumber', e.target.value)}
                placeholder="0123456789012"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="เลขประจำตัวผู้เสียภาษี"
                required
                value={data.company.taxId}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                  handleCompanyChange('taxId', value);
                }}
                placeholder="0123456789012"
                inputProps={{ maxLength: 13 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                ผู้มีอำนาจลงนาม
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ชื่อ-นามสกุล"
                required
                value={data.company.representative.name}
                onChange={(e) => handleRepresentativeChange('name', e.target.value)}
                placeholder="เช่น นายสมชาย ใจดี"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="เลขบัตรประชาชน"
                required
                value={data.company.representative.nationalId}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                  handleRepresentativeChange('nationalId', value);
                }}
                placeholder="1234567890123"
                inputProps={{ maxLength: 13 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ตำแหน่ง"
                required
                value={data.company.representative.position}
                onChange={(e) => handleRepresentativeChange('position', e.target.value)}
                placeholder="เช่น กรรมการผู้จัดการ"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Contact Information */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          ข้อมูลติดต่อ
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="เบอร์โทรศัพท์"
              required
              value={data.phone}
              onChange={(e) => onChange({ ...data, phone: e.target.value })}
              placeholder="0812345678"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="อีเมล"
              type="email"
              required
              value={data.email}
              onChange={(e) => onChange({ ...data, email: e.target.value })}
              placeholder="example@email.com"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Address */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <AddressForm
          value={data.address}
          onChange={(address) => onChange({ ...data, address })}
          required
        />
      </Paper>
    </Box>
  );
};

export default PT9Step1Applicant;
