'use client';

import React from 'react';
import { Box, Stepper, Step, StepLabel, Typography, useTheme, useMediaQuery } from '@mui/material';
import { WorkflowState } from '@/contexts/ApplicationContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorIcon from '@mui/icons-material/Error';

interface WorkflowProgressProps {
  currentState: WorkflowState;
  currentStep: number;
  variant?: 'horizontal' | 'vertical';
}

const WORKFLOW_STEPS = [
  {
    step: 1,
    label: 'ยื่นคำขอ',
    description: 'Application Submission',
    states: ['DRAFT', 'SUBMITTED'],
  },
  {
    step: 2,
    label: 'ชำระเงินรอบแรก',
    description: '5,000 บาท',
    states: ['PAYMENT_PENDING_1', 'PAYMENT_PROCESSING_1'],
  },
  {
    step: 3,
    label: 'ตรวจสอบเอกสาร',
    description: 'Document Review',
    states: ['DOCUMENT_REVIEW', 'DOCUMENT_REVISION', 'DOCUMENT_REJECTED'],
  },
  {
    step: 4,
    label: 'เอกสารผ่าน',
    description: 'Document Approved',
    states: ['DOCUMENT_APPROVED'],
  },
  {
    step: 5,
    label: 'ชำระเงินรอบสอง',
    description: '25,000 บาท',
    states: ['PAYMENT_PENDING_2', 'PAYMENT_PROCESSING_2'],
  },
  {
    step: 6,
    label: 'ตรวจสอบฟาร์ม',
    description: 'Field Inspection',
    states: [
      'INSPECTION_SCHEDULED',
      'INSPECTION_VDO_CALL',
      'INSPECTION_ON_SITE',
      'INSPECTION_COMPLETED',
    ],
  },
  {
    step: 7,
    label: 'อนุมัติผล',
    description: 'Final Approval',
    states: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
  },
  {
    step: 8,
    label: 'รับใบรับรอง',
    description: 'Certificate',
    states: ['CERTIFICATE_GENERATING', 'CERTIFICATE_ISSUED'],
  },
];

const getStepStatus = (stepNumber: number, currentStep: number, currentState: WorkflowState) => {
  if (stepNumber < currentStep) return 'completed';
  if (stepNumber === currentStep) {
    if (currentState === 'REJECTED' || currentState === 'DOCUMENT_REJECTED') return 'error';
    return 'active';
  }
  return 'pending';
};

const getStepIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon color="success" />;
    case 'error':
      return <ErrorIcon color="error" />;
    case 'active':
      return <RadioButtonUncheckedIcon color="primary" />;
    default:
      return <RadioButtonUncheckedIcon color="disabled" />;
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return '#4caf50';
    case 'error':
      return '#f44336';
    case 'active':
      return '#2196f3';
    default:
      return '#9e9e9e';
  }
};

export default function WorkflowProgress({
  currentState,
  currentStep,
  variant = 'horizontal',
}: WorkflowProgressProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const orientation = variant === 'vertical' || isMobile ? 'vertical' : 'horizontal';

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Stepper
        activeStep={currentStep - 1}
        orientation={orientation}
        alternativeLabel={orientation === 'horizontal'}
      >
        {WORKFLOW_STEPS.map((step) => {
          const status = getStepStatus(step.step, currentStep, currentState);
          const statusColor = getStatusColor(status);

          return (
            <Step key={step.step} completed={status === 'completed'}>
              <StepLabel
                icon={getStepIcon(status)}
                error={status === 'error'}
                sx={{
                  '& .MuiStepLabel-label': {
                    color: statusColor,
                    fontWeight: status === 'active' ? 600 : 400,
                  },
                }}
              >
                <Typography variant="body2" fontWeight={status === 'active' ? 600 : 400}>
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          ขั้นตอนปัจจุบัน: <strong>{WORKFLOW_STEPS[currentStep - 1]?.label}</strong> ({currentStep}
          /8)
        </Typography>
        <Typography variant="caption" color="text.secondary">
          สถานะ: {currentState}
        </Typography>
      </Box>
    </Box>
  );
}
