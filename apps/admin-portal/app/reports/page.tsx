'use client';

import { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, TextField, MenuItem, Alert } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { exportApplicationsCSV } from '@/lib/api/applications';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('applications');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const blob = await exportApplicationsCSV({ startDate: dateFrom, endDate: dateTo });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportType}-${Date.now()}.csv`;
      a.click();
    } catch (err: any) {
      console.error('Failed to generate report:', err);
      setError(err.message || 'ไม่สามารถสร้างรายงานได้');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Report Generation</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
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
