/**
 * API Configuration for GACP Platform
 * Connects Next.js frontend with Express.js backend
 */

import axios from 'axios';

// Backend API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('gacp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('gacp_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    profile: '/api/auth/profile',
    logout: '/api/auth/logout'
  },

  // Dashboard
  dashboard: {
    farmer: '/api/farmer/dashboard',
    dtam: '/api/dtam/dashboard',
    auditor: '/api/auditor/dashboard'
  },

  // Applications
  applications: {
    list: '/api/applications',
    create: '/api/applications',
    get: (id: string) => `/api/applications/${id}`,
    update: (id: string) => `/api/applications/${id}`,
    delete: (id: string) => `/api/applications/${id}`
  },

  // Certificates
  certificates: {
    generate: (id: string) => `/api/certificates/generate/${id}`,
    download: (id: string) => `/api/certificates/download/${id}`,
    verify: (number: string) => `/verify/${number}`
  },

  // Health Check
  health: '/health'
};

export default api;
