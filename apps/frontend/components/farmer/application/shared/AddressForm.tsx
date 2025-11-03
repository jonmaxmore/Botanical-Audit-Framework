/**
 * Thai Address Form Component
 * ฟอร์มกรอกที่อยู่แบบไทย พร้อม Dropdown จังหวัด/อำเภอ/ตำบล
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Grid,
  Typography,
  Autocomplete,
} from '@mui/material';

export interface ThaiAddress {
  addressLine1: string;
  addressLine2?: string;
  subDistrict: string; // ตำบล
  district: string; // อำเภอ
  province: string; // จังหวัด
  postalCode: string;
}

interface AddressFormProps {
  value: ThaiAddress;
  onChange: (address: ThaiAddress) => void;
  required?: boolean;
  error?: Partial<Record<keyof ThaiAddress, boolean>>;
}

// Mock data - ในระบบจริงควรดึงจาก API
const provinces = [
  'กรุงเทพมหานคร',
  'เชียงใหม่',
  'เชียงราย',
  'นครราชสีมา',
  'ขอนแก่น',
  'อุดรธานี',
  'พิษณุโลก',
  'ระยอง',
  'ชลบุรี',
  'สมุทรปราการ',
  'นนทบุรี',
  'ปทุมธานี',
  'สระบุรี',
  'นครปฐม',
  'สุราษฎร์ธานี',
  'ภูเก็ต',
  'สงขลา',
  'นครศรีธรรมราช',
].sort();

const districts: Record<string, string[]> = {
  'กรุงเทพมหานคร': ['บางกอกใหญ่', 'บางกอกน้อย', 'บางรัก', 'ปทุมวัน', 'ป้อมปราบศัตรูพ่าย', 'พระนคร', 'สัมพันธวงศ์', 'บางเขน', 'บางแค', 'ภาษีเจริญ', 'ห้วยขวาง', 'คลองสาน', 'ธนบุรี', 'จตุจักร', 'ลาดพร้าว', 'วัฒนา', 'สาทร', 'ยานนาวา', 'คลองเตย', 'ประเวศ', 'สวนหลวง', 'บางนา', 'พระโขนง'].sort(),
  'เชียงใหม่': ['เมืองเชียงใหม่', 'จอมทอง', 'แม่แจ่ม', 'เชียงดาว', 'ดอยสะเก็ด', 'สันทราย', 'สันกำแพง', 'สันป่าตอง', 'หางดง', 'ฝาง', 'สะเมิง', 'พร้าว', 'แม่วาง', 'แม่ริม', 'แม่ออน'].sort(),
  'เชียงราย': ['เมืองเชียงราย', 'แม่จัน', 'เชียงของ', 'เทิง', 'แม่สาย', 'พาน', 'ป่าแดด', 'แม่ลาว', 'เวียงป่าเป้า', 'เวียงแก่น', 'ขุนตาล', 'พญาเม็งราย', 'เวียงเชียงรุ้ง'].sort(),
};

const subDistricts: Record<string, Record<string, string[]>> = {
  'กรุงเทพมหานคร': {
    'บางกอกใหญ่': ['บ้านช่างหล่อ', 'วัดอรุณ', 'วัดท่าพระ', 'วัดกัลยาณ์'].sort(),
    'บางกอกน้อย': ['บางขุนนนท์', 'ศิริราช', 'บ้านช่างหล่อ', 'อรุณอมรินทร์'].sort(),
    'จตุจักร': ['ลาดยาว', 'เสนานิคม', 'จันทรเกษม', 'จอมพล', 'จตุจักร'].sort(),
  },
  'เชียงใหม่': {
    'เมืองเชียงใหม่': ['ศรีภูมิ', 'พระสิงห์', 'หายยา', 'ช้างม่อย', 'วัดเกต', 'ช้างเผือก', 'ป่าตัน', 'ฟ้าฮ่าม', 'ช้างคลาน', 'วัดประดู่'].sort(),
    'จอมทอง': ['บ้านหลวง', 'ข่วงเปา', 'สบเตี๊ยะ', 'บ้านแปะ', 'ดอยแก้ว'].sort(),
  },
};

const postalCodes: Record<string, Record<string, string>> = {
  'กรุงเทพมหานคร': {
    'บางกอกใหญ่': '10600',
    'บางกอกน้อย': '10700',
    'จตุจักร': '10900',
  },
  'เชียงใหม่': {
    'เมืองเชียงใหม่': '50000',
    'จอมทอง': '50160',
  },
};

const AddressForm: React.FC<AddressFormProps> = ({
  value,
  onChange,
  required = false,
  error = {},
}) => {
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableSubDistricts, setAvailableSubDistricts] = useState<string[]>([]);

  // Update districts when province changes
  useEffect(() => {
    if (value.province) {
      setAvailableDistricts(districts[value.province] || []);
    } else {
      setAvailableDistricts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.province]);

  // Update sub-districts when district changes
  useEffect(() => {
    if (value.province && value.district) {
      setAvailableSubDistricts(
        subDistricts[value.province]?.[value.district] || []
      );
      
      // Auto-fill postal code
      const code = postalCodes[value.province]?.[value.district];
      if (code && value.postalCode !== code) {
        onChange({ ...value, postalCode: code });
      }
    } else {
      setAvailableSubDistricts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.province, value.district]);

  const handleFieldChange = (field: keyof ThaiAddress, newValue: string) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        ที่อยู่ {required && <Typography component="span" color="error">*</Typography>}
      </Typography>

      <Grid container spacing={2}>
        {/* Address Line 1 */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="ที่อยู่ (บ้านเลขที่, หมู่, ซอย, ถนน)"
            value={value.addressLine1}
            onChange={(e) => handleFieldChange('addressLine1', e.target.value)}
            placeholder="เช่น 123/45 หมู่ 2 ซอยสุขุมวิท 15"
            required={required}
            error={error.addressLine1}
            helperText={error.addressLine1 ? 'กรุณากรอกที่อยู่' : ''}
          />
        </Grid>

        {/* Address Line 2 (Optional) */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="ที่อยู่เพิ่มเติม (ถ้ามี)"
            value={value.addressLine2 || ''}
            onChange={(e) => handleFieldChange('addressLine2', e.target.value)}
            placeholder="เช่น อาคาร, ชั้น, ห้อง"
          />
        </Grid>

        {/* Province */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={provinces}
            value={value.province}
            onChange={(_, newValue) => handleFieldChange('province', newValue || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="จังหวัด"
                required={required}
                error={error.province}
                helperText={error.province ? 'กรุณาเลือกจังหวัด' : ''}
              />
            )}
          />
        </Grid>

        {/* District */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={availableDistricts}
            value={value.district}
            onChange={(_, newValue) => handleFieldChange('district', newValue || '')}
            disabled={!value.province}
            renderInput={(params) => (
              <TextField
                {...params}
                label="อำเภอ/เขต"
                required={required}
                error={error.district}
                helperText={error.district ? 'กรุณาเลือกอำเภอ' : ''}
              />
            )}
          />
        </Grid>

        {/* Sub-district */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={availableSubDistricts}
            value={value.subDistrict}
            onChange={(_, newValue) => handleFieldChange('subDistrict', newValue || '')}
            disabled={!value.district}
            renderInput={(params) => (
              <TextField
                {...params}
                label="ตำบล/แขวง"
                required={required}
                error={error.subDistrict}
                helperText={error.subDistrict ? 'กรุณาเลือกตำบล' : ''}
              />
            )}
          />
        </Grid>

        {/* Postal Code */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="รหัสไปรษณีย์"
            value={value.postalCode}
            onChange={(e) => {
              const code = e.target.value.replace(/\D/g, '').slice(0, 5);
              handleFieldChange('postalCode', code);
            }}
            placeholder="เช่น 10900"
            required={required}
            error={error.postalCode}
            helperText={error.postalCode ? 'กรุณากรอกรหัสไปรษณีย์' : ''}
            inputProps={{ maxLength: 5 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddressForm;
