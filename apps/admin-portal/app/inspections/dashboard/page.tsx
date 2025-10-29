'use client';

import { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import InspectorKPICards from '@/components/dashboard/InspectorKPICards';
import QuickActionsPanel from '@/components/dashboard/QuickActionsPanel';
import UpcomingInspections from '@/components/inspection/UpcomingInspections';
import InspectionCalendar from '@/components/inspection/InspectionCalendar';
import axios from 'axios';

export default function InspectorDashboard() {
  const [kpiData, setKpiData] = useState({
    totalInspections: 0,
    completedToday: 0,
    upcomingThisWeek: 0,
    videoCallCount: 0,
    onsiteCount: 0,
    avgResponseTime: 0,
  });

  useEffect(() => {
    fetchKPIData();
  }, []);

  const fetchKPIData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inspections/kpi`
      );
      setKpiData(response.data.kpi || kpiData);
    } catch (error) {
      console.error('Failed to fetch KPI data:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Inspector Dashboard</Typography>

      <Box sx={{ mb: 3 }}>
        <InspectorKPICards data={kpiData} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <UpcomingInspections />
          </Box>
          <InspectionCalendar />
        </Grid>

        <Grid item xs={12} md={4}>
          <QuickActionsPanel />
        </Grid>
      </Grid>
    </Box>
  );
}
