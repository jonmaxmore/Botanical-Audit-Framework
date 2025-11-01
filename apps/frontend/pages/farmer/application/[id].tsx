import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Link as MuiLink,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FarmerLayout from '../../../components/layout/FarmerLayout';
import { useAuth } from '../../../contexts/AuthContext';

interface ApplicantInfo {
  applicantType: 'INDIVIDUAL' | 'COMMUNITY_ENTERPRISE' | 'LEGAL_ENTITY';
  fullName?: string;
  organizationName?: string;
  registrationNumber?: string;
  idCardNumber?: string;
  address: string;
  subDistrict?: string;
  district?: string;
  province: string;
  postalCode?: string;
  phone: string;
  email?: string;
  lineId?: string;
}

interface FarmInfo {
  farmName: string;
  purpose: 'MEDICAL_USE' | 'EXPORT' | 'OTHER';
  farmType: 'OUTDOOR' | 'INDOOR' | 'GREENHOUSE' | 'OTHER';
  farmAddress: string;
  subDistrict?: string;
  district?: string;
  province: string;
  postalCode?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  landDocumentType?: string;
  landDocumentNumber?: string;
  landStatus?: 'OWNER' | 'AUTHORIZED_USE' | 'RENTED';
  landOwnerName?: string;
  farmAreaSqM: number;
  plantVariety?: string;
  plantPart?: string;
  plantSource?: string;
  plantQuantity?: number;
  harvestRoundsPerYear?: number;
}

interface AttachmentInfo {
  id: string;
  category: string;
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  uploadedAt: string;
}

interface ConsentInfo {
  agreeAccuracy: boolean;
  agreeDisclosure: boolean;
  digitalSignature?: string;
  submittedAt?: string;
}

interface ApplicationDetailResponse {
  id: string;
  applicationNumber: string;
  status: string;
  submittedAt?: string;
  updatedAt?: string;
  applicant: ApplicantInfo;
  farm: FarmInfo;
  attachments: AttachmentInfo[];
  consent?: ConsentInfo;
}

const applicantTypeLabels: Record<ApplicantInfo['applicantType'], string> = {
  INDIVIDUAL: 'บุคคลธรรมดา',
  COMMUNITY_ENTERPRISE: 'วิสาหกิจชุมชน',
  LEGAL_ENTITY: 'นิติบุคคล'
};

const purposeLabels: Record<FarmInfo['purpose'], string> = {
  MEDICAL_USE: 'เพื่อใช้ทางการแพทย์',
  EXPORT: 'เพื่อการส่งออก',
  OTHER: 'อื่นๆ'
};

const farmTypeLabels: Record<FarmInfo['farmType'], string> = {
  OUTDOOR: 'กลางแจ้ง',
  INDOOR: 'โรงเรือนระบบปิด',
  GREENHOUSE: 'กรีนเฮ้าส์',
  OTHER: 'อื่นๆ'
};

const landStatusLabels: Record<NonNullable<FarmInfo['landStatus']>, string> = {
  OWNER: 'เจ้าของที่ดิน',
  AUTHORIZED_USE: 'ได้รับอนุญาตใช้ที่ดิน',
  RENTED: 'เช่าที่ดิน'
};

const statusColors: Record<string, string> = {
  draft: '#757575',
  submitted: '#0288d1',
  under_review: '#f9a825',
  approved: '#2e7d32',
  rejected: '#c62828'
};

function formatDate(value?: string) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatNumber(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '-';
  }
  return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value);
}

