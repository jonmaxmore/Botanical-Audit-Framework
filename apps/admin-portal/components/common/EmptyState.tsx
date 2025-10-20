'use client';

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { SearchOff as NoDataIcon } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({
  title = 'ไม่พบข้อมูล',
  message = 'ยังไม่มีข้อมูลในระบบ',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          textAlign: 'center',
        }}
      >
        {icon || (
          <NoDataIcon
            sx={{
              fontSize: 80,
              color: 'text.disabled',
              mb: 2,
            }}
          />
        )}
        <Typography variant="h5" fontWeight={600} color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.disabled" sx={{ mb: 3 }}>
          {message}
        </Typography>
        {action}
      </Box>
    </Container>
  );
}
