import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Divider,
  Alert,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Save as SaveIcon, Refresh as ResetIcon } from '@mui/icons-material';

export interface SystemSettings {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  supportEmail: string;
  maxUploadSize: number;
  sessionTimeout: number;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  language: string;
  timezone: string;
}

export interface SystemSettingsFormProps {
  initialSettings?: Partial<SystemSettings>;
  onSave: (settings: SystemSettings) => Promise<void>;
  loading?: boolean;
}

const defaultSettings: SystemSettings = {
  siteName: 'GACP Certification System',
  siteUrl: 'https://gacp.example.com',
  adminEmail: 'admin@gacp.example.com',
  supportEmail: 'support@gacp.example.com',
  maxUploadSize: 10,
  sessionTimeout: 30,
  maintenanceMode: false,
  registrationEnabled: true,
  emailNotifications: true,
  smsNotifications: false,
  autoBackup: true,
  backupFrequency: 'daily',
  language: 'th',
  timezone: 'Asia/Bangkok',
};

export default function SystemSettingsForm({
  initialSettings = {},
  onSave,
  loading = false,
}: SystemSettingsFormProps) {
  const [settings, setSettings] = React.useState<SystemSettings>({
    ...defaultSettings,
    ...initialSettings,
  });
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  const handleChange = (
    field: keyof SystemSettings,
    value: SystemSettings[keyof SystemSettings],
  ) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    try {
      await onSave(settings);
      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = () => {
    setSettings({
      ...defaultSettings,
      ...initialSettings,
    });
    setHasChanges(false);
    setSaveSuccess(false);
  };

  return (
    <Box>
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          บันทึกการตั้งค่าเรียบร้อยแล้ว
        </Alert>
      )}

      {/* General Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            ตั้งค่าทั่วไป
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ชื่อระบบ"
                value={settings.siteName}
                onChange={e => handleChange('siteName', e.target.value)}
                helperText="ชื่อที่แสดงในระบบ"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="URL ระบบ"
                value={settings.siteUrl}
                onChange={e => handleChange('siteUrl', e.target.value)}
                helperText="URL หลักของระบบ"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="อีเมลผู้ดูแลระบบ"
                type="email"
                value={settings.adminEmail}
                onChange={e => handleChange('adminEmail', e.target.value)}
                helperText="สำหรับการแจ้งเตือนสำคัญ"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="อีเมลฝ่ายสนับสนุน"
                type="email"
                value={settings.supportEmail}
                onChange={e => handleChange('supportEmail', e.target.value)}
                helperText="สำหรับติดต่อฝ่ายสนับสนุน"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>ภาษาระบบ</InputLabel>
                <Select
                  value={settings.language}
                  label="ภาษาระบบ"
                  onChange={e => handleChange('language', e.target.value)}
                >
                  <MenuItem value="th">ไทย</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>เขตเวลา</InputLabel>
                <Select
                  value={settings.timezone}
                  label="เขตเวลา"
                  onChange={e => handleChange('timezone', e.target.value)}
                >
                  <MenuItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</MenuItem>
                  <MenuItem value="Asia/Singapore">Asia/Singapore (GMT+8)</MenuItem>
                  <MenuItem value="UTC">UTC (GMT+0)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* System Limits */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            ข้อจำกัดระบบ
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ขนาดไฟล์สูงสุด (MB)"
                type="number"
                value={settings.maxUploadSize}
                onChange={e => handleChange('maxUploadSize', parseInt(e.target.value))}
                helperText="ขนาดไฟล์สูงสุดที่อัพโหลดได้"
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="เวลา Session (นาที)"
                type="number"
                value={settings.sessionTimeout}
                onChange={e => handleChange('sessionTimeout', parseInt(e.target.value))}
                helperText="ระยะเวลา session ก่อนหมดอายุ"
                inputProps={{ min: 5, max: 1440 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            ฟีเจอร์ระบบ
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.maintenanceMode}
                  onChange={e => handleChange('maintenanceMode', e.target.checked)}
                  color="warning"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    โหมดปรับปรุงระบบ
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ปิดระบบชั่วคราวเพื่อปรับปรุง
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.registrationEnabled}
                  onChange={e => handleChange('registrationEnabled', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    เปิดให้ลงทะเบียน
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    อนุญาตให้ผู้ใช้ใหม่ลงทะเบียน
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            การแจ้งเตือน
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={e => handleChange('emailNotifications', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    การแจ้งเตือนทางอีเมล
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ส่งการแจ้งเตือนผ่านอีเมล
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.smsNotifications}
                  onChange={e => handleChange('smsNotifications', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    การแจ้งเตือนทาง SMS
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ส่งการแจ้งเตือนผ่าน SMS
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            การสำรองข้อมูล
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoBackup}
                  onChange={e => handleChange('autoBackup', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    สำรองข้อมูลอัตโนมัติ
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    สำรองข้อมูลตามกำหนดเวลา
                  </Typography>
                </Box>
              }
            />

            {settings.autoBackup && (
              <FormControl fullWidth>
                <InputLabel>ความถี่การสำรองข้อมูล</InputLabel>
                <Select
                  value={settings.backupFrequency}
                  label="ความถี่การสำรองข้อมูล"
                  onChange={e => handleChange('backupFrequency', e.target.value)}
                >
                  <MenuItem value="daily">รายวัน</MenuItem>
                  <MenuItem value="weekly">รายสัปดาห์</MenuItem>
                  <MenuItem value="monthly">รายเดือน</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          startIcon={<ResetIcon />}
          onClick={handleReset}
          disabled={!hasChanges || loading}
        >
          รีเซ็ต
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!hasChanges || loading}
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Button>
      </Box>
    </Box>
  );
}
