'use client';
/**
 * Analytics Page
 * Feature 3: Analytics Dashboard
 */

import React from 'react';
import { Box, Container } from '@mui/material';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <AnalyticsDashboard />
      </Box>
    </Container>
  );
}
