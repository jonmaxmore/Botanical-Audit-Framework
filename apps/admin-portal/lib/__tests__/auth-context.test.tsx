import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../auth-context';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string | null> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component that uses useAuth
function TestComponent() {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user">{auth.user ? auth.user.email : 'null'}</div>
      <div data-testid="token">{auth.token || 'null'}</div>
      <div data-testid="isLoading">{auth.isLoading ? 'true' : 'false'}</div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated ? 'true' : 'false'}</div>
      <button onClick={() => auth.login('admin@gacp.th', 'admin123')}>Login</button>
      <button onClick={auth.logout}>Logout</button>
      <button onClick={() => auth.checkAuth()}>Check Auth</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset localStorage mock store
    localStorageMock.clear();
    // Ensure getItem returns null by default
    localStorageMock.getItem.mockReturnValue(null);
    mockPush.mockClear();
    jest.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('should provide auth context to children', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user')).toBeInTheDocument();
      expect(screen.getByTestId('token')).toBeInTheDocument();
      expect(screen.getByTestId('isLoading')).toBeInTheDocument();
      expect(screen.getByTestId('isAuthenticated')).toBeInTheDocument();
    });

    it('should finish loading after mount', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
    });

    it('should initialize with no user when localStorage is empty', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('token')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });

    it('should restore user from localStorage on mount', async () => {
      const mockUser = { id: '1', email: 'admin@gacp.th', name: 'Admin User', role: 'admin' };
      const mockToken = 'mock-token';

      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'token') return mockToken;
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('admin@gacp.th');
        expect(screen.getByTestId('token')).toHaveTextContent('mock-token');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });
    });

    it('should handle invalid JSON in localStorage', async () => {
      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'token') return 'mock-token';
        if (key === 'user') return 'invalid-json{';
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      });
    });
  });

  describe('login', () => {
    it('should login successfully with valid admin credentials', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('admin@gacp.th');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', expect.any(String));
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'user',
          expect.stringContaining('admin@gacp.th')
        );
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should set token in localStorage on successful login', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', expect.any(String));
        const tokenCall = localStorageMock.setItem.mock.calls.find(
          (call: any) => call[0] === 'token'
        );
        expect(tokenCall).toBeDefined();
        expect(tokenCall && tokenCall[1]).toBeTruthy();
      });
    });

    it('should set user data without password in localStorage', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        const userCall = localStorageMock.setItem.mock.calls.find(
          (call: any) => call[0] === 'user'
        );
        expect(userCall).toBeDefined();
        const userData = JSON.parse((userCall && userCall[1]) as string);
        expect(userData.password).toBeUndefined();
        expect(userData.email).toBe('admin@gacp.th');
        expect(userData.name).toBe('Admin User');
        expect(userData.role).toBe('admin');
      });
    });

    it('should redirect to dashboard after successful login', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should throw error with invalid credentials', async () => {
      const TestErrorComponent = () => {
        const auth = useAuth();
        const [error, setError] = React.useState('');

        const handleLogin = async () => {
          try {
            await auth.login('wrong@email.com', 'wrongpassword');
          } catch (err) {
            // err has unknown type in TS; cast to any to access message
            setError((err as any).message);
          }
        };

        return (
          <div>
            <button onClick={handleLogin}>Login</button>
            <div data-testid="error">{error}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestErrorComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('error')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid email or password');
      });
    });

    it('should not store data on failed login', async () => {
      const TestErrorComponent = () => {
        const auth = useAuth();

        const handleLogin = async () => {
          try {
            await auth.login('wrong@email.com', 'wrongpassword');
          } catch (err) {
            // Ignore error
          }
        };

        return <button onClick={handleLogin}>Login</button>;
      };

      render(
        <AuthProvider>
          <TestErrorComponent />
        </AuthProvider>
      );

      const initialSetItemCount = localStorageMock.setItem.mock.calls.length;

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        // Should not have any new setItem calls
        expect(localStorageMock.setItem.mock.calls.length).toBe(initialSetItemCount);
      });
    });
  });

  describe('logout', () => {
    it('should clear user and token on logout', async () => {
      const mockUser = { id: '1', email: 'admin@gacp.th', name: 'Admin User', role: 'admin' };
      const mockToken = 'mock-token';

      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'token') return mockToken;
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('admin@gacp.th');
      });

      await act(async () => {
        screen.getByText('Logout').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('token')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });

    it('should remove data from localStorage on logout', async () => {
      const mockUser = { id: '1', email: 'admin@gacp.th', name: 'Admin User', role: 'admin' };
      const mockToken = 'mock-token';

      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'token') return mockToken;
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('admin@gacp.th');
      });

      await act(async () => {
        screen.getByText('Logout').click();
      });

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      });
    });

    it('should redirect to login page after logout', async () => {
      const mockUser = { id: '1', email: 'admin@gacp.th', name: 'Admin User', role: 'admin' };
      const mockToken = 'mock-token';

      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'token') return mockToken;
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('admin@gacp.th');
      });

      mockPush.mockClear();

      await act(async () => {
        screen.getByText('Logout').click();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('checkAuth', () => {
    it('should return false when not authenticated', async () => {
      const TestCheckComponent = () => {
        const auth = useAuth();
        const [result, setResult] = React.useState<boolean | null>(null);

        return (
          <div>
            <button onClick={() => setResult(auth.checkAuth())}>Check</button>
            <div data-testid="result">{result === null ? 'null' : result.toString()}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestCheckComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('result')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByText('Check').click();
      });

      expect(screen.getByTestId('result')).toHaveTextContent('false');
    });

    it('should return true when authenticated', async () => {
      const mockUser = { id: '1', email: 'admin@gacp.th', name: 'Admin User', role: 'admin' };
      const mockToken = 'mock-token';

      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'token') return mockToken;
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      const TestCheckComponent = () => {
        const auth = useAuth();
        const [result, setResult] = React.useState<boolean | null>(null);

        return (
          <div>
            <div data-testid="isAuthenticated">{auth.isAuthenticated ? 'true' : 'false'}</div>
            <button onClick={() => setResult(auth.checkAuth())}>Check</button>
            <div data-testid="result">{result === null ? 'null' : result.toString()}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestCheckComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      await act(async () => {
        screen.getByText('Check').click();
      });

      expect(screen.getByTestId('result')).toHaveTextContent('true');
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should provide all auth context properties', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toBeInTheDocument();
        expect(screen.getByTestId('token')).toBeInTheDocument();
        expect(screen.getByTestId('isLoading')).toBeInTheDocument();
        expect(screen.getByTestId('isAuthenticated')).toBeInTheDocument();
      });

      // Check buttons (methods) are available
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.getByText('Check Auth')).toBeInTheDocument();
    });
  });

  describe('isAuthenticated property', () => {
    it('should be false initially', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });

    it('should be true after successful login', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });
    });

    it('should be false after logout', async () => {
      const mockUser = { id: '1', email: 'admin@gacp.th', name: 'Admin User', role: 'admin' };
      const mockToken = 'mock-token';

      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'token') return mockToken;
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      await act(async () => {
        screen.getByText('Logout').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });
  });
});
