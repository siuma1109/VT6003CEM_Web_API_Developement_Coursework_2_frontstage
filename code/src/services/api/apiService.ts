import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import { FavouriteHotel } from '../../types/hotel';

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
  signUpCode?: string;
}

export interface CheckEmailResponse {
  exists: boolean;
}

export interface Role {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

export interface AuthResponse {
  user: UserData;
  metaData: {
    accessToken: string;
    refreshToken: string;
  };
}

// Signup Code types
export interface SignupCode {
  id: number;
  code: string;
  role: {
    id: number;
    name: string;
  };
  generatedBy: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  usedAt: string | null;
  usedBy: string | null;
}

// Chat Room types
export interface ChatRoom {
  id: number;
  userId: number;
  hotelId: number;
  newMessageTime: string;
  createdAt: string;
  updatedAt: string;
  hotel?: {
    id: number;
    name: string;
    images?: string[];
  };
  user?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: number;
  chatRoomId: number;
  senderId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface ChatRoomListResponse {
  status: number;
  success: boolean;
  message: string;
  paginate: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  data: ChatRoom[];
}

export interface ChatMessageListResponse {
  success: boolean;
  message: string;
  paginate: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  data: ChatMessage[];
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

  uploadAvatar: async (formData: FormData): Promise<ApiResponse<AuthResponse['user']>> => {
    const response = await apiClient.post(API_ENDPOINTS.USER.UPLOAD_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFavourites: async (userId: string | number): Promise<ApiResponse<FavouriteHotel[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.USER.GET_FAVOURITES(userId));
    return response.data;
  },

  addFavourite: async (userId: string | number, hotelId: number): Promise<ApiResponse<FavouriteHotel>> => {
    const response = await apiClient.post(API_ENDPOINTS.USER.ADD_FAVOURITE(userId), { hotelId });
    return response.data;
  },

  removeFavourite: async (userId: string | number, hotelId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(API_ENDPOINTS.USER.REMOVE_FAVOURITE(userId), { data: { hotelId } });
    return response.data;
  },

  checkFavourite: async (userId: string | number, hotelId: number): Promise<ApiResponse<{ isFavourite: boolean }>> => {
    const response = await apiClient.get(API_ENDPOINTS.USER.CHECK_FAVOURITE(userId), { params: { hotelId } });
    return response.data;
  },
};

// Signup Code service methods
export const signupCodeService = {
  generateCode: async (roleId: number): Promise<ApiResponse<SignupCode>> => {
    const response = await apiClient.post(API_ENDPOINTS.SIGNUP_CODES.GENERATE, { roleId });
    return response.data;
  },

  listCodes: async (): Promise<ApiResponse<SignupCode[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.SIGNUP_CODES.LIST);
    return response.data;
  },

  deleteCode: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(API_ENDPOINTS.SIGNUP_CODES.DELETE(id.toString()));
    return response.data;
  },
};

// Roles service methods
export const rolesService = {
  listRoles: async (): Promise<ApiResponse<Role[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.LIST);
    return response.data;
  },
};

// Chat Room service methods
export const chatRoomService = {
  getChatRooms: async (params?: { page?: number; limit?: number; search?: string }): Promise<ChatRoomListResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.CHATROOMS.LIST, { params });
    return response.data;
  },

  createChatRoom: async (hotelId: number): Promise<ApiResponse<ChatRoom>> => {
    const response = await apiClient.post(API_ENDPOINTS.CHATROOMS.LIST, { hotelId });
    return response.data;
  },

  getChatRoom: async (id: number): Promise<ApiResponse<ChatRoom>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.CHATROOMS.LIST}/${id}`);
    return response.data;
  },

  updateChatRoom: async (id: number, hotelId: number): Promise<ApiResponse<ChatRoom>> => {
    const response = await apiClient.put(`${API_ENDPOINTS.CHATROOMS.LIST}/${id}`, { hotelId });
    return response.data;
  },

  deleteChatRoom: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.CHATROOMS.LIST}/${id}`);
    return response.data;
  },

  getMessages: async (chatRoomId: number, params?: { page?: number; limit?: number }): Promise<ChatMessageListResponse> => {
    const response = await apiClient.get(`${API_ENDPOINTS.CHATROOMS.LIST}/${chatRoomId}/messages`, { params });
    return response.data;
  },

  createMessage: async (chatRoomId: number, content: string): Promise<ApiResponse<ChatMessage>> => {
    const response = await apiClient.post(`${API_ENDPOINTS.CHATROOMS.LIST}/${chatRoomId}`, { content });
    return response.data;
  },
}; 