import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewsPage from '../page';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

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

jest.mock('@/components/common/LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

jest.mock('@/components/applications/ReviewQueue', () => {
  return function MockReviewQueue({ applications }: any) {
    return (
      <div data-testid="review-queue">
        {applications.map((app: any) => (
          <div key={app.id} data-testid={`application-${app.id}`}>
            {app.applicationNumber} - {app.farmerName}
          </div>
        ))}
      </div>
    );
  };
});

describe('ReviewsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render loading spinner initially', () => {
    render(<ReviewsPage />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render review queue after loading', async () => {
    render(<ReviewsPage />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    expect(screen.getByTestId('review-queue')).toBeInTheDocument();
  });

  it('should display application data', async () => {
    render(<ReviewsPage />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText(/GACP-2025-0001/)).toBeInTheDocument();
    expect(screen.getByText(/นายสมชาย ใจดี/)).toBeInTheDocument();
  });

  it('should render admin header and sidebar', async () => {
    render(<ReviewsPage />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
  const sidebars = screen.getAllByTestId('admin-sidebar');
  expect(sidebars.length).toBeGreaterThanOrEqual(1);
  });

  it('should display multiple applications', async () => {
    render(<ReviewsPage />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    expect(screen.getByTestId('application-1')).toBeInTheDocument();
    expect(screen.getByTestId('application-2')).toBeInTheDocument();
    expect(screen.getByTestId('application-3')).toBeInTheDocument();
  });
});