export default function FarmerApplicationDetailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;

  const [data, setData] = useState<ApplicationDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusChipColor = useMemo(() => {
    if (!data?.status) {
      return '#424242';
    }
    return statusColors[data.status] ?? '#424242';
  }, [data?.status]);

  useEffect(() => {
    if (!router.isReady || !id) {
      return;
    }

    const controller = new AbortController();
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/farmer/application/${encodeURIComponent(String(id))}`, {
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('ไม่พบคำขอที่ระบุ');
          } else {
            const errorPayload = await response.json().catch(() => null);
            setError(errorPayload?.message ?? 'ไม่สามารถโหลดข้อมูลคำขอได้');
          }
          setData(null);
          return;
        }

        const payload: ApplicationDetailResponse = await response.json();
        setData(payload);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลคำขอ');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();

    return () => {
      controller.abort();
    };
  }, [id, router.isReady]);

  const renderAttachmentIcon = (category: string) => {
    if (category.toLowerCase().includes('map')) {
      return <LocationOnIcon fontSize="small" />;
    }
    if (category.toLowerCase().includes('consent')) {
      return <SecurityIcon fontSize="small" />;
    }
    if (category.toLowerCase().includes('plan')) {
      return <DescriptionIcon fontSize="small" />;
    }
    if (category.toLowerCase().includes('photo')) {
      return <InsertDriveFileIcon fontSize="small" />;
    }
    return <UploadFileIcon fontSize="small" />;
  };

  const handleBack = () => {
    router.push('/farmer/dashboard');
  };

  return (
    <>
      <Head>
        <title>
          {data?.applicationNumber
            ? `${data.applicationNumber} | รายละเอียดคำขอ`
            : 'รายละเอียดคำขอ GACP'}
        </title>
      </Head>
      <FarmerLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            mb={3}
          >
            <Button startIcon={<ArrowBackIcon />} onClick={handleBack} variant="text">
              กลับแดชบอร์ด
            </Button>
            {data?.applicationNumber && (
              <Chip
                label={data.applicationNumber}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Stack>

          {loading ? (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight="40vh">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : !data ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              ไม่พบข้อมูลคำขอ กรุณาตรวจสอบอีกครั้ง
            </Alert>
          ) : (
            <Stack spacing={3}>
              <Paper sx={{ p: 3 }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  spacing={2}
                  mb={2}
                >
                  <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      รายละเอียดคำขอรับรอง
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      อัปเดตล่าสุด: {formatDate(data.updatedAt)}
                    </Typography>
                  </Box>
                  <Chip
                    label={data.status ? data.status.toUpperCase() : 'UNKNOWN'}
                    sx={{
                      bgcolor: statusChipColor,
                      color: '#fff',
                      fontWeight: 600,
                      alignSelf: 'flex-start'
                    }}
                  />
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="overline"
                      sx={{ fontWeight: 700, color: 'text.secondary' }}
                    >
                      วันที่ยื่นคำขอ
                    </Typography>
                    <Typography variant="h6">{formatDate(data.submittedAt)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="overline"
                      sx={{ fontWeight: 700, color: 'text.secondary' }}
                    >
                      ผู้ใช้งาน
                    </Typography>
                    <Typography variant="h6">{user?.fullName ?? '-'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <PersonIcon color="primary" />
                  <Typography variant="h5" fontWeight={700}>
                    ข้อมูลผู้ขอใบรับรอง
                  </Typography>
                </Stack>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ประเภทผู้ขอ
                    </Typography>
                    <Typography variant="body1">
                      {applicantTypeLabels[data.applicant.applicantType]}
                    </Typography>
                  </Grid>
                  {data.applicant.fullName && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        ชื่อผู้ขอ / ผู้มีอำนาจลงนาม
                      </Typography>
                      <Typography variant="body1">{data.applicant.fullName}</Typography>
                    </Grid>
                  )}
                  {data.applicant.organizationName && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        ชื่อวิสาหกิจ / นิติบุคคล
                      </Typography>
                      <Typography variant="body1">{data.applicant.organizationName}</Typography>
                    </Grid>
                  )}
                  {data.applicant.registrationNumber && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        เลขทะเบียน / ผู้เสียภาษี
                      </Typography>
                      <Typography variant="body1">{data.applicant.registrationNumber}</Typography>
                    </Grid>
                  )}
                  {data.applicant.idCardNumber && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        เลขบัตรประชาชน
                      </Typography>
                      <Typography variant="body1">{data.applicant.idCardNumber}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ที่อยู่
                    </Typography>
                    <Typography variant="body1">
                      {data.applicant.address}
                      {data.applicant.subDistrict ? ` ต.${data.applicant.subDistrict}` : ''}
                      {data.applicant.district ? ` อ.${data.applicant.district}` : ''}
                      {` จ.${data.applicant.province}`}
                      {data.applicant.postalCode ? ` ${data.applicant.postalCode}` : ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      โทรศัพท์
                    </Typography>
                    <Typography variant="body1">{data.applicant.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      อีเมล
                    </Typography>
                    <Typography variant="body1">{data.applicant.email ?? '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Line ID
                    </Typography>
                    <Typography variant="body1">{data.applicant.lineId ?? '-'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <LocationOnIcon color="primary" />
                  <Typography variant="h5" fontWeight={700}>
                    ข้อมูลแปลงปลูก / แปรรูป
                  </Typography>
                </Stack>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ชื่อสถานที่
                    </Typography>
                    <Typography variant="body1">{data.farm.farmName}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      วัตถุประสงค์
                    </Typography>
                    <Typography variant="body1">{purposeLabels[data.farm.purpose]}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ลักษณะพื้นที่
                    </Typography>
                    <Typography variant="body1">{farmTypeLabels[data.farm.farmType]}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ที่ตั้ง
                    </Typography>
                    <Typography variant="body1">
                      {data.farm.farmAddress}
                      {data.farm.subDistrict ? ` ต.${data.farm.subDistrict}` : ''}
                      {data.farm.district ? ` อ.${data.farm.district}` : ''}
                      {` จ.${data.farm.province}`}
                      {data.farm.postalCode ? ` ${data.farm.postalCode}` : ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      เอกสารสิทธิ์ที่ดิน
                    </Typography>
                    <Typography variant="body1">
                      {data.farm.landDocumentType ?? '-'}
                      {data.farm.landDocumentNumber ? ` (${data.farm.landDocumentNumber})` : ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      สถานะที่ดิน
                    </Typography>
                    <Typography variant="body1">
                      {data.farm.landStatus ? landStatusLabels[data.farm.landStatus] : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      เจ้าของที่ดิน
                    </Typography>
                    <Typography variant="body1">{data.farm.landOwnerName ?? '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ขนาดพื้นที่ (ตร.ม.)
                    </Typography>
                    <Typography variant="body1">{formatNumber(data.farm.farmAreaSqM)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      พิกัด GPS
                    </Typography>
                    <Typography variant="body1">
                      {data.farm.gpsLatitude && data.farm.gpsLongitude
                        ? `${data.farm.gpsLatitude.toFixed(6)}, ${data.farm.gpsLongitude.toFixed(6)}`
                        : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      จำนวนต้น / รอบ
                    </Typography>
                    <Typography variant="body1">
                      {data.farm.plantQuantity
                        ? `${formatNumber(data.farm.plantQuantity)} ต้น`
                        : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      รอบการเก็บเกี่ยวต่อปี
                    </Typography>
                    <Typography variant="body1">
                      {data.farm.harvestRoundsPerYear
                        ? `${formatNumber(data.farm.harvestRoundsPerYear)} รอบ`
                        : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      สายพันธุ์กัญชา
                    </Typography>
                    <Typography variant="body1">{data.farm.plantVariety ?? '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ส่วนที่ใช้ / ผลิตภัณฑ์
                    </Typography>
                    <Typography variant="body1">{data.farm.plantPart ?? '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      แหล่งที่มา
                    </Typography>
                    <Typography variant="body1">{data.farm.plantSource ?? '-'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <UploadFileIcon color="primary" />
                  <Typography variant="h5" fontWeight={700}>
                    เอกสารประกอบ
                  </Typography>
                </Stack>
                {data.attachments.length === 0 ? (
                  <Alert severity="warning">ยังไม่มีการแนบเอกสาร</Alert>
                ) : (
                  <Stack spacing={2}>
                    {data.attachments.map(attachment => (
                      <Paper key={attachment.id} variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={6}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {renderAttachmentIcon(attachment.category)}
                              <Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {attachment.fileName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  หมวด: {attachment.category}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="text.secondary">
                              อัปโหลดเมื่อ
                            </Typography>
                            <Typography variant="body1">
                              {formatDate(attachment.uploadedAt)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Button
                              component={MuiLink}
                              href={attachment.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="outlined"
                              startIcon={<DownloadIcon />}
                            >
                              ดาวน์โหลด
                            </Button>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <TaskAltIcon color="primary" />
                  <Typography variant="h5" fontWeight={700}>
                    การรับรองและยินยอม
                  </Typography>
                </Stack>
                {data.consent ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        ยืนยันความถูกต้องของข้อมูล
                      </Typography>
                      <Typography variant="body1">
                        {data.consent.agreeAccuracy ? '✔ ยืนยันแล้ว' : '✘ ยังไม่ยืนยัน'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        ยินยอมเปิดเผยข้อมูล
                      </Typography>
                      <Typography variant="body1">
                        {data.consent.agreeDisclosure ? '✔ ยินยอม' : '✘ ยังไม่ยินยอม'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        วันที่ยืนยัน
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(data.consent.submittedAt)}
                      </Typography>
                    </Grid>
                    {data.consent.digitalSignature && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          ลายเซ็นดิจิทัล
                        </Typography>
                        <Box
                          component="img"
                          src={data.consent.digitalSignature}
                          alt="digital-signature"
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            maxWidth: 320,
                            width: '100%',
                            py: 2,
                            px: 3,
                            bgcolor: '#fff'
                          }}
                        />
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Alert severity="warning">ยังไม่มีการบันทึกการยินยอม</Alert>
                )}
              </Paper>
            </Stack>
          )}
        </Container>
      </FarmerLayout>
    </>
  );
}
