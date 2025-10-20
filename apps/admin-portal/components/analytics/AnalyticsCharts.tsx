import React from 'react';
import { Box, Card, CardContent, Typography, Stack, Tabs, Tab, Grid } from '@mui/material';
import {
  TrendingUp as TrendIcon,
  BarChart as BarIcon,
  PieChart as PieIcon,
} from '@mui/icons-material';

export type ChartType = 'line' | 'bar' | 'pie';

export interface AnalyticsChartsProps {
  title?: string;
  subtitle?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AnalyticsCharts({
  title = 'การวิเคราะห์ข้อมูล',
  subtitle = 'แสดงกราฟสถิติและการวิเคราะห์',
}: AnalyticsChartsProps) {
  const [chartType, setChartType] = React.useState(0);

  const handleChartChange = (event: React.SyntheticEvent, newValue: number) => {
    setChartType(newValue);
  };

  // Mock data for charts
  const lineChartData = {
    labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
    datasets: [
      {
        label: 'คำขอ',
        data: [65, 78, 90, 81, 95, 105],
        color: '#1976d2',
      },
      {
        label: 'อนุมัติ',
        data: [45, 52, 68, 74, 82, 89],
        color: '#2e7d32',
      },
    ],
  };

  const barChartData = {
    labels: ['รอตรวจสอบ', 'กำลังตรวจสอบ', 'อนุมัติ', 'ไม่อนุมัติ'],
    values: [156, 42, 89, 15],
    colors: ['#ff9800', '#2196f3', '#4caf50', '#f44336'],
  };

  const pieChartData = {
    labels: ['เกษตรกร', 'กลุ่มเกษตรกร', 'สหกรณ์', 'วิสาหกิจ'],
    values: [45, 28, 18, 9],
    colors: ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0'],
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        {/* Chart Type Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={chartType} onChange={handleChartChange} aria-label="chart tabs">
            <Tab icon={<TrendIcon />} label="แนวโน้ม" iconPosition="start" />
            <Tab icon={<BarIcon />} label="เปรียบเทียบ" iconPosition="start" />
            <Tab icon={<PieIcon />} label="สัดส่วน" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Line Chart Tab */}
        <TabPanel value={chartType} index={0}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              แนวโน้มคำขอรับรอง (รายเดือน)
            </Typography>
            <Box sx={{ height: 300, bgcolor: '#f5f5f5', borderRadius: 1, p: 2 }}>
              <Grid container spacing={2} sx={{ height: '100%' }}>
                {/* Y-axis labels */}
                <Grid item xs={1}>
                  <Stack sx={{ height: '100%' }} justifyContent="space-between">
                    {[120, 100, 80, 60, 40, 20, 0].map(val => (
                      <Typography key={val} variant="caption" color="text.secondary">
                        {val}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>

                {/* Chart area */}
                <Grid item xs={11}>
                  <Box sx={{ height: '100%', position: 'relative' }}>
                    {/* Mock line chart visualization */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-around',
                        gap: 1,
                      }}
                    >
                      {lineChartData.labels.map((label, index) => (
                        <Box key={label} sx={{ flex: 1, textAlign: 'center' }}>
                          <Stack spacing={1} sx={{ height: '100%' }} justifyContent="flex-end">
                            {/* Data points */}
                            {lineChartData.datasets.map(dataset => (
                              <Box
                                key={dataset.label}
                                sx={{
                                  height: `${(dataset.data[index] / 120) * 100}%`,
                                  bgcolor: dataset.color,
                                  borderRadius: 1,
                                  opacity: 0.8,
                                  transition: 'all 0.3s',
                                  '&:hover': {
                                    opacity: 1,
                                    transform: 'scaleY(1.05)',
                                  },
                                }}
                              />
                            ))}
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                              {label}
                            </Typography>
                          </Stack>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Legend */}
            <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 2 }}>
              {lineChartData.datasets.map(dataset => (
                <Box key={dataset.label} display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 16, height: 16, bgcolor: dataset.color, borderRadius: 0.5 }} />
                  <Typography variant="caption">{dataset.label}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </TabPanel>

        {/* Bar Chart Tab */}
        <TabPanel value={chartType} index={1}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              เปรียบเทียบสถานะคำขอ
            </Typography>
            <Box sx={{ height: 300, bgcolor: '#f5f5f5', borderRadius: 1, p: 2 }}>
              <Stack spacing={2} sx={{ height: '100%' }} justifyContent="space-around">
                {barChartData.labels.map((label, index) => (
                  <Box key={label}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="caption" sx={{ minWidth: 100, textAlign: 'right' }}>
                        {label}
                      </Typography>
                      <Box sx={{ flex: 1, position: 'relative' }}>
                        <Box
                          sx={{
                            width: `${(barChartData.values[index] / Math.max(...barChartData.values)) * 100}%`,
                            height: 32,
                            bgcolor: barChartData.colors[index],
                            borderRadius: 1,
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            px: 2,
                            '&:hover': {
                              transform: 'scaleX(1.02)',
                              boxShadow: 2,
                            },
                          }}
                        >
                          <Typography variant="caption" fontWeight={600} color="white">
                            {barChartData.values[index]}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </TabPanel>

        {/* Pie Chart Tab */}
        <TabPanel value={chartType} index={2}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              สัดส่วนประเภทผู้ขอรับรอง
            </Typography>
            <Grid container spacing={3} sx={{ height: 300 }}>
              {/* Pie Chart */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    height: '100%',
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Mock pie chart - circular segments */}
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      background: `conic-gradient(
                        ${pieChartData.colors[0]} 0deg ${(pieChartData.values[0] / 100) * 360}deg,
                        ${pieChartData.colors[1]} ${(pieChartData.values[0] / 100) * 360}deg ${((pieChartData.values[0] + pieChartData.values[1]) / 100) * 360}deg,
                        ${pieChartData.colors[2]} ${((pieChartData.values[0] + pieChartData.values[1]) / 100) * 360}deg ${((pieChartData.values[0] + pieChartData.values[1] + pieChartData.values[2]) / 100) * 360}deg,
                        ${pieChartData.colors[3]} ${((pieChartData.values[0] + pieChartData.values[1] + pieChartData.values[2]) / 100) * 360}deg 360deg
                      )`,
                      boxShadow: 2,
                    }}
                  />
                </Box>
              </Grid>

              {/* Legend */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2} justifyContent="center" sx={{ height: '100%' }}>
                  {pieChartData.labels.map((label, index) => (
                    <Box key={label} display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: pieChartData.colors[index],
                          borderRadius: 0.5,
                        }}
                      />
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={500}>
                          {label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {pieChartData.values[index]}%
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        {Math.round((pieChartData.values[index] / 100) * 302)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </CardContent>
    </Card>
  );
}
