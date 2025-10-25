import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LineChart from '../LineChart';

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: (props) => {
    const { data, options } = props;
    return (
      <div data-testid="line-chart">
        <div data-testid="chart-title">{options?.plugins?.title?.text || ''}</div>
        <div data-testid="chart-labels">{data?.labels?.join(',')}</div>
        {data?.datasets?.map((dataset, index) => (
          <div key={index} data-testid={`dataset-${index}`}>
            <span data-testid={`dataset-label-${index}`}>{dataset.label}</span>
            <span data-testid={`dataset-data-${index}`}>{dataset.data.join(',')}</span>
          </div>
        ))}
      </div>
    );
  },
}));

// Mock Chart.js registration
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

describe('LineChart', () => {
  it('should render line chart with default data', () => {
    render(<LineChart />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('should render chart with Thai day labels by default', () => {
    render(<LineChart />);
    
    const labels = screen.getByTestId('chart-labels');
    expect(labels).toHaveTextContent('จันทร์');
    expect(labels).toHaveTextContent('อังคาร');
    expect(labels).toHaveTextContent('พุธ');
  });

  it('should render three datasets with default data', () => {
    render(<LineChart />);
    
    // Check all three datasets
    expect(screen.getByTestId('dataset-0')).toBeInTheDocument();
    expect(screen.getByTestId('dataset-1')).toBeInTheDocument();
    expect(screen.getByTestId('dataset-2')).toBeInTheDocument();
    
    // Check dataset labels
    expect(screen.getByTestId('dataset-label-0')).toHaveTextContent('คำขอใหม่');
    expect(screen.getByTestId('dataset-label-1')).toHaveTextContent('อนุมัติแล้ว');
    expect(screen.getByTestId('dataset-label-2')).toHaveTextContent('ไม่อนุมัติ');
  });

  it('should render with custom data', () => {
    const customData = {
      labels: ['Week 1', 'Week 2', 'Week 3'],
      datasets: [
        {
          label: 'Sales',
          data: [100, 200, 150],
          borderColor: '#FF0000',
          backgroundColor: '#FF000020',
        },
      ],
    };

    render(<LineChart data={customData} />);
    
    const labels = screen.getByTestId('chart-labels');
    expect(labels).toHaveTextContent('Week 1,Week 2,Week 3');
    
    expect(screen.getByTestId('dataset-label-0')).toHaveTextContent('Sales');
    expect(screen.getByTestId('dataset-data-0')).toHaveTextContent('100,200,150');
  });

  it('should display title when provided', () => {
    render(<LineChart title="สถิติรายสัปดาห์" />);
    
    const title = screen.getByTestId('chart-title');
    expect(title).toHaveTextContent('สถิติรายสัปดาห์');
  });

  it('should not display title when not provided', () => {
    render(<LineChart />);
    
    const title = screen.getByTestId('chart-title');
    expect(title).toBeEmptyDOMElement();
  });

  it('should render with custom height', () => {
    const { container } = render(<LineChart height={400} />);
    
    const boxElement = container.querySelector('.MuiBox-root');
    expect(boxElement).toBeInTheDocument();
  });

  it('should handle empty dataset gracefully', () => {
    const emptyData = {
      labels: [],
      datasets: [],
    };

    render(<LineChart data={emptyData} />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('chart-labels')).toBeEmptyDOMElement();
  });

  it('should render multiple data points correctly', () => {
    render(<LineChart />);
    
    // Check that default data has 7 data points (7 days)
    const dataset0 = screen.getByTestId('dataset-data-0');
    const dataPoints = dataset0.textContent?.split(',') || [];
    expect(dataPoints.length).toBe(7);
  });
});
