'use client';

import { useState } from 'react';
import { Box, TextField, Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Typography, Divider, Alert } from '@mui/material';
import GACPChecklist from './GACPChecklist';
import axios from 'axios';

interface InspectionReportFormProps {
  inspectionId: string;
  snapshotCount: number;
  onSubmit: () => void;
}

export default function InspectionReportForm({ inspectionId, snapshotCount, onSubmit }: InspectionReportFormProps) {
  const [checklistItems, setChecklistItems] = useState([]);
  const [summary, setSummary] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [decision, setDecision] = useState<'approve' | 'reject' | 'need_onsite'>('approve');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/inspections/${inspectionId}/report`, {
        inspectionType: 'online',
        summary,
        strengths: strengths.split('\n').filter(s => s.trim()),
        weaknesses: weaknesses.split('\n').filter(w => w.trim()),
        recommendations: recommendations.split('\n').filter(r => r.trim()),
        checklistItems,
        decision,
        reason,
        snapshotCount,
      });
      onSubmit();
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = summary && decision && (decision !== 'reject' || reason);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>รายงานผลการตรวจสอบ</Typography>
      <Divider sx={{ mb: 3 }} />

      <Alert severity="info" sx={{ mb: 3 }}>
        ภาพที่บันทึก: {snapshotCount} ภาพ
      </Alert>

      <TextField
        fullWidth
        label="สรุปผลการตรวจสอบ"
        multiline
        rows={4}
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        required
        sx={{ mb: 3 }}
      />

      <GACPChecklist items={checklistItems} onChange={setChecklistItems} />

      <TextField
        fullWidth
        label="จุดแข็ง (แยกบรรทัด)"
        multiline
        rows={3}
        value={strengths}
        onChange={(e) => setStrengths(e.target.value)}
        placeholder="- มีการจัดการดินที่ดี&#10;- เอกสารครบถ้วน"
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        label="จุดอ่อน (แยกบรรทัด)"
        multiline
        rows={3}
        value={weaknesses}
        onChange={(e) => setWeaknesses(e.target.value)}
        placeholder="- ขาดการฝึกอบรมบุคลากร&#10;- พื้นที่เก็บรักษาไม่เพียงพอ"
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        label="ข้อเสนอแนะ (แยกบรรทัด)"
        multiline
        rows={3}
        value={recommendations}
        onChange={(e) => setRecommendations(e.target.value)}
        placeholder="- ควรจัดอบรมบุคลากร&#10;- ควรปรับปรุงพื้นที่เก็บรักษา"
        sx={{ mb: 3 }}
      />

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">การตัดสินใจ</FormLabel>
        <RadioGroup value={decision} onChange={(e) => setDecision(e.target.value as any)}>
          <FormControlLabel value="approve" control={<Radio />} label="✅ ผ่านการตรวจสอบ (ส่งต่อผู้อนุมัติ)" />
          <FormControlLabel value="need_onsite" control={<Radio />} label="❓ ต้องตรวจสอบ Onsite" />
          <FormControlLabel value="reject" control={<Radio />} label="❌ ไม่ผ่าน (ปฏิเสธ)" />
        </RadioGroup>
      </FormControl>

      {decision === 'reject' && (
        <TextField
          fullWidth
          label="เหตุผลในการปฏิเสธ"
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          sx={{ mb: 3 }}
        />
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          fullWidth
        >
          {submitting ? 'กำลังบันทึก...' : 'ส่งรายงาน'}
        </Button>
      </Box>
    </Box>
  );
}
