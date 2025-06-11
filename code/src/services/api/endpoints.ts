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
    PROFILE: '/api/v1/users/me',
    UPDATE_PROFILE: '/api/v1/users/me',
    UPLOAD_AVATAR: '/api/v1/users/me/avatar',
    GET_FAVOURITES: (userId: string | number) => `/api/v1/users/${userId}/favourites`,
    ADD_FAVOURITE: (userId: string | number) => `/api/v1/users/${userId}/favourites`,
    REMOVE_FAVOURITE: (userId: string | number) => `/api/v1/users/${userId}/favourites`,
    CHECK_FAVOURITE: (userId: string | number) => `/api/v1/users/${userId}/favourites/check`,
  },

  // Signup Codes endpoints
  SIGNUP_CODES: {
    GENERATE: '/api/v1/sign-up-codes/generate',
    LIST: '/api/v1/sign-up-codes',
    DELETE: (id: string) => `/api/v1/sign-up-codes/${id}`,
  },

  // Roles endpoints
  ROLES: {
    LIST: '/api/v1/roles',
  },

  // Hotel endpoints
  HOTELS: {
    LIST: '/api/v1/hotels',
    DETAIL: (id: string | number) => `/api/v1/hotels/${id}`,
    CREATE: '/api/v1/hotels',
    UPDATE: (id: string | number) => `/api/v1/hotels/${id}`,
    DELETE: (id: string | number) => `/api/v1/hotels/${id}`,
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