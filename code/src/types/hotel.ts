export interface Hotel {
  id: number;
  hotelBedsId?: number;
  name: string;
  description: string;
  address: string;
  postalCode: string;
  email: string;
  phones: {
    phoneNumber: string;
    phoneType: string;
  }[];
  city: string;
  countryCode: string;
  stateCode: string;
  destinationCode: string;
  zoneCode: string;
  latitude: number;
  longitude: number;
  category: string;
  images: string[];
  lastUpdated: string;
  status: string;
  customData: any;
  createdAt: string;
  updatedAt: string;
}

export interface HotelSearchParams {
  search: string;
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} 