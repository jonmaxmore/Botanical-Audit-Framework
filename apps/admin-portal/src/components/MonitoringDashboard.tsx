/**
 * Monitoring Dashboard Component
 *
 * Real-time system monitoring dashboard for administrators
 * Displays metrics, health status, and performance indicators
 *
 * Features:
 * - Real-time metrics updates (SSE)
 * - Interactive charts (Chart.js)
 * - Health status indicators
 * - Alert notifications
 * - Performance metrics
 * - System resources monitoring
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Button,
  LinearProgress,
  Tab,
  Tabs,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface MetricsData {
  system: {
    cpu: { avg: number; max: number; };
    memory: { avg: number; max: number; };
    disk: { avg: number; max: number; };
    uptime: number;
  };
  database: {
    queryTime: { avg: number; p95: number; p99: number; };
    slowQueries: number;
    operations: {
      find: number;
      insert: number;
      update: number;
      delete: number;
    };
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  queue: {
    jobs: {
      active: number;
      completed: number;
      failed: number;
      waiting: number;
    };
  };
  api: {
    requests: {
      total: number;
      success: number;
      error: number;
    };
    responseTime: { avg: number; p95: number; p99: number; };
    statusCodes: {
      '2xx': number;
      '3xx': number;
      '4xx': number;
      '5xx': number;
    };
  };
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'critical';
  checks: {
    system: { status: string; issues: string[]; };
    database: { status: string; issues: string[]; };
    cache: { status: string; issues: string[]; };
    queue: { status: string; issues: string[]; };
  };
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [timeWindow, setTimeWindow] = useState('realtime');
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchMetrics();
    fetchHealth();
  }, [timeWindow]);

  // Setup real-time updates (SSE)
  useEffect(() => {
    connectEventSource();

    return () => {
      disconnectEventSource();
    };
  }, []);

  const connectEventSource = () => {
    const token = localStorage.getItem('token');
    const eventSource = new EventSource(
      `/api/v1/monitoring/stream?token=${token}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'update') {
          setMetrics(data.metrics);
          setHealth(data.health);
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();

      // Reconnect after 5 seconds
      setTimeout(connectEventSource, 5000);
    };

    eventSourceRef.current = eventSource;
  };

  const disconnectEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch(
        `/api/v1/monitoring/metrics?timeWindow=${timeWindow}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch metrics');

      const data = await response.json();
      setMetrics(data.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/v1/monitoring/health', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch health');

      const data = await response.json();
      setHealth(data.data);
    } catch (err) {
      console.error('Error fetching health:', err);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchMetrics();
    fetchHealth();
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/v1/monitoring/export', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metrics-${Date.now()}.json`;
      a.click();
    } catch (err) {
      console.error('Error exporting metrics:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckIcon color="success" />;
      case 'warning':
      case 'degraded':
        return <WarningIcon color="warning" />;
      case 'critical':
        return <ErrorIcon color="error" />;
      default:
        return <CheckIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
      case 'degraded':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!metrics || !health) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        No metrics data available
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          System Monitoring
        </Typography>

        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Metrics">
            <IconButton onClick={handleExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Health Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            {getStatusIcon(health.status)}
            <Typography variant="h6" sx={{ ml: 1 }}>
              System Health: {health.status.toUpperCase()}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="caption" color="textSecondary">
                  System
                </Typography>
                <Chip
                  label={health.checks.system.status}
                  color={getStatusColor(health.checks.system.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="caption" color="textSecondary">
                  Database
                </Typography>
                <Chip
                  label={health.checks.database.status}
                  color={getStatusColor(health.checks.database.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="caption" color="textSecondary">
                  Cache
                </Typography>
                <Chip
                  label={health.checks.cache.status}
                  color={getStatusColor(health.checks.cache.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="caption" color="textSecondary">
                  Queue
                </Typography>
                <Chip
                  label={health.checks.queue.status}
                  color={getStatusColor(health.checks.queue.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="System" />
          <Tab label="Database" />
          <Tab label="Cache" />
          <Tab label="Queue" />
          <Tab label="API" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* System Resources */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Resources
                </Typography>

                <Box mb={2}>
                  <Typography variant="caption">CPU</Typography>
                  <Box display="flex" alignItems="center">
                    <LinearProgress
                      variant="determinate"
                      value={metrics.system.cpu.avg}
                      sx={{ flexGrow: 1, mr: 1 }}
                      color={metrics.system.cpu.avg > 80 ? 'error' : 'primary'}
                    />
                    <Typography variant="body2">
                      {metrics.system.cpu.avg.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="caption">Memory</Typography>
                  <Box display="flex" alignItems="center">
                    <LinearProgress
                      variant="determinate"
                      value={metrics.system.memory.avg}
                      sx={{ flexGrow: 1, mr: 1 }}
                      color={metrics.system.memory.avg > 85 ? 'error' : 'primary'}
                    />
                    <Typography variant="body2">
                      {metrics.system.memory.avg.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="caption">Disk</Typography>
                  <Box display="flex" alignItems="center">
                    <LinearProgress
                      variant="determinate"
                      value={metrics.system.disk.avg}
                      sx={{ flexGrow: 1, mr: 1 }}
                      color={metrics.system.disk.avg > 90 ? 'error' : 'primary'}
                    />
                    <Typography variant="body2">
                      {metrics.system.disk.avg.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary">
                  Uptime: {formatUptime(metrics.system.uptime)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* API Statistics */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  API Statistics
                </Typography>

                <Box mb={2}>
                  <Typography variant="h4">
                    {metrics.api.requests.total}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Requests
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="success.main">
                      ✓ {metrics.api.requests.success} Success
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="error.main">
                      ✗ {metrics.api.requests.error} Errors
                    </Typography>
                  </Grid>
                </Grid>

                <Box mt={2}>
                  <Typography variant="caption" color="textSecondary">
                    Avg Response Time
                  </Typography>
                  <Typography variant="h6">
                    {metrics.api.responseTime.avg.toFixed(0)}ms
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Cache Performance */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cache Performance
                </Typography>

                <Box mb={2}>
                  <Typography variant="h4">
                    {metrics.cache.hitRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Hit Rate
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Hits: {metrics.cache.hits}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Misses: {metrics.cache.misses}
                    </Typography>
                  </Grid>
                </Grid>

                <Box mt={2}>
                  <Doughnut
                    data={{
                      labels: ['Hits', 'Misses'],
                      datasets: [{
                        data: [metrics.cache.hits, metrics.cache.misses],
                        backgroundColor: ['#4caf50', '#f44336']
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false
                    }}
                    height={100}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Additional tabs implementation here... */}
    </Box>
  );
}
