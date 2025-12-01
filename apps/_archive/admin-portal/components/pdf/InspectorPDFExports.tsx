'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Divider } from '@mui/material';
import PDFExportButton from './PDFExportButton';

interface InspectorPDFExportsProps {
  inspectionId: string;
  applicationId?: string;
}

export default function InspectorPDFExports({
  inspectionId,
  applicationId,
}: InspectorPDFExportsProps) {
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
              endpoint={`/api/pdf/inspection-report/${inspectionId}`}
              filename={`inspection-report-${inspectionId}.pdf`}
              label="รายงานผลการตรวจสอบ"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PDFExportButton
              endpoint={`/api/pdf/inspection-appointment/${inspectionId}`}
              filename={`appointment-${inspectionId}.pdf`}
              label="ใบนัดหมายตรวจสอบ"
              color="info"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PDFExportButton
              endpoint={`/api/pdf/inspection-checklist/${inspectionId}`}
              filename={`checklist-${inspectionId}.pdf`}
              label="แบบฟอร์ม GACP Checklist"
              color="info"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PDFExportButton
              endpoint={`/api/pdf/video-inspection-report/${inspectionId}`}
              filename={`video-report-${inspectionId}.pdf`}
              label="รายงาน Video Inspection (ละเอียด)"
              variant="outlined"
              fullWidth
            />
          </Grid>
        </Grid>

        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            เอกสารสำหรับ Approver
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <PDFExportButton
                endpoint={`/api/pdf/complete-summary/${applicationId}`}
                filename={`complete-summary-${applicationId}.pdf`}
                label="รายงานสรุปการตรวจสอบทั้งหมด"
                color="secondary"
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>

        <Box mt={3}>
          <Typography variant="body2" color="text.secondary">
            💡 เอกสารทั้งหมดจะถูกสร้างในรูปแบบ PDF ตามมาตรฐานเอกสารราชการไทย
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
