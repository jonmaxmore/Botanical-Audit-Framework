'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Divider } from '@mui/material';
import PDFExportButton from './PDFExportButton';

interface FarmerPDFExportsProps {
  applicationId: string;
  paymentId?: string;
  inspectionId?: string;
  certificateId?: string;
}

export default function FarmerPDFExports({
  applicationId,
  paymentId,
  inspectionId,
  certificateId
}: FarmerPDFExportsProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📄 ดาวน์โหลดเอกสาร
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <PDFExportButton
              endpoint={`/api/pdf/farmer-confirmation/${applicationId}`}
              filename={`confirmation-${applicationId}.pdf`}
              label="ใบยืนยันการส่งคำขอ"
              variant="outlined"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PDFExportButton
              endpoint={`/api/pdf/farmer-confirmation/${applicationId}`}
              filename={`confirmation-${applicationId}.pdf`}
              label="ใบยืนยันการส่งคำขอ"
              color="info"
              fullWidth
            />
          </Grid>

          {paymentId && (
            <Grid item xs={12} md={6}>
              <PDFExportButton
                endpoint={`/api/pdf/payment-receipt/${paymentId}`}
                filename={`receipt-${paymentId}.pdf`}
                label="ใบเสร็จรับเงิน"
                color="success"
                fullWidth
              />
            </Grid>
          )}

          {inspectionId && (
            <>
              <Grid item xs={12} md={6}>
                <PDFExportButton
                  endpoint={`/api/pdf/farmer-appointment/${inspectionId}`}
                  filename={`appointment-${inspectionId}.pdf`}
                  label="ใบนัดหมายตรวจสอบ"
                  variant="outlined"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <PDFExportButton
                  endpoint={`/api/pdf/farmer-inspection-result/${inspectionId}`}
                  filename={`inspection-result-${inspectionId}.pdf`}
                  label="รายงานผลการตรวจสอบ"
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            </>
          )}

          {certificateId && (
            <Grid item xs={12}>
              <PDFExportButton
                endpoint={`/api/pdf/certificate/${certificateId}`}
                filename={`certificate-${certificateId}.pdf`}
                label="ใบรับรองมาตรฐาน GACP"
                color="success"
                size="large"
                fullWidth
              />
            </Grid>
          )}
        </Grid>

        <Box mt={3}>
          <Typography variant="body2" color="text.secondary">
            💡 เอกสารทั้งหมดสามารถใช้เป็นหลักฐานทางราชการได้
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
