import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import UsersPage from '../page';

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

jest.mock('@/components/users/UsersTable', () => {
  return function MockUsersTable({ users, onEdit, onDelete }: any) {
    return (
      <div data-testid="users-table">
        {users.map((user: any) => (
          <div key={user.id} data-testid={`user-${user.id}`}>
            {user.name} - {user.email}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('@/components/users/UserFormDialog', () => {
  return function MockUserFormDialog({ open, onClose, onSubmit, user }: any) {
    return open ? (
      <div data-testid="user-form-dialog">
        <button onClick={() => onSubmit({ name: 'Test User' })}>Submit</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

describe('UsersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render loading spinner initially', () => {
    render(<UsersPage />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render users table after loading', async () => {
    render(<UsersPage />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('users-table')).toBeInTheDocument();
  });

  it('should display user data', async () => {
    render(<UsersPage />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/นายสมชาย ผู้ตรวจสอบ/)).toBeInTheDocument();
    expect(screen.getByText(/somchai@gacp.go.th/)).toBeInTheDocument();
  });

  it('should open dialog when add button is clicked', async () => {
    render(<UsersPage />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /เพิ่มผู้ใช้งาน/i });
    fireEvent.click(addButton);

    expect(screen.getByTestId('user-form-dialog')).toBeInTheDocument();
  });

  it('should close dialog when close button is clicked', async () => {
    render(<UsersPage />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /เพิ่มผู้ใช้งาน/i });
    fireEvent.click(addButton);

    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('user-form-dialog')).not.toBeInTheDocument();
    });
  });

  it('should render admin header and sidebar', async () => {
    render(<UsersPage />);

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('admin-header')).toBeInTheDocument();

    // Sidebar may appear once or twice (desktop & mobile). Assert at least one.
    const sidebars = screen.getAllByTestId('admin-sidebar');
    expect(sidebars.length).toBeGreaterThanOrEqual(1);
  });
});
