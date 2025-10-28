import axios from 'axios';

// Create axios instance with defaults
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth tokens, etc
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Network error handling with automatic retry
    if (error.message.includes('Network Error') && !originalRequest._retry) {
      originalRequest._retry = true;

      // Wait 2 seconds and retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      return api(originalRequest);
    }

    // Handle 401 unauthorized (expired token)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token here if you have refresh token flow
        // const refreshResponse = await api.post('/auth/refresh');
        // Store new token
        // localStorage.setItem('auth_token', refreshResponse.data.token);
        // Retry original request
        // return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Create wrapped API methods with retry and offline handling
const apiClient = {
  // GET request with retry
  async get(url, config = {}) {
    try {
      return await api.get(url, config);
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },

  // POST request with offline support
  async post(url, data, config = {}) {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      // If offline, store in local queue
      if (error.message.includes('Network Error')) {
        this.storeOfflineAction('post', url, data);
      }

      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  },

  // PUT request
  async put(url, data, config = {}) {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      if (error.message.includes('Network Error')) {
        this.storeOfflineAction('put', url, data);
      }
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  },

  // Store offline actions for later sync
  storeOfflineAction(method, url, data) {
    const offlineActions = JSON.parse(localStorage.getItem('offline_actions') || '[]');
    offlineActions.push({
      method,
      url,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('offline_actions', JSON.stringify(offlineActions));
    console.log('Action stored for offline use');
  },

  // Try to sync offline actions
  async syncOfflineActions() {
    const offlineActions = JSON.parse(localStorage.getItem('offline_actions') || '[]');

    if (offlineActions.length === 0) return;

    console.log(`Attempting to sync ${offlineActions.length} offline actions`);

    const completedActions = [];

    for (const action of offlineActions) {
      try {
        await api[action.method](action.url, action.data);
        completedActions.push(action);
        console.log(`Successfully synced: ${action.method} ${action.url}`);
      } catch (error) {
        console.error(`Failed to sync: ${action.method} ${action.url}`, error);
      }
    }

    // Remove completed actions
    const remaining = offlineActions.filter(
      action =>
        !completedActions.some(
          completed =>
            completed.url === action.url &&
            completed.method === action.method &&
            completed.timestamp === action.timestamp
        )
    );

    localStorage.setItem('offline_actions', JSON.stringify(remaining));
    return completedActions.length;
  }
};

// Add auto sync on online event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online, attempting to sync');
    apiClient.syncOfflineActions();
  });
}

export default apiClient;
