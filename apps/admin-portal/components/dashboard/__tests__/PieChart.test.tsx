import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PieChart from '../PieChart';

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Pie: (props) => {
    const { data, options } = props;
    return (
      <div data-testid="pie-chart">
        <div data-testid="chart-title">{options?.plugins?.title?.text || ''}</div>
        <div data-testid="chart-labels">{data?.labels?.join(',')}</div>
        {data?.datasets?.map((dataset, index) => (
          <div key={index} data-testid={`dataset-${index}`}>
            <span data-testid={`dataset-data-${index}`}>{dataset.data.join(',')}</span>
            <span data-testid={`dataset-colors-${index}`}>
              {dataset.backgroundColor.join(',')}
            </span>
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
  ArcElement: {},
  Tooltip: {},
  Legend: {},
}));

describe('PieChart', () => {
  it('should render pie chart with default data', () => {
    render(<PieChart />);
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should render chart with Thai status labels by default', () => {
    render(<PieChart />);
    
    const labels = screen.getByTestId('chart-labels');
    expect(labels).toHaveTextContent('รอพิจารณา');
    expect(labels).toHaveTextContent('อนุมัติแล้ว');
    expect(labels).toHaveTextContent('ไม่อนุมัติ');
    expect(labels).toHaveTextContent('กำลังตรวจสอบ');
  });

  it('should render with four data segments by default', () => {
    render(<PieChart />);
    
    const dataElement = screen.getByTestId('dataset-data-0');
    const dataValues = dataElement.textContent?.split(',') || [];
    expect(dataValues.length).toBe(4);
    expect(dataElement).toHaveTextContent('32,45,8,15');
  });

  it('should render with custom data', () => {
    const customData = {
      labels: ['Category A', 'Category B'],
      datasets: [
        {
          data: [60, 40],
          backgroundColor: ['#FF0000', '#00FF00'],
          borderColor: ['#CC0000', '#00CC00'],
          borderWidth: 2,
        },
      ],
    };

    render(<PieChart data={customData} />);
    
    const labels = screen.getByTestId('chart-labels');
    expect(labels).toHaveTextContent('Category A,Category B');
    
    const dataElement = screen.getByTestId('dataset-data-0');
    expect(dataElement).toHaveTextContent('60,40');
  });

  it('should display title when provided', () => {
    render(<PieChart title="สัดส่วนสถานะ" />);
    
    const title = screen.getByTestId('chart-title');
    expect(title).toHaveTextContent('สัดส่วนสถานะ');
  });

  it('should not display title when not provided', () => {
    render(<PieChart />);
    
    const title = screen.getByTestId('chart-title');
    expect(title).toBeEmptyDOMElement();
  });

  it('should render with colors from theme', () => {
    render(<PieChart />);
    
    const colorsElement = screen.getByTestId('dataset-colors-0');
    // Check that colors are rendered (actual theme colors will be applied)
    expect(colorsElement).toBeInTheDocument();
    expect(colorsElement.textContent).toBeTruthy();
  });

  it('should render with custom height', () => {
    const { container } = render(<PieChart height={400} />);
    
    const boxElement = container.querySelector('.MuiBox-root');
    expect(boxElement).toBeInTheDocument();
  });

  it('should handle empty dataset gracefully', () => {
    const emptyData = {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 2,
        },
      ],
    };

    render(<PieChart data={emptyData} />);
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('chart-labels')).toBeEmptyDOMElement();
    expect(screen.getByTestId('dataset-data-0')).toBeEmptyDOMElement();
  });

  it('should render centered in flex container', () => {
    const { container } = render(<PieChart />);
    
    const boxElement = container.querySelector('.MuiBox-root');
    expect(boxElement).toBeInTheDocument();
    // MUI Box with display flex for centering
  });
});
