'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  LinearProgress,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  EventRepeat as RescheduleIcon,
  Photo as PhotoIcon,
  Map as MapIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Inspection {
  _id: string;
  inspectionNumber: string;
  inspectionType: string;
  scheduledDate: string;
  actualStartTime?: string;
  actualEndTime?: string;
  duration?: number;
  status: string;
  application: {
    _id: string;
    applicationNumber: string;
    basicInfo: {
      farmName: string;
      ownerName: string;
    };
  };
  inspector: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  siteInfo: {
    farmName: string;
    contactPerson: string;
    contactPhone: string;
    address: string;
    gpsCoordinates: {
      latitude: number;
      longitude: number;
    };
  };
  checklist: Array<{
    _id: string;
    category: string;
    item: string;
    status: string;
    score: number;
    notes?: string;
  }>;
  photos: Array<{
    _id: string;
    url: string;
    caption?: string;
    category: string;
  }>;
  observations: Array<{
    _id: string;
    type: string;
    description: string;
    severity: string;
  }>;
  scoring: {
    totalScore: number;
    grade: string;
    passed: boolean;
    categoryScores: Array<{
      category: string;
      score: number;
      percentage: number;
    }>;
  };
  inspectorNotes?: {
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
  };
  checklistCompletion: number;
  photoCount: number;
  isOverdue: boolean;
}

