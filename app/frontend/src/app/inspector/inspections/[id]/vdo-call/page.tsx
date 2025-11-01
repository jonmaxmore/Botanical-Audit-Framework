'use client';

import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
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
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocationOn as LocationOnIcon,
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { withAuth } from '@/contexts/AuthContext';
import {
  useApplicationContext,
  type Application,
  type InspectionChecklistItem,
} from '@/contexts/ApplicationContext';

/**
 * VDO Call Inspection Page
 *
 * หน้าบันทึกผลการตรวจสอบผ่าน VDO Call
 * - แสดงข้อมูลใบสมัคร
 * - Checklist การตรวจเบื้องต้น
 * - ตัดสินใจ: เพียงพอ (INSPECTION_COMPLETED) หรือ ต้องลงพื้นที่ (INSPECTION_ON_SITE)
 * - อัปโหลดรูปภาพหลักฐาน (screenshots)
 * - บันทึกหมายเหตุ
 */

type ChecklistItem = InspectionChecklistItem & {
  label: string;
  checked: boolean;
};

const VdoCallInspectionPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const applicationId = params?.id as string;
  const { applications, updateApplication } = useApplicationContext();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: '1',
      question: 'เกษตรกรแสดงพื้นที่ฟาร์มผ่านกล้อง',
      label: 'เกษตรกรแสดงพื้นที่ฟาร์มผ่านกล้อง',
      checked: false,
    },
    {
      id: '2',
      question: 'สามารถเห็นแปลงปลูกได้ชัดเจน',
      label: 'สามารถเห็นแปลงปลูกได้ชัดเจน',
      checked: false,
    },
    {
      id: '3',
      question: 'แสดงพื้นที่เก็บเก็บเกี่ยว/บ่มสุก',
      label: 'แสดงพื้นที่เก็บเก็บเกี่ยว/บ่มสุก',
      checked: false,
    },
    {
      id: '4',
      question: 'แสดงพื้นที่จัดเก็บ/คลังสินค้า',
      label: 'แสดงพื้นที่จัดเก็บ/คลังสินค้า',
      checked: false,
    },
    {
      id: '5',
      question: 'แสดงระบบน้ำและการชลประทาน',
      label: 'แสดงระบบน้ำและการชลประทาน',
      checked: false,
    },
    {
      id: '6',
      question: 'แสดงพื้นที่จัดการปุ๋ย/สารเคมี',
      label: 'แสดงพื้นที่จัดการปุ๋ย/สารเคมี',
      checked: false,
    },
    {
      id: '7',
      question: 'สามารถสอบถามเกี่ยวกับกระบวนการปลูกได้',
      label: 'สามารถสอบถามเกี่ยวกับกระบวนการปลูกได้',
      checked: false,
    },
    {
      id: '8',
      question: 'เกษตรกรมีความรู้เรื่อง GACP',
      label: 'เกษตรกรมีความรู้เรื่อง GACP',
      checked: false,
    },
  ]);
  const [decision, setDecision] = useState<'sufficient' | 'on_site' | null>(null);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
  }, [applicationId, applications]);

  const loadApplication = () => {
    const app = applications.find((a: Application) => a.id === applicationId);
    if (app) {
      setApplication(app);
      setLoading(false);
    } else {
      router.push('/inspector/dashboard');
    }
  };

  const handleChecklistChange = (id: string) => {
    setChecklist((prev: ChecklistItem[]) =>
      prev.map((item: ChecklistItem) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handlePhotoUpload = () => {
    // Mock photo upload
    const mockPhotoUrl = `https://via.placeholder.com/300x200?text=VDO+Screenshot+${photos.length + 1}`;
    setPhotos((prev: string[]) => [...prev, mockPhotoUrl]);
    alert('อัปโหลดรูปภาพสำเร็จ (Mock)');
  };

  const handleOpenConfirm = () => {
    if (!decision) {
      alert('กรุณาเลือกการตัดสินใจ');
      return;
    }
    setConfirmDialog(true);
  };

  const handleCloseConfirm = () => {
    setConfirmDialog(false);
  };

  const handleSubmit = async () => {
    if (!application || !decision) return;

    setSubmitting(true);

    try {
      // Determine new workflow state
      const newState: Application['workflowState'] =
        decision === 'sufficient' ? 'INSPECTION_COMPLETED' : 'INSPECTION_ON_SITE';

      // Update application
      const updatedApp: Application = {
        ...application,
        workflowState: newState,
        currentStep: decision === 'sufficient' ? 7 : 6,
        inspectionData: {
          type: 'VDO_CALL',
          checklist: checklist.map((item: ChecklistItem) => {
            const { checked, label, ...rest } = item;
            return {
              ...rest,
              status: checked ? 'completed' : 'pending',
              notes: checked ? 'ผ่านการตรวจผ่าน VDO Call' : undefined,
            } as InspectionChecklistItem;
          }),
          decision: decision,
          notes: notes,
          photos: photos,
          inspectedAt: new Date().toISOString(),
          inspectedBy: 'INSPECTOR', // In real app: get from auth context
          ...(decision === 'sufficient' && {
            score: 85, // Mock score for VDO Call only
          }),
        },
      };

      updateApplication(updatedApp);

      alert(
        decision === 'sufficient'
          ? '✅ บันทึกผลการตรวจสำเร็จ - การตรวจผ่าน VDO Call เพียงพอ'
          : '📍 บันทึกสำเร็จ - กำหนดนัดลงพื้นที่ตรวจฟาร์ม'
      );

      router.push('/inspector/dashboard');
    } catch (error) {
      console.error('Error submitting inspection:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
      handleCloseConfirm();
    }
  };

  const checkedCount = checklist.filter((item: ChecklistItem) => item.checked).length;
  const totalCount = checklist.length;
  const completionRate = Math.round((checkedCount / totalCount) * 100);

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
          📹 VDO Call Inspection
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {application.applicationNumber} - {application.farmInfo?.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Application Details */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              🌾 ข้อมูลฟาร์ม
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ '& > div': { mb: 1.5 } }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ชื่อฟาร์ม:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {application.farmInfo?.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ขนาดพื้นที่:
                </Typography>
                <Typography variant="body2">{application.farmInfo?.size} ไร่</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ประเภทพืช:
                </Typography>
                <Typography variant="body2">{application.farmInfo?.cropType}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  จังหวัด:
                </Typography>
                <Typography variant="body2">{application.farmInfo?.province}</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              👤 ข้อมูลเกษตรกร
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ '& > div': { mb: 1.5 } }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ชื่อ-นามสกุล:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {application.farmerInfo?.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  โทรศัพท์:
                </Typography>
                <Typography variant="body2">{application.farmerInfo?.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ประสบการณ์:
                </Typography>
                <Typography variant="body2">{application.farmerInfo?.experience} ปี</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Inspection Form */}
        <Grid item xs={12} md={8}>
          {/* Checklist */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              ✅ Checklist การตรวจเบื้องต้น
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Alert severity="info" sx={{ mb: 2 }}>
              ความสมบูรณ์:{' '}
              <strong>
                {checkedCount}/{totalCount}
              </strong>{' '}
              รายการ ({completionRate}%)
            </Alert>

            <List>
              {checklist.map((item: ChecklistItem) => (
                <ListItem key={item.id} sx={{ py: 0.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={item.checked}
                        onChange={() => handleChecklistChange(item.id)}
                        color="primary"
                      />
                    }
                    label={item.label}
                    sx={{ width: '100%' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Photo Upload */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              📷 รูปภาพหลักฐาน (Screenshots)
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={handlePhotoUpload}
              sx={{ mb: 2 }}
            >
              อัปโหลดรูปภาพ
            </Button>

            {photos.length > 0 && (
              <Grid container spacing={2}>
                {photos.map((photo: string, index: number) => (
                  <Grid item xs={6} md={4} key={index}>
                    <Paper
                      sx={{
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <img
                        src={photo}
                        alt={`Screenshot ${index + 1}`}
                        style={{ width: '100%', height: 'auto', borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        รูปที่ {index + 1}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}

            {photos.length === 0 && (
              <Alert severity="warning">
                ยังไม่มีรูปภาพหลักฐาน - กรุณาอัปโหลดอย่างน้อย 3-5 รูป
              </Alert>
            )}
          </Paper>

          {/* Notes */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              📝 หมายเหตุ / ข้อสังเกต
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              multiline
              rows={4}
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
              placeholder="บันทึกข้อสังเกต, จุดที่ดี, จุดที่ควรปรับปรุง, คำแนะนำ..."
            />
          </Paper>

          {/* Decision */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              ⚖️ การตัดสินใจ
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <FormControl component="fieldset">
              <FormLabel component="legend">จากการตรวจผ่าน VDO Call คุณเห็นว่า:</FormLabel>
              <RadioGroup
                value={decision}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDecision(e.target.value as 'sufficient' | 'on_site')
                }
              >
                <FormControlLabel
                  value="sufficient"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" />
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          เพียงพอ - ไม่ต้องลงพื้นที่
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ฟาร์มมีมาตรฐานดี สามารถปิดการตรวจได้ (State: INSPECTION_COMPLETED)
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                />
                <FormControlLabel
                  value="on_site"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon color="secondary" />
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          ต้องลงพื้นที่ตรวจ
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          จำเป็นต้องตรวจสอบฟาร์มจริงและให้คะแนน 8 CCPs (State: INSPECTION_ON_SITE)
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                />
              </RadioGroup>
            </FormControl>

            <Alert severity="warning" sx={{ mt: 3 }}>
              <strong>หมายเหตุ:</strong> หากเลือก "เพียงพอ" - ระบบจะปิดการตรวจและส่งไปขั้นตอนอนุมัติ
              (Step 7)
              <br />
              หากเลือก "ต้องลงพื้นที่" - จะต้องนัดหมายและลงพื้นที่ตรวจฟาร์มจริง (Step 6B)
            </Alert>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                color="primary"
                disabled={!decision}
                onClick={handleOpenConfirm}
                sx={{ py: 1.5 }}
              >
                {decision === 'sufficient' ? '✅ บันทึกและปิดการตรวจ' : '📍 บันทึกและนัดลงพื้นที่'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog} onClose={handleCloseConfirm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {decision === 'sufficient' ? '✅ ยืนยันการตรวจผ่าน VDO Call' : '📍 ยืนยันการนัดลงพื้นที่'}
        </DialogTitle>
        <DialogContent>
          {decision === 'sufficient' ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              คุณกำลังปิดการตรวจ - ใบสมัครจะส่งไปขั้นตอนอนุมัติ (Step 7: PENDING_APPROVAL)
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              คุณกำลังกำหนดให้ต้องลงพื้นที่ตรวจ - จะต้องนัดหมายและตรวจฟาร์มจริง พร้อมให้คะแนน 8 CCPs
            </Alert>
          )}
          <Typography variant="body2">กรุณาตรวจสอบข้อมูลอีกครั้งก่อนยืนยัน:</Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color={checkedCount >= 6 ? 'success' : 'warning'} />
              </ListItemIcon>
              <ListItemText
                primary={`Checklist: ${checkedCount}/${totalCount} รายการ`}
                secondary={checkedCount < 6 ? 'แนะนำให้เช็คอย่างน้อย 6 รายการ' : 'ครบถ้วน'}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color={photos.length >= 3 ? 'success' : 'warning'} />
              </ListItemIcon>
              <ListItemText
                primary={`รูปภาพ: ${photos.length} รูป`}
                secondary={photos.length < 3 ? 'แนะนำให้อัปโหลดอย่างน้อย 3 รูป' : 'เพียงพอ'}
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={submitting}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            color={decision === 'sufficient' ? 'success' : 'primary'}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'ยืนยัน'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(VdoCallInspectionPage, ['INSPECTOR']);
