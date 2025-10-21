import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Compare as CompareIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  RemoveCircle as RemoveCircleIcon,
} from '@mui/icons-material';

export default function StandardComparisonPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const standards = [
    {
      name: 'GACP',
      fullName: 'Good Agricultural and Collection Practices',
      description: 'มาตรฐานการปฏิบัติทางการเกษตรและการเก็บรวบรวมที่ดี สำหรับพืชสมุนไพร',
    },
    {
      name: 'GAP',
      fullName: 'Good Agricultural Practices',
      description: 'มาตรฐานการปฏิบัติทางการเกษตรที่ดี สำหรับพืชทั่วไป',
    },
    {
      name: 'Organic',
      fullName: 'Organic Agriculture',
      description: 'เกษตรอินทรีย์ ระบบการผลิตที่คำนึงถึงสิ่งแวดล้อม ไม่ใช้สารเคมี',
    },
    {
      name: 'GMP',
      fullName: 'Good Manufacturing Practices',
      description: 'หลักเกณฑ์วิธีการที่ดีในการผลิตอาหารและผลิตภัณฑ์',
    },
  ];

  // ตัวอย่างข้อมูลการเปรียบเทียบมาตรฐาน
  const comparisonData = [
    {
      criteria: 'การจัดการพื้นที่เพาะปลูก',
      GACP: 'required',
      GAP: 'required',
      Organic: 'required',
      GMP: 'not-applicable',
    },
    {
      criteria: 'การใช้สารเคมี',
      GACP: 'limited',
      GAP: 'limited',
      Organic: 'prohibited',
      GMP: 'not-applicable',
    },
    {
      criteria: 'การจดบันทึก',
      GACP: 'required',
      GAP: 'required',
      Organic: 'required',
      GMP: 'required',
    },
    {
      criteria: 'การตรวจสอบย้อนกลับ',
      GACP: 'required',
      GAP: 'required',
      Organic: 'required',
      GMP: 'required',
    },
    {
      criteria: 'การเก็บรักษาผลผลิต',
      GACP: 'required',
      GAP: 'required',
      Organic: 'required',
      GMP: 'required',
    },
    {
      criteria: 'การจัดการโรงเรือน',
      GACP: 'optional',
      GAP: 'optional',
      Organic: 'required',
      GMP: 'required',
    },
    {
      criteria: 'การทดสอบสารพิษตกค้าง',
      GACP: 'required',
      GAP: 'required',
      Organic: 'required',
      GMP: 'required',
    },
  ];

  const statusIcons = {
    required: <CheckCircleIcon sx={{ color: '#4caf50' }} />,
    optional: <RemoveCircleIcon sx={{ color: '#ff9800' }} />,
    prohibited: <CancelIcon sx={{ color: '#f44336' }} />,
    'not-applicable': <CancelIcon sx={{ color: '#9e9e9e' }} />,
  };

  const statusText = {
    required: 'จำเป็น',
    optional: 'ทางเลือก',
    prohibited: 'ห้ามใช้',
    'not-applicable': 'ไม่เกี่ยวข้อง',
  };

  return (
    <>
      <Head>
        <title>ระบบเปรียบเทียบมาตรฐาน | GACP System</title>
      </Head>

      <AppBar position="static" sx={{ backgroundColor: '#607d8b' }}>
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={() => router.push('/')}>
            กลับหน้าหลัก
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <CompareIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            GACP System
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: '#f5f5f5', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h1"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            ระบบเปรียบเทียบมาตรฐาน
          </Typography>
          <Typography
            variant="h6"
            color="textSecondary"
            align="center"
            paragraph
            sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}
          >
            เปรียบเทียบมาตรฐาน GACP กับมาตรฐานอื่นๆ เพื่อช่วยให้เกษตรกรและผู้ประกอบการ
            เข้าใจความแตกต่างและเลือกมาตรฐานที่เหมาะสม
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
          มาตรฐานที่เปรียบเทียบ
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {standards.map((standard, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {standard.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {standard.fullName}
                  </Typography>
                  <Typography variant="body2">{standard.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ mb: 6 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="เปรียบเทียบมาตรฐาน" />
              <Tab label="รายละเอียดเพิ่มเติม" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <TableContainer component={Box} sx={{ p: 2 }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>เกณฑ์</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      GACP
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      GAP
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      Organic
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      GMP
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparisonData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {row.criteria}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={statusIcons[row.GACP as keyof typeof statusIcons]}
                          label={statusText[row.GACP as keyof typeof statusText]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={statusIcons[row.GAP as keyof typeof statusIcons]}
                          label={statusText[row.GAP as keyof typeof statusText]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={statusIcons[row.Organic as keyof typeof statusIcons]}
                          label={statusText[row.Organic as keyof typeof statusText]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={statusIcons[row.GMP as keyof typeof statusIcons]}
                          label={statusText[row.GMP as keyof typeof statusText]}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" paragraph>
                มาตรฐาน GACP (Good Agricultural and Collection Practices)
                เป็นมาตรฐานที่เน้นการปฏิบัติทางการเกษตรและการเก็บรวบรวมที่ดีสำหรับพืชสมุนไพร
                มุ่งเน้นการควบคุมคุณภาพตั้งแต่การเพาะปลูกจนถึงการเก็บเกี่ยว
                เพื่อให้ได้วัตถุดิบสมุนไพรที่มีคุณภาพและปลอดภัยสำหรับการผลิตยาและผลิตภัณฑ์สมุนไพร
              </Typography>
              <Typography variant="body1" paragraph>
                มาตรฐาน GAP (Good Agricultural Practices)
                เป็นมาตรฐานการปฏิบัติทางการเกษตรที่ดีทั่วไป
                มุ่งเน้นความปลอดภัยของผลผลิตจากสารเคมีตกค้าง
                แต่ยังอนุญาตให้ใช้สารเคมีทางการเกษตรได้ตามที่กฎหมายกำหนด
              </Typography>
              <Typography variant="body1" paragraph>
                มาตรฐานเกษตรอินทรีย์ (Organic) มีความเข้มงวดมากที่สุดในด้านการห้ามใช้สารเคมี
                ปุ๋ยเคมี และยาฆ่าแมลง ต้องใช้ระยะเวลาในการปรับเปลี่ยนจากเกษตรทั่วไปอย่างน้อย 1-3 ปี
              </Typography>
              <Typography variant="body1">
                มาตรฐาน GMP (Good Manufacturing Practices) เป็นมาตรฐานในกระบวนการผลิตและแปรรูป
                ไม่ได้เกี่ยวข้องโดยตรงกับการเพาะปลูก แต่จะเน้นการควบคุมคุณภาพในโรงงานหรือสถานที่ผลิต
              </Typography>
            </Box>
          )}
        </Paper>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            sx={{ backgroundColor: '#607d8b' }}
            onClick={() => router.push('/services/standard-comparison/detail')}
          >
            ดูข้อมูลเปรียบเทียบเพิ่มเติม
          </Button>
        </Box>
      </Container>
    </>
  );
}
