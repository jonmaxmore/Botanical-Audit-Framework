import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Avatar,
  Stack,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, PhotoCamera as CameraIcon } from '@mui/icons-material';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  avatar?: string;
}

export interface UserPreferencesProps {
  profile?: Partial<UserProfile>;
  onSave: (profile: UserProfile) => Promise<void>;
  loading?: boolean;
}

export default function UserPreferences({
  profile = {},
  onSave,
  loading = false,
}: UserPreferencesProps) {
  const [formData, setFormData] = React.useState<UserProfile>({
    firstName: profile.firstName || 'Admin',
    lastName: profile.lastName || 'User',
    email: profile.email || 'admin@gacp.example.com',
    phone: profile.phone || '02-xxx-xxxx',
    position: profile.position || 'System Administrator',
    department: profile.department || 'IT Department',
    avatar: profile.avatar,
  });
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  return (
    <Box>
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          บันทึกโปรไฟล์เรียบร้อยแล้ว
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            ข้อมูลโปรไฟล์
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Avatar */}
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4 }}>
            <Avatar src={formData.avatar} sx={{ width: 100, height: 100 }} />
            <Button variant="outlined" startIcon={<CameraIcon />}>
              เปลี่ยนรูปโปรไฟล์
            </Button>
          </Stack>

          {/* Profile Form */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ชื่อ"
                value={formData.firstName}
                onChange={e => handleChange('firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="นามสกุล"
                value={formData.lastName}
                onChange={e => handleChange('lastName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="อีเมล"
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="เบอร์โทรศัพท์"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ตำแหน่ง"
                value={formData.position}
                onChange={e => handleChange('position', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="แผนก"
                value={formData.department}
                onChange={e => handleChange('department', e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Save Button */}
          <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Password Change Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            เปลี่ยนรหัสผ่าน
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="รหัสผ่านปัจจุบัน" type="password" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="รหัสผ่านใหม่" type="password" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="ยืนยันรหัสผ่านใหม่" type="password" />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button variant="contained">เปลี่ยนรหัสผ่าน</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
