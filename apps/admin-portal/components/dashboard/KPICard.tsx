'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  change?: number;
  changeLabel?: string;
}

export default function KPICard({
  title,
  value,
  icon,
  color = '#2e7d32',
  change,
  changeLabel = 'เทียบกับเดือนที่แล้ว',
}: KPICardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        {/* Icon Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: color,
              width: 56,
              height: 56,
              mr: 2,
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {value}
            </Typography>
          </Box>
        </Box>

        {/* Change Indicator */}
        {change !== undefined && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {isPositive ? (
              <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} fontSize="small" />
            ) : (
              <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5 }} fontSize="small" />
            )}
            <Typography
              variant="body2"
              sx={{
                color: isPositive ? 'success.main' : 'error.main',
                fontWeight: 600,
                mr: 1,
              }}
            >
              {isPositive ? '+' : ''}
              {change}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {changeLabel}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
