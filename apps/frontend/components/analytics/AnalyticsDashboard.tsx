'use client';
/**
 * Analytics Dashboard Page
 * Feature 3: Analytics Dashboard
 *
 * Comprehensive analytics dashboard with:
 * - Statistics cards (applications, documents, certificates, inspections)
 * - Line charts for trends
 * - Pie charts for distributions
 * - Date range filters
 * - Export functionality
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
  TrendingUp,
  Description,
  VerifiedUser,
  Assessment,
  FileDownload,
  Refresh
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsOverview {
  totalApplications: number;
  totalDocuments: number;
  totalCertificates: number;
  totalInspections: number;
  totalUsers: number;
  totalNotifications: number;
  pendingApplications: number;
  pendingDocuments: number;
  activeInspections: number;
  activeCertificates: number;
}

interface TrendData {
  date: string;
  count: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [period, setPeriod] = useState('30days');
  const [trendType, setTrendType] = useState('applications');

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch overview
      const overviewRes = await fetch(`${API_BASE_URL}/analytics/overview`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!overviewRes.ok) {
        throw new Error('Failed to fetch analytics overview');
      }

      const overviewData = await overviewRes.json();
      setOverview(overviewData.data.overview);

      // Fetch trends
      const trendsRes = await fetch(
        `${API_BASE_URL}/analytics/trends?period=${period}&type=${trendType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!trendsRes.ok) {
        throw new Error('Failed to fetch trends');
      }

      const trendsData = await trendsRes.json();
      setTrends(trendsData.data.trends);
    } catch (err: any) {
      setError(err.message);
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, trendType]);

  // Export data
  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/analytics/export?format=${format}&type=overview`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Export failed');

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  // Prepare chart data
  const lineChartData = {
    labels: trends.map(t => t.date),
    datasets: [
      {
        label: `${trendType.charAt(0).toUpperCase() + trendType.slice(1)} Over Time`,
        data: trends.map(t => t.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: `${trendType.charAt(0).toUpperCase() + trendType.slice(1)} Trends`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Statistics cards data
  const statsCards = [
    {
      title: 'คำขอทั้งหมด',
      value: overview?.totalApplications || 0,
      pending: overview?.pendingApplications || 0,
      icon: <TrendingUp />,
      color: '#1976d2'
    },
    {
      title: 'เอกสาร',
      value: overview?.totalDocuments || 0,
      pending: overview?.pendingDocuments || 0,
      icon: <Description />,
      color: '#2e7d32'
    },
    {
      title: 'ใบรับรอง',
      value: overview?.totalCertificates || 0,
      active: overview?.activeCertificates || 0,
      icon: <VerifiedUser />,
      color: '#ed6c02'
    },
    {
      title: 'การตรวจสอบ',
      value: overview?.totalInspections || 0,
      active: overview?.activeInspections || 0,
      icon: <Assessment />,
      color: '#9c27b0'
    }
  ];

  if (loading && !overview) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" gutterBottom>
            📊 Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ภาพรวมและการวิเคราะห์ระบบ GACP
          </Typography>
        </div>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAnalytics}
            disabled={loading}
          >
            รีเฟรช
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={() => handleExport('csv')}
          >
            ส่งออก CSV
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: `${stat.color}20`,
                      borderRadius: 2,
                      p: 1,
                      display: 'flex',
                      mr: 2
                    }}
                  >
                    {React.cloneElement(stat.icon, { sx: { color: stat.color } })}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {stat.value.toLocaleString()}
                </Typography>
                {stat.pending !== undefined && (
                  <Chip label={`รอดำเนินการ: ${stat.pending}`} size="small" color="warning" />
                )}
                {stat.active !== undefined && (
                  <Chip label={`Active: ${stat.active}`} size="small" color="success" />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Trends Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">📈 แนวโน้มข้อมูล</Typography>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>ประเภทข้อมูล</InputLabel>
                <Select
                  value={trendType}
                  label="ประเภทข้อมูล"
                  onChange={e => setTrendType(e.target.value)}
                >
                  <MenuItem value="applications">คำขอ</MenuItem>
                  <MenuItem value="documents">เอกสาร</MenuItem>
                  <MenuItem value="certificates">ใบรับรอง</MenuItem>
                  <MenuItem value="inspections">การตรวจสอบ</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>ช่วงเวลา</InputLabel>
                <Select value={period} label="ช่วงเวลา" onChange={e => setPeriod(e.target.value)}>
                  <MenuItem value="7days">7 วัน</MenuItem>
                  <MenuItem value="30days">30 วัน</MenuItem>
                  <MenuItem value="90days">90 วัน</MenuItem>
                  <MenuItem value="1year">1 ปี</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : trends.length > 0 ? (
            <Line data={lineChartData} options={lineChartOptions} />
          ) : (
            <Alert severity="info">ไม่มีข้อมูลแนวโน้มในช่วงเวลานี้</Alert>
          )}
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                👥 สถิติผู้ใช้งาน
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">ผู้ใช้ทั้งหมด</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {overview?.totalUsers || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">การแจ้งเตือนทั้งหมด</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {overview?.totalNotifications || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 สถานะงาน
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">คำขอรอดำเนินการ</Typography>
                  <Chip
                    label={overview?.pendingApplications || 0}
                    size="small"
                    color="warning"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">เอกสารรอตรวจสอบ</Typography>
                  <Chip label={overview?.pendingDocuments || 0} size="small" color="warning" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">การตรวจสอบที่กำลังดำเนินการ</Typography>
                  <Chip label={overview?.activeInspections || 0} size="small" color="info" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
