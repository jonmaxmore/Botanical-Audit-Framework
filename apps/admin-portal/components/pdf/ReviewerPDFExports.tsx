'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Divider } from '@mui/material';
import PDFExportButton from './PDFExportButton';

interface ReviewerPDFExportsProps {
  applicationId: string;
}

export default function ReviewerPDFExports({ applicationId }: ReviewerPDFExportsProps) {
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
              endpoint={`/api/pdf/application-summary/${applicationId}`}
              filename={`application-summary-${applicationId}.pdf`}
              label="รายงานสรุปคำขอรับรอง"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PDFExportButton
              endpoint={`/api/pdf/document-verification/${applicationId}`}
              filename={`document-verification-${applicationId}.pdf`}
              label="รายงานการตรวจสอบเอกสาร"
              color="success"
              fullWidth
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Typography variant="body2" color="text.secondary">
            💡 เอกสารสำหรับนำเสนอหัวหน้างานและเก็บเข้าแฟ้ม
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
