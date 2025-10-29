'use client';

import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { CheckCircle, Schedule, VideoCall, LocationOn } from '@mui/icons-material';

interface KPIData {
  totalInspections: number;
  completedToday: number;
  upcomingThisWeek: number;
  videoCallCount: number;
  onsiteCount: number;
  avgResponseTime: number;
}

interface InspectorKPICardsProps {
  data: KPIData;
}

export default function InspectorKPICards({ data }: InspectorKPICardsProps) {
  const cards = [
    { title: 'ตรวจสอบวันนี้', value: data.completedToday, icon: <CheckCircle />, color: 'success.main' },
    { title: 'นัดหมายสัปดาห์นี้', value: data.upcomingThisWeek, icon: <Schedule />, color: 'warning.main' },
    { title: 'Video Call', value: data.videoCallCount, icon: <VideoCall />, color: 'primary.main' },
    { title: 'Onsite', value: data.onsiteCount, icon: <LocationOn />, color: 'secondary.main' },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ color: card.color }}>{card.icon}</Box>
                <Box>
                  <Typography variant="h4">{card.value}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
