'use client';
/**
 * 📋 GACP SOP Wizard Component - Production Ready
 * ระบบตัวช่วย SOP ครบถ้วน 5 ขั้นตอนสำหรับ Frontend
 *
 * Features:
 * - Interactive 5-Phase Workflow
 * - Photo Upload + GPS Tagging
 * - Real-time Compliance Scoring
 * - AI Guidance Integration
 * - Progress Tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Grid,
  Alert,
  AlertTitle,
  Chip,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Badge,
  Tooltip,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import {
  Eco,
  LocalFlorist,
  Grass,
  Agriculture,
  Inventory,
  PhotoCamera,
  GpsFixed,
  CheckCircle,
  Warning,
  Info,
  TrendingUp,
  Assignment,
  LocationOn,
  Timer,
  Add,
  ExpandMore,
  Analytics,
  Star,
  Verified,
} from '@mui/icons-material';

// Import AI Assistant and SOP System
import { GACPAIAssistantSystem } from '../../../business-logic/gacp-ai-assistant-system';
import {
  GACPSOPWizardSystem,
  GACP_SOP_ACTIVITIES,
} from '../../../business-logic/gacp-sop-wizard-system';

// Phase Configuration
const SOP_PHASES = [
  {
    id: 'pre_planting',
    name: 'ขั้นตอนก่อนปลูก',
    icon: <Eco />,
    color: '#8BC34A',
    description: 'เตรียมความพร้อมก่อนการปลูก',
  },
  {
    id: 'planting',
    name: 'ขั้นตอนการปลูก',
    icon: <LocalFlorist />,
    color: '#4CAF50',
    description: 'กระบวนการปลูกและเริ่มต้น',
  },
  {
    id: 'growing',
    name: 'ขั้นตอนการเพาะปลูก',
    icon: <Grass />,
    color: '#2E7D32',
    description: 'การดูแลระหว่างการเจริญเติบโต',
  },
  {
    id: 'harvesting',
    name: 'ขั้นตอนการเก็บเกี่ยว',
    icon: <Agriculture />,
    color: '#FF9800',
    description: 'การเก็บเกี่ยวผลผลิต',
  },
  {
    id: 'post_harvest',
    name: 'ขั้นตอนหลังการเก็บเกี่ยว',
    icon: <Inventory />,
    color: '#795548',
    description: 'การแปรรูปและเก็บรักษา',
  },
];

const GACPSOPWizard = ({ farmId, cultivationCycleId, userId, onSessionComplete }) => {
  // State Management
  const [activePhase, setActivePhase] = useState(0);
  const [sopSession, setSOPSession] = useState(null);
  const [sessionProgress, setSessionProgress] = useState(null);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [activityData, setActivityData] = useState({});
  const [photos, setPhotos] = useState([]);
  const [gpsLocation, setGPSLocation] = useState(null);
  const [aiGuidance, setAIGuidance] = useState([]);
  const [complianceScore, setComplianceScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [errors, setErrors] = useState({});

  // System Instances
  const [sopSystem, setSOPSystem] = useState(null);
  const [aiAssistant, setAIAssistant] = useState(null);

  // Initialize systems
  useEffect(() => {
    const initializeSystems = async () => {
      try {
        // Initialize SOP Wizard System
        const sop = new GACPSOPWizardSystem(null); // DB will be injected via API
        setSOPSystem(sop);

        // Initialize AI Assistant
        const ai = new GACPAIAssistantSystem();
        setAIAssistant(ai);

        // Start SOP Session
        const sessionResult = await fetch('/api/sop/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmId,
            cultivationCycleId,
            userId,
            sessionName: `SOP Session ${new Date().toLocaleDateString('th-TH')}`,
          }),
        });

        if (sessionResult.ok) {
          const { session } = await sessionResult.json();
          setSOPSession(session);
          loadSessionProgress(session.id);
        }
      } catch (error) {
        console.error('Error initializing SOP systems:', error);
      }
    };

    if (farmId && cultivationCycleId && userId) {
      initializeSystems();
    }
  }, [farmId, cultivationCycleId, userId]);

  // Get GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setGPSLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        error => console.warn('GPS not available:', error),
      );
    }
  }, []);

  // Load session progress
  const loadSessionProgress = async sessionId => {
    try {
      const response = await fetch(`/api/sop/sessions/${sessionId}/progress`);
      if (response.ok) {
        const progress = await response.json();
        setSessionProgress(progress);
        updateAvailableActivities(progress.session.currentPhase);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  // Update available activities for current phase
  const updateAvailableActivities = phaseId => {
    const phaseActivities = GACP_SOP_ACTIVITIES[phaseId]?.activities || {};
    const activities = Object.entries(phaseActivities).map(([id, activity]) => ({
      id,
      ...activity,
      phase: phaseId,
    }));
    setAvailableActivities(activities);
  };

  // Handle activity selection
  const handleActivitySelect = activity => {
    setCurrentActivity(activity);
    setActivityData({});
    setPhotos([]);
    setShowActivityDialog(true);
  };

  // Handle photo upload
  const handlePhotoUpload = event => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        setPhotos(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            file,
            preview: e.target.result,
            timestamp: new Date(),
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Record SOP activity
  const recordActivity = async () => {
    if (!currentActivity || !sopSession) return;

    setIsRecording(true);
    try {
      const payload = {
        activityId: currentActivity.id,
        data: activityData,
        photos: photos.map(p => ({
          name: p.file.name,
          size: p.file.size,
          type: p.file.type,
          timestamp: p.timestamp,
        })),
        gpsLocation,
        userId,
        notes: activityData.notes || '',
        deviceInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date(),
        },
      };

      const response = await fetch(`/api/sop/sessions/${sopSession.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();

        // Update progress
        setSessionProgress(result.sessionProgress);
        setCompletedActivities(prev => [...prev, result.activity]);

        // Close dialog
        setShowActivityDialog(false);
        setCurrentActivity(null);

        // Show success
        alert(`บันทึกกิจกรรม "${currentActivity.name}" สำเร็จ!`);

        // Reload progress
        loadSessionProgress(sopSession.id);
      } else {
        throw new Error('Failed to record activity');
      }
    } catch (error) {
      console.error('Error recording activity:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกกิจกรรม');
    } finally {
      setIsRecording(false);
    }
  };

  // Render phase progress
  const renderPhaseProgress = phase => {
    if (!sessionProgress) return null;

    const progress = sessionProgress.session.phaseProgress[phase.id];
    const percentage = progress?.percentage || 0;

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">{phase.name}</Typography>
          <Typography variant="body2">
            {progress?.completed || 0}/{progress?.total || 0}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: phase.color,
            },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {percentage}% เสร็จสิ้น
        </Typography>
      </Box>
    );
  };

  // Render activity card
  const renderActivityCard = (activity, isCompleted = false) => (
    <Card
      key={activity.id}
      sx={{
        mb: 2,
        border: isCompleted ? '2px solid #4CAF50' : '1px solid #ddd',
        cursor: isCompleted ? 'default' : 'pointer',
        opacity: isCompleted ? 0.8 : 1,
      }}
      onClick={() => !isCompleted && handleActivitySelect(activity)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {activity.name}
              {isCompleted && <CheckCircle sx={{ ml: 1, color: '#4CAF50' }} />}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {activity.description}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`GACP ${activity.gacp_requirement}`} size="small" color="primary" />
              <Chip label={`${activity.compliance_points} คะแนน`} size="small" icon={<Star />} />
              {activity.frequency && (
                <Chip label={`ความถี่: ${activity.frequency}`} size="small" variant="outlined" />
              )}
            </Box>
          </Box>

          {!isCompleted && (
            <IconButton color="primary">
              <Add />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  // Render activity dialog
  const renderActivityDialog = () => (
    <Dialog
      open={showActivityDialog}
      onClose={() => setShowActivityDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assignment />
          {currentActivity?.name}
        </Box>
      </DialogTitle>

      <DialogContent>
        {currentActivity && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {currentActivity.description}
            </Typography>

            {/* Required Fields */}
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              ข้อมูลที่จำเป็น
            </Typography>

            {currentActivity.requiredFields?.map((field, index) => (
              <TextField
                key={field}
                fullWidth
                label={field.replace(/_/g, ' ').toUpperCase()}
                value={activityData[field] || ''}
                onChange={e =>
                  setActivityData(prev => ({
                    ...prev,
                    [field]: e.target.value,
                  }))
                }
                margin="normal"
                required
              />
            ))}

            {/* Notes */}
            <TextField
              fullWidth
              label="หมายเหตุเพิ่มเติม"
              multiline
              rows={3}
              value={activityData.notes || ''}
              onChange={e =>
                setActivityData(prev => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              margin="normal"
            />

            {/* Photo Upload */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                รูปภาพประกอบ
              </Typography>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
                id="photo-upload"
              />
              <label htmlFor="photo-upload">
                <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
                  เพิ่มรูปภาพ
                </Button>
              </label>

              {photos.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {photos.map(photo => (
                    <Grid item xs={6} sm={4} key={photo.id}>
                      <img
                        src={photo.preview}
                        alt="Activity"
                        style={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* GPS Info */}
            {gpsLocation && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <AlertTitle>ตำแหน่ง GPS</AlertTitle>
                Latitude: {gpsLocation.latitude.toFixed(6)}, Longitude:{' '}
                {gpsLocation.longitude.toFixed(6)}
                (ความแม่นยำ: {gpsLocation.accuracy?.toFixed(0)} เมตร)
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setShowActivityDialog(false)}>ยกเลิก</Button>
        <Button
          onClick={recordActivity}
          variant="contained"
          disabled={
            isRecording || !currentActivity?.requiredFields?.every(field => activityData[field])
          }
          startIcon={isRecording ? <Timer /> : <CheckCircle />}
        >
          {isRecording ? 'กำลังบันทึก...' : 'บันทึกกิจกรรม'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (!sopSession || !sessionProgress) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>กำลังโหลดระบบ SOP...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            📋 ระบบ GACP SOP Wizard
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary">
            ตัวช่วยการปฏิบัติตามขั้นตอน SOP มาตรฐาน GACP
          </Typography>

          {/* Overall Progress */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">ความคืบหน้าโดยรวม</Typography>
              <Typography variant="body1">{sessionProgress.session.overallProgress}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={sessionProgress.session.overallProgress}
              sx={{ height: 12, borderRadius: 6 }}
            />
          </Box>

          {/* Compliance Score */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Chip
              icon={<Verified />}
              label={`คะแนนความสอดคล้อง: ${sessionProgress.session.complianceScore.overall}/345`}
              color="primary"
              variant="outlined"
              size="large"
            />
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Panel - Phase Navigation */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ขั้นตอนการดำเนินงาน
              </Typography>

              <Stepper activeStep={activePhase} orientation="vertical">
                {SOP_PHASES.map((phase, index) => (
                  <Step key={phase.id}>
                    <StepLabel
                      icon={
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: '50%',
                            backgroundColor: phase.color,
                            color: 'white',
                          }}
                        >
                          {phase.icon}
                        </Box>
                      }
                    >
                      <Typography variant="body1" fontWeight="medium">
                        {phase.name}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="caption" color="text.secondary">
                        {phase.description}
                      </Typography>
                      <Box sx={{ mt: 2 }}>{renderPhaseProgress(phase)}</Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* AI Guidance Panel */}
          {aiGuidance.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🤖 คำแนะนำจาก AI
                </Typography>
                {aiGuidance.slice(-3).map((guidance, index) => (
                  <Alert key={index} severity="info" sx={{ mb: 1 }}>
                    {guidance.message}
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Panel - Current Phase Activities */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {SOP_PHASES[activePhase]?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {SOP_PHASES[activePhase]?.description}
              </Typography>

              {/* Available Activities */}
              <Typography variant="h6" gutterBottom>
                กิจกรรมที่ต้องดำเนินการ
              </Typography>

              {availableActivities.length > 0 ? (
                availableActivities.map(activity =>
                  renderActivityCard(
                    activity,
                    completedActivities.some(ca => ca.activityId === activity.id),
                  ),
                )
              ) : (
                <Alert severity="info">
                  ไม่มีกิจกรรมสำหรับขั้นตอนนี้ หรือได้ดำเนินการครบถ้วนแล้ว
                </Alert>
              )}

              {/* Completed Activities */}
              {completedActivities.length > 0 && (
                <Accordion sx={{ mt: 3 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">
                      กิจกรรมที่เสร็จสิ้นแล้ว ({completedActivities.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {completedActivities.map(activity => (
                      <Card key={activity.id} sx={{ mb: 1, backgroundColor: '#f5f5f5' }}>
                        <CardContent sx={{ py: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ color: '#4CAF50' }} />
                            <Typography variant="body1">{activity.activityName}</Typography>
                            <Chip
                              label={`${activity.compliancePoints} คะแนน`}
                              size="small"
                              color="success"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </AccordionDetails>
                </Accordion>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activity Recording Dialog */}
      {renderActivityDialog()}

      {/* Floating Action Button for Quick Actions */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 20, right: 20 }}
        onClick={() => {
          // Show quick actions menu
          console.log('Quick actions menu');
        }}
      >
        <Analytics />
      </Fab>
    </Box>
  );
};

export default GACPSOPWizard;
