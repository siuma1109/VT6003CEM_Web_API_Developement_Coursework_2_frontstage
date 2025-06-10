import { Hotel, HotelSearchParams, PaginatedResponse } from '../types/hotel';

// Mock data
const mockHotels: Hotel[] = [
  {
    id: 1,
    hotelBedsId: 1001,
    name: 'Grand Hotel',
    description: 'Luxury hotel in the heart of the city',
    address: '123 Main St',
    postalCode: '10001',
    email: 'info@grandhotel.com',
    phones: [{ phoneNumber: '+1234567890', phoneType: 'PHONEHOTEL' }],
    city: 'New York',
    countryCode: 'US',
    stateCode: 'NY',
    destinationCode: 'NYC',
    zoneCode: '1',
    latitude: 40.7128,
    longitude: -74.0060,
    category: '4EST',
    images: ['https://source.unsplash.com/800x600/?hotel'],
    lastUpdated: new Date().toISOString(),
    status: 'active',
    customData: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    hotelBedsId: 1002,
    name: 'Seaside Resort',
    description: 'Beautiful beachfront resort',
    address: '456 Beach Ave',
    postalCode: '33139',
    email: 'info@seasideresort.com',
    phones: [{ phoneNumber: '+1987654321', phoneType: 'PHONEHOTEL' }],
    city: 'Miami',
    countryCode: 'US',
    stateCode: 'FL',
    destinationCode: 'MIA',
    zoneCode: '2',
    latitude: 25.7617,
    longitude: -80.1918,
    category: '5EST',
    images: ['https://source.unsplash.com/800x600/?resort'],
    lastUpdated: new Date().toISOString(),
    status: 'active',
    customData: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    hotelBedsId: 1003,
    name: 'Mountain View Lodge',
    description: 'Cozy mountain retreat',
    address: '789 Mountain Rd',
    postalCode: '80201',
    email: 'info@mountainlodge.com',
    phones: [{ phoneNumber: '+1122334455', phoneType: 'PHONEHOTEL' }],
    city: 'Denver',
    countryCode: 'US',
    stateCode: 'CO',
    destinationCode: 'DEN',
    zoneCode: '3',
    latitude: 39.7392,
    longitude: -104.9903,
    category: '3EST',
    images: ['https://source.unsplash.com/800x600/?lodge'],
    lastUpdated: new Date().toISOString(),
    status: 'active',
    customData: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const hotelService = {
  async searchHotels(params: HotelSearchParams): Promise<PaginatedResponse<Hotel>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const { search, page, pageSize } = params;
    
    // Filter hotels based on search query
    const filteredHotels = mockHotels.filter(hotel => 
      hotel.name.toLowerCase().includes(search.toLowerCase()) ||
      hotel.city.toLowerCase().includes(search.toLowerCase())
    );

    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedHotels = filteredHotels.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredHotels.length / pageSize);

    return {
      data: paginatedHotels,
      total: filteredHotels.length,
      page,
      pageSize,
      totalPages
    };
  }
}; 