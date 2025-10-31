/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';
/**
 * 🧙‍♂️ GACP Application Wizard - Multi-Step Form System
 * ระบบตัวช่วยยื่นคำขอแบบหลายขั้นตอนสำหรับใบรับรอง GACP
 *
 * รองรับผู้ขอ 3 ประเภท:
 * 1. วิสาหกิจชุมชน (Community Enterprise)
 * 2. บุคคลธรรมดา (Individual)
 * 3. นิติบุคคล (Juristic Person)
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
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Alert,
  AlertTitle,
  Chip,
  LinearProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { AlertColor } from '@mui/material';

import {
  AccountCircle,
  Business,
  LocationOn,
  // Eco, // Not available in this version
  Nature, // Use Nature instead of Eco
  BugReport,
  Assignment,
  CloudUpload,
  CheckCircle,
  Warning,
  Info,
  Error,
  ExpandMore,
  Help,
  Description,
  Verified,
  Schedule,
  MonetizationOn
} from '@mui/icons-material';

// Import AI Assistant System
// @ts-expect-error - JavaScript module without type declarations
import { GACPAIAssistantSystem } from '../../../business-logic/gacp-ai-assistant-system';

// Application wizard steps configuration
const WIZARD_STEPS = [
  {
    id: 'applicant_type',
    label: 'ประเภทผู้ขอ',
    title: 'เลือกประเภทผู้ยื่นขอใบรับรอง GACP',
    icon: <AccountCircle />,
    required: true
  },
  {
    id: 'applicant_info',
    label: 'ข้อมูลผู้ขอ',
    title: 'กรอกข้อมูลส่วนตัวและการติดต่อ',
    icon: <Business />,
    required: true
  },
  {
    id: 'land_info',
    label: 'ข้อมูลที่ดิน',
    title: 'ข้อมูลสถานที่เพาะปลูกและเอกสารสิทธิ์',
    icon: <LocationOn />,
    required: true
  },
  {
    id: 'cultivation_plan',
    label: 'แผนการเพาะปลูก',
    title: 'รายละเอียดการเพาะปลูกและพันธุ์กัญชา',
    icon: <Nature />,
    required: true
  },
  {
    id: 'pest_control',
    label: 'การควบคุมศัตรูพืช',
    title: 'แผนการจัดการศัตรูพืชและโรคพืช',
    icon: <BugReport />,
    required: true
  },
  {
    id: 'documents',
    label: 'เอกสารประกอบ',
    title: 'อัปโหลดเอกสารที่จำเป็นตามประเภทผู้ขอ',
    icon: <CloudUpload />,
    required: true
  },
  {
    id: 'review',
    label: 'ตรวจสอบและยืนยัน',
    title: 'ตรวจสอบข้อมูลทั้งหมดก่อนส่งคำขอ',
    icon: <Assignment />,
    required: true
  }
];

// Applicant types with specific requirements
const APPLICANT_TYPES = {
  community_enterprise: {
    id: 'community_enterprise',
    name: 'วิสาหกิจชุมชน',
    description: 'วิสาหกิจชุมชนที่จดทะเบียนถูกต้องตามกฎหมาย',
    requiredDocuments: [
      'หนังสือสำคัญแสดงการจดทะเบียนวิสาหกิจชุมชน',
      'บัญชีรายชื่อสมาชิก',
      'หนังสือยินยอมจากหน่วยงานรัฐ',
      'เอกสารสิทธิ์ที่ดิน',
      'แผนที่แสดงตำแหน่งฟาร์ม'
    ],
    cooperation: 'หน่วยงานรัฐหรือสถาบันอุดมศึกษา',
    fees: { phase1: 5000, phase2: 25000 }
  },
  individual: {
    id: 'individual',
    name: 'บุคคลธรรมดา',
    description: 'บุคคลธรรมดาที่มีความร่วมมือกับผู้รับอนุญาตผลิตยา',
    requiredDocuments: [
      'บัตรประจำตัวประชาชน',
      'หนังสือยินยอมจากผู้รับอนุญาตผลิตยา',
      'เอกสารสิทธิ์ที่ดิน',
      'แผนที่แสดงตำแหน่งฟาร์ม'
    ],
    cooperation: 'ผู้รับอนุญาตผลิตยาแผนปัจจุบัน/แผนโบราณ/ผลิตภัณฑ์สมุนไพร',
    fees: { phase1: 5000, phase2: 25000 }
  },
  juristic_person: {
    id: 'juristic_person',
    name: 'นิติบุคคล',
    description: 'นิติบุคคลที่จดทะเบียนถูกต้องตามกฎหมาย',
    requiredDocuments: [
      'หนังสือรับรองการจดทะเบียนนิติบุคคล (ไม่เกิน 6 เดือน)',
      'หนังสือมอบอำนาจ',
      'เอกสารสิทธิ์ที่ดิน',
      'แผนที่แสดงตำแหน่งฟาร์ม'
    ],
    cooperation: 'หน่วยงานรัฐ/สถาบันอุดมศึกษา/ผู้รับอนุญาตผลิตยา',
    fees: { phase1: 5000, phase2: 25000 }
  }
};

const HiddenFileInput = styled('input')({
  display: 'none'
});

const GACPApplicationWizard = () => {
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [aiAssistant, setAiAssistant] = useState(null);
  const [validationResults, setValidationResults] = useState({});
  const [aiGuidance, setAiGuidance] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [errors, setErrors] = useState({});
  const [aiAnalysisReport, setAiAnalysisReport] = useState(null);
  const [feedback, setFeedback] = useState<{ message: string; severity: AlertColor } | null>(null);

  const showFeedback = (message: string, severity: AlertColor = 'info') => {
    setFeedback({ message, severity });
  };

  const handleFeedbackClose = (_event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setFeedback(null);
  };

  // Initialize AI Assistant
  useEffect(() => {
    const ai = new GACPAIAssistantSystem();
    setAiAssistant(ai);

    // Listen to AI events
    ai.on('real_time_assistance', data => {
      setAiGuidance(prev => [...prev, ...data.guidance]);
    });

    ai.on('form_data_extracted', data => {
      setFormData(prev => ({
        ...prev,
        ...data.extractedData
      }));
    });

    ai.on('ai_analysis_completed', report => {
      setAiAnalysisReport(report);
    });

    return () => {
      ai.removeAllListeners();
    };
  }, []);

  // Calculate completion percentage
  useEffect(() => {
    const totalFields = 20; // Estimated total required fields
    const completedFields = Object.keys(formData).filter(
      key => formData[key] && formData[key] !== ''
    ).length;
    setCompletionPercentage(Math.min((completedFields / totalFields) * 100, 100));
  }, [formData]);

  // Handle field change with real-time AI validation
  const handleFieldChange = useCallback(
    async (fieldName, value) => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: value
      }));

      // Clear previous errors for this field
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));

      // Real-time AI validation
      if (aiAssistant && value) {
        try {
          const result = await aiAssistant.validateFieldRealTime(fieldName, value, formData);

          setValidationResults(prev => ({
            ...prev,
            [fieldName]: result
          }));

          if (!result.valid) {
            setErrors(prev => ({
              ...prev,
              [fieldName]: result.errors[0]
            }));
          }
        } catch (error) {
          console.error('AI validation error:', error);
        }
      }
    },
    [aiAssistant, formData]
  );

  // Handle document upload with AI processing
  const handleDocumentUpload = async (documentType, file) => {
    if (!aiAssistant) return;

    setIsProcessing(true);
    try {
      const result = await aiAssistant.processDocument(file, documentType, formData.applicant_type);

      if (result.success) {
        // Auto-populate form with extracted data
        setFormData(prev => ({
          ...prev,
          ...result.extractedData,
          [`${documentType}_uploaded`]: true,
          [`${documentType}_confidence`]: result.validation.ocrConfidence
        }));
      }
    } catch (error) {
      console.error('Document processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Navigation functions
  const handleNext = async () => {
    // Validate current step before proceeding
    const currentStepData = getCurrentStepData();

    if (aiAssistant) {
      const validation = await aiAssistant.validateFormAndProvideGuidance(currentStepData);

      if (!validation.formValidation.valid) {
        // Show validation errors
        const stepErrors = {};
        Object.entries(validation.formValidation.fieldResults).forEach(([field, result]) => {
          if (!result.valid) {
            stepErrors[field] = result.errors[0];
          }
        });
        setErrors(stepErrors);
        return;
      }
    }

    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({});
    setValidationResults({});
    setAiGuidance([]);
    setErrors({});
    setAiAnalysisReport(null);
  };

  // Get data for current step
  const getCurrentStepData = () => {
    const step = WIZARD_STEPS[activeStep];
    const stepFields = getStepFields(step.id);
    const stepData = {};

    stepFields.forEach(field => {
      if (formData[field]) {
        stepData[field] = formData[field];
      }
    });

    return stepData;
  };

  // Get fields for each step
  const getStepFields = stepId => {
    const fieldMap = {
      applicant_type: ['applicant_type'],
      applicant_info: ['full_name', 'thai_id', 'email', 'phone', 'address'],
      land_info: ['land_deed_number', 'land_size', 'land_ownership', 'farm_location'],
      cultivation_plan: ['cultivation_area', 'plant_quantity', 'cultivation_type', 'plant_variety'],
      pest_control: ['pest_control_method', 'approved_substances', 'ipm_plan'],
      documents: ['uploaded_documents'],
      review: []
    };
    return fieldMap[stepId] || [];
  };

  // Submit application
  const handleSubmit = async () => {
    if (!aiAssistant) return;

    setIsProcessing(true);
    try {
      // Final AI analysis
      const finalAnalysis = await aiAssistant.validateFormAndProvideGuidance(formData);

      if (finalAnalysis.readinessScore < 70) {
        showFeedback('คะแนนความพร้อมต่ำ กรุณาแก้ไขปัญหาก่อนส่งคำขอ', 'warning');
        return;
      }

      // Submit to backend
      const response = await fetch('/api/gacp/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          aiAnalysis: finalAnalysis,
          submittedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        showFeedback(`ส่งคำขอสำเร็จ! หมายเลขใบสมัคร: ${result.applicationNumber}`, 'success');
        handleReset();
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (error) {
      console.error('Submission error:', error);
      showFeedback('เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Render step content
  const renderStepContent = stepId => {
    switch (stepId) {
      case 'applicant_type':
        return (
          <ApplicantTypeStep
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
            aiGuidance={aiGuidance}
          />
        );

      case 'applicant_info':
        return (
          <ApplicantInfoStep
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
            validationResults={validationResults}
            aiGuidance={aiGuidance}
          />
        );

      case 'land_info':
        return (
          <LandInfoStep
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
            validationResults={validationResults}
            aiGuidance={aiGuidance}
          />
        );

      case 'cultivation_plan':
        return (
          <CultivationPlanStep
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
            validationResults={validationResults}
            aiGuidance={aiGuidance}
          />
        );

      case 'pest_control':
        return (
          <PestControlStep
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
            aiGuidance={aiGuidance}
          />
        );

      case 'documents':
        return (
          <DocumentsStep
            formData={formData}
            onChange={handleFieldChange}
            onDocumentUpload={handleDocumentUpload}
            isProcessing={isProcessing}
            aiGuidance={aiGuidance}
          />
        );

      case 'review':
        return (
          <ReviewStep
            formData={formData}
            aiAnalysisReport={aiAnalysisReport}
            onAnalyze={() => aiAssistant?.validateFormAndProvideGuidance(formData)}
          />
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            🌿 ระบบยื่นขอใบรับรองมาตรฐาน GACP
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary">
            Good Agricultural and Collection Practices สำหรับกัญชาทางการแพทย์
          </Typography>

          {/* Progress Bar */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                ความคืบหน้า: {completionPercentage.toFixed(0)}%
              </Typography>
              <Typography variant="body2">
                ขั้นตอน {activeStep + 1} จาก {WIZARD_STEPS.length}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{ height: 8, borderRadius: 5 }}
            />
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Panel - Stepper */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ขั้นตอนการยื่นขอ
              </Typography>

              <Stepper activeStep={activeStep} orientation="vertical">
                {WIZARD_STEPS.map((step, index) => (
                  <Step key={step.id}>
                    <StepLabel icon={step.icon} error={errors[step.id]}>
                      <Typography variant="body2" fontWeight="medium">
                        {step.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="caption" color="text.secondary">
                        {step.title}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {/* AI Guidance Panel */}
              {aiGuidance.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    🤖 คำแนะนำจาก AI
                  </Typography>
                  {aiGuidance.slice(-3).map((guidance, index) => (
                    <Alert
                      key={index}
                      severity={guidance.severity || 'info'}
                      sx={{ mb: 1, fontSize: '0.875rem' }}
                    >
                      <AlertTitle>{guidance.title}</AlertTitle>
                      {guidance.message}
                    </Alert>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Form Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  {WIZARD_STEPS[activeStep]?.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง ระบบ AI จะช่วยตรวจสอบและให้คำแนะนำ
                </Typography>
              </Box>

              {/* Step Content */}
              <Box sx={{ minHeight: 400 }}>{renderStepContent(WIZARD_STEPS[activeStep]?.id)}</Box>

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined">
                  ก่อนหน้า
                </Button>

                <Box>
                  {activeStep === WIZARD_STEPS.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      variant="contained"
                      color="primary"
                      disabled={isProcessing}
                      startIcon={<CheckCircle />}
                    >
                      {isProcessing ? 'กำลังส่งคำขอ...' : 'ส่งคำขอใบรับรอง'}
                    </Button>
                  ) : (
                    <Button onClick={handleNext} variant="contained" disabled={isProcessing}>
                      ถัดไป
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={6000}
        onClose={handleFeedbackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {feedback ? (
          <Alert onClose={handleFeedbackClose} severity={feedback.severity} sx={{ width: '100%' }}>
            {feedback.message}
          </Alert>
        ) : null}
      </Snackbar>
    </Box>
  );
};

// Step Components

const ApplicantTypeStep = ({ formData, onChange, errors, aiGuidance }) => (
  <Box>
    <FormControl component="fieldset" fullWidth>
      <FormLabel component="legend">เลือกประเภทผู้ยื่นขอใบรับรอง *</FormLabel>
      <RadioGroup
        value={formData.applicant_type || ''}
        onChange={e => onChange('applicant_type', e.target.value)}
        sx={{ mt: 2 }}
      >
        {Object.values(APPLICANT_TYPES).map(type => (
          <Card
            key={type.id}
            sx={{
              mb: 2,
              border: formData.applicant_type === type.id ? 2 : 1,
              borderColor: formData.applicant_type === type.id ? 'primary.main' : 'divider'
            }}
          >
            <CardContent sx={{ pb: 2 }}>
              <FormControlLabel
                value={type.id}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="h6">{type.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {type.description}
                    </Typography>
                    <Typography variant="body2">
                      <strong>ต้องมีความร่วมมือกับ:</strong> {type.cooperation}
                    </Typography>
                    <Typography variant="body2">
                      <strong>ค่าธรรมเนียม:</strong> {type.fees.phase1.toLocaleString()} +{' '}
                      {type.fees.phase2.toLocaleString()} บาท
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>
        ))}
      </RadioGroup>
      {errors.applicant_type && (
        <Typography color="error" variant="caption">
          {errors.applicant_type}
        </Typography>
      )}
    </FormControl>

    {formData.applicant_type && (
      <Alert severity="info" sx={{ mt: 2 }}>
        <AlertTitle>เอกสารที่จำเป็น</AlertTitle>
        <List dense>
          {APPLICANT_TYPES[formData.applicant_type].requiredDocuments.map((doc, index) => (
            <ListItem key={index} disableGutters>
              <ListItemIcon>
                <Description fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={doc} />
            </ListItem>
          ))}
        </List>
      </Alert>
    )}
  </Box>
);

const ApplicantInfoStep = ({ formData, onChange, errors, validationResults }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        ข้อมูลผู้ยื่นขอ
      </Typography>
    </Grid>

    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="ชื่อ-นามสกุล *"
        value={formData.full_name || ''}
        onChange={e => onChange('full_name', e.target.value)}
        error={!!errors.full_name}
        helperText={errors.full_name || 'กรอกชื่อ-นามสกุลเป็นภาษาไทย'}
      />
    </Grid>

    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="เลขประจำตัวประชาชน *"
        value={formData.thai_id || ''}
        onChange={e => onChange('thai_id', e.target.value)}
        error={!!errors.thai_id}
        helperText={errors.thai_id || 'กรอกเลขประจำตัวประชาชน 13 หลัก'}
        inputProps={{ maxLength: 13 }}
      />
      {validationResults.thai_id?.valid && (
        <Chip
          icon={<CheckCircle />}
          label="ตรวจสอบแล้ว"
          color="success"
          size="small"
          sx={{ mt: 1 }}
        />
      )}
    </Grid>

    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="อีเมล *"
        type="email"
        value={formData.email || ''}
        onChange={e => onChange('email', e.target.value)}
        error={!!errors.email}
        helperText={errors.email || 'อีเมลสำหรับติดต่อ'}
      />
    </Grid>

    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="เบอร์โทรศัพท์ *"
        value={formData.phone || ''}
        onChange={e => onChange('phone', e.target.value)}
        error={!!errors.phone}
        helperText={errors.phone || 'เบอร์โทรศัพท์ที่สามารถติดต่อได้'}
      />
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="ที่อยู่ *"
        multiline
        rows={3}
        value={formData.address || ''}
        onChange={e => onChange('address', e.target.value)}
        error={!!errors.address}
        helperText={errors.address || 'ที่อยู่ตามบัตรประจำตัวประชาชน'}
      />
    </Grid>
  </Grid>
);

const LandInfoStep = ({ formData, onChange, errors, validationResults, aiGuidance }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        ข้อมูลที่ดินและสถานที่เพาะปลูก
      </Typography>
    </Grid>

    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="เลขที่โฉนดที่ดิน *"
        value={formData.land_deed_number || ''}
        onChange={e => onChange('land_deed_number', e.target.value)}
        error={!!errors.land_deed_number}
        helperText={errors.land_deed_number || 'เช่น ข.12345'}
      />
    </Grid>

    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="ขนาดที่ดิน *"
        value={formData.land_size || ''}
        onChange={e => onChange('land_size', e.target.value)}
        error={!!errors.land_size}
        helperText={errors.land_size || 'รูปแบบ: ไร่-งาน-วา (เช่น 5-2-75)'}
      />
      {validationResults.land_size?.metadata && (
        <Typography variant="caption" color="success.main">
          = {validationResults.land_size.metadata.totalSqm.toLocaleString()} ตารางเมตร
        </Typography>
      )}
    </Grid>

    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel>สถานะที่ดิน *</InputLabel>
        <Select
          value={formData.land_ownership || ''}
          onChange={e => onChange('land_ownership', e.target.value)}
          error={!!errors.land_ownership}
        >
          <MenuItem value="owned">เป็นเจ้าของ</MenuItem>
          <MenuItem value="rental">เช่า</MenuItem>
          <MenuItem value="concession">สัมปทาน</MenuItem>
        </Select>
      </FormControl>
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="ที่ตั้งฟาร์ม/พิกัด GPS *"
        value={formData.farm_location || ''}
        onChange={e => onChange('farm_location', e.target.value)}
        error={!!errors.farm_location}
        helperText={errors.farm_location || 'ระบุที่ตั้งหรือพิกัด GPS'}
      />
    </Grid>

    {/* AI Guidance for land rental */}
    {formData.land_ownership === 'rental' && (
      <Grid item xs={12}>
        <Alert severity="warning">
          <AlertTitle>เอกสารเพิ่มเติมสำหรับที่ดินเช่า</AlertTitle>
          จำเป็นต้องเตรียมหนังสือให้ความยินยอมจากผู้ให้เช่าและสัญญาเช่าที่ดิน
        </Alert>
      </Grid>
    )}
  </Grid>
);

const CultivationPlanStep = ({ formData, onChange, errors, validationResults, aiGuidance }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        แผนการเพาะปลูกกัญชา
      </Typography>
    </Grid>

    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="พื้นที่เพาะปลูก (ตร.ม.) *"
        type="number"
        value={formData.cultivation_area || ''}
        onChange={e => onChange('cultivation_area', e.target.value)}
        error={!!errors.cultivation_area}
        helperText={errors.cultivation_area || 'พื้นที่ที่จะใช้ปลูกกัญชา'}
      />
    </Grid>

    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="จำนวนต้นปลูก *"
        type="number"
        value={formData.plant_quantity || ''}
        onChange={e => onChange('plant_quantity', e.target.value)}
        error={!!errors.plant_quantity}
        helperText={errors.plant_quantity || 'จำนวนต้นกัญชาที่วางแผนจะปลูก'}
      />
    </Grid>

    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel>ลักษณะการปลูก *</InputLabel>
        <Select
          value={formData.cultivation_type || ''}
          onChange={e => onChange('cultivation_type', e.target.value)}
          error={!!errors.cultivation_type}
        >
          <MenuItem value="outdoor">กลางแจ้ง (Outdoor)</MenuItem>
          <MenuItem value="greenhouse">โรงเรือน (Greenhouse)</MenuItem>
          <MenuItem value="indoor">ในอาคาร (Indoor)</MenuItem>
        </Select>
      </FormControl>
    </Grid>

    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="พันธุ์กัญชา *"
        value={formData.plant_variety || ''}
        onChange={e => onChange('plant_variety', e.target.value)}
        error={!!errors.plant_variety}
        helperText={errors.plant_variety || 'ชื่อพันธุ์หรือสายพันธุ์'}
      />
    </Grid>

    {/* Show AI guidance for outdoor cultivation */}
    {formData.cultivation_type === 'outdoor' && (
      <Grid item xs={12}>
        <Alert severity="info">
          <AlertTitle>ข้อกำหนด GACP สำหรับการปลูกกลางแจ้ง</AlertTitle>
          <List dense>
            <ListItem>
              <ListItemText primary="ตรวจสอบคุณภาพดินและน้ำก่อนปลูก" />
            </ListItem>
            <ListItem>
              <ListItemText primary="ห่างจากแหล่งมลพิษอย่างน้อย 500 เมตร" />
            </ListItem>
            <ListItem>
              <ListItemText primary="จำเป็นต้องอัปโหลดผลการวิเคราะห์ดินและน้ำ" />
            </ListItem>
          </List>
        </Alert>
      </Grid>
    )}

    {/* Show plant density analysis */}
    {validationResults.area_vs_quantity?.metadata && (
      <Grid item xs={12}>
        <Alert severity="success">
          <AlertTitle>การวิเคราะห์ความหนาแน่น</AlertTitle>
          ความหนาแน่น: {validationResults.area_vs_quantity.metadata.plantsPerSqm} ต้น/ตร.ม. -
          ประสิทธิภาพ: {validationResults.area_vs_quantity.metadata.efficiency}
        </Alert>
      </Grid>
    )}
  </Grid>
);

const PestControlStep = ({ formData, onChange, errors, aiGuidance }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom>
        แผนการจัดการศัตรูพืชและโรคพืช
      </Typography>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <AlertTitle>ข้อกำหนดสำคัญ</AlertTitle>
        ตามมาตรฐาน GACP ห้ามใช้วัตถุอันตรายทางการเกษตร ใช้ได้เฉพาะสารอินทรีย์และสารชีวภัณฑ์เท่านั้น
      </Alert>
    </Grid>

    <Grid item xs={12}>
      <FormControl fullWidth>
        <InputLabel>วิธีการควบคุมศัตรูพืช *</InputLabel>
        <Select
          value={formData.pest_control_method || ''}
          onChange={e => onChange('pest_control_method', e.target.value)}
          error={!!errors.pest_control_method}
        >
          <MenuItem value="organic">สารอินทรีย์</MenuItem>
          <MenuItem value="biological">สารชีวภัณฑ์</MenuItem>
          <MenuItem value="ipm">การจัดการศัตรูพืชแบบผสมผสาน (IPM)</MenuItem>
        </Select>
      </FormControl>
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="รายการสารที่ใช้ *"
        multiline
        rows={4}
        value={formData.approved_substances || ''}
        onChange={e => onChange('approved_substances', e.target.value)}
        error={!!errors.approved_substances}
        helperText="ระบุชื่อสารและหมายเลขขึ้นทะเบียน"
      />
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="แผน IPM"
        multiline
        rows={4}
        value={formData.ipm_plan || ''}
        onChange={e => onChange('ipm_plan', e.target.value)}
        helperText="อธิบายแผนการจัดการศัตรูพืชแบบผสมผสาน"
      />
    </Grid>
  </Grid>
);

const DocumentsStep = ({ formData, onChange, onDocumentUpload, isProcessing, aiGuidance }) => {
  const applicantType = formData.applicant_type;
  const requiredDocs = applicantType ? APPLICANT_TYPES[applicantType].requiredDocuments : [];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          อัปโหลดเอกสารประกอบ
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          กรุณาอัปโหลดเอกสารที่จำเป็นตามประเภทผู้ขอ ระบบ AI จะช่วยตรวจสอบและดึงข้อมูลอัตโนมัติ
        </Typography>
      </Grid>

      {requiredDocs.map((doc, index) => (
        <Grid item xs={12} key={index}>
          <Paper sx={{ p: 2, border: '1px dashed', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Description sx={{ mr: 1 }} />
              <Typography variant="body1">{doc}</Typography>
              {formData[`doc_${index}_uploaded`] && (
                <Chip
                  icon={<Verified />}
                  label="อัปโหลดแล้ว"
                  color="success"
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>

            <HiddenFileInput
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => {
                if (e.target.files[0]) {
                  onDocumentUpload(`doc_${index}`, e.target.files[0]);
                }
              }}
              id={`file-upload-${index}`}
            />
            <label htmlFor={`file-upload-${index}`}>
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                disabled={isProcessing}
              >
                {isProcessing ? 'กำลังประมวลผล...' : 'เลือกไฟล์'}
              </Button>
            </label>

            {formData[`doc_${index}_confidence`] && (
              <Typography variant="caption" color="success.main" sx={{ ml: 2 }}>
                AI Confidence: {(formData[`doc_${index}_confidence`] * 100).toFixed(0)}%
              </Typography>
            )}
          </Paper>
        </Grid>
      ))}

      {isProcessing && (
        <Grid item xs={12}>
          <Alert severity="info">
            <AlertTitle>กำลังประมวลผลเอกสาร</AlertTitle>
            ระบบ AI กำลังอ่านและตรวจสอบเอกสาร กรุณารอสักครู่...
          </Alert>
        </Grid>
      )}
    </Grid>
  );
};

const ReviewStep = ({ formData, aiAnalysisReport, onAnalyze }) => {
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);

  useEffect(() => {
    if (!aiAnalysisReport) {
      onAnalyze();
    }
  }, [aiAnalysisReport, onAnalyze]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          ตรวจสอบข้อมูลและการวิเคราะห์ AI
        </Typography>
      </Grid>

      {/* AI Analysis Summary */}
      {aiAnalysisReport && (
        <Grid item xs={12}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🤖 การวิเคราะห์ความพร้อมโดย AI
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {aiAnalysisReport.readinessScore}
                    </Typography>
                    <Typography variant="body2">คะแนนความพร้อม</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography
                      variant="h4"
                      sx={{ color: aiAnalysisReport.estimatedApprovalChance.color }}
                    >
                      {aiAnalysisReport.estimatedApprovalChance.percentage}%
                    </Typography>
                    <Typography variant="body2">โอกาสได้รับอนุมัติ</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Chip
                      label={aiAnalysisReport.estimatedApprovalChance.level}
                      color={
                        aiAnalysisReport.readinessScore >= 80
                          ? 'success'
                          : aiAnalysisReport.readinessScore >= 60
                            ? 'warning'
                            : 'error'
                      }
                    />
                  </Box>
                </Grid>
              </Grid>

              <Button variant="outlined" onClick={() => setShowAnalysisDialog(true)} sx={{ mt: 2 }}>
                ดูรายละเอียดการวิเคราะห์
              </Button>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Form Data Summary */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">ข้อมูลที่กรอก</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">ประเภทผู้ขอ:</Typography>
                <Typography>{APPLICANT_TYPES[formData.applicant_type]?.name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">ชื่อ-นามสกุล:</Typography>
                <Typography>{formData.full_name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">เลขประจำตัวประชาชน:</Typography>
                <Typography>{formData.thai_id}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">พื้นที่เพาะปลูก:</Typography>
                <Typography>{formData.cultivation_area} ตร.ม.</Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* AI Analysis Dialog */}
      <Dialog
        open={showAnalysisDialog}
        onClose={() => setShowAnalysisDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>รายงานการวิเคราะห์โดย AI</DialogTitle>
        <DialogContent>
          {aiAnalysisReport && (
            <Box>
              <Typography variant="h6" gutterBottom>
                คำแนะนำ
              </Typography>
              {aiAnalysisReport.recommendations.map((rec, index) => (
                <Alert
                  key={index}
                  severity={rec.priority === 'critical' ? 'error' : 'info'}
                  sx={{ mb: 2 }}
                >
                  <AlertTitle>{rec.title}</AlertTitle>
                  <List dense>
                    {rec.items.map((item, i) => (
                      <ListItem key={i}>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAnalysisDialog(false)}>ปิด</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default GACPApplicationWizard;
