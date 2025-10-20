'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Typography, Paper, Box, Grid, Skeleton } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Description, Assessment, CheckCircle, TrendingUp, Warning } from '@mui/icons-material';
import { getApplicationStatistics } from '@/lib/api/applications';
import {
  chartColors,
  chartColorsAlpha,
  lineChartOptions,
  barChartOptions,
  pieChartOptions,
  statusColors,
  statusColorsAlpha,
  urgencyColors,
  urgencyColorsAlpha,
  generateDateLabels,
} from '@/lib/chart-config';

// Dynamic imports for charts (code splitting)
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
  ssr: false,
  loading: () => <Skeleton variant="rectangular" width="100%" height={300} />,
});

const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), {
  ssr: false,
  loading: () => <Skeleton variant="rectangular" width="100%" height={300} />,
});

const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), {
  ssr: false,
  loading: () => <Skeleton variant="circular" width={200} height={200} />,
});

export default function DTAMDashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    highPriority: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await getApplicationStatistics();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to load statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Line Chart Data - Applications over time (mock data)
  const lineChartData = {
    labels: generateDateLabels(7),
    datasets: [
      {
        label: 'Applications Received',
        data: [8, 12, 9, 15, 11, 14, 16],
        borderColor: chartColors.primary,
        backgroundColor: chartColorsAlpha.primary,
        fill: true,
      },
      {
        label: 'Applications Reviewed',
        data: [6, 10, 8, 13, 10, 12, 14],
        borderColor: chartColors.success,
        backgroundColor: chartColorsAlpha.success,
        fill: true,
      },
    ],
  };

  // Bar Chart Data - Urgency distribution (mock data)
  const barChartData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Applications by Urgency',
        data: [
          stats.highPriority,
          Math.floor(stats.pending / 2),
          stats.pending - stats.highPriority - Math.floor(stats.pending / 2),
        ],
        backgroundColor: [
          urgencyColorsAlpha.high,
          urgencyColorsAlpha.medium,
          urgencyColorsAlpha.low,
        ],
        borderColor: [urgencyColors.high, urgencyColors.medium, urgencyColors.low],
        borderWidth: 2,
      },
    ],
  };

  // Doughnut Chart Data - Status distribution
  const doughnutChartData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [stats.approved, stats.pending, stats.rejected],
        backgroundColor: [
          statusColorsAlpha.approved,
          statusColorsAlpha.pending,
          statusColorsAlpha.rejected,
        ],
        borderColor: [statusColors.approved, statusColors.pending, statusColors.rejected],
        borderWidth: 2,
      },
    ],
  };

  return (
    <DashboardLayout userRole="dtam">
      <Box>
        {/* Page Header */}
        <Box className="mb-6">
          <Typography variant="h4" component="h1" className="font-bold text-gray-800">
            DTAM Government Portal 🏢
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            System overview and administrative management dashboard.
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} sm={6} lg={3}>
            <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Total Applications
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" className="font-bold text-gray-800">
                      {stats.total}
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-blue-600">
                    All time
                  </Typography>
                </Box>
                <Box className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <Description className="text-blue-600" sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Pending Review
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" className="font-bold text-gray-800">
                      {stats.pending}
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-orange-600">
                    Requires attention
                  </Typography>
                </Box>
                <Box className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                  <Assessment className="text-orange-600" sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Approved
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" className="font-bold text-gray-800">
                      {stats.approved}
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-green-600">
                    {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                    approval rate
                  </Typography>
                </Box>
                <Box className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="text-green-600" sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    High Priority
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" className="font-bold text-gray-800">
                      {stats.highPriority}
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-red-600">
                    Urgent review needed
                  </Typography>
                </Box>
                <Box className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <Warning className="text-red-600" sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} className="mb-6">
          {/* Line Chart - Applications Trend */}
          <Grid item xs={12} lg={8}>
            <Paper className="p-6">
              <Box className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-blue-600" />
                <Typography variant="h6" className="font-semibold">
                  Application Trends (Last 7 Days)
                </Typography>
              </Box>
              <Box style={{ height: '300px' }}>
                <Line data={lineChartData} options={lineChartOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* Doughnut Chart - Status Distribution */}
          <Grid item xs={12} lg={4}>
            <Paper className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Status Distribution
              </Typography>
              <Box style={{ height: '300px' }}>
                {loading ? (
                  <Box className="flex items-center justify-center h-full">
                    <Skeleton variant="circular" width={200} height={200} />
                  </Box>
                ) : (
                  <Doughnut data={doughnutChartData} options={pieChartOptions} />
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Bar Chart - Urgency Distribution */}
          <Grid item xs={12}>
            <Paper className="p-6">
              <Box className="flex items-center gap-2 mb-4">
                <Warning className="text-red-600" />
                <Typography variant="h6" className="font-semibold">
                  Applications by Urgency Level
                </Typography>
              </Box>
              <Box style={{ height: '300px' }}>
                {loading ? (
                  <Box className="flex items-center justify-center h-full">
                    <Skeleton variant="rectangular" width="100%" height={250} />
                  </Box>
                ) : (
                  <Bar data={barChartData} options={barChartOptions} />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Week 3 Notice */}
        <Paper className="p-4 bg-orange-50 border-l-4 border-orange-500">
          <Typography variant="subtitle2" className="font-semibold text-orange-800 mb-2">
            ✅ Week 3 Day 1-3 Complete: DTAM Dashboard Charts!
          </Typography>
          <Typography variant="body2" className="text-orange-700">
            Features: Multi-line chart (applications vs reviews), Doughnut chart (status
            distribution), Bar chart (urgency levels), real-time API statistics, loading skeletons,
            responsive grid layout
          </Typography>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
