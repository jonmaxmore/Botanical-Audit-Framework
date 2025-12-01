'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Avatar,
  IconButton,
} from '@mui/material';
import { PhotoCamera as PhotoIcon, Close as CloseIcon } from '@mui/icons-material';

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'reviewer' | 'manager' | 'viewer';
  department: string;
  position: string;
  location: string;
  password?: string;
  avatar?: string;
}

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  initialData?: Partial<UserFormData>;
  mode: 'create' | 'edit';
}

export default function UserFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
}: UserFormDialogProps) {
  const [formData, setFormData] = React.useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'viewer',
    department: '',
    position: '',
    location: '',
    password: '',
    avatar: '',
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof UserFormData, string>>>({});
  const [avatarPreview, setAvatarPreview] = React.useState<string>('');

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        role: initialData.role || 'viewer',
        department: initialData.department || '',
        position: initialData.position || '',
        location: initialData.location || '',
        password: '',
        avatar: initialData.avatar || '',
      });
      setAvatarPreview(initialData.avatar || '');
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'viewer',
        department: '',
        position: '',
        location: '',
        password: '',
        avatar: '',
      });
      setAvatarPreview('');
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = 'รูปแบบเบอร์โทรไม่ถูกต้อง';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'กรุณากรอกแผนก';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'กรุณากรอกตำแหน่ง';
    }

    if (mode === 'create' && !formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'viewer',
      department: '',
      position: '',
      location: '',
      password: '',
      avatar: '',
    });
    setErrors({});
    setAvatarPreview('');
    onClose();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setFormData({ ...formData, avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'ผู้ดูแลระบบ',
      reviewer: 'ผู้ตรวจสอบ',
      manager: 'ผู้จัดการ',
      viewer: 'ผู้ดูข้อมูล',
    };
    return labels[role] || role;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            {mode === 'create' ? 'เพิ่มผู้ใช้งานใหม่' : 'แก้ไขข้อมูลผู้ใช้'}
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Avatar Upload */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={avatarPreview}
              sx={{
                width: 100,
                height: 100,
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
              }}
            >
              {formData.name.charAt(0) || 'U'}
            </Avatar>
            <Button variant="outlined" component="label" startIcon={<PhotoIcon />} size="small">
              อัพโหลดรูปภาพ
              <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
            </Button>
          </Box>

          {/* Form Fields */}
          <Grid container spacing={2}>
            {/* Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ชื่อ-นามสกุล"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="อีเมล"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                error={!!errors.email}
                helperText={errors.email}
                required
                disabled={mode === 'edit'}
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="เบอร์โทรศัพท์"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                error={!!errors.phone}
                helperText={errors.phone}
                placeholder="081-234-5678"
                required
              />
            </Grid>

            {/* Role */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>บทบาท</InputLabel>
                <Select
                  value={formData.role}
                  label="บทบาท"
                  onChange={e =>
                    setFormData({ ...formData, role: e.target.value as UserFormData['role'] })
                  }
                >
                  <MenuItem value="admin">{getRoleLabel('admin')}</MenuItem>
                  <MenuItem value="reviewer">{getRoleLabel('reviewer')}</MenuItem>
                  <MenuItem value="manager">{getRoleLabel('manager')}</MenuItem>
                  <MenuItem value="viewer">{getRoleLabel('viewer')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Department */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="แผนก"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                error={!!errors.department}
                helperText={errors.department}
                required
              />
            </Grid>

            {/* Position */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ตำแหน่ง"
                value={formData.position}
                onChange={e => setFormData({ ...formData, position: e.target.value })}
                error={!!errors.position}
                helperText={errors.position}
                required
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="สถานที่"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="กรุงเทพมหานคร"
              />
            </Grid>

            {/* Password */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={mode === 'create' ? 'รหัสผ่าน' : 'รหัสผ่านใหม่ (ไม่บังคับ)'}
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                error={!!errors.password}
                helperText={
                  errors.password ||
                  (mode === 'edit' ? 'เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน' : '')
                }
                required={mode === 'create'}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>ยกเลิก</Button>
        <Button onClick={handleSubmit} variant="contained">
          {mode === 'create' ? 'เพิ่มผู้ใช้' : 'บันทึก'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
