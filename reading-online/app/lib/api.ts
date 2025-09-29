import axios, { AxiosError, AxiosResponse } from 'axios';
import { JwtPayload } from 'jwt-decode';
import { isValidJwtPayload, ParsedJwtPayload, parseJwtPayload } from '../types';

const BASE_API_URL = 'http://localhost:5244';

// API Configuration constants
export const API_CONFIG = {
  baseURL: `${BASE_API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

export const apiClient = axios.create(API_CONFIG);

// Health check function
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_API_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};

// Token management functions
export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  },
  
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },
  
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },
  
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
      const currentTime = Date.now() / 1000;
      // Ensure exp exists and is a number
      return typeof payload.exp === 'number' ? payload.exp < currentTime : true;
    } catch {
      return true;
    }
  },
  
  getTokenPayload: (token: string): ParsedJwtPayload | null => {
    try {
      const rawPayload = JSON.parse(atob(token.split('.')[1]));
      // Use type guard to validate payload structure
      if (isValidJwtPayload(rawPayload)) {
        // Convert to parsed format với short claim names
        return parseJwtPayload(rawPayload);
      }
      return null;
    } catch {
      return null;
    }
  }
};

// Request interceptor để tự động thêm token
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token && !tokenManager.isTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor để handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenManager.removeToken();
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);