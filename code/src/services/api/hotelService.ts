import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import { Hotel, HotelSearchParams } from '../../types/hotel';
import { ApiResponse, ChatRoom } from './apiService';

// Types
export interface HotelSearchResponse {
  data: Hotel[];
  paginate: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface HotelResponse {
  status: number;
  success: boolean;
  message: string;
  data: Hotel;
}

// Hotel service methods
export const hotelService = {
  // Get all hotels with pagination
  getHotels: async (params: HotelSearchParams): Promise<HotelSearchResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.HOTELS.LIST, {
      params: {
        page: params.page,
        per_page: params.pageSize,
        search: params.search,
      },
    });
    return response.data;
  },

  // Get hotel by ID
  getHotelById: async (id: string): Promise<HotelResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.HOTELS.DETAIL(id));
    return response.data;
  },

  // Create new hotel (admin only)
  createHotel: async (hotelData: Omit<Hotel, 'id'>): Promise<HotelResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.HOTELS.CREATE, hotelData);
    return response.data;
  },

  // Update hotel (admin only)
  updateHotel: async (id: string, hotelData: Partial<Hotel>): Promise<HotelResponse> => {
    const response = await apiClient.put(API_ENDPOINTS.HOTELS.UPDATE(id), hotelData);
    return response.data;
  },

  // Delete hotel (admin only)
  deleteHotel: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.HOTELS.DELETE(id));
  },

  getChatRoom: async (id: string): Promise<ApiResponse<ChatRoom>> => {
    const response = await apiClient.get(API_ENDPOINTS.HOTELS.CHATROOM(id));
    return response.data;
  },
}; 