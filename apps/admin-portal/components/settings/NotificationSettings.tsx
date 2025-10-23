import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
} from '@mui/icons-material';

export interface NotificationSettingsProps {
  onSave: (data: NotificationSettingsData) => Promise<void>;
  loading?: boolean;
}

export interface NotificationSettingsData {
  emailNotifications: boolean;
  smsNotifications: boolean;
  newApplicationEmail: boolean;
  applicationApprovedEmail: boolean;
  applicationRejectedEmail: boolean;
  commentAddedEmail: boolean;
  systemAlertsEmail: boolean;
  emailRecipients: string[];
  smsRecipients: string[];
}

const defaultSettings: NotificationSettingsData = {
  emailNotifications: true,
  smsNotifications: false,
  newApplicationEmail: true,
  applicationApprovedEmail: true,
  applicationRejectedEmail: true,
  commentAddedEmail: false,
  systemAlertsEmail: true,
  emailRecipients: ['admin@gacp.go.th'],
  smsRecipients: [],
};

export default function NotificationSettings({
  onSave,
  loading = false,
}: NotificationSettingsProps) {
  const [settings, setSettings] = React.useState<NotificationSettingsData>(defaultSettings);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState('');
  const [newPhone, setNewPhone] = React.useState('');

  const handleChange = (
    field: keyof NotificationSettingsData,
    value: boolean | string[] | string
  ) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAddEmail = () => {
    if (newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      handleChange('emailRecipients', [...settings.emailRecipients, newEmail]);
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    handleChange(
      'emailRecipients',
      settings.emailRecipients.filter(e => e !== email)
    );
  };

  const handleAddPhone = () => {
    if (newPhone && /^[0-9]{10}$/.test(newPhone)) {
      handleChange('smsRecipients', [...settings.smsRecipients, newPhone]);
      setNewPhone('');
    }
  };

  const handleRemovePhone = (phone: string) => {
    handleChange(
      'smsRecipients',
      settings.smsRecipients.filter(p => p !== phone)
    );
  };

  const handleSave = async () => {
    await onSave(settings);
    setHasChanges(false);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <NotificationsIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              การตั้งค่าการแจ้งเตือน
            </Typography>
            <Typography variant="body2" color="text.secondary">
              กำหนดช่องทางและประเภทการแจ้งเตือน
            </Typography>
          </Box>
        </Box>

        <Stack spacing={3}>
          {/* Enable/Disable Channels */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              ช่องทางการแจ้งเตือน
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={e => handleChange('emailNotifications', e.target.checked)}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon fontSize="small" />
                    <span>การแจ้งเตือนทาง Email</span>
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
                  <Box display="flex" alignItems="center" gap={1}>
                    <SmsIcon fontSize="small" />
                    <span>การแจ้งเตือนทาง SMS</span>
                  </Box>
                }
              />
            </Stack>
          </Box>

          <Divider />

          {/* Email Notification Types */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              ประเภทการแจ้งเตือนทาง Email
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.newApplicationEmail}
                    onChange={e => handleChange('newApplicationEmail', e.target.checked)}
                    disabled={!settings.emailNotifications}
                  />
                }
                label="คำขอใหม่เข้าระบบ"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.applicationApprovedEmail}
                    onChange={e => handleChange('applicationApprovedEmail', e.target.checked)}
                    disabled={!settings.emailNotifications}
                  />
                }
                label="คำขออนุมัติแล้ว"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.applicationRejectedEmail}
                    onChange={e => handleChange('applicationRejectedEmail', e.target.checked)}
                    disabled={!settings.emailNotifications}
                  />
                }
                label="คำขอไม่อนุมัติ"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.commentAddedEmail}
                    onChange={e => handleChange('commentAddedEmail', e.target.checked)}
                    disabled={!settings.emailNotifications}
                  />
                }
                label="มีความเห็นเพิ่มเติม"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.systemAlertsEmail}
                    onChange={e => handleChange('systemAlertsEmail', e.target.checked)}
                    disabled={!settings.emailNotifications}
                  />
                }
                label="การแจ้งเตือนระบบ"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Email Recipients */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              ผู้รับการแจ้งเตือนทาง Email
            </Typography>
            <Stack spacing={2}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  label="เพิ่มอีเมล"
                  type="email"
                  placeholder="example@email.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      handleAddEmail();
                    }
                  }}
                  disabled={!settings.emailNotifications}
                />
                <Button
                  variant="contained"
                  onClick={handleAddEmail}
                  disabled={!settings.emailNotifications}
                >
                  เพิ่ม
                </Button>
              </Box>

              {settings.emailRecipients.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {settings.emailRecipients.map(email => (
                    <Chip
                      key={email}
                      label={email}
                      onDelete={() => handleRemoveEmail(email)}
                      color="primary"
                      variant="outlined"
                      icon={<EmailIcon />}
                    />
                  ))}
                </Box>
              )}
            </Stack>
          </Box>

          <Divider />

          {/* SMS Recipients */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              ผู้รับการแจ้งเตือนทาง SMS
            </Typography>
            <Stack spacing={2}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  label="เพิ่มเบอร์โทรศัพท์"
                  placeholder="08xxxxxxxx"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      handleAddPhone();
                    }
                  }}
                  disabled={!settings.smsNotifications}
                />
                <Button
                  variant="contained"
                  onClick={handleAddPhone}
                  disabled={!settings.smsNotifications}
                >
                  เพิ่ม
                </Button>
              </Box>

              {settings.smsRecipients.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {settings.smsRecipients.map(phone => (
                    <Chip
                      key={phone}
                      label={phone}
                      onDelete={() => handleRemovePhone(phone)}
                      color="secondary"
                      variant="outlined"
                      icon={<SmsIcon />}
                    />
                  ))}
                </Box>
              )}
            </Stack>
          </Box>

          {hasChanges && <Alert severity="warning">คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</Alert>}

          {/* Save Button */}
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setSettings(defaultSettings);
                setHasChanges(false);
              }}
              disabled={loading || !hasChanges}
            >
              รีเซ็ต
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading || !hasChanges}
              startIcon={<NotificationsIcon />}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
