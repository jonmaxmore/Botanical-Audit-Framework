import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  CloudUpload as UploadIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface AIQCResult {
  overallScore: number;
  inspectionType: 'VIDEO' | 'HYBRID' | 'ONSITE';
  scores: {
    documentValidation?: number;
    imageQuality?: number;
    dataCompleteness?: number;
  };
  issues: string[];
  recommendations: string[];
}

interface AIQCModalProps {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  onComplete?: (result: AIQCResult) => void;
}

const AIQCModal: React.FC<AIQCModalProps> = ({ open, onClose, applicationId, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIQCResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const runAIQC = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE}/ai-qc/applications/${applicationId}/run`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setResult(response.data.data);
        if (onComplete) {
          onComplete(response.data.data);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to run AI QC');
    } finally {
      setLoading(false);
    }
  };

  const getInspectionTypeColor = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'info';
      case 'HYBRID':
        return 'warning';
      case 'ONSITE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getInspectionTypeLabel = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'วิดีโอ (฿500)';
      case 'HYBRID':
        return 'แบบผสม (฿1,500)';
      case 'ONSITE':
        return 'ลงพื้นที่ (฿3,000)';
      default:
        return type;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ mr: 1 }} />
          AI Quality Control
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              กำลังวิเคราะห์เอกสารด้วย AI...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!result && !loading && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              AI Quality Control System
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ระบบจะทำการตรวจสอบคุณภาพเอกสารและรูปภาพด้วย Google Gemini AI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • ตรวจสอบความถูกต้องของเอกสาร
              <br />
              • วิเคราะห์คุณภาพรูปภาพ
              <br />
              • ประเมินความสมบูรณ์ของข้อมูล
              <br />• กำหนดรูปแบบการตรวจประเมินที่เหมาะสม
            </Typography>
          </Box>
        )}

        {result && (
          <Box>
            {/* Overall Score */}
            <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Typography variant="h4" color="primary">
                      {result.overallScore.toFixed(1)}/10
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      คะแนนรวม
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Chip
                      label={getInspectionTypeLabel(result.inspectionType)}
                      color={getInspectionTypeColor(result.inspectionType)}
                      size="medium"
                      sx={{ fontWeight: 'bold', fontSize: '1rem', padding: '8px 16px' }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Detailed Scores */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              คะแนนรายละเอียด
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {result.scores.documentValidation !== undefined && (
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        ตรวจสอบเอกสาร
                      </Typography>
                      <Chip
                        label={`${result.scores.documentValidation.toFixed(1)}/10`}
                        color={getScoreColor(result.scores.documentValidation)}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {result.scores.imageQuality !== undefined && (
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        คุณภาพรูปภาพ
                      </Typography>
                      <Chip
                        label={`${result.scores.imageQuality.toFixed(1)}/10`}
                        color={getScoreColor(result.scores.imageQuality)}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {result.scores.dataCompleteness !== undefined && (
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        ความสมบูรณ์
                      </Typography>
                      <Chip
                        label={`${result.scores.dataCompleteness.toFixed(1)}/10`}
                        color={getScoreColor(result.scores.dataCompleteness)}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>

            {/* Issues */}
            {result.issues && result.issues.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  ปัญหาที่พบ
                </Typography>
                <List dense>
                  {result.issues.map((issue, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={issue} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  คำแนะนำ
                </Typography>
                <List dense>
                  {result.recommendations.map((rec, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>ปิด</Button>
        {!result && !loading && (
          <Button variant="contained" onClick={runAIQC} startIcon={<AssessmentIcon />}>
            เริ่มตรวจสอบด้วย AI
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AIQCModal;
