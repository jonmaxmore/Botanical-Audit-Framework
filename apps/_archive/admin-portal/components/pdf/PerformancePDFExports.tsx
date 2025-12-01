'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Divider, Tabs, Tab } from '@mui/material';
import PDFExportButton from './PDFExportButton';

interface PerformancePDFExportsProps {
  userId?: string;
  userRole?: 'reviewer' | 'inspector' | 'approver' | 'admin';
}

export default function PerformancePDFExports({ userId, userRole }: PerformancePDFExportsProps) {
  const [tab, setTab] = React.useState(0);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📊 รายงานสถิติและผลงาน
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Reviewer" />
          <Tab label="Inspector" />
          <Tab label="Approver" />
          <Tab label="System" />
        </Tabs>

        {tab === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <PDFExportButton
                endpoint={`/api/pdf/reviewer-performance/${userId || 'REV001'}`}
                filename={`reviewer-performance-${userId || 'REV001'}.pdf`}
                label="รายงานสถิติการทำงาน (Reviewer)"
                color="primary"
                fullWidth
              />
            </Grid>
          </Grid>
        )}

        {tab === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <PDFExportButton
                endpoint={`/api/pdf/inspector-performance/${userId || 'INS001'}`}
                filename={`inspector-performance-${userId || 'INS001'}.pdf`}
                label="รายงานสถิติการตรวจสอบ (Inspector)"
                color="success"
                fullWidth
              />
            </Grid>
          </Grid>
        )}

        {tab === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <PDFExportButton
                endpoint="/api/pdf/approval-statistics"
                filename="approval-statistics.pdf"
                label="รายงานสถิติการอนุมัติ"
                color="info"
                fullWidth
              />
            </Grid>
          </Grid>
        )}

        {tab === 3 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <PDFExportButton
                endpoint="/api/pdf/system-summary"
                filename="system-summary.pdf"
                label="รายงานสรุประบบ GACP Platform"
                color="secondary"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PDFExportButton
                endpoint="/api/pdf/financial-report"
                filename="financial-report.pdf"
                label="รายงานการเงิน"
                color="success"
                fullWidth
              />
            </Grid>
          </Grid>
        )}

        <Box mt={3}>
          <Typography variant="body2" color="text.secondary">
            💡 รายงานสำหรับประเมินผลงานและรายงานผู้บริหาร
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
