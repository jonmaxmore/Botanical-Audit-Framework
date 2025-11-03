/**
 * PT9 Step 2: Cultivation Details
 * ข้อมูลแปลงเพาะปลูก
 */

import React from 'react';
import {
  Box,
  TextField,
  Grid,
  Typography,
  Paper,
  Divider,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  Autocomplete,
} from '@mui/material';
import GPSPicker, { GPSCoordinates } from '@/components/farmer/application/shared/GPSPicker';
import AddressForm, { ThaiAddress } from '@/components/farmer/application/shared/AddressForm';

export interface PT9Cultivation {
  farmName: string;
  location: {
    address: ThaiAddress;
    gps: GPSCoordinates;
  };
  landArea: {
    total: number;
    cultivated: number;
    unit: 'rai' | 'hectare';
  };
  landOwnership: {
    type: 'owned' | 'leased' | 'rented';
    documentFileId?: string;
  };
  species: string[];
  variety: string;
  plantingMethod: 'seeds' | 'seedlings' | 'cuttings' | 'rhizomes';
  expectedYield: number;
  harvestPeriod: {
    start: string;
    end: string;
  };
  quality: {
    soilTest: {
      ph: number;
      organicMatter: number;
      reportFileId?: string;
      testDate: string;
    };
    waterTest: {
      source: 'well' | 'river' | 'canal' | 'rainwater';
      quality: 'good' | 'fair' | 'poor';
      reportFileId?: string;
      testDate: string;
    };
  };
  safety: {
    pestControl: boolean;
    chemicalFree: boolean;
    organicCertification?: {
      certified: boolean;
      certNumber?: string;
      certFileId?: string;
    };
  };
}

interface PT9Step2Props {
  data: PT9Cultivation;
  onChange: (data: PT9Cultivation) => void;
}

// รายชื่อพืชสมุนไพรที่ควบคุม
const herbSpecies = [
  'กัญชา (Cannabis)',
  'กัญชง (Hemp)',
  'กระท่อม (Kratom)',
  'ฝิ่น (Opium Poppy)',
  'ไพล (Plai)',
  'ขมิ้นชัน (Turmeric)',
  'ขิง (Ginger)',
  'ว่านหางจระเข้ (Aloe Vera)',
  'มะระขี้นก (Andrographis)',
  'ฟ้าทะลายโจร (Green Chiretta)',
];

