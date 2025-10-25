import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivitySummary from '../ActivitySummary';

describe('ActivitySummary', () => {
  const mockActivities = [
    {
      id: '1',
      type: 'application' as const,
      title: 'New Application',
      description: 'John submitted application GACP-2025-0125',
      time: new Date().toISOString(),
      user: 'John Doe',
    },
    {
      id: '2',
      type: 'approval' as const,
      title: 'Application Approved',
      description: 'Application GACP-2025-0120 was approved',
      time: new Date().toISOString(),
      user: 'Admin',
    },
  ];

  it('should render activity summary', () => {
    render(<ActivitySummary activities={mockActivities} />);
    
    expect(screen.getByText('New Application')).toBeInTheDocument();
    expect(screen.getByText('Application Approved')).toBeInTheDocument();
  });

  it('should render activity descriptions', () => {
    render(<ActivitySummary activities={mockActivities} />);
    
    expect(screen.getByText(/John submitted application/i)).toBeInTheDocument();
    expect(screen.getByText(/was approved/i)).toBeInTheDocument();
  });

  it('should render empty state when no activities', () => {
    render(<ActivitySummary activities={[]} />);
    
    expect(screen.getByText(/ไม่มีกิจกรรม/i)).toBeInTheDocument();
  });

  it('should display user names', () => {
    render(<ActivitySummary activities={mockActivities} />);
    
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
  });
});
