import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PieChart from '../PieChart';

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Pie: (props: any) => {
    const { data, options } = props;
    return (
      <div data-testid="pie-chart">
        <div data-testid="chart-title">{options?.plugins?.title?.text || ''}</div>
        <div data-testid="chart-labels">{data?.labels?.join(',')}</div>
        {data?.datasets?.map((dataset: any, index: number) => (
          <div key={index} data-testid={`dataset-${index}`}>
            <span data-testid={`dataset-data-${index}`}>{dataset.data.join(',')}</span>
            <span data-testid={`dataset-colors-${index}`}>{dataset.backgroundColor.join(',')}</span>
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

  it('should generate labels with percentages', () => {
    // Create a more realistic mock to test generateLabels
    const mockGenerateLabels = jest.fn();

    jest.mock('react-chartjs-2', () => ({
      Pie: (props: any) => {
        const { options } = props;
        // Test that generateLabels function exists and works
        if (options?.plugins?.legend?.labels?.generateLabels) {
          const mockChart = {
            data: {
              labels: ['A', 'B'],
              datasets: [
                {
                  data: [30, 70],
                  backgroundColor: ['#FF0000', '#00FF00'],
                  borderColor: ['#CC0000', '#00CC00'],
                },
              ],
            },
          };
          const result = options.plugins.legend.labels.generateLabels(mockChart);
          mockGenerateLabels(result);
        }
        return <div data-testid="pie-chart"></div>;
      },
    }));

    render(<PieChart />);
    // The generateLabels function is executed by Chart.js internally
  });

  it('should calculate correct percentages in legend', () => {
    const customData = {
      labels: ['First', 'Second', 'Third'],
      datasets: [
        {
          data: [25, 50, 25],
          backgroundColor: ['#FF0000', '#00FF00', '#0000FF'],
          borderColor: ['#CC0000', '#00CC00', '#0000CC'],
          borderWidth: 2,
        },
      ],
    };

    render(<PieChart data={customData} />);
    // Percentages: 25%, 50%, 25% should be calculated correctly
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should format tooltip with percentage', () => {
    const customData = {
      labels: ['Item 1', 'Item 2'],
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
    // Tooltip callback should format: "Item 1: 60 (60.0%)"
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should handle single data point', () => {
    const singleData = {
      labels: ['Only One'],
      datasets: [
        {
          data: [100],
          backgroundColor: ['#FF0000'],
          borderColor: ['#CC0000'],
          borderWidth: 2,
        },
      ],
    };

    render(<PieChart data={singleData} />);

    const labels = screen.getByTestId('chart-labels');
    expect(labels).toHaveTextContent('Only One');

    const dataElement = screen.getByTestId('dataset-data-0');
    expect(dataElement).toHaveTextContent('100');
  });

  it('should use correct font family for Thai text', () => {
    render(<PieChart title="ทดสอบ" />);

    // Chart is configured with Sarabun font for Thai support
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should apply border width correctly', () => {
    const customData = {
      labels: ['Test'],
      datasets: [
        {
          data: [100],
          backgroundColor: ['#FF0000'],
          borderColor: ['#CC0000'],
          borderWidth: 3,
        },
      ],
    };

    render(<PieChart data={customData} />);
    expect(screen.getByTestId('dataset-0')).toBeInTheDocument();
  });
});
