import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import {
  Security as SecurityIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrentisActive: boolean;
}

export default function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [loginAlerts, setLoginAlerts] = React.useState(true);

  const sessions: Session[] = [
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'Bangkok, Thailand',
      lastActive: '5 นาทีที่แล้ว',
      isCurrentisActive: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'Bangkok, Thailand',
      lastActive: '2 ชั่วโมงที่แล้ว',
      isCurrentisActive: false,
    },
  ];

  const handleEnable2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  const handleRevokeSession = (sessionId: string) => {
    console.log('Revoking session:', sessionId);
  };

  return (
    <Box>
      {/* 2FA Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <SecurityIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              การยืนยันตัวตนสองขั้นตอน (2FA)
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />

          <Box>
            <FormControlLabel
              control={<Switch checked={twoFactorEnabled} onChange={handleEnable2FA} />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    เปิดใช้งาน 2FA
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    เพิ่มความปลอดภัยด้วยการยืนยันตัวตนสองขั้นตอน
                  </Typography>
                </Box>
              }
            />

            {twoFactorEnabled && (
              <Alert severity="info" sx={{ mt: 2 }}>
                กรุณาสแกน QR Code ด้วยแอพ Authenticator เพื่อตั้งค่า 2FA
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Login Alerts */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            การแจ้งเตือนการเข้าสู่ระบบ
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <FormControlLabel
            control={<Switch checked={loginAlerts} onChange={() => setLoginAlerts(!loginAlerts)} />}
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  แจ้งเตือนเมื่อมีการเข้าสู่ระบบใหม่
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  รับการแจ้งเตือนทางอีเมลเมื่อมีการเข้าสู่ระบบจากอุปกรณ์ใหม่
                </Typography>
              </Box>
            }
          />
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Session ที่ใช้งานอยู่
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>อุปกรณ์</TableCell>
                  <TableCell>สถานที่</TableCell>
                  <TableCell>ใช้งานล่าสุด</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map(session => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {session.device}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {session.location}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {session.lastActive}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {session.isCurrentisActive ? (
                        <Chip icon={<ActiveIcon />} label="ปัจจุบัน" color="success" size="small" />
                      ) : (
                        <Chip
                          icon={<InactiveIcon />}
                          label="ไม่ใช้งาน"
                          color="default"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {!session.isCurrentisActive && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRevokeSession(session.id)}
                        >
                          ยกเลิก
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
