import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatisticsCard from '../StatisticsCard';
import { TrendingUp } from '@mui/icons-material';

describe('StatisticsCard', () => {
  it('should render statistics card with title and value', () => {
    render(
      <StatisticsCard
        title="Total Applications"
        value="1,248"
        subtitle="Applications in system"
        icon={<TrendingUp />}
        iconColor="primary"
      />
    );
    
    expect(screen.getByText('Total Applications')).toBeInTheDocument();
    expect(screen.getByText('1,248')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(
      <StatisticsCard
        title="Test"
        value="100"
        subtitle="Test subtitle"
        icon={<TrendingUp />}
        iconColor="primary"
      />
    );
    
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('should render trend when provided', () => {
    render(
      <StatisticsCard
        title="Test"
        value="100"
        subtitle="Test"
        icon={<TrendingUp />}
        iconColor="primary"
        trend={{ value: 12.5, isPositive: true }}
      />
    );
    
    expect(screen.getByText(/12.5%/)).toBeInTheDocument();
  });

  it('should show negative trend', () => {
    render(
      <StatisticsCard
        title="Test"
        value="100"
        subtitle="Test"
        icon={<TrendingUp />}
        iconColor="primary"
        trend={{ value: 8.2, isPositive: false }}
      />
    );
    
    expect(screen.getByText(/8.2%/)).toBeInTheDocument();
  });
});
