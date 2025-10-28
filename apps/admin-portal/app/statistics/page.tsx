'use client';

import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import {
  Assessment as StatsIcon,
  TrendingUp as TrendIcon,
  CompareArrows as CompareIcon,
  PieChart as PieIcon,
} from '@mui/icons-material';

export default function StatisticsPage() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              สถิติและการวิเคราะห์
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ภาพรวมและข้อมูลสถิติทั้งหมด
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <StatsIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="h6">อัตราการอนุมัติ</Typography>
                      </Box>
                      <Typography variant="h3" fontWeight={700}>71.5%</Typography>
                      <Typography variant="body2" color="text.secondary">จากคำขอทั้งหมด</Typography>
                      <Typography variant="caption" color="success.main">+3.2% จากเดือนที่แล้ว</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TrendIcon color="info" sx={{ mr: 1 }} />
                        <Typography variant="h6">เวลาเฉลี่ย</Typography>
                      </Box>
                      <Typography variant="h3" fontWeight={700}>12 วัน</Typography>
                      <Typography variant="body2" color="text.secondary">ระยะเวลาตรวจสอบ</Typography>
                      <Typography variant="caption" color="error.main">-1.8 วัน</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CompareIcon color="warning" sx={{ mr: 1 }} />
                        <Typography variant="h6">อัตราการส่งซ้ำ</Typography>
                      </Box>
                      <Typography variant="h3" fontWeight={700}>8.2%</Typography>
                      <Typography variant="body2" color="text.secondary">คำขอที่ส่งซ้ำ</Typography>
                      <Typography variant="caption" color="error.main">-0.5%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PieIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">ความพึงพอใจ</Typography>
                      </Box>
                      <Typography variant="h3" fontWeight={700}>4.6/5</Typography>
                      <Typography variant="body2" color="text.secondary">คะแนนเฉลี่ย</Typography>
                      <Typography variant="caption" color="success.main">+0.3</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>การวิเคราะห์ข้อมูลเชิงลึก</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    แสดงแนวโน้มและการเปรียบเทียบข้อมูลในรูปแบบต่างๆ
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography color="text.secondary">กราฟและแผนภูมิจะแสดงที่นี่</Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>ตารางสถิติรายละเอียด</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    ข้อมูลสถิติทั้งหมดพร้อมการเปรียบเทียบ
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography color="text.secondary">ตารางข้อมูลจะแสดงที่นี่</Typography>
                  </Box>
                </CardContent>
              </Card>
            </>
          )}
        </Container>
      </Box>
    </ErrorBoundary>
  );
}
