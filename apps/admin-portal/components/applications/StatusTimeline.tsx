'use client';

import React from 'react';
import {
  Box,
  Typography,
  Step,
  Stepper,
  StepLabel,
  StepContent,
  StepIconProps,
  styled,
} from '@mui/material';
import {
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
  Edit as ReviewingIcon,
} from '@mui/icons-material';

export interface StatusHistory {
  id: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  date: string;
  time: string;
  user: string;
  comment?: string;
}

interface StatusTimelineProps {
  history: StatusHistory[];
}

const ColorlibStepIconRoot = styled('div')<{
  ownerState: { completed?: boolean; active?: boolean; color: string };
}>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundColor: ownerState.color,
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundColor: ownerState.color,
  }),
}));

export default function StatusTimeline({ history }: StatusTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <PendingIcon />;
      case 'reviewing':
        return <ReviewingIcon />;
      case 'approved':
        return <ApprovedIcon />;
      case 'rejected':
        return <RejectedIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ed6c02';
      case 'reviewing':
        return '#0288d1';
      case 'approved':
        return '#2e7d32';
      case 'rejected':
        return '#d32f2f';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอพิจารณา';
      case 'reviewing':
        return 'กำลังตรวจสอบ';
      case 'approved':
        return 'อนุมัติ';
      case 'rejected':
        return 'ไม่อนุมัติ';
      default:
        return status;
    }
  };

  function ColorlibStepIcon(props: StepIconProps & { status: string }) {
    const { active, completed, status } = props;

    return (
      <ColorlibStepIconRoot ownerState={{ completed, active, color: getStatusColor(status) }}>
        {getStatusIcon(status)}
      </ColorlibStepIconRoot>
    );
  }

  return (
    <Stepper orientation="vertical" activeStep={history.length}>
      {history.map((item, index) => (
        <Step key={item.id} active={index === history.length - 1} completed>
          <StepLabel
            StepIconComponent={props => <ColorlibStepIcon {...props} status={item.status} />}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {getStatusText(item.status)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {new Date(item.date).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                เวลา {item.time}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                โดย {item.user}
              </Typography>
            </Box>
          </StepLabel>
          <StepContent>
            {item.comment && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mt: 1 }}>
                <Typography variant="body2">{item.comment}</Typography>
              </Box>
            )}
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
}
