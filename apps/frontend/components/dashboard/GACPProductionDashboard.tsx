'use client';
/**
 * 📊 GACP Production Dashboard - Complete System Overview
 * แดชบอร์ดหลักแสดงสถานะทุกระบบแบบ Real-time
 *
 * Features:
 * - Farm Management Overview
 * - SOP Progress Tracking
 * - Compliance Scores
 * - Survey Results Integration
 * - Track & Trace Status
 * - AI Insights & Recommendations
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Button,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Tooltip,
  CircularProgress,
  Fab
} from '@mui/material';

import {
  Dashboard,
  Agriculture,
  Assignment,
  Verified,
  Analytics,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  Star,
  Refresh,
  Notifications,
  Settings,
  ArrowUpward,
  ArrowDownward,
  MoreVert,
  Add,
  Visibility,
  Edit,
  Assessment
} from '@mui/icons-material';

// Type definitions for dashboard data
interface DashboardData {
  farm?: {
    activeCycles?: { count: number };
  };
  sop?: {
    statistics?: {
      avgCompliance: number;
      activitiesByPhase?: Record<string, number>;
    };
  };
  survey?: {
    avgScore: number;
  };
  trackTrace?: {
    certified: number;
  };
  compliance?: {
    trends: Array<{ month: string; score: number }>;
  };
  lastUpdated: Date;
}

interface Notification {
  type: string;
  title: string;
  message: string;
}

interface DashboardProps {
  userId: string;
  role?: string;
}

const GACPProductionDashboard: React.FC<DashboardProps> = ({ userId, role = 'farmer' }) => {
  // State Management
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Colors for charts
  const CHART_COLORS = {
    primary: '#1976d2',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3'
  };

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    loadNotifications();

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId, selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      setIsRefreshing(true);

      // Load data from all systems
      const [farmData, sopData, surveyData, trackTraceData, complianceData] = await Promise.all([
        fetch(`/api/farm-management/dashboard/${userId}`).then(r => r.json()),
        fetch(`/api/sop/dashboard/${userId}`).then(r => r.json()),
        fetch(`/api/survey/statistics/${userId}`).then(r => r.json()),
        fetch(`/api/track-trace/statistics/${userId}`).then(r => r.json()),
        fetch(`/api/compliance/scores/${userId}?range=${selectedTimeRange}`).then(r => r.json())
      ]);

      setDashboardData({
        farm: farmData,
        sop: sopData,
        survey: surveyData,
        trackTrace: trackTraceData,
        compliance: complianceData,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Render overview cards
  const renderOverviewCards = () => {
    if (!dashboardData) return null;

    const cards = [
      {
        title: 'Active Farms',
        value: dashboardData.farm?.activeCycles?.count || 0,
        icon: <Agriculture />,
        color: CHART_COLORS.success,
        trend: '+5%',
        subtitle: 'cultivation cycles'
      },
      {
        title: 'SOP Progress',
        value: `${dashboardData.sop?.statistics?.avgCompliance || 0}%`,
        icon: <Assignment />,
        color: CHART_COLORS.primary,
        trend: '+12%',
        subtitle: 'avg compliance'
      },
      {
        title: 'Certified Products',
        value: dashboardData.trackTrace?.certified || 0,
        icon: <Verified />,
        color: CHART_COLORS.success,
        trend: '+8%',
        subtitle: 'total batches'
      },
      {
        title: 'Survey Score',
        value: dashboardData.survey?.avgScore || 0,
        icon: <Analytics />,
        color: CHART_COLORS.warning,
        trend: '+3%',
        subtitle: 'regional average'
      }
    ];

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: card.color,
                      width: 48,
                      height: 48,
                      mr: 2
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {card.value}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {card.subtitle}
                      </Typography>
                      <Chip
                        label={card.trend}
                        size="small"
                        color="success"
                        icon={<ArrowUpward />}
                      />
                    </Box>
                  </Box>
                </Box>
                <Typography variant="h6" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render compliance trends chart
  const renderComplianceTrends = () => {
    if (!dashboardData?.compliance?.trends) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📈 Compliance Trends
          </Typography>
          <Box
            sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Typography variant="body2" color="text.secondary">
              Chart visualization will be implemented with chart library
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render SOP progress
  const renderSOPProgress = () => {
    if (!dashboardData?.sop) return null;

    const sopData = dashboardData.sop;
    const phases = ['pre_planting', 'planting', 'growing', 'harvesting', 'post_harvest'];

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 SOP Progress by Phase
          </Typography>

          <Grid container spacing={2}>
            {phases.map(phase => {
              const phaseData = sopData.statistics?.activitiesByPhase?.[phase] || 0;
              const maxActivities = 6; // Average activities per phase
              const percentage = Math.min((phaseData / maxActivities) * 100, 100);

              return (
                <Grid item xs={12} key={phase}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {phase.replace(/_/g, ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="body2">
                        {phaseData}/{maxActivities}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Render recent activities
  const renderRecentActivities = () => {
    const activities = [
      {
        id: 1,
        type: 'SOP_ACTIVITY',
        title: 'Soil Testing Completed',
        description: 'pH level: 6.8 - Optimal range',
        timestamp: '2 hours ago',
        status: 'completed',
        points: 20
      },
      {
        id: 2,
        type: 'FARM_UPDATE',
        title: 'New Cultivation Cycle Started',
        description: 'Strain: Northern Lights - Area: 500 sqm',
        timestamp: '1 day ago',
        status: 'in_progress',
        points: 0
      },
      {
        id: 3,
        type: 'SURVEY_COMPLETED',
        title: 'Regional Survey Submitted',
        description: 'Score: 85/100 - Northern Region',
        timestamp: '2 days ago',
        status: 'completed',
        points: 15
      },
      {
        id: 4,
        type: 'TRACK_TRACE',
        title: 'Batch Certified',
        description: 'Batch: NL2024-001 - QR Code Generated',
        timestamp: '3 days ago',
        status: 'certified',
        points: 25
      }
    ];

    const getStatusColor = (status: string): 'success' | 'primary' | 'warning' | 'default' => {
      switch (status) {
        case 'completed':
          return 'success';
        case 'certified':
          return 'primary';
        case 'in_progress':
          return 'warning';
        default:
          return 'default';
      }
    };

    const getStatusIcon = (type: string) => {
      switch (type) {
        case 'SOP_ACTIVITY':
          return <Assignment />;
        case 'FARM_UPDATE':
          return <Agriculture />;
        case 'SURVEY_COMPLETED':
          return <Analytics />;
        case 'TRACK_TRACE':
          return <Verified />;
        default:
          return <CheckCircle />;
      }
    };

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🕒 Recent Activities
          </Typography>

          <List>
            {activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                      {getStatusIcon(activity.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">{activity.title}</Typography>
                        <Chip
                          label={activity.status}
                          size="small"
                          color={getStatusColor(activity.status)}
                        />
                        {activity.points > 0 && (
                          <Chip
                            label={`+${activity.points} pts`}
                            size="small"
                            icon={<Star />}
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.timestamp}
                        </Typography>
                      </Box>
                    }
                  />
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </ListItem>
                {index < activities.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };

  // Render notifications panel
  const renderNotifications = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">🔔 Notifications</Typography>
          <Badge badgeContent={notifications.length} color="error">
            <Notifications />
          </Badge>
        </Box>

        {notifications.length === 0 ? (
          <Alert severity="info">No new notifications</Alert>
        ) : (
          <List dense>
            {notifications.slice(0, 5).map((notification, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {notification.type === 'warning' ? (
                    <Warning color="warning" />
                  ) : (
                    <CheckCircle color="success" />
                  )}
                </ListItemIcon>
                <ListItemText primary={notification.title} secondary={notification.message} />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📊 GACP Production Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Real-time overview of your GACP operations
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadDashboardData}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="contained" startIcon={<Add />}>
            New Session
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      {renderOverviewCards()}

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Compliance Trends */}
          {renderComplianceTrends()}

          {/* SOP Progress */}
          {renderSOPProgress()}

          {/* System Status Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 System Status Overview
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>System</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Last Update</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      {
                        name: 'Farm Management',
                        status: 'Active',
                        progress: 85,
                        lastUpdate: '2 hours ago'
                      },
                      {
                        name: 'SOP Wizard',
                        status: 'In Progress',
                        progress: 70,
                        lastUpdate: '1 hour ago'
                      },
                      {
                        name: 'Track & Trace',
                        status: 'Active',
                        progress: 90,
                        lastUpdate: '30 minutes ago'
                      },
                      {
                        name: 'Survey System',
                        status: 'Completed',
                        progress: 100,
                        lastUpdate: '1 day ago'
                      }
                    ].map((system, index) => (
                      <TableRow key={index}>
                        <TableCell>{system.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={system.status}
                            color={
                              system.status === 'Active'
                                ? 'success'
                                : system.status === 'Completed'
                                  ? 'primary'
                                  : 'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={system.progress}
                              sx={{ width: 100, height: 6 }}
                            />
                            <Typography variant="body2">{system.progress}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{system.lastUpdate}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Notifications */}
          {renderNotifications()}

          {/* Recent Activities */}
          {renderRecentActivities()}
        </Grid>
      </Grid>

      {/* Floating Action Buttons */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 20, right: 20 }}
        onClick={() => console.log('Quick actions')}
      >
        <Assessment />
      </Fab>
    </Box>
  );
};

export default GACPProductionDashboard;
