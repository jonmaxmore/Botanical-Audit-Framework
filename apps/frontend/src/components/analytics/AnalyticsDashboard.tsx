'use client';

import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

export default function AnalyticsDashboard() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📊 Analytics Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Analytics Overview</Typography>
            <Typography variant="body2" color="text.secondary">
              Analytics data will be displayed here
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Performance Metrics</Typography>
            <Typography variant="body2" color="text.secondary">
              Performance metrics will be displayed here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
