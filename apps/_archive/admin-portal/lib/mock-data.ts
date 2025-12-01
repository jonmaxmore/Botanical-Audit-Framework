/**
 * Mock Data Generator for Admin Dashboard
 * Simulates real-time data updates for charts and KPIs
 */

export interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  reviewing: number;
}

export interface DailyStats {
  date: string;
  newApplications: number;
  approved: number;
  rejected: number;
}

/**
 * Generate random number within range
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate mock application stats
 */
export function generateApplicationStats(): ApplicationStats {
  const pending = randomInRange(25, 40);
  const approved = randomInRange(40, 60);
  const rejected = randomInRange(5, 15);
  const reviewing = randomInRange(10, 20);
  const total = pending + approved + rejected + reviewing;

  return {
    total,
    pending,
    approved,
    rejected,
    reviewing,
  };
}

/**
 * Generate mock daily stats for the last 7 days
 */
export function generateDailyStats(): DailyStats[] {
  const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

  return days.map(day => ({
    date: day,
    newApplications: randomInRange(8, 25),
    approved: randomInRange(5, 18),
    rejected: randomInRange(1, 5),
  }));
}

/**
 * Hook for real-time data updates
 */
export function useRealtimeData<T>(generator: () => T, interval: number = 5000): T {
  const [data, setData] = React.useState<T>(generator());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setData(generator());
    }, interval);

    return () => clearInterval(timer);
  }, [generator, interval]);

  return data;
}

// For React imports
import React from 'react';

/**
 * Format number with Thai locale
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('th-TH');
}

/**
 * Calculate percentage change
 */
export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Generate mock KPI data
 */
export interface KPIData {
  total: number;
  pending: number;
  approved: number;
  revenue: string;
  totalChange: number;
  pendingChange: number;
  approvedChange: number;
  revenueChange: number;
}

export function generateKPIData(): KPIData {
  return {
    total: randomInRange(80, 120),
    pending: randomInRange(25, 40),
    approved: randomInRange(15, 25),
    revenue: `฿${randomInRange(100000, 150000).toLocaleString('th-TH')}`,
    totalChange: randomInRange(-10, 20) / 10,
    pendingChange: randomInRange(-10, 10) / 10,
    approvedChange: randomInRange(0, 15) / 10,
    revenueChange: randomInRange(5, 20) / 10,
  };
}
