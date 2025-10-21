import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  VerifiedUser as VerifiedUserIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from '@mui/icons-material';
import { Approver } from '../../types/user.types';
import { WorkflowService } from '../../lib/workflow.service';

export default function ApproverDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Approver | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/login?role=approver');
      return;
    }
    const user = JSON.parse(userStr) as Approver;
    setCurrentUser(user);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  if (!currentUser) return null;

  const stats = [
    { label: 'รออนุมัติ', value: '0', icon: <HourglassEmptyIcon />, color: '#ff9800' },
    { label: 'อนุมัติแล้ว', value: '0', icon: <CheckCircleIcon />, color: '#4caf50' },
    { label: 'ไม่อนุมัติ', value: '0', icon: <CancelIcon />, color: '#f44336' },
    { label: 'ออกใบรับรอง', value: '0', icon: <VerifiedUserIcon />, color: '#9c27b0' },
  ];

  return (
    <>
      <Head>
        <title>Dashboard ผู้อนุมัติ | GACP System</title>
      </Head>

      <AppBar position="sticky" sx={{ backgroundColor: '#9c27b0' }}>
        <Toolbar>
          <VerifiedUserIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ระบบอนุมัติและรับรอง GACP
          </Typography>
          <IconButton color="inherit" onClick={e => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: '#7b1fa2' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2">
                <strong>{currentUser.fullName}</strong>
                <br />
                <small>{currentUser.department}</small>
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
              ออกจากระบบ
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          แดชบอร์ดอนุมัติและรับรอง
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: `${stat.color}20`,
                        color: stat.color,
                        p: 1,
                        borderRadius: 1,
                        mr: 2,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab label="รออนุมัติ" />
            <Tab label="อนุมัติแล้ว" />
            <Tab label="ไม่อนุมัติ" />
          </Tabs>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>เลขที่คำขอ</TableCell>
                  <TableCell>ชื่อเกษตรกร</TableCell>
                  <TableCell>ฟาร์ม</TableCell>
                  <TableCell>คะแนนตรวจประเมิน</TableCell>
                  <TableCell>ผู้ตรวจประเมิน</TableCell>
                  <TableCell>การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                      ไม่มีรายการรออนุมัติ
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </>
  );
}
