// Chart.js configuration and theme
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Chart theme colors (matching Material-UI theme)
export const chartColors = {
  primary: 'rgb(25, 118, 210)', // Blue
  success: 'rgb(46, 125, 50)', // Green
  warning: 'rgb(237, 108, 2)', // Orange
  error: 'rgb(211, 47, 47)', // Red
  info: 'rgb(2, 136, 209)', // Light Blue
  purple: 'rgb(123, 31, 162)', // Purple
  teal: 'rgb(0, 137, 123)', // Teal
  pink: 'rgb(216, 27, 96)' // Pink
};

// Chart color with transparency
export const chartColorsAlpha = {
  primary: 'rgba(25, 118, 210, 0.6)',
  success: 'rgba(46, 125, 50, 0.6)',
  warning: 'rgba(237, 108, 2, 0.6)',
  error: 'rgba(211, 47, 47, 0.6)',
  info: 'rgba(2, 136, 209, 0.6)',
  purple: 'rgba(123, 31, 162, 0.6)',
  teal: 'rgba(0, 137, 123, 0.6)',
  pink: 'rgba(216, 27, 96, 0.6)'
};

// Chart default options
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        padding: 15,
        usePointStyle: true,
        font: {
          size: 12,
          family: "'Roboto', sans-serif"
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold' as const
      },
      bodyFont: {
        size: 13
      },
      cornerRadius: 4
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          size: 11
        }
      },
      beginAtZero: true
    }
  }
};

// Line chart options
export const lineChartOptions = {
  ...defaultChartOptions,
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins.legend,
      display: true
    }
  },
  elements: {
    line: {
      tension: 0.4, // Smooth curves
      borderWidth: 2
    },
    point: {
      radius: 3,
      hoverRadius: 5,
      hitRadius: 10
    }
  }
};

// Bar chart options
export const barChartOptions = {
  ...defaultChartOptions,
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins.legend,
      display: true
    }
  },
  elements: {
    bar: {
      borderWidth: 0,
      borderRadius: 4
    }
  }
};

// Pie/Doughnut chart options
export const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        padding: 15,
        usePointStyle: true,
        font: {
          size: 12,
          family: "'Roboto', sans-serif"
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold' as const
      },
      bodyFont: {
        size: 13
      },
      cornerRadius: 4,
      callbacks: {
        label: function (context: { label: string; parsed: number; dataset: { data: number[] } }) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
};

// Status color mapping
export const statusColors = {
  pending: chartColors.warning,
  approved: chartColors.success,
  rejected: chartColors.error
};

// Status color mapping with alpha
export const statusColorsAlpha = {
  pending: chartColorsAlpha.warning,
  approved: chartColorsAlpha.success,
  rejected: chartColorsAlpha.error
};

// Urgency color mapping
export const urgencyColors = {
  high: chartColors.error,
  medium: chartColors.warning,
  low: chartColors.success
};

// Urgency color mapping with alpha
export const urgencyColorsAlpha = {
  high: chartColorsAlpha.error,
  medium: chartColorsAlpha.warning,
  low: chartColorsAlpha.success
};

// Helper function to generate gradient background
export const createGradient = (ctx: CanvasRenderingContext2D, color: string) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
  return gradient;
};

// Format date for chart labels
export const formatChartDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short'
  });
};

// Format number with commas
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Generate last N days labels
export const generateDateLabels = (days: number): string[] => {
  const labels: string[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    labels.push(formatChartDate(date.toISOString()));
  }

  return labels;
};

// Generate last N months labels
export const generateMonthLabels = (months: number): string[] => {
  const labels: string[] = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    labels.push(
      date.toLocaleDateString('th-TH', {
        month: 'short',
        year: 'numeric'
      })
    );
  }

  return labels;
};
