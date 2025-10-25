import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../page';

// Mock components
jest.mock('@/components/dashboard/StatisticsCard', () => {
  return function MockStatisticsCard({ title, value }: any) {
    return <div data-testid="statistics-card">{title}: {value}</div>;
  };
});

jest.mock('@/components/dashboard/ActivitySummary', () => {
  return function MockActivitySummary() {
    return <div data-testid="activity-summary">Activity Summary</div>;
  };
});

jest.mock('@/components/analytics/AnalyticsCharts', () => {
  return function MockAnalyticsCharts() {
    return <div data-testid="analytics-charts">Analytics Charts</div>;
  };
});

jest.mock('@/components/dashboard/LineChart', () => {
  return function MockLineChart() {
    return <div data-testid="line-chart">Line Chart</div>;
  };
});

jest.mock('@/components/dashboard/PieChart', () => {
  return function MockPieChart() {
    return <div data-testid="pie-chart">Pie Chart</div>;
  };
});

jest.mock('@/components/layout/AdminHeader', () => {
  return function MockAdminHeader() {
    return <div data-testid="admin-header">Admin Header</div>;
  };
});

jest.mock('@/components/layout/AdminSidebar', () => {
  return function MockAdminSidebar() {
    return <div data-testid="admin-sidebar">Admin Sidebar</div>;
  };
});

jest.mock('@/lib/protected-route', () => {
  return function MockProtectedRoute({ children }: any) {
    return <div>{children}</div>;
  };
});

describe('DashboardPage', () => {
  it('should render dashboard components', () => {
    render(<DashboardPage />);
    
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
    // Note: AdminSidebar appears twice (desktop & mobile)
    const sidebars = screen.getAllByTestId('admin-sidebar');
    expect(sidebars.length).toBe(2);
  });

  it('should render statistics cards', () => {
    render(<DashboardPage />);
    
    const statsCards = screen.getAllByTestId('statistics-card');
    expect(statsCards.length).toBe(4); // คำขอทั้งหมด, รอตรวจสอบ, อนุมัติเดือนนี้, ผู้ใช้งานปัจจุบัน
  });

  it('should render activity summary', () => {
    render(<DashboardPage />);
    
    expect(screen.getByTestId('activity-summary')).toBeInTheDocument();
  });

  it('should render analytics charts', () => {
    render(<DashboardPage />);
    
    expect(screen.getByTestId('analytics-charts')).toBeInTheDocument();
  });

  it('should render dashboard title', () => {
    render(<DashboardPage />);
    
    // Thai text: "ภาพรวมระบบ"
    expect(screen.getByText('ภาพรวมระบบ')).toBeInTheDocument();
  });

  it('should render dashboard subtitle', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText(/สรุปข้อมูลและสถิติการทำงานของระบบ/i)).toBeInTheDocument();
  });

  it('should render line chart', () => {
    render(<DashboardPage />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('should render pie chart', () => {
    render(<DashboardPage />);
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
});
