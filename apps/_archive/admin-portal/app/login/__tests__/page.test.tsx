import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminLoginPage from '../page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AdminLoginPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (global.fetch as jest.Mock).mockClear();
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
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token', user: { email: 'admin@test.com' } }),
    });

    render(<AdminLoginPage />);

    const emailInput = screen.getByRole('textbox', { name: /อีเมล/i });
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/i);
    const submitButton = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/dtam/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'admin@test.com', password: 'password123' }),
        })
      );
    });
  });

  it('should show error message on login failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }),
    });

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
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ token: 'test-token', user: {} }),
              }),
            100
          )
        )
    );

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
