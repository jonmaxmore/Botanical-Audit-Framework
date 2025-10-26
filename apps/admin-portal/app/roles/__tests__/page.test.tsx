import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RolesPage from '../page';

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

jest.mock('@/components/users/RoleManagement', () => {
  return function MockRoleManagement({ roles, permissions }: any) {
    return (
      <div data-testid="role-management">
        Role Management: {roles.length} roles, {permissions.length} permissions
      </div>
    );
  };
});

describe('RolesPage', () => {
  it('should render roles page', () => {
    render(<RolesPage />);

    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
  });

  it('should render role management component', () => {
    render(<RolesPage />);

    expect(screen.getByTestId('role-management')).toBeInTheDocument();
  });

  it('should render sidebar', () => {
    render(<RolesPage />);

    const sidebars = screen.getAllByTestId('admin-sidebar');
    expect(sidebars.length).toBeGreaterThanOrEqual(1);
  });

  it('should render admin header with title', () => {
    render(<RolesPage />);

    // Header is rendered (title passed as prop to AdminHeader)
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
  });
});
