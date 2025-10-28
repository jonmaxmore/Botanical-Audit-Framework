'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Rating,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as RequestChangesIcon,
} from '@mui/icons-material';

import type { Application } from '../../lib/api/applications';

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewData) => void;
  application: Application | null;
  loading?: boolean;
}

export interface ReviewData {
  decision: 'approve' | 'reject' | 'request_changes';
  comment: string;
  rating?: number;
  requiredChanges?: string;
  rejectionReason?: string;
}

const cropTypeLabels: Record<string, string> = {
  cannabis: 'กัญชา',
  turmeric: 'ขมิ้นชัน',
  ginger: 'ขิง',
  black_galingale: 'กระชายดำ',
  plai: 'ไพล',
  kratom: 'กระท่อม',
};

export default function ReviewDialog({
  open,
  onClose,
  onSubmit,
  application,
  loading = false,
}: ReviewDialogProps) {
  const [decision, setDecision] = React.useState<'approve' | 'reject' | 'request_changes'>(
    'approve'
  );
  const [comment, setComment] = React.useState('');
  const [rating, setRating] = React.useState<number>(4);
  const [requiredChanges, setRequiredChanges] = React.useState('');
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [error, setError] = React.useState('');

  if (!application) return null;

  const handleSubmit = () => {
    // Validation
    if (!comment.trim()) {
      setError('กรุณาระบุความคิดเห็น');
      return;
    }

    if (comment.length < 10) {
      setError('ความคิดเห็นต้องมีอย่างน้อย 10 ตัวอักษร');
      return;
    }

    if (decision === 'approve' && rating < 3) {
      setError('คะแนนประเมินต้องไม่ต่ำกว่า 3 ดาว สำหรับการอนุมัติ');
      return;
    }

    if (decision === 'request_changes' && !requiredChanges.trim()) {
      setError('กรุณาระบุรายละเอียดการแก้ไขที่ต้องการ');
      return;
    }

    if (decision === 'reject' && !rejectionReason.trim()) {
      setError('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }

    // Submit
    onSubmit({
      decision,
      comment,
      rating: decision === 'approve' ? rating : undefined,
      requiredChanges: decision === 'request_changes' ? requiredChanges : undefined,
      rejectionReason: decision === 'reject' ? rejectionReason : undefined,
    });

    // Reset form
    if (!loading) {
      handleClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      setDecision('approve');
      setComment('');
      setRating(4);
      setRequiredChanges('');
      setRejectionReason('');
      setError('');
      onClose();
    }
  };

  const getDecisionColor = () => {
    switch (decision) {
      case 'approve':
        return 'success';
      case 'reject':
        return 'error';
      case 'request_changes':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getDecisionText = () => {
    switch (decision) {
      case 'approve':
        return 'อนุมัติคำขอ';
      case 'reject':
        return 'ไม่อนุมัติคำขอ';
      case 'request_changes':
        return 'ขอให้แก้ไขเอกสาร';
      default:
        return '';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              พิจารณาคำขอรับรอง
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {application.applicationNumber} - {application.farmerName}
            </Typography>
          </Box>
          {application.cropType === 'cannabis' && (
            <Box
              sx={{
                bgcolor: 'success.main',
                color: 'success.contrastText',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 'bold',
              }}
            >
              กัญชา
            </Box>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Application Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            ข้อมูลคำขอ
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
            <Typography variant="body2">
              <strong>เลขที่:</strong> {application.applicationNumber}
            </Typography>
            <Typography variant="body2">
              <strong>เกษตรกร:</strong> {application.farmerName}
            </Typography>
            <Typography variant="body2">
              <strong>ประเภทพืช:</strong> {cropTypeLabels[application.cropType]}
            </Typography>
            <Typography variant="body2">
              <strong>พื้นที่:</strong> {application.farmSize?.toLocaleString() || '-'} ไร่
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Decision Selection */}
        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2 }}>
            การตัดสินใจ
          </FormLabel>
          <RadioGroup
            value={decision}
            onChange={e => setDecision(e.target.value as typeof decision)}
          >
            <FormControlLabel
              value="approve"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ApproveIcon color="success" />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      อนุมัติ
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      อนุมัติคำขอและออกใบรับรอง
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <FormControlLabel
              value="request_changes"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RequestChangesIcon color="warning" />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      ขอให้แก้ไข
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ขอให้เกษตรกรแก้ไขข้อมูลหรือเอกสาร
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <FormControlLabel
              value="reject"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RejectIcon color="error" />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      ไม่อนุมัติ
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ไม่อนุมัติคำขอนี้
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 3 }} />

        {/* Rating (only for approve) */}
        {decision === 'approve' && (
          <Box sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
              คะแนนประเมิน
            </FormLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Rating
                value={rating}
                onChange={(_, newValue) => setRating(newValue || 0)}
                size="large"
                precision={0.5}
              />
              <Typography variant="body2" color="text.secondary">
                {rating} ดาว
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              ประเมินคุณภาพของคำขอและเอกสารประกอบ (ต้องมีอย่างน้อย 3 ดาว)
            </Typography>
          </Box>
        )}

        {/* Comment */}
        <Box>
          <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
            ความคิดเห็น *
          </FormLabel>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={comment}
            onChange={e => {
              setComment(e.target.value);
              setError('');
            }}
            placeholder="ระบุเหตุผลและความคิดเห็นเกี่ยวกับการตัดสินใจของคุณ..."
            helperText={`${comment.length} ตัวอักษร (ขั้นต่ำ 10 ตัวอักษร)`}
          />
        </Box>

        {/* Required Changes (if request_changes) */}
        {decision === 'request_changes' && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                รายละเอียดการแก้ไขที่ต้องการ *
              </FormLabel>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={requiredChanges}
                onChange={e => {
                  setRequiredChanges(e.target.value);
                  setError('');
                }}
                placeholder="ระบุรายละเอียดเอกสาร/ข้อมูลที่ต้องการให้แก้ไข..."
              />
            </Alert>
          </Box>
        )}

        {/* Rejection Reason (if reject) */}
        {decision === 'reject' && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                เหตุผลในการปฏิเสธ *
              </FormLabel>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={rejectionReason}
                onChange={e => {
                  setRejectionReason(e.target.value);
                  setError('');
                }}
                placeholder="ระบุเหตุผลในการปฏิเสธคำขอ..."
              />
            </Alert>
          </Box>
        )}

        {/* Cannabis Special Notice */}
        {application.cropType === 'cannabis' && (
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>หมายเหตุ:</strong> คำขอกัญชาต้องตรวจสอบเอกสารให้ครบถ้วนตามกฎหมาย พ.ศ. 2565
              และระเบียบกระทรวงสาธารณสุข
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          ยกเลิก
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={getDecisionColor()}
          disabled={!comment.trim() || loading}
        >
          {loading ? 'กำลังบันทึก...' : `ยืนยัน ${getDecisionText()}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
