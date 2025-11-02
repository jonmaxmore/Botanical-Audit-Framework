import React from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface SLAIndicatorProps {
  sla: {
    dueDate: string;
    breached: boolean;
    remainingHours?: number;
    completedAt?: string;
  };
}

export default function SLAIndicator({ sla }: SLAIndicatorProps) {
  const calculateProgress = () => {
    if (sla.completedAt) return 100;
    if (!sla.remainingHours) return 0;
    
    const dueDate = new Date(sla.dueDate);
    const now = new Date();
    const totalTime = dueDate.getTime() - (dueDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Assume 7 days SLA
    const elapsed = now.getTime() - (dueDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return Math.min(100, (elapsed / totalTime) * 100);
  };

  const getStatus = () => {
    if (sla.completedAt) {
      return sla.breached ? 'completed_breached' : 'completed_on_time';
    }
    
    if (sla.breached) {
      return 'breached';
    }
    
    if (sla.remainingHours !== undefined) {
      if (sla.remainingHours <= 24) return 'critical';
      if (sla.remainingHours <= 48) return 'warning';
    }
    
    return 'on_track';
  };

  const status = getStatus();
  const progress = calculateProgress();

  const statusConfig = {
    on_track: {
      color: '#4caf50',
      bgColor: '#4caf5020',
      label: 'ตามกำหนด',
      icon: <CheckCircleIcon sx={{ fontSize: 16 }} />
    },
    warning: {
      color: '#ff9800',
      bgColor: '#ff980020',
      label: 'ใกล้ครบกำหนด',
      icon: <WarningIcon sx={{ fontSize: 16 }} />
    },
    critical: {
      color: '#f44336',
      bgColor: '#f4433620',
      label: 'เร่งด่วน',
      icon: <ErrorIcon sx={{ fontSize: 16 }} />
    },
    breached: {
      color: '#d32f2f',
      bgColor: '#d32f2f20',
      label: 'เกินกำหนด',
      icon: <ErrorIcon sx={{ fontSize: 16 }} />
    },
    completed_on_time: {
      color: '#2e7d32',
      bgColor: '#2e7d3220',
      label: 'เสร็จทันเวลา',
      icon: <CheckCircleIcon sx={{ fontSize: 16 }} />
    },
    completed_breached: {
      color: '#c62828',
      bgColor: '#c6282820',
      label: 'เสร็จเกินกำหนด',
      icon: <ErrorIcon sx={{ fontSize: 16 }} />
    }
  };

  const config = statusConfig[status];

  const formatRemainingTime = () => {
    if (sla.completedAt) {
      return null;
    }

    if (!sla.remainingHours) {
      return 'ไม่ระบุเวลา';
    }

    if (sla.remainingHours < 0) {
      const hours = Math.abs(sla.remainingHours);
      if (hours >= 24) {
        return `เกิน ${Math.floor(hours / 24)} วัน`;
      }
      return `เกิน ${Math.floor(hours)} ชั่วโมง`;
    }

    if (sla.remainingHours >= 24) {
      return `เหลือ ${Math.floor(sla.remainingHours / 24)} วัน`;
    }
    
    return `เหลือ ${Math.floor(sla.remainingHours)} ชั่วโมง`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={config.icon}
            label={config.label}
            size="small"
            sx={{
              bgcolor: config.bgColor,
              color: config.color,
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: config.color
              }
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: config.color, fontWeight: 600 }}>
          {formatRemainingTime()}
        </Typography>
      </Box>
      
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 1,
          bgcolor: `${config.color}20`,
          '& .MuiLinearProgress-bar': {
            bgcolor: config.color,
            borderRadius: 1
          }
        }}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" color="textSecondary">
          เริ่ม: {new Date(sla.dueDate).getTime() - 7 * 24 * 60 * 60 * 1000 
            ? new Date(new Date(sla.dueDate).getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH')
            : 'N/A'}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          ครบกำหนด: {new Date(sla.dueDate).toLocaleDateString('th-TH')}
        </Typography>
      </Box>
    </Box>
  );
}
