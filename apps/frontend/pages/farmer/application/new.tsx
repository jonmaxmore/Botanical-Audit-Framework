/**
 * Application Type Selection Page
 * หน้าเลือกประเภทคำขออนุญาต (GACP)
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Chip,
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface ApplicationType {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
  fee: number;
  processingDays: number;
  disabled?: boolean;
}

const applicationTypes: ApplicationType[] = [
  {
    id: 'gacp',
    code: 'GACP',
    nameTh: 'ใบรับรอง GACP',
    nameEn: 'GACP Certification',
    description: 'ใบรับรองการปฏิบัติทางการเกษตรและการเก็บรกัษาที่ดีสำหรับพืชสมุนไพร (Good Agricultural and Collection Practices)',
    icon: <VerifiedIcon sx={{ fontSize: 60 }} />,
    color: '#9c27b0',
    href: '/farmer/application/create',
    fee: 2000,
    processingDays: 60,
    disabled: false,
  },
];

const ApplicationTypeSelectionPage: React.FC = () => {
  const router = useRouter();

  const handleSelectType = (type: ApplicationType) => {
    if (type.disabled) return;
    router.push(type.href);
  };

  return (
    <>
      <Head>
        <title>ยื่นคำขออนุญาตใหม่ | GACP System</title>
        <meta name="description" content="ยื่นคำขอใบรับรอง GACP" />
      </Head>

      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 3 }}
          >
            <Link href="/farmer/dashboard" passHref legacyBehavior>
              <MuiLink underline="hover" color="inherit">
                Dashboard
              </MuiLink>
            </Link>
            <Link href="/farmer/applications" passHref legacyBehavior>
              <MuiLink underline="hover" color="inherit">
                คำขออนุญาต
              </MuiLink>
            </Link>
            <Typography color="text.primary">ยื่นคำขอใหม่</Typography>
          </Breadcrumbs>

          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Typography variant="h4" gutterBottom fontWeight="bold">
              ยื่นคำขอใบรับรอง GACP
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              ใบรับรองการปฏิบัติทางการเกษตรและการเก็บรักษาที่ดีสำหรับพืชสมุนไพร
            </Typography>
          </Paper>

          {/* Application Type Cards */}
          <Grid container spacing={3}>
            {applicationTypes.map((type) => (
              <Grid item xs={12} sm={6} md={6} key={type.id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease-in-out',
                    position: 'relative',
                    opacity: type.disabled ? 0.6 : 1,
                    '&:hover': type.disabled
                      ? {}
                      : {
                          transform: 'translateY(-8px)',
                          boxShadow: 6,
                        },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleSelectType(type)}
                    disabled={type.disabled}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      {/* Icon with gradient background */}
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${type.color} 0%, ${type.color}dd 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          mb: 3,
                          mx: 'auto',
                        }}
                      >
                        {type.icon}
                      </Box>

                      {/* Code Badge */}
                      <Chip
                        label={type.code}
                        sx={{
                          bgcolor: type.color,
                          color: 'white',
                          fontWeight: 'bold',
                          mb: 2,
                        }}
                      />

                      {/* Title */}
                      <Typography
                        variant="h6"
                        gutterBottom
                        fontWeight="bold"
                        color="text.primary"
                      >
                        {type.nameTh}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                        sx={{ fontStyle: 'italic', mb: 2 }}
                      >
                        {type.nameEn}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3, minHeight: 60 }}
                      >
                        {type.description}
                      </Typography>

                      {/* Info Grid */}
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              textAlign: 'center',
                              p: 1.5,
                              bgcolor: 'grey.50',
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              ค่าธรรมเนียม
                            </Typography>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                              ฿{type.fee.toLocaleString()}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              textAlign: 'center',
                              p: 1.5,
                              bgcolor: 'grey.50',
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              ระยะเวลาพิจารณา
                            </Typography>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                              {type.processingDays} วัน
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {type.disabled && (
                        <Chip
                          label="ใช้งานได้แล้ว"
                          color="success"
                          size="small"
                          sx={{ mt: 2 }}
                        />
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Info Box */}
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: 3,
              bgcolor: 'info.50',
              borderLeft: 4,
              borderColor: 'info.main',
            }}
          >
            <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="info.main">
              📋 ข้อมูลสำคัญ
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • กรุณาเตรียมเอกสารประกอบการยื่นคำขอให้พร้อม
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • สามารถบันทึกแบบฟอร์มเป็น Draft และกลับมาแก้ไขภายหลังได้
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • ระยะเวลาในการพิจารณาเริ่มนับหลังจากชำระค่าธรรมเนียมและเอกสารครบถ้วน
            </Typography>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default ApplicationTypeSelectionPage;
