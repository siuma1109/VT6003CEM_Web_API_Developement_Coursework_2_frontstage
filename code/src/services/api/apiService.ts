import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';

// Generic response type
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
  metaData: {
    accessToken: string;
    refreshToken: string;
  };
}

// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface CheckEmailResponse {
  exists: boolean;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserData;
  metaData: {
    accessToken: string;
    refreshToken: string;
  };
}

// Auth service methods
export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<UserData>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<UserData>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  refreshToken: async (): Promise<ApiResponse<{ accessToken: string }>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
    return response.data;
  },

  checkEmailExists: async (email: string): Promise<ApiResponse<CheckEmailResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.CHECK_EMAIL_EXISTS, { email });
    return response.data;
  },
};

// User service methods
export const userService = {
  getProfile: async (): Promise<ApiResponse<AuthResponse['user']>> => {
    const response = await apiClient.get(API_ENDPOINTS.USER.PROFILE);
    return response.data;
  },

  updateProfile: async (data: Partial<AuthResponse['user']>): Promise<ApiResponse<AuthResponse['user']>> => {
    const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
    return response.data;
  },
}; 