import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import authService from '../authService';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from AuthService
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
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark that we've attempted a refresh
            
            try {
                // Try to refresh token
                const refreshToken = authService.getRefreshToken();
                if (refreshToken) {
                    const response = await apiClient.post('/api/v1/auth/refresh-token', {
                        refreshToken
                    });

                    if (response.data.success) {
                        // Update tokens using AuthService
                        const { accessToken, refreshToken } = response.data.metaData;
                        authService.setTokens(accessToken, refreshToken);

                        // Update the failed request's authorization header
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        
                        // Retry the original request
                        return apiClient(originalRequest);
                    }
                }
            } catch (refreshError) {
                // If refresh token fails, clear tokens and redirect to login
                // Don't try to call logout API since we're already having auth issues
                authService.clearTokens();
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        // If we get here, either it wasn't a 401 error or the refresh failed
        return Promise.reject(error);
    }
);

export default apiClient; 