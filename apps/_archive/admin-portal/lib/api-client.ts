import { createApiClient } from '@gacp/utils';

const apiClient = createApiClient({
  authTokenKey: 'admin_token',
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('dtam_token');
      localStorage.removeItem('admin_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  },
});

export default apiClient;
