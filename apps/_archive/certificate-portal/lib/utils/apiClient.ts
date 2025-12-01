/**
 * API Client with Retry and Offline Queue Support
 *
 * Features:
 * - Exponential backoff retry
 * - Offline queue (localStorage)
 * - Auto-sync when online
 * - Token management
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cert_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors with retry
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Handle 401 - Redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('cert_token');

      // Only redirect if we're in the browser
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    // Handle retryable errors with exponential backoff
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    const isRetryable =
      error.message.includes('Network Error') ||
      error.message.includes('timeout') ||
      (error.response?.status && retryableStatuses.includes(error.response.status));

    if (isRetryable && (!originalRequest._retryCount || originalRequest._retryCount < 3)) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      // Exponential backoff: 1s, 2s, 4s
      const delay = 1000 * Math.pow(2, originalRequest._retryCount - 1);

      console.log(`Retrying request (attempt ${originalRequest._retryCount}/3) after ${delay}ms`);

      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Offline queue management
interface OfflineAction {
  method: string;
  url: string;
  data?: any;
  timestamp: string;
}

export const offlineQueue = {
  /**
   * Store action in offline queue
   */
  store(method: string, url: string, data?: any): void {
    const actions = this.getAll();
    actions.push({
      method,
      url,
      data,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('offline_actions', JSON.stringify(actions));
    console.log(`[Offline Queue] Stored ${method} ${url}`);
  },

  /**
   * Get all offline actions
   */
  getAll(): OfflineAction[] {
    try {
      const actionsJson = localStorage.getItem('offline_actions');
      return actionsJson ? JSON.parse(actionsJson) : [];
    } catch {
      return [];
    }
  },

  /**
   * Clear all offline actions
   */
  clear(): void {
    localStorage.setItem('offline_actions', JSON.stringify([]));
  },

  /**
   * Sync all offline actions
   */
  async sync(): Promise<number> {
    const actions = this.getAll();

    if (actions.length === 0) {
      return 0;
    }

    console.log(`[Offline Queue] Syncing ${actions.length} actions...`);

    const completedActions: OfflineAction[] = [];

    for (const action of actions) {
      try {
        await api.request({
          method: action.method,
          url: action.url,
          data: action.data,
        });

        completedActions.push(action);
        console.log(`[Offline Queue] Synced ${action.method} ${action.url}`);
      } catch (error) {
        console.error(`[Offline Queue] Failed to sync ${action.method} ${action.url}:`, error);
      }
    }

    // Remove completed actions
    const remaining = actions.filter(
      (action) =>
        !completedActions.some(
          (completed) =>
            completed.url === action.url &&
            completed.method === action.method &&
            completed.timestamp === action.timestamp
        )
    );

    localStorage.setItem('offline_actions', JSON.stringify(remaining));

    console.log(`[Offline Queue] Synced ${completedActions.length}/${actions.length} actions`);

    return completedActions.length;
  },
};

// Auto-sync when browser goes online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Network] Back online - attempting to sync offline queue');
    offlineQueue.sync();
  });
}

export default api;
