'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'applications' | 'users' | 'reports' | 'settings' | 'system';
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean; // Cannot be deleted
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

interface RoleManagementProps {
  roles: Role[];
  permissions: Permission[];
  onAddRole: (role: Omit<Role, 'id' | 'userCount'>) => void;
  onEditRole: (id: string, role: Omit<Role, 'id' | 'userCount'>) => void;
  onDeleteRole: (id: string) => void;
}

export default function RoleManagement({
  roles,
  permissions,
  onAddRole,
  onEditRole,
  onDeleteRole,
}: RoleManagementProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = React.useState<Role | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<{ [key: string]: HTMLElement | null }>({});

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as string[],
    color: 'primary' as Role['color'],
  });

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        permissions: role.permissions,
        color: role.color,
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        displayName: '',
        description: '',
        permissions: [],
        color: 'primary',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRole(null);
  };

  const handleMenuOpen = (roleId: string, event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl({ ...anchorEl, [roleId]: event.currentTarget });
  };

  const handleMenuClose = (roleId: string) => {
    setAnchorEl({ ...anchorEl, [roleId]: null });
  };

  const handleEdit = (role: Role) => {
    handleMenuClose(role.id);
    handleOpenDialog(role);
  };

  const handleDeleteClick = (role: Role) => {
    handleMenuClose(role.id);
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (roleToDelete) {
      onDeleteRole(roleToDelete.id);
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleSubmit = () => {
    if (editingRole) {
      onEditRole(editingRole.id, {
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        permissions: formData.permissions,
        isSystem: editingRole.isSystem,
        color: formData.color,
      });
    } else {
      onAddRole({
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        permissions: formData.permissions,
        isSystem: false,
        color: formData.color,
      });
    }
    handleCloseDialog();
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const groupPermissionsByCategory = () => {
    const grouped: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      applications: 'คำขอรับรอง',
      users: 'ผู้ใช้งาน',
      reports: 'รายงาน',
      settings: 'ตั้งค่า',
      system: 'ระบบ',
    };
    return labels[category] || category;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={600}>
              จัดการบทบาทและสิทธิ์
            </Typography>
            <Typography variant="body2" color="text.secondary">
              กำหนดบทบาทและสิทธิ์การเข้าถึงสำหรับผู้ใช้งาน
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          เพิ่มบทบาทใหม่
        </Button>
      </Box>

      {/* Roles Grid */}
      <Grid container spacing={3}>
        {roles.map(role => (
          <Grid item xs={12} md={6} lg={4} key={role.id}>
            <Card sx={{ boxShadow: 2, height: '100%' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={role.displayName}
                        color={role.color}
                        size="medium"
                        sx={{ fontWeight: 600 }}
                      />
                      {role.isSystem && <Chip label="ระบบ" size="small" variant="outlined" />}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {role.description}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={e => handleMenuOpen(role.id, e)}>
                    <MoreIcon />
                  </IconButton>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Permissions Count */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckIcon fontSize="small" color="success" />
                  <Typography variant="body2">
                    <strong>{role.permissions.length}</strong> สิทธิ์การใช้งาน
                  </Typography>
                </Box>

                {/* User Count */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    <strong>{role.userCount}</strong> ผู้ใช้งาน
                  </Typography>
                </Box>

                {/* Permissions List Preview */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    สิทธิ์การใช้งานบางส่วน:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {role.permissions.slice(0, 3).map(permId => {
                      const perm = permissions.find(p => p.id === permId);
                      return perm ? (
                        <Chip
                          key={permId}
                          label={perm.name}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ) : null;
                    })}
                    {role.permissions.length > 3 && (
                      <Chip
                        label={`+${role.permissions.length - 3}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>
              </CardContent>

              {/* Menu */}
              <Menu
                anchorEl={anchorEl[role.id]}
                open={Boolean(anchorEl[role.id])}
                onClose={() => handleMenuClose(role.id)}
              >
                <MenuItem onClick={() => handleEdit(role)}>
                  <EditIcon sx={{ mr: 1 }} fontSize="small" />
                  แก้ไข
                </MenuItem>
                {!role.isSystem && (
                  <MenuItem onClick={() => handleDeleteClick(role)} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                    ลบ
                  </MenuItem>
                )}
              </Menu>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Role Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingRole ? 'แก้ไขบทบาท' : 'เพิ่มบทบาทใหม่'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Basic Info */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ชื่อบทบาท (Internal)"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="reviewer"
                  helperText="ใช้ภาษาอังกฤษตัวพิมพ์เล็ก ไม่มีช่องว่าง"
                  disabled={editingRole?.isSystem}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ชื่อแสดง"
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="ผู้ตรวจสอบ"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="คำอธิบาย"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={2}
                  placeholder="อธิบายหน้าที่และความรับผิดชอบของบทบาทนี้"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Permissions Matrix */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
              สิทธิ์การใช้งาน
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              เลือกสิทธิ์ที่ต้องการให้บทบาทนี้เข้าถึง
            </Typography>

            <Box sx={{ mt: 2 }}>
              {Object.entries(groupPermissionsByCategory()).map(([category, perms]) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    gutterBottom
                    sx={{ color: 'primary.main' }}
                  >
                    {getCategoryLabel(category)}
                  </Typography>
                  <FormGroup>
                    {perms.map(permission => (
                      <FormControlLabel
                        key={permission.id}
                        control={
                          <Checkbox
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {permission.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {permission.description}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </Box>
              ))}
            </Box>

            {/* Permissions Summary */}
            <Alert severity="info" sx={{ mt: 2 }}>
              เลือกแล้ว <strong>{formData.permissions.length}</strong> สิทธิ์จากทั้งหมด{' '}
              <strong>{permissions.length}</strong> สิทธิ์
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ยกเลิก</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.displayName || formData.permissions.length === 0}
          >
            {editingRole ? 'บันทึก' : 'เพิ่มบทบาท'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>ยืนยันการลบบทบาท</DialogTitle>
        <DialogContent>
          <Typography>
            คุณแน่ใจหรือไม่ที่จะลบบทบาท <strong>{roleToDelete?.displayName}</strong>?
          </Typography>
          {roleToDelete && roleToDelete.userCount > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              มีผู้ใช้งาน {roleToDelete.userCount} คนที่ใช้บทบาทนี้อยู่
              กรุณาย้ายผู้ใช้เหล่านี้ไปยังบทบาทอื่นก่อนลบ
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ยกเลิก</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={roleToDelete ? roleToDelete.userCount > 0 : false}
          >
            ลบบทบาท
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
