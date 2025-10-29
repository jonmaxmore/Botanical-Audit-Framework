'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Typography, Paper, Box, Grid, Skeleton } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Description, Assessment, CheckCircle, Pending, TrendingUp } from '@mui/icons-material';
import { getDocumentStatistics } from '@/lib/api/documents';
import {
  chartColors,
  chartColorsAlpha,
  lineChartOptions,
  barChartOptions,
  pieChartOptions,
  statusColors,
  statusColorsAlpha,
  generateDateLabels,
} from '@/lib/chart-config';

// Dynamic imports for charts (code splitting)
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
  loading: () => <Skeleton variant="rectangular" width="100%" height={300} />,
});

const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), {
  ssr: false,
  loading: () => <Skeleton variant="rectangular" width="100%" height={300} />,
});

const Doughnut = dynamic(() => import('react-chartjs-2').then((mod) => mod.Doughnut), {
  ssr: false,
  loading: () => <Skeleton variant="circular" width={200} height={200} />,
});

export default function FarmerDashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await getDocumentStatistics();
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

  // Line Chart Data - Document submissions over time (mock data for now)
  const lineChartData = {
    labels: generateDateLabels(7),
    datasets: [
      {
        label: 'Documents Submitted',
        data: [2, 5, 3, 8, 4, 6, 7],
        borderColor: chartColors.primary,
        backgroundColor: chartColorsAlpha.primary,
        fill: true,
      },
    ],
  };

  // Bar Chart Data - Document types distribution (mock data)
  const barChartData = {
    labels: [
      'Farm Registration',
      'Land Certificate',
      'Water Test',
      'Soil Test',
      'Cultivation Plan',
      'Organic Cert',
    ],
    datasets: [
      {
        label: 'Number of Documents',
        data: [3, 2, 4, 3, 2, 1],
        backgroundColor: [
          chartColorsAlpha.primary,
          chartColorsAlpha.success,
          chartColorsAlpha.info,
          chartColorsAlpha.warning,
          chartColorsAlpha.purple,
          chartColorsAlpha.teal,
        ],
        borderColor: [
          chartColors.primary,
          chartColors.success,
          chartColors.info,
          chartColors.warning,
          chartColors.purple,
          chartColors.teal,
        ],
        borderWidth: 1,
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
    <DashboardLayout userRole="farmer">
      <Box>
        {/* Page Header */}
        <Box className="mb-6">
          <Typography variant="h4" component="h1" className="font-bold text-gray-800">
            Welcome back! 🌱
          </Typography>
          <Typography variant="body1" className="text-gray-600 mt-1">
            Here&apos;s what&apos;s happening with your GACP certification today.
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} sm={6} lg={3}>
            <Paper className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Total Documents
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
                    Pending Approval
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" className="font-bold text-gray-800">
                      {stats.pending}
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-orange-600">
                    Awaiting review
                  </Typography>
                </Box>
                <Box className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                  <Pending className="text-orange-600" sx={{ fontSize: 28 }} />
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
                    Rejected
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" className="font-bold text-gray-800">
                      {stats.rejected}
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-red-600">
                    Need resubmission
                  </Typography>
                </Box>
                <Box className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <Assessment className="text-red-600" sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} className="mb-6">
          {/* Line Chart - Document Submissions Trend */}
          <Grid item xs={12} lg={8}>
            <Paper className="p-6">
              <Box className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-blue-600" />
                <Typography variant="h6" className="font-semibold">
                  Document Submissions (Last 7 Days)
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

          {/* Bar Chart - Document Types */}
          <Grid item xs={12}>
            <Paper className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Document Types Distribution
              </Typography>
              <Box style={{ height: '300px' }}>
                <Bar data={barChartData} options={barChartOptions} />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Week 3 Notice */}
        <Paper className="p-4 bg-blue-50 border-l-4 border-blue-500">
          <Typography variant="subtitle2" className="font-semibold text-blue-800 mb-2">
            ✅ Week 3 Day 1-2 Complete: Dashboard Charts with Chart.js!
          </Typography>
          <Typography variant="body2" className="text-blue-700">
            Features: Line chart (7-day trend), Doughnut chart (status distribution), Bar chart
            (document types), real-time statistics from API, loading skeletons, responsive layout,
            Material-UI integration
          </Typography>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
