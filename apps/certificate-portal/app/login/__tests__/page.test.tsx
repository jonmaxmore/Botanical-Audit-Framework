import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import LoginPage from '../page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock notistack
const mockEnqueueSnackbar = jest.fn();
jest.mock('notistack', () => ({
  useSnackbar: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    store,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('LoginPage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSnackbar as jest.Mock).mockReturnValue({ enqueueSnackbar: mockEnqueueSnackbar });
    mockLocalStorage.clear();
    mockPush.mockClear();
    mockEnqueueSnackbar.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render login form', () => {
      render(<LoginPage />);
      expect(screen.getByLabelText(/อีเมล/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/รหัสผ่าน/i)).toBeInTheDocument();
    });

    it('should render login button', () => {
      render(<LoginPage />);
      expect(screen.getByRole('button', { name: /เข้าสู่ระบบ/i })).toBeInTheDocument();
    });

    it('should render page title', () => {
      render(<LoginPage />);
      expect(screen.getByRole('heading', { name: /Certificate Portal/i })).toBeInTheDocument();
    });

    it('should have password visibility toggle', () => {
      render(<LoginPage />);
      const passwordInput = screen.getByLabelText(/รหัสผ่าน/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in email field', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoginPage />);
      const emailInput = screen.getByLabelText(/อีเมล/i);
      await user.type(emailInput, 'test@example.com');
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should allow typing in password field', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoginPage />);
      const passwordInput = screen.getByLabelText(/รหัสผ่าน/i);
      await user.type(passwordInput, 'password123');
      expect(passwordInput).toHaveValue('password123');
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoginPage />);
      const passwordInput = screen.getByLabelText(/รหัสผ่าน/i);
      const toggleButtons = screen.getAllByRole('button');
      const visibilityToggle = toggleButtons.find(
        (btn) =>
          btn.querySelector('[data-testid="VisibilityOffIcon"]') ||
          btn.querySelector('[data-testid="VisibilityIcon"]')
      );

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(visibilityToggle).toBeDefined();

      if (visibilityToggle) {
        await user.click(visibilityToggle);
      }
      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Login Success', () => {
    it('should login successfully with correct credentials', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/อีเมล/i);
      const passwordInput = screen.getByLabelText(/รหัสผ่าน/i);
      const loginButton = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });

      await user.type(emailInput, 'cert@gacp.test');
      await user.type(passwordInput, 'password123');
      fireEvent.click(loginButton);

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'cert_token',
          'demo-token-certificate-officer'
        );
      });

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith('เข้าสู่ระบบสำเร็จ!', {
          variant: 'success',
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should store user data in localStorage', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/อีเมล/i), 'cert@gacp.test');
      await user.type(screen.getByLabelText(/รหัสผ่าน/i), 'password123');
      fireEvent.click(screen.getByRole('button', { name: /เข้าสู่ระบบ/i }));

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'cert_user',
          expect.stringContaining('certificate_officer')
        );
      });
    });
  });

  describe('Login Failure', () => {
    it('should show error with incorrect credentials', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/อีเมล/i), 'wrong@test.com');
      await user.type(screen.getByLabelText(/รหัสผ่าน/i), 'wrongpass');
      fireEvent.click(screen.getByRole('button', { name: /เข้าสู่ระบบ/i }));

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('อีเมลหรือรหัสผ่านไม่ถูกต้อง')).toBeInTheDocument();
      });
    });

    it('should not redirect on failed login', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/อีเมล/i), 'wrong@test.com');
      await user.type(screen.getByLabelText(/รหัสผ่าน/i), 'wrongpass');
      fireEvent.click(screen.getByRole('button', { name: /เข้าสู่ระบบ/i }));

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('อีเมลหรือรหัสผ่านไม่ถูกต้อง')).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Loading State', () => {
    it('should show loading state during login', async () => {
      const user = userEvent.setup({ delay: null });
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/อีเมล/i), 'cert@gacp.test');
      await user.type(screen.getByLabelText(/รหัสผ่าน/i), 'password123');

      const loginButton = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });
      fireEvent.click(loginButton);

      expect(loginButton).toBeDisabled();
    });
  });
});
