// API endpoints configuration
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH_TOKEN: '/api/v1/auth/refresh-token',
    CHECK_EMAIL_EXISTS: '/api/v1/auth/check-email-exists',
  },
  
  // User endpoints
  USER: {
    PROFILE: 'api/v1/users/me',
    UPDATE_PROFILE: 'api/v1/users/me',
  },

  // Hotel endpoints
  HOTELS: {
    LIST: '/api/v1/hotels',
    DETAIL: (id: string) => `/api/v1/hotels/${id}`,
    CREATE: '/api/v1/hotels',
    UPDATE: (id: string) => `/api/v1/hotels/${id}`,
    DELETE: (id: string) => `/api/v1/hotels/${id}`,
  },
  
  // Add more endpoint categories as needed
  // Example:
  // PRODUCTS: {
  //   LIST: '/products',
  //   DETAIL: (id: string) => `/products/${id}`,
  //   CREATE: '/products',
  //   UPDATE: (id: string) => `/products/${id}`,
  //   DELETE: (id: string) => `/products/${id}`,
  // },
} as const; 