export default function InspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = params?.id as string;

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    'start' | 'complete' | 'cancel' | 'reschedule' | null
  >(null);
  const [actionData, setActionData] = useState<any>({});

  const fetchInspection = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/inspections/${inspectionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch inspection');

      const data = await response.json();
      setInspection(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inspection');
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    fetchInspection();
  }, [fetchInspection]);

  const handleAction = async () => {
    if (!inspection || !actionType) return;

    try {
      let endpoint = '';
      let body = {};

      switch (actionType) {
        case 'start':
          endpoint = `/api/inspections/${inspection._id}/start`;
          break;
        case 'complete':
          endpoint = `/api/inspections/${inspection._id}/complete`;
          break;
        case 'cancel':
          endpoint = `/api/inspections/${inspection._id}/cancel`;
          body = { reason: actionData.reason };
          break;
        case 'reschedule':
          endpoint = `/api/inspections/${inspection._id}/reschedule`;
          body = { newDate: actionData.newDate, reason: actionData.reason };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Action failed');

      await fetchInspection();
      setActionDialogOpen(false);
      setActionType(null);
      setActionData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !inspection) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Inspection not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/inspections')}
          sx={{ mt: 2 }}
        >
          กลับไปหน้ารายการ
        </Button>
      </Box>
    );
  }

  const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
    scheduled: 'primary',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'error'
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.push('/inspections')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4">{inspection.inspectionNumber}</Typography>
            <Typography variant="body2" color="textSecondary">
              {inspection.siteInfo.farmName}
            </Typography>
          </Box>
        </Box>
        <Chip label={inspection.status} color={statusColors[inspection.status]} />
      </Box>

      {/* Action Buttons */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {inspection.status === 'scheduled' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<StartIcon />}
              onClick={() => {
                setActionType('start');
                setActionDialogOpen(true);
              }}
            >
              เริ่มการตรวจ
            </Button>
          )}

          {inspection.status === 'in_progress' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CompleteIcon />}
              onClick={() => {
                setActionType('complete');
                setActionDialogOpen(true);
              }}
            >
              เสร็จสิ้นการตรวจ
            </Button>
          )}

          {(inspection.status === 'scheduled' || inspection.status === 'in_progress') && (
            <>
              <Button
                variant="outlined"
                startIcon={<RescheduleIcon />}
                onClick={() => {
                  setActionType('reschedule');
                  setActionDialogOpen(true);
                }}
              >
                เลื่อนนัด
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => {
                  setActionType('cancel');
                  setActionDialogOpen(true);
                }}
              >
                ยกเลิก
              </Button>
            </>
          )}

          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => router.push(`/inspections/${inspection._id}/edit`)}
          >
            แก้ไขข้อมูล
          </Button>
        </Box>
      </Paper>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                ความคืบหน้า Checklist
              </Typography>
              <Typography variant="h4">{inspection.checklistCompletion}%</Typography>
              <LinearProgress
                variant="determinate"
                value={inspection.checklistCompletion}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                รูปภาพ
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhotoIcon color="primary" />
                <Typography variant="h4">{inspection.photoCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Observations
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="primary" />
                <Typography variant="h4">{inspection.observations.length}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                คะแนน
              </Typography>
              <Typography
                variant="h4"
                color={inspection.scoring.passed ? 'success.main' : 'error.main'}
              >
                {inspection.scoring.totalScore.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                เกรด {inspection.scoring.grade}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Info */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Basic Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ข้อมูลการตรวจ
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    เลขที่ใบสมัคร
                  </Typography>
                  <Typography variant="body1">
                    {inspection.application.applicationNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    ประเภทการตรวจ
                  </Typography>
                  <Typography variant="body1">
                    {inspection.inspectionType === 'initial' && 'ครั้งแรก'}
                    {inspection.inspectionType === 'surveillance' && 'ติดตาม'}
                    {inspection.inspectionType === 'renewal' && 'ต่ออายุ'}
                    {inspection.inspectionType === 'special' && 'พิเศษ'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    วันที่นัด
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(inspection.scheduledDate), 'dd/MM/yyyy HH:mm')}
                  </Typography>
                </Grid>
                {inspection.actualStartTime && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      เวลาเริ่มจริง
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(inspection.actualStartTime), 'dd/MM/yyyy HH:mm')}
                    </Typography>
                  </Grid>
                )}
                {inspection.actualEndTime && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      เวลาสิ้นสุด
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(inspection.actualEndTime), 'dd/MM/yyyy HH:mm')}
                    </Typography>
                  </Grid>
                )}
                {inspection.duration && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      ระยะเวลา
                    </Typography>
                    <Typography variant="body1">
                      {Math.floor(inspection.duration / 60)}h {inspection.duration % 60}m
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Scoring Details */}
          {inspection.scoring.categoryScores.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  คะแนนแยกตามหมวด
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {inspection.scoring.categoryScores.map(cat => (
                    <ListItem key={cat.category}>
                      <ListItemText
                        primary={cat.category}
                        secondary={`${cat.score.toFixed(1)} / ${cat.percentage.toFixed(0)}%`}
                      />
                      <LinearProgress
                        variant="determinate"
                        value={cat.percentage}
                        sx={{ width: 100, mr: 2 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Inspector Notes */}
          {inspection.inspectorNotes && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  บันทึกของผู้ตรวจ
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {inspection.inspectorNotes.summary && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      สรุป
                    </Typography>
                    <Typography variant="body2">{inspection.inspectorNotes.summary}</Typography>
                  </Box>
                )}

                {inspection.inspectorNotes.strengths &&
                  inspection.inspectorNotes.strengths.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom color="success.main">
                        จุดแข็ง
                      </Typography>
                      <List dense>
                        {inspection.inspectorNotes.strengths.map((item, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={`• ${item}`} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                {inspection.inspectorNotes.weaknesses &&
                  inspection.inspectorNotes.weaknesses.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom color="warning.main">
                        จุดอ่อน
                      </Typography>
                      <List dense>
                        {inspection.inspectorNotes.weaknesses.map((item, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={`• ${item}`} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                {inspection.inspectorNotes.recommendations &&
                  inspection.inspectorNotes.recommendations.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        คำแนะนำ
                      </Typography>
                      <List dense>
                        {inspection.inspectorNotes.recommendations.map((item, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={`• ${item}`} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Site Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ข้อมูลสถานที่
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" gutterBottom>
                <strong>ชื่อไร่:</strong> {inspection.siteInfo.farmName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>ผู้ติดต่อ:</strong> {inspection.siteInfo.contactPerson}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>โทรศัพท์:</strong> {inspection.siteInfo.contactPhone}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>ที่อยู่:</strong> {inspection.siteInfo.address}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<MapIcon />}
                fullWidth
                sx={{ mt: 2 }}
                href={`https://www.google.com/maps?q=${inspection.siteInfo.gpsCoordinates.latitude},${inspection.siteInfo.gpsCoordinates.longitude}`}
                target="_blank"
              >
                ดูแผนที่
              </Button>
            </CardContent>
          </Card>

          {/* Inspector Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ผู้ตรวจ
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" gutterBottom>
                <strong>ชื่อ:</strong> {inspection.inspector.fullName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>อีเมล:</strong> {inspection.inspector.email}
              </Typography>
              {inspection.inspector.phone && (
                <Typography variant="body2" gutterBottom>
                  <strong>โทร:</strong> {inspection.inspector.phone}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === 'start' && 'เริ่มการตรวจ'}
          {actionType === 'complete' && 'เสร็จสิ้นการตรวจ'}
          {actionType === 'cancel' && 'ยกเลิกการตรวจ'}
          {actionType === 'reschedule' && 'เลื่อนนัดการตรวจ'}
        </DialogTitle>
        <DialogContent>
          {actionType === 'start' && (
            <Alert severity="info">คุณต้องการเริ่มการตรวจนี้หรือไม่?</Alert>
          )}

          {actionType === 'complete' && (
            <Alert severity="success">
              คุณต้องการเสร็จสิ้นการตรวจนี้หรือไม่? ระบบจะคำนวณคะแนนสุดท้ายโดยอัตโนมัติ
            </Alert>
          )}

          {actionType === 'cancel' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="เหตุผลในการยกเลิก"
              value={actionData.reason || ''}
              onChange={e => setActionData({ ...actionData, reason: e.target.value })}
              sx={{ mt: 2 }}
              required
            />
          )}

          {actionType === 'reschedule' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="วันเวลาใหม่"
                value={actionData.newDate || ''}
                onChange={e => setActionData({ ...actionData, newDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="เหตุผลในการเลื่อนนัด"
                value={actionData.reason || ''}
                onChange={e => setActionData({ ...actionData, reason: e.target.value })}
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>ยกเลิก</Button>
          <Button onClick={handleAction} variant="contained" color="primary">
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
