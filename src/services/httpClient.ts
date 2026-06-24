import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getBaseUrl } from '../utils/baseUrl';

// Create axios instance with default base URL
const httpClient: AxiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Initialize base URL from storage
export const initializeHttpClient = async (): Promise<void> => {
  const baseUrl = await getBaseUrl();
  httpClient.defaults.baseURL = baseUrl;
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Token akan diset dari authStore / useAuth hook
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token, redirect to login
      console.warn('Unauthorized. Please login again.');
    }
    return Promise.reject(error);
  },
);

/**
 * Set Authorization token for all subsequent requests
 */
export const setAuthToken = (token: string | null): void => {
  if (token) {
    httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete httpClient.defaults.headers.common['Authorization'];
  }
};

/**
 * Update base URL for all requests
 */
export const updateBaseUrl = (url: string): void => {
  httpClient.defaults.baseURL = url;
};

export default httpClient;
