'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Box, useTheme } from '@mui/material';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  data?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
  title?: string;
  height?: number;
}

export default function LineChart({ data, title, height = 300 }: LineChartProps) {
  const theme = useTheme();

  // Default mock data if none provided
  const defaultData = {
    labels: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'],
    datasets: [
      {
        label: 'คำขอใหม่',
        data: [12, 19, 15, 25, 22, 18, 20],
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}20`,
        tension: 0.4,
      },
      {
        label: 'อนุมัติแล้ว',
        data: [8, 12, 10, 15, 14, 12, 13],
        borderColor: theme.palette.success.main,
        backgroundColor: `${theme.palette.success.main}20`,
        tension: 0.4,
      },
      {
        label: 'ไม่อนุมัติ',
        data: [2, 3, 2, 4, 3, 2, 3],
        borderColor: theme.palette.error.main,
        backgroundColor: `${theme.palette.error.main}20`,
        tension: 0.4,
      },
    ],
  };

  const chartData = data || defaultData;

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Sarabun, sans-serif',
            size: 12,
          },
          usePointStyle: true,
          padding: 15,
        },
      },
      title: {
        display: !!title,
        text: title,
        font: {
          family: 'Sarabun, sans-serif',
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'Sarabun, sans-serif',
          size: 14,
        },
        bodyFont: {
          family: 'Sarabun, sans-serif',
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Sarabun, sans-serif',
            size: 11,
          },
        },
        grid: {
          color: theme.palette.divider,
        },
      },
      x: {
        ticks: {
          font: {
            family: 'Sarabun, sans-serif',
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Box sx={{ height, width: '100%' }}>
      <Line data={chartData} options={options} />
    </Box>
  );
}
