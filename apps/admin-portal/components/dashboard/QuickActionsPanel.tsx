'use client';

import { Box, Card, CardContent, Typography, Button, Stack } from '@mui/material';
import { VideoCall, Schedule, Assessment, CalendarMonth } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function QuickActionsPanel() {
  const router = useRouter();

  const actions = [
    { label: 'เริ่ม Video Call', icon: <VideoCall />, onClick: () => router.push('/inspections/video') },
    { label: 'ดูปฏิทิน', icon: <CalendarMonth />, onClick: () => router.push('/inspections/calendar') },
    { label: 'นัดหมายใหม่', icon: <Schedule />, onClick: () => router.push('/inspections/schedule') },
    { label: 'รายงานผล', icon: <Assessment />, onClick: () => router.push('/inspections/reports') },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
        <Stack spacing={1}>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outlined"
              startIcon={action.icon}
              onClick={action.onClick}
              fullWidth
              sx={{ justifyContent: 'flex-start' }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
