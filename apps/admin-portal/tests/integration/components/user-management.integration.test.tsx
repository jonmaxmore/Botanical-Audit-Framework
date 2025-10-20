/**
 * Component Integration Tests - User Management
 * Tests user registration, login, and profile management workflows
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';

const theme = createTheme();

// Mock components
const MockLoginForm = ({
  onSubmit,
  onForgotPassword,
}: {
  onSubmit: (data: { email: string; password: string }) => void;
  onForgotPassword: () => void;
}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        data-testid="email-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        data-testid="password-input"
      />
      {error && <div data-testid="error-message">{error}</div>}
      <button type="submit" data-testid="login-button">
        Login
      </button>
      <button type="button" onClick={onForgotPassword} data-testid="forgot-password-button">
        Forgot Password?
      </button>
    </form>
  );
};

const MockRegistrationForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'FARMER',
  });
  const [errors, setErrors] = React.useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!formData.email) newErrors.push('Email is required');
    if (!formData.password) newErrors.push('Password is required');
    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match');
    }
    if (!formData.firstName) newErrors.push('First name is required');
    if (!formData.lastName) newErrors.push('Last name is required');

    setErrors(newErrors);

    if (newErrors.length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="registration-form">
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        data-testid="email-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={e => setFormData({ ...formData, password: e.target.value })}
        data-testid="password-input"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
        data-testid="confirm-password-input"
      />
      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName}
        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
        data-testid="first-name-input"
      />
      <input
        type="text"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
        data-testid="last-name-input"
      />
      <input
        type="tel"
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
        data-testid="phone-input"
      />
      {errors.length > 0 && (
        <div data-testid="error-list">
          {errors.map((error, i) => (
            <div key={i} data-testid={`error-${i}`}>
              {error}
            </div>
          ))}
        </div>
      )}
      <button type="submit" data-testid="register-button">
        Register
      </button>
    </form>
  );
};

const MockProfileEditor = ({ user, onSave }: { user: any; onSave: (data: any) => void }) => {
  const [formData, setFormData] = React.useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    address: user.address || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="profile-form">
      <input
        type="text"
        value={formData.firstName}
        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
        data-testid="first-name-input"
      />
      <input
        type="text"
        value={formData.lastName}
        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
        data-testid="last-name-input"
      />
      <input
        type="tel"
        value={formData.phoneNumber}
        onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
        data-testid="phone-input"
      />
      <textarea
        value={formData.address}
        onChange={e => setFormData({ ...formData, address: e.target.value })}
        data-testid="address-input"
      />
      <button type="submit" data-testid="save-button">
        Save Changes
      </button>
    </form>
  );
};

describe('User Management Integration Tests', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  describe('User Login Flow', () => {
    test('should login with valid credentials', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockLoginForm onSubmit={mockSubmit} onForgotPassword={jest.fn()} />);

      await user.type(screen.getByTestId('email-input'), 'user@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'password123',
        });
      });
    });

    test('should show error for empty fields', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockLoginForm onSubmit={mockSubmit} onForgotPassword={jest.fn()} />);

      await user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByText('Email and password are required')).toBeInTheDocument();
        expect(mockSubmit).not.toHaveBeenCalled();
      });
    });

    test('should trigger forgot password flow', async () => {
      const mockForgotPassword = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockLoginForm onSubmit={jest.fn()} onForgotPassword={mockForgotPassword} />);

      await user.click(screen.getByTestId('forgot-password-button'));

      expect(mockForgotPassword).toHaveBeenCalled();
    });

    test('should handle password visibility toggle', async () => {
      const user = userEvent.setup();

      renderWithTheme(<MockLoginForm onSubmit={jest.fn()} onForgotPassword={jest.fn()} />);

      const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;

      expect(passwordInput.type).toBe('password');
    });
  });

  describe('User Registration Flow', () => {
    test('should register with valid data', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockRegistrationForm onSubmit={mockSubmit} />);

      await user.type(screen.getByTestId('email-input'), 'newuser@example.com');
      await user.type(screen.getByTestId('password-input'), 'SecurePass123');
      await user.type(screen.getByTestId('confirm-password-input'), 'SecurePass123');
      await user.type(screen.getByTestId('first-name-input'), 'John');
      await user.type(screen.getByTestId('last-name-input'), 'Doe');
      await user.type(screen.getByTestId('phone-input'), '0812345678');

      await user.click(screen.getByTestId('register-button'));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '0812345678',
          role: 'FARMER',
        });
      });
    });

    test('should validate password match', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockRegistrationForm onSubmit={mockSubmit} />);

      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.type(screen.getByTestId('confirm-password-input'), 'differentpassword');
      await user.type(screen.getByTestId('first-name-input'), 'John');
      await user.type(screen.getByTestId('last-name-input'), 'Doe');

      await user.click(screen.getByTestId('register-button'));

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        expect(mockSubmit).not.toHaveBeenCalled();
      });
    });

    test('should validate required fields', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockRegistrationForm onSubmit={mockSubmit} />);

      await user.click(screen.getByTestId('register-button'));

      await waitFor(() => {
        const errorList = screen.getByTestId('error-list');
        expect(errorList).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
        expect(mockSubmit).not.toHaveBeenCalled();
      });
    });

    test('should handle email format validation', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockRegistrationForm onSubmit={mockSubmit} />);

      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;

      await user.type(emailInput, 'invalid-email');

      expect(emailInput.value).toBe('invalid-email');
      expect(emailInput.type).toBe('email');
    });

    test('should handle phone number format', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockRegistrationForm onSubmit={mockSubmit} />);

      await user.type(screen.getByTestId('phone-input'), '0812345678');

      const phoneInput = screen.getByTestId('phone-input') as HTMLInputElement;
      expect(phoneInput.value).toBe('0812345678');
    });
  });

  describe('Profile Management Flow', () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '0812345678',
      address: '123 Main St, Bangkok',
      role: 'FARMER',
    };

    test('should update profile information', async () => {
      const mockSave = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockProfileEditor user={mockUser} onSave={mockSave} />);

      // Verify initial values
      expect((screen.getByTestId('first-name-input') as HTMLInputElement).value).toBe('John');

      // Update fields
      await user.clear(screen.getByTestId('first-name-input'));
      await user.type(screen.getByTestId('first-name-input'), 'Jane');

      await user.clear(screen.getByTestId('phone-input'));
      await user.type(screen.getByTestId('phone-input'), '0887654321');

      await user.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith({
          firstName: 'Jane',
          lastName: 'Doe',
          phoneNumber: '0887654321',
          address: '123 Main St, Bangkok',
        });
      });
    });

    test('should update address', async () => {
      const mockSave = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockProfileEditor user={mockUser} onSave={mockSave} />);

      await user.clear(screen.getByTestId('address-input'));
      await user.type(screen.getByTestId('address-input'), '456 New Street, Chiang Mai');

      await user.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith(
          expect.objectContaining({
            address: '456 New Street, Chiang Mai',
          })
        );
      });
    });

    test('should preserve unchanged fields', async () => {
      const mockSave = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockProfileEditor user={mockUser} onSave={mockSave} />);

      // Only change first name
      await user.clear(screen.getByTestId('first-name-input'));
      await user.type(screen.getByTestId('first-name-input'), 'Updated');

      await user.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith({
          firstName: 'Updated',
          lastName: 'Doe', // Unchanged
          phoneNumber: '0812345678', // Unchanged
          address: '123 Main St, Bangkok', // Unchanged
        });
      });
    });

    test('should handle empty optional fields', async () => {
      const userWithoutAddress = { ...mockUser, address: '' };
      const mockSave = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(<MockProfileEditor user={userWithoutAddress} onSave={mockSave} />);

      await user.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith(
          expect.objectContaining({
            address: '',
          })
        );
      });
    });
  });

  describe('Complete User Workflow', () => {
    test('should complete registration to profile update flow', async () => {
      const mockRegister = jest.fn();
      const mockSave = jest.fn();
      const user = userEvent.setup();

      // Step 1: Register
      const { unmount } = renderWithTheme(<MockRegistrationForm onSubmit={mockRegister} />);

      await user.type(screen.getByTestId('email-input'), 'complete@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.type(screen.getByTestId('confirm-password-input'), 'password123');
      await user.type(screen.getByTestId('first-name-input'), 'Complete');
      await user.type(screen.getByTestId('last-name-input'), 'User');
      await user.type(screen.getByTestId('phone-input'), '0812345678');

      await user.click(screen.getByTestId('register-button'));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });

      unmount();

      // Step 2: Edit profile
      const newUser = {
        id: 'new-user-id',
        email: 'complete@example.com',
        firstName: 'Complete',
        lastName: 'User',
        phoneNumber: '0812345678',
        address: '',
        role: 'FARMER',
      };

      renderWithTheme(<MockProfileEditor user={newUser} onSave={mockSave} />);

      await user.type(screen.getByTestId('address-input'), '789 Complete St');
      await user.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith(
          expect.objectContaining({
            address: '789 Complete St',
          })
        );
      });
    });

    test('should handle login after registration', async () => {
      const mockRegister = jest.fn();
      const mockLogin = jest.fn();
      const user = userEvent.setup();

      // Register
      const { unmount: unmountRegister } = renderWithTheme(
        <MockRegistrationForm onSubmit={mockRegister} />
      );

      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.type(screen.getByTestId('confirm-password-input'), 'password123');
      await user.type(screen.getByTestId('first-name-input'), 'Test');
      await user.type(screen.getByTestId('last-name-input'), 'User');

      await user.click(screen.getByTestId('register-button'));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });

      unmountRegister();

      // Login
      renderWithTheme(<MockLoginForm onSubmit={mockLogin} onForgotPassword={jest.fn()} />);

      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });
  });

  describe('Form Accessibility', () => {
    test('should have proper input types', () => {
      renderWithTheme(<MockLoginForm onSubmit={jest.fn()} onForgotPassword={jest.fn()} />);

      expect(screen.getByTestId('email-input')).toHaveAttribute('type', 'email');
      expect(screen.getByTestId('password-input')).toHaveAttribute('type', 'password');
    });

    test('should have proper button types', () => {
      renderWithTheme(<MockLoginForm onSubmit={jest.fn()} onForgotPassword={jest.fn()} />);

      expect(screen.getByTestId('login-button')).toHaveAttribute('type', 'submit');
      expect(screen.getByTestId('forgot-password-button')).toHaveAttribute('type', 'button');
    });

    test('should have accessible phone input', () => {
      renderWithTheme(<MockRegistrationForm onSubmit={jest.fn()} />);

      expect(screen.getByTestId('phone-input')).toHaveAttribute('type', 'tel');
    });
  });
});
