import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportsPage from '../page';

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

jest.mock('@/components/reports/ReportGenerator', () => {
  return function MockReportGenerator({ onGenerate }: any) {
    return <div data-testid="report-generator">Report Generator</div>;
  };
});

describe('ReportsPage', () => {
  it('should render reports page', () => {
    render(<ReportsPage />);
    
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
  });

  it('should render report generator component', () => {
    render(<ReportsPage />);
    
    expect(screen.getByTestId('report-generator')).toBeInTheDocument();
  });

  it('should render sidebar', () => {
    render(<ReportsPage />);
    
    const sidebars = screen.getAllByTestId('admin-sidebar');
    expect(sidebars.length).toBeGreaterThanOrEqual(1);
  });

  it('should render header and generator', () => {
    render(<ReportsPage />);
    
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
    expect(screen.getByTestId('report-generator')).toBeInTheDocument();
  });
});