const PT9Step2Cultivation: React.FC<PT9Step2Props> = ({ data, onChange }) => {
  const handleFieldChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    onChange({
      ...data,
      [parent]: {
        ...(data as any)[parent],
        [field]: value,
      },
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ข้อมูลแปลงเพาะปลูก
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        กรุณากรอกข้อมูลเกี่ยวกับแปลงเพาะปลูกและการปลูก
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Farm Basic Info */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          ข้อมูลพื้นฐาน
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="ชื่อแปลง/ฟาร์ม"
              required
              value={data.farmName}
              onChange={(e) => handleFieldChange('farmName', e.target.value)}
              placeholder="เช่น แปลงสมุนไพรทุ่งนา"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Location */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          ที่ตั้งแปลงเพาะปลูก
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <AddressForm
              value={data.location.address}
              onChange={(address) =>
                handleNestedChange('location', 'address', address)
              }
              required
            />
          </Grid>
          <Grid item xs={12}>
            <GPSPicker
              value={data.location.gps}
              onChange={(gps) => handleNestedChange('location', 'gps', gps)}
              label="พิกัด GPS แปลง"
              required
              helperText="กดปุ่ม 'ใช้ตำแหน่งปัจจุบัน' เมื่ออยู่ที่แปลงเพาะปลูก"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Land Area */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          พื้นที่
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="พื้นที่รวม"
              type="number"
              required
              value={data.landArea.total}
              onChange={(e) =>
                handleNestedChange('landArea', 'total', parseFloat(e.target.value))
              }
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="พื้นที่ปลูก"
              type="number"
              required
              value={data.landArea.cultivated}
              onChange={(e) =>
                handleNestedChange('landArea', 'cultivated', parseFloat(e.target.value))
              }
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="หน่วย"
              required
              value={data.landArea.unit}
              onChange={(e) =>
                handleNestedChange('landArea', 'unit', e.target.value)
              }
            >
              <MenuItem value="rai">ไร่</MenuItem>
              <MenuItem value="hectare">เฮกตาร์</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Land Ownership */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          สิทธิ์ในที่ดิน
        </Typography>
        <TextField
          fullWidth
          select
          label="ประเภทกรรมสิทธิ์"
          required
          value={data.landOwnership.type}
          onChange={(e) =>
            handleNestedChange('landOwnership', 'type', e.target.value)
          }
        >
          <MenuItem value="owned">เป็นเจ้าของ (โฉนดที่ดิน)</MenuItem>
          <MenuItem value="leased">เช่าระยะยาว</MenuItem>
          <MenuItem value="rented">เช่าระยะสั้น</MenuItem>
        </TextField>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          ** จะต้องแนบเอกสารสิทธิ์ในที่ดินใน Step ถัดไป
        </Typography>
      </Paper>

      {/* Cultivation Details */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          รายละเอียดการเพาะปลูก
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={herbSpecies}
              value={data.species}
              onChange={(_, newValue) => handleFieldChange('species', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="ชนิดพืชสมุนไพร"
                  placeholder="เลือกชนิดพืช"
                  required
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option} label={option} />
                ))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="สายพันธุ์"
              required
              value={data.variety}
              onChange={(e) => handleFieldChange('variety', e.target.value)}
              placeholder="เช่น พันธุ์เชียงราย"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="วิธีการเพาะปลูก"
              required
              value={data.plantingMethod}
              onChange={(e) => handleFieldChange('plantingMethod', e.target.value)}
            >
              <MenuItem value="seeds">เมล็ด (Seeds)</MenuItem>
              <MenuItem value="seedlings">กล้า (Seedlings)</MenuItem>
              <MenuItem value="cuttings">ตอนกิ่ง (Cuttings)</MenuItem>
              <MenuItem value="rhizomes">เหง้า/หัว (Rhizomes)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ผลผลิตคาดการณ์ (กก./ปี)"
              type="number"
              required
              value={data.expectedYield}
              onChange={(e) =>
                handleFieldChange('expectedYield', parseFloat(e.target.value))
              }
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="ช่วงเก็บเกี่ยว (เริ่ม)"
              type="date"
              required
              value={data.harvestPeriod.start}
              onChange={(e) =>
                handleNestedChange('harvestPeriod', 'start', e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="ช่วงเก็บเกี่ยว (สิ้นสุด)"
              type="date"
              required
              value={data.harvestPeriod.end}
              onChange={(e) =>
                handleNestedChange('harvestPeriod', 'end', e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Soil & Water Quality */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          คุณภาพดินและน้ำ
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              การทดสอบดิน
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ค่า pH"
                  type="number"
                  value={data.quality.soilTest.ph}
                  onChange={(e) =>
                    handleNestedChange('quality', 'soilTest', {
                      ...data.quality.soilTest,
                      ph: parseFloat(e.target.value),
                    })
                  }
                  inputProps={{ min: 0, max: 14, step: 0.1 }}
                  placeholder="6.5-7.5"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ปริมาณอินทรีย์วัตถุ (%)"
                  type="number"
                  value={data.quality.soilTest.organicMatter}
                  onChange={(e) =>
                    handleNestedChange('quality', 'soilTest', {
                      ...data.quality.soilTest,
                      organicMatter: parseFloat(e.target.value),
                    })
                  }
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="วันที่ทดสอบ"
                  type="date"
                  value={data.quality.soilTest.testDate}
                  onChange={(e) =>
                    handleNestedChange('quality', 'soilTest', {
                      ...data.quality.soilTest,
                      testDate: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              การทดสอบน้ำ
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="แหล่งน้ำ"
                  value={data.quality.waterTest.source}
                  onChange={(e) =>
                    handleNestedChange('quality', 'waterTest', {
                      ...data.quality.waterTest,
                      source: e.target.value,
                    })
                  }
                >
                  <MenuItem value="well">บ่อบาดาล</MenuItem>
                  <MenuItem value="river">แม่น้ำ</MenuItem>
                  <MenuItem value="canal">คลอง</MenuItem>
                  <MenuItem value="rainwater">น้ำฝน</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="คุณภาพน้ำ"
                  value={data.quality.waterTest.quality}
                  onChange={(e) =>
                    handleNestedChange('quality', 'waterTest', {
                      ...data.quality.waterTest,
                      quality: e.target.value,
                    })
                  }
                >
                  <MenuItem value="good">ดี</MenuItem>
                  <MenuItem value="fair">ปานกลาง</MenuItem>
                  <MenuItem value="poor">แย่</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="วันที่ทดสอบ"
                  type="date"
                  value={data.quality.waterTest.testDate}
                  onChange={(e) =>
                    handleNestedChange('quality', 'waterTest', {
                      ...data.quality.waterTest,
                      testDate: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Safety & Certification */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          มาตรการความปลอดภัย
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.safety.pestControl}
                  onChange={(e) =>
                    handleNestedChange('safety', 'pestControl', e.target.checked)
                  }
                />
              }
              label="มีการควบคุมศัตรูพืช"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.safety.chemicalFree}
                  onChange={(e) =>
                    handleNestedChange('safety', 'chemicalFree', e.target.checked)
                  }
                />
              }
              label="ปลอดสารเคมี (Chemical Free)"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.safety.organicCertification?.certified || false}
                  onChange={(e) =>
                    handleNestedChange('safety', 'organicCertification', {
                      ...data.safety.organicCertification,
                      certified: e.target.checked,
                      certNumber: '',
                      certFileId: '',
                    })
                  }
                />
              }
              label="มีใบรับรองเกษตรอินทรีย์"
            />
          </Grid>
          {data.safety.organicCertification?.certified && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="เลขที่ใบรับรอง"
                value={data.safety.organicCertification.certNumber || ''}
                onChange={(e) =>
                  handleNestedChange('safety', 'organicCertification', {
                    ...data.safety.organicCertification,
                    certNumber: e.target.value,
                  })
                }
                placeholder="เช่น ORG-2024-001234"
              />
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default PT9Step2Cultivation;
