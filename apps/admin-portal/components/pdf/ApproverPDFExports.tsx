'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Divider } from '@mui/material';
import PDFExportButton from './PDFExportButton';

interface ApproverPDFExportsProps {
  applicationId: string;
  certificateId?: string;
  decision?: 'approved' | 'rejected';
}

export default function ApproverPDFExports({
  applicationId,
  certificateId,
  decision,
}: ApproverPDFExportsProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📄 ดาวน์โหลดเอกสาร PDF
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <PDFExportButton
              endpoint={`/api/pdf/complete-summary/${applicationId}`}
              filename={`complete-summary-${applicationId}.pdf`}
              label="รายงานสรุปการตรวจสอบทั้งหมด"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PDFExportButton
              endpoint={`/api/pdf/approval-letter/${applicationId}?decision=${decision || 'approved'}`}
              filename={`approval-letter-${applicationId}.pdf`}
              label="หนังสืออนุมัติ/ไม่อนุมัติ"
              color={decision === 'approved' ? 'success' : 'error'}
              fullWidth
            />
          </Grid>

          {certificateId && (
            <Grid item xs={12} md={6}>
              <PDFExportButton
                endpoint={`/api/pdf/certificate/${certificateId}`}
                filename={`certificate-${certificateId}.pdf`}
                label="ใบรับรองมาตรฐาน GACP"
                color="success"
                fullWidth
              />
            </Grid>
          )}
        </Grid>

        <Box mt={3}>
          <Typography variant="body2" color="text.secondary">
            💡 เอกสารทั้งหมดมีลายเซ็นดิจิทัลและตราประทับ
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
