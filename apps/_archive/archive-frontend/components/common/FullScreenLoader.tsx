import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface FullScreenLoaderProps {
  label?: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ label = 'กำลังโหลดข้อมูล...' }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      bgcolor: 'background.default'
    }}
  >
    <CircularProgress />
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default FullScreenLoader;
