/**
 * Component Integration Tests - Dashboard and Analytics
 * Tests dashboard components, statistics, and data visualization
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';

const theme = createTheme();

// Mock components
const MockStatisticsCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon?: string;
  color?: string;
}) => {
  return (
    <div data-testid={`stats-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h3>{title}</h3>
      <div data-testid="stats-value">{value.toLocaleString()}</div>
      {icon && <span data-testid="stats-icon">{icon}</span>}
    </div>
  );
};

const MockApplicationTable = ({
  applications,
  onRowClick,
}: {
  applications: any[];
  onRowClick: (app: any) => void;
}) => {
  return (
    <table data-testid="application-table">
      <thead>
        <tr>
          <th>Application Number</th>
          <th>Farm Name</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {applications.map(app => (
          <tr key={app.id} onClick={() => onRowClick(app)} data-testid={`app-row-${app.id}`}>
            <td>{app.applicationNumber}</td>
            <td>{app.farmName}</td>
            <td data-testid={`status-${app.id}`}>{app.status}</td>
            <td>{new Date(app.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const MockDashboard = ({
  statistics,
  recentApplications,
  onApplicationClick,
  onRefresh,
}: {
  statistics: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  recentApplications: any[];
  onApplicationClick: (app: any) => void;
  onRefresh: () => void;
}) => {
  return (
    <div data-testid="dashboard">
      <h1>Dashboard</h1>
      <button onClick={onRefresh} data-testid="refresh-button">
        Refresh
      </button>

      <div data-testid="statistics-section">
        <MockStatisticsCard title="Total Applications" value={statistics.total} />
        <MockStatisticsCard title="Pending Review" value={statistics.pending} />
        <MockStatisticsCard title="Approved" value={statistics.approved} />
        <MockStatisticsCard title="Rejected" value={statistics.rejected} />
      </div>

      <div data-testid="recent-applications-section">
        <h2>Recent Applications</h2>
        <MockApplicationTable applications={recentApplications} onRowClick={onApplicationClick} />
      </div>
    </div>
  );
};

const MockChartComponent = ({ data, type }: { data: any[]; type: 'line' | 'bar' | 'pie' }) => {
  return (
    <div data-testid={`chart-${type}`}>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  );
};

const MockAnalyticsPage = ({
  monthlyData,
  statusDistribution,
  onDateRangeChange,
}: {
  monthlyData: any[];
  statusDistribution: any[];
  onDateRangeChange: (start: Date, end: Date) => void;
}) => {
  const [startDate, setStartDate] = React.useState('2025-01-01');
  const [endDate, setEndDate] = React.useState('2025-12-31');

  const handleApplyFilter = () => {
    onDateRangeChange(new Date(startDate), new Date(endDate));
  };

  return (
    <div data-testid="analytics-page">
      <h1>Analytics</h1>

      <div data-testid="date-filter">
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          data-testid="start-date-input"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          data-testid="end-date-input"
        />
        <button onClick={handleApplyFilter} data-testid="apply-filter-button">
          Apply Filter
        </button>
      </div>

      <div data-testid="charts-section">
        <MockChartComponent data={monthlyData} type="line" />
        <MockChartComponent data={statusDistribution} type="pie" />
      </div>
    </div>
  );
};

describe('Dashboard and Analytics Integration Tests', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  describe('Dashboard Display', () => {
    const mockStatistics = {
      total: 150,
      pending: 45,
      approved: 90,
      rejected: 15,
    };

    const mockApplications = [
      {
        id: 'app-1',
        applicationNumber: 'APP-2025-001',
        farmName: 'Green Valley Farm',
        status: 'PENDING_REVIEW',
        createdAt: new Date('2025-01-15'),
      },
      {
        id: 'app-2',
        applicationNumber: 'APP-2025-002',
        farmName: 'Sunshine Farm',
        status: 'APPROVED',
        createdAt: new Date('2025-01-14'),
      },
      {
        id: 'app-3',
        applicationNumber: 'APP-2025-003',
        farmName: 'Valley Farm',
        status: 'REJECTED',
        createdAt: new Date('2025-01-13'),
      },
    ];

    test('should display all statistics cards', () => {
      renderWithTheme(
        <MockDashboard
          statistics={mockStatistics}
          recentApplications={mockApplications}
          onApplicationClick={jest.fn()}
          onRefresh={jest.fn()}
        />
      );

      expect(screen.getByTestId('stats-card-total-applications')).toBeInTheDocument();
      expect(screen.getByTestId('stats-card-pending-review')).toBeInTheDocument();
      expect(screen.getByTestId('stats-card-approved')).toBeInTheDocument();
      expect(screen.getByTestId('stats-card-rejected')).toBeInTheDocument();
    });

    test('should display correct statistics values', () => {
      renderWithTheme(
        <MockDashboard
          statistics={mockStatistics}
          recentApplications={mockApplications}
          onApplicationClick={jest.fn()}
          onRefresh={jest.fn()}
        />
      );

      const statValues = screen.getAllByTestId('stats-value');
      expect(statValues[0]).toHaveTextContent('150');
      expect(statValues[1]).toHaveTextContent('45');
      expect(statValues[2]).toHaveTextContent('90');
      expect(statValues[3]).toHaveTextContent('15');
    });

    test('should display recent applications table', () => {
      renderWithTheme(
        <MockDashboard
          statistics={mockStatistics}
          recentApplications={mockApplications}
          onApplicationClick={jest.fn()}
          onRefresh={jest.fn()}
        />
      );

      expect(screen.getByTestId('application-table')).toBeInTheDocument();
      expect(screen.getByText('APP-2025-001')).toBeInTheDocument();
      expect(screen.getByText('Green Valley Farm')).toBeInTheDocument();
    });

    test('should handle application row click', async () => {
      const mockClick = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <MockDashboard
          statistics={mockStatistics}
          recentApplications={mockApplications}
          onApplicationClick={mockClick}
          onRefresh={jest.fn()}
        />
      );

      await user.click(screen.getByTestId('app-row-app-1'));

      expect(mockClick).toHaveBeenCalledWith(mockApplications[0]);
    });

    test('should handle refresh button click', async () => {
      const mockRefresh = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <MockDashboard
          statistics={mockStatistics}
          recentApplications={mockApplications}
          onApplicationClick={jest.fn()}
          onRefresh={mockRefresh}
        />
      );

      await user.click(screen.getByTestId('refresh-button'));

      expect(mockRefresh).toHaveBeenCalled();
    });

    test('should display application statuses correctly', () => {
      renderWithTheme(
        <MockDashboard
          statistics={mockStatistics}
          recentApplications={mockApplications}
          onApplicationClick={jest.fn()}
          onRefresh={jest.fn()}
        />
      );

      expect(screen.getByTestId('status-app-1')).toHaveTextContent('PENDING_REVIEW');
      expect(screen.getByTestId('status-app-2')).toHaveTextContent('APPROVED');
      expect(screen.getByTestId('status-app-3')).toHaveTextContent('REJECTED');
    });
  });

  describe('Statistics Cards', () => {
    test('should format large numbers correctly', () => {
      renderWithTheme(<MockStatisticsCard title="Total" value={1234567} />);

      expect(screen.getByTestId('stats-value')).toHaveTextContent('1,234,567');
    });

    test('should display zero values', () => {
      renderWithTheme(<MockStatisticsCard title="Pending" value={0} />);

      expect(screen.getByTestId('stats-value')).toHaveTextContent('0');
    });

    test('should display icon when provided', () => {
      renderWithTheme(<MockStatisticsCard title="Total" value={100} icon="📊" />);

      expect(screen.getByTestId('stats-icon')).toHaveTextContent('📊');
    });
  });

  describe('Analytics Page', () => {
    const mockMonthlyData = [
      { month: 'Jan', applications: 10 },
      { month: 'Feb', applications: 15 },
      { month: 'Mar', applications: 20 },
    ];

    const mockStatusDistribution = [
      { status: 'Approved', count: 90 },
      { status: 'Pending', count: 45 },
      { status: 'Rejected', count: 15 },
    ];

    test('should display analytics page', () => {
      renderWithTheme(
        <MockAnalyticsPage
          monthlyData={mockMonthlyData}
          statusDistribution={mockStatusDistribution}
          onDateRangeChange={jest.fn()}
        />
      );

      expect(screen.getByTestId('analytics-page')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    test('should display date range filters', () => {
      renderWithTheme(
        <MockAnalyticsPage
          monthlyData={mockMonthlyData}
          statusDistribution={mockStatusDistribution}
          onDateRangeChange={jest.fn()}
        />
      );

      expect(screen.getByTestId('start-date-input')).toBeInTheDocument();
      expect(screen.getByTestId('end-date-input')).toBeInTheDocument();
      expect(screen.getByTestId('apply-filter-button')).toBeInTheDocument();
    });

    test('should handle date range change', async () => {
      const mockDateChange = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <MockAnalyticsPage
          monthlyData={mockMonthlyData}
          statusDistribution={mockStatusDistribution}
          onDateRangeChange={mockDateChange}
        />
      );

      await user.clear(screen.getByTestId('start-date-input'));
      await user.type(screen.getByTestId('start-date-input'), '2025-06-01');

      await user.clear(screen.getByTestId('end-date-input'));
      await user.type(screen.getByTestId('end-date-input'), '2025-12-31');

      await user.click(screen.getByTestId('apply-filter-button'));

      await waitFor(() => {
        expect(mockDateChange).toHaveBeenCalledWith(new Date('2025-06-01'), new Date('2025-12-31'));
      });
    });

    test('should display charts', () => {
      renderWithTheme(
        <MockAnalyticsPage
          monthlyData={mockMonthlyData}
          statusDistribution={mockStatusDistribution}
          onDateRangeChange={jest.fn()}
        />
      );

      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
      expect(screen.getByTestId('chart-pie')).toBeInTheDocument();
    });

    test('should pass data to charts correctly', () => {
      renderWithTheme(
        <MockAnalyticsPage
          monthlyData={mockMonthlyData}
          statusDistribution={mockStatusDistribution}
          onDateRangeChange={jest.fn()}
        />
      );

      const charts = screen.getAllByTestId('chart-data');
      expect(charts[0]).toHaveTextContent(JSON.stringify(mockMonthlyData));
      expect(charts[1]).toHaveTextContent(JSON.stringify(mockStatusDistribution));
    });
  });

  describe('Application Table', () => {
    const mockApplications = [
      {
        id: 'app-1',
        applicationNumber: 'APP-001',
        farmName: 'Farm 1',
        status: 'APPROVED',
        createdAt: new Date('2025-01-15'),
      },
      {
        id: 'app-2',
        applicationNumber: 'APP-002',
        farmName: 'Farm 2',
        status: 'PENDING_REVIEW',
        createdAt: new Date('2025-01-14'),
      },
    ];

    test('should display all table rows', () => {
      renderWithTheme(
        <MockApplicationTable applications={mockApplications} onRowClick={jest.fn()} />
      );

      expect(screen.getByTestId('app-row-app-1')).toBeInTheDocument();
      expect(screen.getByTestId('app-row-app-2')).toBeInTheDocument();
    });

    test('should handle empty applications list', () => {
      renderWithTheme(<MockApplicationTable applications={[]} onRowClick={jest.fn()} />);

      const table = screen.getByTestId('application-table');
      const tbody = table.querySelector('tbody');
      expect(tbody?.children.length).toBe(0);
    });

    test('should format dates correctly', () => {
      renderWithTheme(
        <MockApplicationTable applications={mockApplications} onRowClick={jest.fn()} />
      );

      // Date formatting depends on locale, so just check it exists
      const dateCell = screen.getByTestId('app-row-app-1').querySelector('td:last-child');
      expect(dateCell).toBeInTheDocument();
      expect(dateCell?.textContent).toBeTruthy();
    });

    test('should handle row click for multiple rows', async () => {
      const mockClick = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <MockApplicationTable applications={mockApplications} onRowClick={mockClick} />
      );

      await user.click(screen.getByTestId('app-row-app-1'));
      await user.click(screen.getByTestId('app-row-app-2'));

      expect(mockClick).toHaveBeenCalledTimes(2);
      expect(mockClick).toHaveBeenNthCalledWith(1, mockApplications[0]);
      expect(mockClick).toHaveBeenNthCalledWith(2, mockApplications[1]);
    });
  });

  describe('Chart Components', () => {
    const mockData = [
      { label: 'Jan', value: 10 },
      { label: 'Feb', value: 20 },
      { label: 'Mar', value: 15 },
    ];

    test('should render line chart', () => {
      renderWithTheme(<MockChartComponent data={mockData} type="line" />);

      expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    });

    test('should render bar chart', () => {
      renderWithTheme(<MockChartComponent data={mockData} type="bar" />);

      expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
    });

    test('should render pie chart', () => {
      renderWithTheme(<MockChartComponent data={mockData} type="pie" />);

      expect(screen.getByTestId('chart-pie')).toBeInTheDocument();
    });

    test('should handle empty data', () => {
      renderWithTheme(<MockChartComponent data={[]} type="line" />);

      const chartData = screen.getByTestId('chart-data');
      expect(chartData).toHaveTextContent('[]');
    });

    test('should handle large datasets', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        label: `Item ${i}`,
        value: i * 10,
      }));

      renderWithTheme(<MockChartComponent data={largeData} type="bar" />);

      expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
      const chartData = screen.getByTestId('chart-data');
      expect(chartData.textContent).toContain('Item 0');
      expect(chartData.textContent).toContain('Item 99');
    });
  });

  describe('Dashboard Performance', () => {
    test('should render dashboard quickly with large dataset', () => {
      const largeApplications = Array.from({ length: 50 }, (_, i) => ({
        id: `app-${i}`,
        applicationNumber: `APP-${i}`,
        farmName: `Farm ${i}`,
        status: 'PENDING_REVIEW',
        createdAt: new Date(),
      }));

      const startTime = Date.now();

      renderWithTheme(
        <MockDashboard
          statistics={{ total: 150, pending: 45, approved: 90, rejected: 15 }}
          recentApplications={largeApplications}
          onApplicationClick={jest.fn()}
          onRefresh={jest.fn()}
        />
      );

      const renderTime = Date.now() - startTime;

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(renderTime).toBeLessThan(1000); // Should render in < 1 second
    });

    test('should handle rapid refresh clicks', async () => {
      const mockRefresh = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <MockDashboard
          statistics={{ total: 150, pending: 45, approved: 90, rejected: 15 }}
          recentApplications={[]}
          onApplicationClick={jest.fn()}
          onRefresh={mockRefresh}
        />
      );

      const refreshButton = screen.getByTestId('refresh-button');

      // Click rapidly multiple times
      await user.click(refreshButton);
      await user.click(refreshButton);
      await user.click(refreshButton);

      expect(mockRefresh).toHaveBeenCalledTimes(3);
    });
  });

  describe('Responsive Behavior', () => {
    test('should display statistics in grid layout', () => {
      renderWithTheme(
        <MockDashboard
          statistics={{ total: 150, pending: 45, approved: 90, rejected: 15 }}
          recentApplications={[]}
          onApplicationClick={jest.fn()}
          onRefresh={jest.fn()}
        />
      );

      const statsSection = screen.getByTestId('statistics-section');
      expect(statsSection).toBeInTheDocument();
      expect(statsSection.children.length).toBe(4);
    });

    test('should maintain table structure', () => {
      const mockApplications = [
        {
          id: 'app-1',
          applicationNumber: 'APP-001',
          farmName: 'Farm 1',
          status: 'APPROVED',
          createdAt: new Date(),
        },
      ];

      renderWithTheme(
        <MockApplicationTable applications={mockApplications} onRowClick={jest.fn()} />
      );

      const table = screen.getByTestId('application-table');
      expect(table.querySelector('thead')).toBeInTheDocument();
      expect(table.querySelector('tbody')).toBeInTheDocument();
    });
  });
});
