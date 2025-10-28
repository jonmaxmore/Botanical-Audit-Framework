'use client';

import { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, TextField, MenuItem } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('applications');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, dateFrom, dateTo }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportType}-${Date.now()}.pdf`;
      a.click();
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Report Generation</Typography>
        
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Report Type"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="applications">Applications Report</MenuItem>
                  <MenuItem value="certificates">Certificates Report</MenuItem>
                  <MenuItem value="inspections">Inspections Report</MenuItem>
                  <MenuItem value="revenue">Revenue Report</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="From Date"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="To Date"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleGenerate}
              disabled={generating}
              sx={{ mt: 3 }}
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </ErrorBoundary>
  );
}
