'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import { CheckCircle, Pending, Cancel, Description } from '@mui/icons-material';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    active: 12,
    pending: 3,
    expired: 2,
    total: 17,
  });

  useEffect(() => {
    const token = localStorage.getItem('cert_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const cards = [
    {
      title: 'Active Certificates',
      value: stats.active,
      icon: <CheckCircle sx={{ fontSize: 48, color: '#4caf50' }} />,
      color: '#4caf50',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <Pending sx={{ fontSize: 48, color: '#ff9800' }} />,
      color: '#ff9800',
    },
    {
      title: 'Expired',
      value: stats.expired,
      icon: <Cancel sx={{ fontSize: 48, color: '#f44336' }} />,
      color: '#f44336',
    },
    {
      title: 'Total',
      value: stats.total,
      icon: <Description sx={{ fontSize: 48, color: '#2196f3' }} />,
      color: '#2196f3',
    },
  ];

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          📊 Dashboard
        </Typography>
        <Grid container spacing={3}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                    {card.icon}
                    <Typography variant="h4" sx={{ mt: 2, color: card.color }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </ErrorBoundary>
  );
}
