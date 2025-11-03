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
  Card,
  CardContent,
  TextField,
  MenuItem,
  Rating,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useApplication, type Application } from '@/contexts/ApplicationContext';

/**
 * DTAM Officer Review Page
 *
 * หน้าตรวจสอบเอกสารสำหรับ DTAM_OFFICER
 * - แสดงข้อมูลใบสมัคร
 * - ตรวจเอกสาร 5 ชนิด (แต่ละชนิด: View + Approve/Reject)
 * - Review Form (Completeness, Accuracy, Risk Assessment)
 * - Decision: Approve / Revision / Reject
 */

type DocumentType = 'ID_CARD' | 'HOUSE_REGISTRATION' | 'LAND_DEED' | 'FARM_MAP' | 'WATER_PERMIT';

interface DocumentReview {
  type: DocumentType;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
}

interface ReviewFormData {
  completeness: number; // 1-5 stars
  accuracy: number; // 1-5 stars
  riskLevel: 'low' | 'medium' | 'high';
  comments: string;
  documents: DocumentReview[];
}

const OfficerReviewPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const applicationId = params?.id as string;
  const { applications, updateApplication } = useApplication();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    completeness: 3,
    accuracy: 3,
    riskLevel: 'low',
    comments: '',
    documents: [
      { type: 'ID_CARD', status: 'pending', notes: '' },
      { type: 'HOUSE_REGISTRATION', status: 'pending', notes: '' },
      { type: 'LAND_DEED', status: 'pending', notes: '' },
      { type: 'FARM_MAP', status: 'pending', notes: '' },
      { type: 'WATER_PERMIT', status: 'pending', notes: '' },
    ],
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    decision: 'approve' | 'revision' | 'reject' | null;
  }>({ open: false, decision: null });
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
      router.push('/officer/applications');
    }
  };

  const getDocumentName = (type: DocumentType): string => {
    const names = {
      ID_CARD: 'สำเนาบัตรประชาชน',
      HOUSE_REGISTRATION: 'สำเนาทะเบียนบ้าน',
      LAND_DEED: 'สำเนาโฉนดที่ดิน',
      FARM_MAP: 'แผนที่ฟาร์ม',
      WATER_PERMIT: 'ใบอนุญาตแหล่งน้ำ',
    };
    return names[type];
  };

  const handleDocumentReview = (
    type: DocumentType,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    setReviewForm((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.type === type ? { ...doc, status, notes: notes || doc.notes } : doc
      ),
    }));
  };

  const handleOpenConfirmDialog = (decision: 'approve' | 'revision' | 'reject') => {
    setConfirmDialog({ open: true, decision });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, decision: null });
  };

  const handleSubmitReview = async () => {
    if (!application || !confirmDialog.decision) return;

    setSubmitting(true);

    try {
      // Validate
      if (confirmDialog.decision === 'approve') {
        const allApproved = reviewForm.documents.every((doc) => doc.status === 'approved');
        if (!allApproved) {
          alert('กรุณาอนุมัติเอกสารทั้งหมดก่อนอนุมัติใบสมัคร');
          setSubmitting(false);
          return;
        }
      }

      if (confirmDialog.decision === 'revision') {
        const hasRejected = reviewForm.documents.some((doc) => doc.status === 'rejected');
        if (!hasRejected) {
          alert('กรุณาระบุเอกสารที่ต้องแก้ไข');
          setSubmitting(false);
          return;
        }
      }

      // Determine new workflow state
      let newState: Application['currentState'] = application.currentState;
      if (confirmDialog.decision === 'approve') {
        newState = 'DOCUMENT_APPROVED';
      } else if (confirmDialog.decision === 'revision') {
        newState = 'DOCUMENT_REVISION';
      } else if (confirmDialog.decision === 'reject') {
        newState = 'DOCUMENT_REJECTED';
      }

      // Update application
      const updatedApp: Application = {
        ...application,
        currentState: newState,
        currentStep: newState === 'DOCUMENT_APPROVED' ? 4 : 3,
        // reviewData stored separately
        documents: application.documents.map((doc) => {
          const review = reviewForm.documents.find((r) => r.type === doc.type);
          return {
            ...doc,
            status:
              review?.status === 'approved'
                ? 'APPROVED'
                : review?.status === 'rejected'
                  ? 'REJECTED'
                  : 'PENDING',
            reviewNotes: review?.notes || '',
          };
        }),
      };

      updateApplication(updatedApp.id, updatedApp);

      // Show success message
      alert(
        `บันทึกผลการตรวจสอบเรียบร้อย: ${
          confirmDialog.decision === 'approve'
            ? 'อนุมัติ'
            : confirmDialog.decision === 'revision'
              ? 'ขอแก้ไข'
              : 'ปฏิเสธ'
        }`
      );

      // Navigate back
      router.push('/officer/applications');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
      handleCloseConfirmDialog();
    }
  };

  const canApprove = reviewForm.documents.every((doc) => doc.status === 'approved');
  const canRevision = reviewForm.documents.some((doc) => doc.status === 'rejected');

  if (loading || !application) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Check if can review
  const canReview =
    application.currentState === 'DOCUMENT_REVIEW' ||
    application.currentState === 'DOCUMENT_REVISION';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2 }}>
          กลับ
        </Button>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          🔍 ตรวจสอบเอกสารใบสมัคร
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {application.applicationNumber} - {application.farmerName + "'s Farm"}
        </Typography>
      </Box>

      {/* Alert if already reviewed */}
      {!canReview && (
        <Alert severity="info" sx={{ mb: 3 }}>
          ใบสมัครนี้ได้รับการตรวจสอบแล้ว (สถานะ: {application.currentState})
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Application Details */}
        <Grid item xs={12} md={4}>
          {/* Farm Info */}
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
                  {application.farmerName + "'s Farm"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ขนาดพื้นที่:
                </Typography>
                <Typography variant="body2">{'[Farm Size]'} ไร่</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ประเภทพืช:
                </Typography>
                <Typography variant="body2">{'[Farm Info]'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  จังหวัด:
                </Typography>
                <Typography variant="body2">{'[Farm Info]'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ที่อยู่:
                </Typography>
                <Typography variant="body2">{'[Farm Info]'}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Farmer Info */}
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
                  {application.farmerName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  เลขบัตรประชาชน:
                </Typography>
                <Typography variant="body2">{application.farmerName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  โทรศัพท์:
                </Typography>
                <Typography variant="body2">{application.farmerName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  อีเมล:
                </Typography>
                <Typography variant="body2">{application.farmerName || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ประสบการณ์:
                </Typography>
                <Typography variant="body2">{'[Experience]'} ปี</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Document Review */}
        <Grid item xs={12} md={8}>
          {/* Documents Checklist */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              📄 ตรวจสอบเอกสาร (5 ชนิด)
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List>
              {reviewForm.documents.map((doc, index) => {
                const appDoc = application.documents.find((d) => d.type === doc.type);
                return (
                  <React.Fragment key={doc.type}>
                    <ListItem
                      sx={{
                        bgcolor: index % 2 === 0 ? 'grey.50' : 'white',
                        borderRadius: 1,
                        mb: 1,
                        flexDirection: 'column',
                        alignItems: 'stretch',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                        <ListItemIcon>
                          {doc.status === 'approved' ? (
                            <CheckCircleIcon color="success" />
                          ) : doc.status === 'rejected' ? (
                            <CancelIcon color="error" />
                          ) : (
                            <DescriptionIcon color="action" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={getDocumentName(doc.type)}
                          secondary={
                            appDoc?.uploadedAt
                              ? `อัปโหลดเมื่อ: ${new Date(appDoc.uploadedAt).toLocaleString('th-TH')}`
                              : 'ยังไม่อัปโหลด'
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="ดูเอกสาร">
                            <IconButton size="small" color="primary" disabled={!appDoc?.fileUrl}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="ดาวน์โหลด">
                            <IconButton size="small" disabled={!appDoc?.fileUrl}>
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {canReview && appDoc?.fileUrl && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Button
                              variant={doc.status === 'approved' ? 'contained' : 'outlined'}
                              color="success"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleDocumentReview(doc.type, 'approved')}
                            >
                              อนุมัติ
                            </Button>
                            <Button
                              variant={doc.status === 'rejected' ? 'contained' : 'outlined'}
                              color="error"
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => handleDocumentReview(doc.type, 'rejected')}
                            >
                              ปฏิเสธ
                            </Button>
                          </Box>
                          {doc.status === 'rejected' && (
                            <TextField
                              fullWidth
                              size="small"
                              label="หมายเหตุ / เหตุผลที่ปฏิเสธ"
                              value={doc.notes}
                              onChange={(e) => {
                                setReviewForm((prev) => ({
                                  ...prev,
                                  documents: prev.documents.map((d) =>
                                    d.type === doc.type ? { ...d, notes: e.target.value } : d
                                  ),
                                }));
                              }}
                              placeholder="ระบุเหตุผล เช่น เอกสารไม่ชัดเจน, หมดอายุ, ข้อมูลไม่ตรง"
                              multiline
                              rows={2}
                            />
                          )}
                        </Box>
                      )}
                    </ListItem>
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>

          {/* Review Form */}
          {canReview && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                📝 แบบฟอร์มประเมิน
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* Completeness */}
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom fontWeight="medium">
                    ความครบถ้วนของเอกสาร
                  </Typography>
                  <Rating
                    value={reviewForm.completeness}
                    onChange={(_, value) =>
                      setReviewForm((prev) => ({ ...prev, completeness: value || 3 }))
                    }
                    size="large"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {reviewForm.completeness}/5 คะแนน
                  </Typography>
                </Grid>

                {/* Accuracy */}
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom fontWeight="medium">
                    ความถูกต้องของข้อมูล
                  </Typography>
                  <Rating
                    value={reviewForm.accuracy}
                    onChange={(_, value) =>
                      setReviewForm((prev) => ({ ...prev, accuracy: value || 3 }))
                    }
                    size="large"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {reviewForm.accuracy}/5 คะแนน
                  </Typography>
                </Grid>

                {/* Risk Level */}
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="ประเมินความเสี่ยง (Risk Assessment)"
                    value={reviewForm.riskLevel}
                    onChange={(e) =>
                      setReviewForm((prev) => ({ ...prev, riskLevel: e.target.value as any }))
                    }
                  >
                    <MenuItem value="low">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="ต่ำ" color="success" size="small" />
                        <Typography variant="body2">- เอกสารครบถ้วน ถูกต้อง</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="medium">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="ปานกลาง" color="warning" size="small" />
                        <Typography variant="body2">- มีข้อสงสัยบางประการ</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="high">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="สูง" color="error" size="small" />
                        <Typography variant="body2">- พบความผิดปกติ</Typography>
                      </Box>
                    </MenuItem>
                  </TextField>
                </Grid>

                {/* Comments */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ความคิดเห็น / หมายเหตุ"
                    value={reviewForm.comments}
                    onChange={(e) =>
                      setReviewForm((prev) => ({ ...prev, comments: e.target.value }))
                    }
                    multiline
                    rows={4}
                    placeholder="ระบุข้อสังเกต, คำแนะนำ, หรือข้อควรระวัง..."
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Decision Buttons */}
          {canReview && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                ✅ ตัดสินใจ
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<CheckCircleIcon />}
                    disabled={!canApprove}
                    onClick={() => handleOpenConfirmDialog('approve')}
                    sx={{ py: 1.5 }}
                  >
                    อนุมัติทั้งหมด
                  </Button>
                  {!canApprove && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: 'block' }}
                    >
                      อนุมัติเอกสารทั้ง 5 ชนิดก่อน
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    size="large"
                    startIcon={<EditIcon />}
                    disabled={!canRevision}
                    onClick={() => handleOpenConfirmDialog('revision')}
                    sx={{ py: 1.5 }}
                  >
                    ขอแก้ไข
                  </Button>
                  {!canRevision && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: 'block' }}
                    >
                      ปฏิเสธเอกสารที่ต้องแก้ไข
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<CancelIcon />}
                    onClick={() => handleOpenConfirmDialog('reject')}
                    sx={{ py: 1.5 }}
                  >
                    ปฏิเสธใบสมัคร
                  </Button>
                </Grid>
              </Grid>

              <Alert severity="info" icon={<WarningIcon />} sx={{ mt: 3 }}>
                <strong>หมายเหตุ:</strong> หากเลือก "ขอแก้ไข" เกษตรกรสามารถแก้ไขได้สูงสุด 2 ครั้ง
              </Alert>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseConfirmDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {confirmDialog.decision === 'approve' && '✅ ยืนยันการอนุมัติ'}
          {confirmDialog.decision === 'revision' && '⚠️ ยืนยันการขอแก้ไข'}
          {confirmDialog.decision === 'reject' && '❌ ยืนยันการปฏิเสธ'}
        </DialogTitle>
        <DialogContent>
          {confirmDialog.decision === 'approve' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              คุณกำลังอนุมัติเอกสารทั้งหมด - ระบบจะแจ้งเกษตรกรให้ชำระเงินรอบที่ 2 (25,000 บาท)
            </Alert>
          )}
          {confirmDialog.decision === 'revision' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              คุณกำลังขอให้แก้ไขเอกสาร - เกษตรกรจะได้รับแจ้งเอกสารที่ต้องแก้ไข
            </Alert>
          )}
          {confirmDialog.decision === 'reject' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              คุณกำลังปฏิเสธใบสมัครนี้ - ระบบจะแจ้งเกษตรกรและปิดใบสมัคร
            </Alert>
          )}
          <Typography variant="body2">
            กรุณาตรวจสอบข้อมูลอีกครั้งก่อนยืนยัน การกระทำนี้ไม่สามารถยกเลิกได้
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} disabled={submitting}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            color={
              confirmDialog.decision === 'approve'
                ? 'success'
                : confirmDialog.decision === 'revision'
                  ? 'warning'
                  : 'error'
            }
            onClick={handleSubmitReview}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'ยืนยัน'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OfficerReviewPage;
