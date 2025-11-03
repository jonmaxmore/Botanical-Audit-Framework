'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  Slider,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationOnIcon,
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { withAuth } from '@/components/auth/withAuth';
import { useApplicationContext, type Application } from '@/contexts/ApplicationContext';

/**
 * On-Site Inspection Page
 *
 * หน้าตรวจสอบฟาร์มลงพื้นที่ (Phase 6B)
 * - ให้คะแนน 8 Critical Control Points (CCPs)
 * - Total: 100 points
 * - Pass Threshold: ≥80 points
 * - Upload photos for each CCP
 * - Final notes/recommendations
 */

interface CCP {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  score: number;
  notes: string;
  photos: string[];
}

const OnSiteInspectionPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const applicationId = params?.id as string;
  const { applications, updateApplication } = useApplicationContext();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [ccps, setCcps] = useState<CCP[]>([
    {
      id: 'ccp1',
      name: '1. Seed/Planting Material Quality',
      description: 'คุณภาพเมล็ดพันธุ์และวัสดุปลูก - การเลือกเมล็ดพันธุ์ดี แหล่งที่มา การจัดเก็บ',
      maxScore: 15,
      score: 0,
      notes: '',
      photos: [],
    },
    {
      id: 'ccp2',
      name: '2. Soil Management & Fertilizer',
      description: 'การจัดการดินและปุ๋ย - การวิเคราะห์ดิน ปุ๋ยที่ใช้ อัตราการใช้ การบันทึก',
      maxScore: 15,
      score: 0,
      notes: '',
      photos: [],
    },
    {
      id: 'ccp3',
      name: '3. Pest & Disease Management',
      description: 'การจัดการศัตรูพืชและโรค - การป้องกัน ใช้สารเคมี การบันทึก ระยะปลอดสาร',
      maxScore: 15,
      score: 0,
      notes: '',
      photos: [],
    },
    {
      id: 'ccp4',
      name: '4. Harvesting Practices',
      description: 'กระบวนการเก็บเกี่ยว - จังหวะการเก็บ เครื่องมือ การขนย้าย ความสะอาด',
      maxScore: 15,
      score: 0,
      notes: '',
      photos: [],
    },
    {
      id: 'ccp5',
      name: '5. Post-Harvest Handling',
      description: 'การจัดการหลังการเก็บเกี่ยว - การคัดแยก การทำความสะอาด การบ่ม การอบแห้ง',
      maxScore: 15,
      score: 0,
      notes: '',
      photos: [],
    },
    {
      id: 'ccp6',
      name: '6. Storage & Transportation',
      description: 'การจัดเก็บและขนส่ง - คลังสินค้า อุณหภูมิ ความชื้น ยานพาหนะ',
      maxScore: 10,
      score: 0,
      notes: '',
      photos: [],
    },
    {
      id: 'ccp7',
      name: '7. Record Keeping',
      description: 'การบันทึกข้อมูล - ปูมการปลูก การใช้ปุ๋ย/สารเคมี การเก็บเกี่ยว การขาย',
      maxScore: 10,
      score: 0,
      notes: '',
      photos: [],
    },
    {
      id: 'ccp8',
      name: '8. Worker Training & Safety',
      description: 'การฝึกอบรมและความปลอดภัย - พนักงาน อุปกรณ์ป้องกัน ปฐมพยาบาล',
      maxScore: 5,
      score: 0,
      notes: '',
      photos: [],
    },
  ]);
  const [finalNotes, setFinalNotes] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
  }, [applicationId, applications]);

  const loadApplication = () => {
    const app = applications.find((a) => a.id === applicationId);
    if (app) {
      setApplication(app);
      setLoading(false);
    } else {
      router.push('/inspector/dashboard');
    }
  };

  const handleScoreChange = (ccpId: string, newScore: number) => {
    setCcps((prev) => prev.map((ccp) => (ccp.id === ccpId ? { ...ccp, score: newScore } : ccp)));
  };

  const handleNotesChange = (ccpId: string, notes: string) => {
    setCcps((prev) => prev.map((ccp) => (ccp.id === ccpId ? { ...ccp, notes } : ccp)));
  };

  const handlePhotoUpload = (ccpId: string) => {
    // Mock photo upload
    const mockPhotoUrl = `https://via.placeholder.com/200x150?text=CCP+Photo`;
    setCcps((prev) =>
      prev.map((ccp) =>
        ccp.id === ccpId ? { ...ccp, photos: [...ccp.photos, mockPhotoUrl] } : ccp
      )
    );
    alert('อัปโหลดรูปภาพสำเร็จ (Mock)');
  };

  const handleOpenConfirm = () => {
    const allScored = ccps.every((ccp) => ccp.score > 0);
    if (!allScored) {
      alert('กรุณาให้คะแนนทุก CCP ก่อนส่งรายงาน');
      return;
    }
    setConfirmDialog(true);
  };

  const handleCloseConfirm = () => {
    setConfirmDialog(false);
  };

  const handleSubmit = async () => {
    if (!application) return;

    setSubmitting(true);

    try {
      // Update application
      const updatedApp: Application = {
        ...application,
        workflowState: 'INSPECTION_COMPLETED',
        currentStep: 7,
        inspectionData: {
          type: 'ON_SITE',
          ccps: ccps,
          totalScore: totalScore,
          passStatus: getPassStatus(),
          finalNotes: finalNotes,
          inspectedAt: new Date().toISOString(),
          inspectedBy: 'INSPECTOR',
        },
      };

      updateApplication(updatedApp);

      alert('✅ บันทึกรายงานการตรวจสำเร็จ - ส่งไปขั้นตอนอนุมัติ (Step 7)');

      router.push('/inspector/dashboard');
    } catch (error) {
      console.error('Error submitting inspection:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
      handleCloseConfirm();
    }
  };

  // Calculate total score
  const totalScore = ccps.reduce((sum, ccp) => sum + ccp.score, 0);
  const maxTotalScore = 100;
  const scorePercentage = (totalScore / maxTotalScore) * 100;

  // Pass/Fail logic
  const getPassStatus = () => {
    if (totalScore >= 80) return 'pass';
    if (totalScore >= 70) return 'conditional';
    return 'fail';
  };

  const getPassColor = () => {
    const status = getPassStatus();
    if (status === 'pass') return 'success';
    if (status === 'conditional') return 'warning';
    return 'error';
  };

  const getPassLabel = () => {
    const status = getPassStatus();
    if (status === 'pass') return 'ผ่าน (Pass)';
    if (status === 'conditional') return 'มีเงื่อนไข (Conditional)';
    return 'ไม่ผ่าน (Fail)';
  };

  if (loading || !application) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2 }}>
          กลับ
        </Button>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          📍 On-Site Inspection (ลงพื้นที่ตรวจฟาร์ม)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {application.applicationNumber} - {application.farmInfo?.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Score Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              📊 คะแนนรวม
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Total Score Display */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h2" fontWeight="bold" color={getPassColor()}>
                {totalScore}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                จาก {maxTotalScore} คะแนน
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={scorePercentage}
                color={getPassColor()}
                sx={{ height: 10, borderRadius: 1 }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}
              >
                {scorePercentage.toFixed(1)}%
              </Typography>
            </Box>

            {/* Pass/Fail Status */}
            <Alert severity={getPassColor()} icon={<StarIcon />}>
              <Typography variant="body2" fontWeight="bold">
                สถานะ: {getPassLabel()}
              </Typography>
              <Typography variant="caption">
                {getPassStatus() === 'pass' && '≥80 คะแนน - ผ่านการตรวจ'}
                {getPassStatus() === 'conditional' && '70-79 คะแนน - ต้องปรับปรุง'}
                {getPassStatus() === 'fail' && '<70 คะแนน - ไม่ผ่าน'}
              </Typography>
            </Alert>

            <Divider sx={{ my: 3 }} />

            {/* CCP Scores Breakdown */}
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              คะแนนแต่ละ CCP:
            </Typography>
            {ccps.map((ccp) => (
              <Box key={ccp.id} sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {ccp.name.split('.')[0]}
                  </Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {ccp.score}/{ccp.maxScore}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(ccp.score / ccp.maxScore) * 100}
                  color={
                    ccp.score >= ccp.maxScore * 0.8
                      ? 'success'
                      : ccp.score >= ccp.maxScore * 0.6
                        ? 'warning'
                        : 'error'
                  }
                  sx={{ height: 4, borderRadius: 1 }}
                />
              </Box>
            ))}

            <Divider sx={{ my: 3 }} />

            {/* Farm Info */}
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              ข้อมูลฟาร์ม:
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {application.farmInfo?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              ขนาด: {application.farmInfo?.size} ไร่
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              พืช: {application.farmInfo?.cropType}
            </Typography>
          </Paper>
        </Grid>

        {/* Right Column: CCPs Scoring */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              🎯 ประเมิน 8 Critical Control Points (CCPs)
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Alert severity="info" sx={{ mb: 3 }}>
              ให้คะแนนแต่ละ CCP ตามความเหมาะสม พร้อมบันทึกหมายเหตุและอัปโหลดรูปภาพหลักฐาน
            </Alert>

            {ccps.map((ccp, index) => (
              <Accordion key={ccp.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      mr: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {ccp.name}
                      </Typography>
                      {ccp.score > 0 && (
                        <Chip
                          label={`${ccp.score}/${ccp.maxScore}`}
                          color={ccp.score >= ccp.maxScore * 0.8 ? 'success' : 'warning'}
                          size="small"
                        />
                      )}
                    </Box>
                    <Chip label={`สูงสุด ${ccp.maxScore} คะแนน`} size="small" variant="outlined" />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    {/* Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {ccp.description}
                    </Typography>

                    {/* Score Slider */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom fontWeight="medium">
                        คะแนน: {ccp.score} / {ccp.maxScore}
                      </Typography>
                      <Slider
                        value={ccp.score}
                        onChange={(_, value) => handleScoreChange(ccp.id, value as number)}
                        min={0}
                        max={ccp.maxScore}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                        color={
                          ccp.score >= ccp.maxScore * 0.8
                            ? 'success'
                            : ccp.score >= ccp.maxScore * 0.6
                              ? 'warning'
                              : 'error'
                        }
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          0
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ccp.maxScore}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Notes */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom fontWeight="medium">
                        หมายเหตุ / ข้อสังเกต:
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={ccp.notes}
                        onChange={(e) => handleNotesChange(ccp.id, e.target.value)}
                        placeholder={`บันทึกข้อสังเกตสำหรับ ${ccp.name}...`}
                        size="small"
                      />
                    </Box>

                    {/* Photos */}
                    <Box>
                      <Typography variant="body2" gutterBottom fontWeight="medium">
                        รูปภาพหลักฐาน:
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => handlePhotoUpload(ccp.id)}
                        sx={{ mb: 2 }}
                      >
                        อัปโหลดรูปภาพ
                      </Button>
                      {ccp.photos.length > 0 && (
                        <Grid container spacing={1}>
                          {ccp.photos.map((photo, photoIndex) => (
                            <Grid item xs={4} key={photoIndex}>
                              <Paper sx={{ p: 0.5 }}>
                                <img
                                  src={photo}
                                  alt={`CCP ${index + 1} Photo ${photoIndex + 1}`}
                                  style={{ width: '100%', height: 'auto', borderRadius: 4 }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  textAlign="center"
                                >
                                  รูปที่ {photoIndex + 1}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                      {ccp.photos.length === 0 && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          ยังไม่มีรูปภาพ - แนะนำให้อัปโหลดอย่างน้อย 2-3 รูปต่อ CCP
                        </Alert>
                      )}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>

          {/* Final Notes */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              📝 สรุปผลและคำแนะนำ
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              multiline
              rows={6}
              value={finalNotes}
              onChange={(e) => setFinalNotes(e.target.value)}
              placeholder="บันทึกสรุปผลการตรวจ, จุดแข็ง, จุดที่ควรปรับปรุง, คำแนะนำสำหรับเกษตรกร..."
            />
          </Paper>

          {/* Submit Button */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              ✅ ส่งรายงาน
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                ตรวจสอบก่อนส่ง:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                <li>ให้คะแนนครบทุก CCP (8 รายการ)</li>
                <li>บันทึกหมายเหตุสำคัญ</li>
                <li>อัปโหลดรูปภาพหลักฐาน</li>
                <li>เขียนสรุปผลและคำแนะนำ</li>
              </Box>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                color={getPassColor()}
                onClick={handleOpenConfirm}
                disabled={totalScore === 0}
                sx={{ py: 1.5 }}
              >
                ส่งรายงาน - คะแนนรวม {totalScore}/{maxTotalScore} ({getPassLabel()})
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog} onClose={handleCloseConfirm} maxWidth="sm" fullWidth>
        <DialogTitle>✅ ยืนยันการส่งรายงาน</DialogTitle>
        <DialogContent>
          <Alert severity={getPassColor()} sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              คะแนนรวม: {totalScore}/{maxTotalScore} คะแนน
            </Typography>
            <Typography variant="body2">สถานะ: {getPassLabel()}</Typography>
          </Alert>
          <Typography variant="body2" paragraph>
            คุณกำลังส่งรายงานการตรวจสอบฟาร์ม - ระบบจะส่งไปขั้นตอนอนุมัติ (Step 7: PENDING_APPROVAL)
          </Typography>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            สรุป:
          </Typography>
          <List dense>
            {ccps.map((ccp) => (
              <ListItem key={ccp.id}>
                <ListItemIcon>
                  <CheckCircleIcon
                    color={ccp.score >= ccp.maxScore * 0.8 ? 'success' : 'warning'}
                    fontSize="small"
                  />
                </ListItemIcon>
                <ListItemText
                  primary={`${ccp.name.split('.')[1]} - ${ccp.score}/${ccp.maxScore}`}
                  primaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={submitting}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            color={getPassColor()}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'ยืนยันและส่งรายงาน'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(OnSiteInspectionPage, ['INSPECTOR']);
