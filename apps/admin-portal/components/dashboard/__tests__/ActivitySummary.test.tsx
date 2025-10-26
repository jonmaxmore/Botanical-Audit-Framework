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

  it('should render activity without user', () => {
    const activitiesWithoutUser = [
      {
        id: '3',
        type: 'comment' as const,
        title: 'System Comment',
        description: 'Auto-generated comment',
        time: new Date().toISOString(),
        // No user field
      },
    ];

    render(<ActivitySummary activities={activitiesWithoutUser} />);

    expect(screen.getByText('System Comment')).toBeInTheDocument();
    expect(screen.getByText('Auto-generated comment')).toBeInTheDocument();
  });

  it('should handle unknown activity type with default icon', () => {
    const unknownTypeActivity = [
      {
        id: '4',
        type: 'unknown' as any,
        title: 'Unknown Activity',
        description: 'This is an unknown type',
        time: new Date().toISOString(),
      },
    ];

    render(<ActivitySummary activities={unknownTypeActivity} />);

    expect(screen.getByText('Unknown Activity')).toBeInTheDocument();
  });

  it('should display correct icon for each activity type', () => {
    const allTypes = [
      {
        id: '1',
        type: 'application' as const,
        title: 'Application',
        description: 'Test',
        time: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'comment' as const,
        title: 'Comment',
        description: 'Test',
        time: new Date().toISOString(),
      },
      {
        id: '3',
        type: 'approval' as const,
        title: 'Approval',
        description: 'Test',
        time: new Date().toISOString(),
      },
      {
        id: '4',
        type: 'user' as const,
        title: 'User',
        description: 'Test',
        time: new Date().toISOString(),
      },
    ];

    render(<ActivitySummary activities={allTypes} />);

    expect(screen.getByText('Application')).toBeInTheDocument();
    expect(screen.getByText('Comment')).toBeInTheDocument();
    expect(screen.getByText('Approval')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should format time as "เมื่อสักครู่" for very recent activities', () => {
    const recentActivity = [
      {
        id: '5',
        type: 'application' as const,
        title: 'Just Now',
        description: 'Just happened',
        time: new Date().toISOString(), // Current time
      },
    ];

    render(<ActivitySummary activities={recentActivity} />);

    expect(screen.getByText(/เมื่อสักครู่/i)).toBeInTheDocument();
  });

  it('should format time in minutes for recent activities', () => {
    const minutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 minutes ago
    const minuteActivity = [
      {
        id: '6',
        type: 'approval' as const,
        title: 'Minutes Ago',
        description: 'Happened minutes ago',
        time: minutesAgo,
      },
    ];

    render(<ActivitySummary activities={minuteActivity} />);

    expect(screen.getByText(/นาทีที่แล้ว/i)).toBeInTheDocument();
  });

  it('should format time in hours for activities within 24 hours', () => {
    const hoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(); // 5 hours ago
    const hourActivity = [
      {
        id: '7',
        type: 'comment' as const,
        title: 'Hours Ago',
        description: 'Happened hours ago',
        time: hoursAgo,
      },
    ];

    render(<ActivitySummary activities={hourActivity} />);

    expect(screen.getByText(/ชั่วโมงที่แล้ว/i)).toBeInTheDocument();
  });

  it('should format time in days for older activities', () => {
    const daysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days ago
    const dayActivity = [
      {
        id: '8',
        type: 'user' as const,
        title: 'Days Ago',
        description: 'Happened days ago',
        time: daysAgo,
      },
    ];

    render(<ActivitySummary activities={dayActivity} />);

    expect(screen.getByText(/วันที่แล้ว/i)).toBeInTheDocument();
  });

  it('should render dividers between activities', () => {
    const multipleActivities = [
      {
        id: '1',
        type: 'application' as const,
        title: 'First',
        description: 'First activity',
        time: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'approval' as const,
        title: 'Second',
        description: 'Second activity',
        time: new Date().toISOString(),
      },
      {
        id: '3',
        type: 'comment' as const,
        title: 'Third',
        description: 'Third activity',
        time: new Date().toISOString(),
      },
    ];

    const { container } = render(<ActivitySummary activities={multipleActivities} />);

    // Should have dividers between activities
    const dividers = container.querySelectorAll('hr');
    expect(dividers.length).toBeGreaterThan(0);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });
});
