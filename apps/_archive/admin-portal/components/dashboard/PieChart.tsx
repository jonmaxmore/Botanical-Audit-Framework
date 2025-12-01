'use client';

import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Box, useTheme } from '@mui/material';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data?: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
  title?: string;
  height?: number;
}

export default function PieChart({ data, title, height = 300 }: PieChartProps) {
  const theme = useTheme();

  // Default mock data if none provided
  const defaultData = {
    labels: ['รอพิจารณา', 'อนุมัติแล้ว', 'ไม่อนุมัติ', 'กำลังตรวจสอบ'],
    datasets: [
      {
        data: [32, 45, 8, 15],
        backgroundColor: [
          theme.palette.warning.main,
          theme.palette.success.main,
          theme.palette.error.main,
          theme.palette.info.main,
        ],
        borderColor: [
          theme.palette.warning.dark,
          theme.palette.success.dark,
          theme.palette.error.dark,
          theme.palette.info.dark,
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartData = data || defaultData;

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            family: 'Sarabun, sans-serif',
            size: 12,
          },
          usePointStyle: true,
          padding: 15,
          generateLabels: chart => {
            const data = chart.data;
            if (data.labels?.length && data.datasets?.length) {
              const dataset = data.datasets[0];
              const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);

              return (data.labels as string[]).map((label, i) => {
                const value = (dataset.data as number[])[i];
                const percentage = ((value / total) * 100).toFixed(1);

                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: (dataset.backgroundColor as string[])[i],
                  strokeStyle: (dataset.borderColor as string[])[i],
                  lineWidth: 2,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
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
        callbacks: {
          label: context => {
            const label = context.label || '';
            const value = context.parsed;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Box
      sx={{
        height,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Pie data={chartData} options={options} />
    </Box>
  );
}
