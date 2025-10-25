import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatisticsPage from '../page';

// Mock components
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

jest.mock('@/components/statistics/StatisticsTable', () => {
  return function MockStatisticsTable() {
    return <div data-testid="statistics-table">Statistics Table</div>;
  };
});

jest.mock('@/components/analytics/AnalyticsCharts', () => {
  return function MockAnalyticsCharts() {
    return <div data-testid="analytics-charts">Analytics Charts</div>;
  };
});

jest.mock('@/components/dashboard/StatisticsCard', () => {
  return function MockStatisticsCard({ title }: any) {
    return <div data-testid="statistics-card">{title}</div>;
  };
});

describe('StatisticsPage', () => {
  it('should render statistics page', () => {
    render(<StatisticsPage />);
    
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
  });

  it('should render statistics table', () => {
    render(<StatisticsPage />);
    
    expect(screen.getByTestId('statistics-table')).toBeInTheDocument();
  });

  it('should render analytics charts', () => {
    render(<StatisticsPage />);
    
    expect(screen.getByTestId('analytics-charts')).toBeInTheDocument();
  });

  it('should render sidebar', () => {
    render(<StatisticsPage />);
    
    const sidebars = screen.getAllByTestId('admin-sidebar');
    expect(sidebars.length).toBeGreaterThanOrEqual(1);
  });

  it('should render page title', () => {
    render(<StatisticsPage />);
    
    expect(screen.getByText(/สถิติและการวิเคราะห์/i)).toBeInTheDocument();
  });

  it('should render statistics cards', () => {
    render(<StatisticsPage />);
    
    const statsCards = screen.getAllByTestId('statistics-card');
    expect(statsCards.length).toBeGreaterThan(0);
  });
});
