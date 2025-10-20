import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API base configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token to all requests
apiClient.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    // Handle auth errors
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        window.location.href = '/login?expired=true';
      }
    }

    // Network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Generic API service
export class ApiService {
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  static async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  static async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  private static handleError(error: AxiosError): Error {
    if (error.response?.data && typeof error.response.data === 'object') {
      // API error with details
      const serverError = error.response.data as any;
      return new Error(serverError.message || 'Server error occurred');
    }
    // Network or other error
    return new Error(error.message || 'Unknown error occurred');
  }
}

// API modules for specific services
export const AuthApi = {
  login: (credentials: { username: string; password: string }) =>
    ApiService.post('/auth/login', credentials),

  register: (userData: any) => ApiService.post('/auth/register', userData),

  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    ApiService.post('/auth/change-password', data),

  forgotPassword: (email: string) => ApiService.post('/auth/forgot-password', { email })
};

export const UserApi = {
  getCurrentUser: () => ApiService.get('/auth/me'),

  getUsers: (params?: any) => ApiService.get('/users', { params }),

  getUserById: (id: string) => ApiService.get(`/users/${id}`),

  createUser: (userData: any) => ApiService.post('/users', userData),

  updateUser: (id: string, userData: any) => ApiService.put(`/users/${id}`, userData),

  deleteUser: (id: string) => ApiService.delete(`/users/${id}`)
};

export const ApplicationApi = {
  getAll: (params?: any) => ApiService.get('/applications', { params }),

  getById: (id: string) => ApiService.get(`/applications/${id}`),

  create: (data: any) => ApiService.post('/applications', data),

  update: (id: string, data: any) => ApiService.put(`/applications/${id}`, data),

  updateStatus: (id: string, data: { status: string; notes?: string }) =>
    ApiService.put(`/applications/${id}/status`, data),

  delete: (id: string) => ApiService.delete(`/applications/${id}`),

  getHistory: (id: string) => ApiService.get(`/applications/${id}/history`)
};

export const FarmApi = {
  getAll: (params?: any) => ApiService.get('/farms', { params }),

  getById: (id: string) => ApiService.get(`/farms/${id}`),

  create: (data: any) => ApiService.post('/farms', data),

  update: (id: string, data: any) => ApiService.put(`/farms/${id}`, data),

  delete: (id: string) => ApiService.delete(`/farms/${id}`),

  getActivities: (id: string) => ApiService.get(`/farms/${id}/activities`),

  addActivity: (id: string, data: any) => ApiService.post(`/farms/${id}/activities`, data)
};

export const InspectionApi = {
  getAll: (params?: any) => ApiService.get('/inspections', { params }),

  getById: (id: string) => ApiService.get(`/inspections/${id}`),

  create: (data: any) => ApiService.post('/inspections', data),

  update: (id: string, data: any) => ApiService.put(`/inspections/${id}`, data),

  submitReport: (id: string, data: any) => ApiService.post(`/inspections/${id}/report`, data)
};

// Additional APIs for new services
export const TraceabilityApi = {
  generateQR: (productId: string) => ApiService.post('/traceability/qr', { productId }),

  getProductInfo: (qrCode: string) => ApiService.get(`/traceability/product/${qrCode}`)
};

export const SurveyApi = {
  getSurveys: () => ApiService.get('/surveys'),

  getSurveyById: (id: string) => ApiService.get(`/surveys/${id}`),

  submitResponse: (id: string, data: any) => ApiService.post(`/surveys/${id}/responses`, data)
};

export const StandardApi = {
  getComparison: () => ApiService.get('/standards/comparison'),

  getStandardDetails: (standard: string) => ApiService.get(`/standards/${standard}`)
};

export const ReportApi = {
  getDashboardStats: () => ApiService.get('/reports/dashboard'),

  getApplicationStats: (params?: any) => ApiService.get('/reports/applications', { params }),

  getFarmStats: (params?: any) => ApiService.get('/reports/farms', { params }),

  exportReports: (type: string, params?: any) =>
    ApiService.get(`/reports/export/${type}`, {
      params,
      responseType: 'blob'
    })
};
