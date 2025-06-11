import axios from 'axios';
import authService from './authService';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Dispatch a custom event to show auth modal
        const authRequiredEvent = new CustomEvent('authRequired', {
          detail: { 
            message: 'Please login to continue',
            returnUrl: window.location.pathname
          }
        });
        window.dispatchEvent(authRequiredEvent);

        // Wait for login to complete (this will be handled by the auth modal)
        return new Promise((resolve) => {
          const handleAuthSuccess = () => {
            window.removeEventListener('authSuccess', handleAuthSuccess);
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${authService.getAccessToken()}`;
            resolve(axiosInstance(originalRequest));
          };
          window.addEventListener('authSuccess', handleAuthSuccess);
        });
      } catch (refreshError) {
        // If refresh token fails, logout the user
        authService.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 