'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Chip } from '@mui/material';
import { TrendingUp as TrendUpIcon, TrendingDown as TrendDownIcon } from '@mui/icons-material';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatisticsCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'primary',
  trend,
}: StatisticsCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: `${iconColor}.lighter`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: `${iconColor}.main`,
              }}
            >
              {icon}
            </Box>
          </Box>

          <Box>
            <Typography variant="h3" fontWeight={700}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip
                size="small"
                icon={trend.isPositive ? <TrendUpIcon /> : <TrendDownIcon />}
                label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
                color={trend.isPositive ? 'success' : 'error'}
              />
              <Typography variant="caption" color="text.secondary">
                จากเดือนที่แล้ว
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
