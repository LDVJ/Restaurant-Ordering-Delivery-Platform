import axios from 'axios';
import toast from 'react-hot-toast';
import { STORAGE_KEYS, ROLE_HOME_PATHS } from '../utils/constants';

/**
 * Axios Client Configuration
 * Sourced from Section 6 of Frontend Guide
 */

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token if present
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & 403 globally
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const requestUrl = error.config ? error.config.url : '';

    // Ignore 401 on login endpoint (let LoginPage show invalid credentials error)
    const isLoginRequest = requestUrl.includes('/auth/login');

    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.CART);

      toast.error('Your session expired. Please log in again.');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error('You do not have access to that.');

      let homeRoute = '/login';
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          const user = JSON.parse(storedUser);
          homeRoute = ROLE_HOME_PATHS[user.role] || '/login';
        }
      } catch {
        // Fallback to /login
      }

      if (window.location.pathname !== homeRoute) {
        window.location.href = homeRoute;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
