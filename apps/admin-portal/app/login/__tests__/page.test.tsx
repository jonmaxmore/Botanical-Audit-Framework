import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminLoginPage from '../page';

// Mock useAuth hook
const mockLogin = jest.fn();
jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    loading: false,
  }),
}));

describe('AdminLoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form', () => {
    render(<AdminLoginPage />);

    expect(screen.getByRole('button', { name: /เข้าสู่ระบบ/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /อีเมล/i })).toBeInTheDocument();
  });

  it('should allow typing in email field', () => {
    render(<AdminLoginPage />);

    const emailInput = screen.getByRole('textbox', { name: /อีเมล/i }) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });

    expect(emailInput.value).toBe('admin@test.com');
  });

  it('should allow typing in password field', () => {
    render(<AdminLoginPage />);

    // Password input doesn't have role textbox, so use label query with Thai regex
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/i) as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput.value).toBe('password123');
  });

  it('should call login on form submit', async () => {
    mockLogin.mockResolvedValue({});

    render(<AdminLoginPage />);

    const emailInput = screen.getByRole('textbox', { name: /อีเมล/i });
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/i);
    const submitButton = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@test.com', 'password123');
    });
  });

  it('should show error message on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Login failed'));

    render(<AdminLoginPage />);

    const emailInput = screen.getByRole('textbox', { name: /อีเมล/i });
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/i);
    const submitButton = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/อีเมลหรือรหัสผ่านไม่ถูกต้อง/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<AdminLoginPage />);

    const emailInput = screen.getByRole('textbox', { name: /อีเมล/i });
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/i);
    const submitButton = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
