import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import FarmerLayout from '../../components/layout/FarmerLayout';

export default function FarmerApplications() {
  const router = useRouter();

  const applications = [
    {
      id: 'APP001',
      farmName: 'ฟาร์มสมุนไพรเชียงใหม่',
      type: 'GACP Certification',
      status: 'pending',
      date: '2025-10-15'
    },
    {
      id: 'APP002',
      farmName: 'ฟาร์มกัญชาทางการแพทย์',
      type: 'GACP Renewal',
      status: 'in_progress',
      date: '2025-10-10'
    },
    {
      id: 'APP003',
      farmName: 'ฟาร์มไพรสมุนไพรออร์แกนิก',
      type: 'GACP Certification',
      status: 'approved',
      date: '2025-10-05'
    },
    {
      id: 'APP004',
      farmName: 'ฟาร์มสมุนไพรลำปาง',
      type: 'GACP Certification',
      status: 'rejected',
      date: '2025-09-28'
    }
  ];

  const getStatusChip = (status: string) => {
    const config: any = {
      pending: { label: 'รอดำเนินการ', color: 'warning' },
      in_progress: { label: 'กำลังตรวจสอบ', color: 'info' },
      approved: { label: 'อนุมัติ', color: 'success' },
      rejected: { label: 'ไม่อนุมัติ', color: 'error' }
    };
    return <Chip label={config[status]?.label} color={config[status]?.color} size="small" />;
  };

  return (
    <>
      <Head>
        <title>คำขอรับรอง - ระบบ GACP</title>
      </Head>
      <FarmerLayout>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
            คำขอรับรอง
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.light' }}>
                  <TableCell>
                    <strong>รหัสคำขอ</strong>
                  </TableCell>
                  <TableCell>
                    <strong>ฟาร์ม</strong>
                  </TableCell>
                  <TableCell>
                    <strong>ประเภท</strong>
                  </TableCell>
                  <TableCell>
                    <strong>สถานะ</strong>
                  </TableCell>
                  <TableCell>
                    <strong>วันที่ยื่น</strong>
                  </TableCell>
                  <TableCell>
                    <strong>ดำเนินการ</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map(app => (
                  <TableRow key={app.id} hover>
                    <TableCell>{app.id}</TableCell>
                    <TableCell>{app.farmName}</TableCell>
                    <TableCell>{app.type}</TableCell>
                    <TableCell>{getStatusChip(app.status)}</TableCell>
                    <TableCell>{new Date(app.date).toLocaleDateString('th-TH')}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        variant="outlined"
                        onClick={() => router.push(`/farmer/application/${app.id}`)}
                      >
                        ดูรายละเอียด
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </FarmerLayout>
    </>
  );
}
