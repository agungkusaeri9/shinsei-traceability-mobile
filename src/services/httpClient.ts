import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { getBaseUrl } from '../utils/baseUrl';

// Module-level token storage for reliable access in interceptor
let authToken: string | null = null;

// Create axios instance with default configuration
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
  if (baseUrl) {
    httpClient.defaults.baseURL = baseUrl;
  }
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Dynamically set baseURL if missing or empty
    if (!config.baseURL || config.baseURL === '') {
      const baseUrl = await getBaseUrl();
      if (baseUrl) {
        config.baseURL = baseUrl;
      }
    }
    // Attach token from module-level variable
    if (authToken) {
      config.headers.set('Authorization', `Bearer ${authToken}`);
    }
    return config;
  },
  error => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized. Please login again.');
    }
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  },
);

/**
 * Set Authorization token for all subsequent requests
 */
export const setAuthToken = (token: string | null): void => {
  authToken = token;
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
