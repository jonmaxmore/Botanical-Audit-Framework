import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Agriculture as AgricultureIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  Verified as VerifiedIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import FarmerLayout from '../../components/layout/FarmerLayout';
import { useAuth } from '../../contexts/AuthContext';
import { WorkflowService } from '../../lib/workflow.service';

type FarmerApplication = {
  id: string;
  applicationNumber: string;
  farmName: string;
  cropType: string;
  status: string;
  submittedAt: Date;
};

const applications: FarmerApplication[] = [
  {
    id: 'APP001',
    applicationNumber: 'GACP-2025-001',
    farmName: 'ฟาร์มสมุนไพรสมชาย',
    cropType: 'ฟ้าทะลายโจร',
    status: 'submitted',
    submittedAt: new Date('2025-01-15')
  },
  {
    id: 'APP002',
    applicationNumber: 'GACP-2025-002',
    farmName: 'ฟาร์มเกษตรอินทรีย์',
    cropType: 'กระชายขาว',
    status: 'reviewing',
    submittedAt: new Date('2025-02-02')
  }
];

export default function FarmerDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const stats = [
    {
      label: 'คำขอทั้งหมด',
      value: applications.length,
      icon: <DescriptionIcon />,
      color: '#1976d2'
    },
    {
      label: 'อยู่ระหว่างตรวจสอบ',
      value: applications.filter(app => app.status !== 'approved').length,
      icon: <TrendingUpIcon />,
      color: '#ff9800'
    },
    {
      label: 'ได้รับการรับรอง',
      value: applications.filter(app => app.status === 'approved').length,
      icon: <VerifiedIcon />,
      color: '#4caf50'
    },
    {
      label: 'พื้นที่ทั้งหมด',
      value: `${((user as any)?.totalFarmArea ?? 0).toLocaleString()} ไร่`,
      icon: <AgricultureIcon />,
      color: '#9c27b0'
    }
  ];

  return (
    <>
      <Head>
        <title>แดชบอร์ดเกษตรกร - ระบบ GACP</title>
      </Head>
      <FarmerLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              สวัสดี, {user?.fullName || 'เกษตรกร'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CalendarIcon />}
                onClick={() => router.push('/farmer/booking')}
              >
                จองการตรวจสอบ
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/farmer/application/create')}
              >
                ยื่นคำขอใหม่
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map(stat => (
              <Grid item xs={12} sm={6} md={3} key={stat.label}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          bgcolor: `${stat.color}20`,
                          color: stat.color,
                          p: 1,
                          borderRadius: 1,
                          mr: 2,
                          display: 'flex'
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              คำขอรับรองล่าสุด
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>เลขที่คำขอ</TableCell>
                    <TableCell>ชื่อฟาร์ม</TableCell>
                    <TableCell>พืชที่ปลูก</TableCell>
                    <TableCell>วันที่ยื่น</TableCell>
                    <TableCell>สถานะ</TableCell>
                    <TableCell align="right">การดำเนินการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          ยังไม่มีคำขอ
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map(app => (
                      <TableRow key={app.id}>
                        <TableCell>{app.applicationNumber}</TableCell>
                        <TableCell>{app.farmName}</TableCell>
                        <TableCell>{app.cropType}</TableCell>
                        <TableCell>{app.submittedAt.toLocaleDateString('th-TH')}</TableCell>
                        <TableCell>
                          <Chip
                            label={WorkflowService.getStatusLabel(app.status as any)}
                            size="small"
                            sx={{
                              backgroundColor: WorkflowService.getStatusColor(app.status as any),
                              color: '#fff'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => router.push(`/farmer/application/${app.id}`)}
                          >
                            ดูรายละเอียด
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </FarmerLayout>
    </>
  );
}
