import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../../components/SearchBar';
import { Pagination } from '../../components/Pagination';
import { HotelCard } from './HotelCard';
import { hotelService } from '../../services/api/hotelService';
import { userService, Role } from '../../services/api/apiService';
import { Hotel, HotelSearchParams } from '../../types/hotel';
import authService from '../../services/authService';

const SkeletonHotelCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse">
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4" />
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
      </div>
    </div>
  );
};

// Custom debounce hook
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const HotelList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [newHotel, setNewHotel] = useState({
    name: '',
    description: '',
    address: '',
    postalCode: '',
    city: '',
    countryCode: '',
    category: '',
    status: 'pending',
    email: '',
    phones: [],
    stateCode: '',
    destinationCode: '',
    zoneCode: '',
    latitude: 0,
    longitude: 0,
    images: [],
    customData: {},
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const pageSize = 6;
  const currentPage = Number(searchParams.get('page')) || 1;
  const debouncedSearchQuery = useDebounce(searchInput, 500);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (isAuthenticated) {
          const response = await userService.getProfile();
          setUserRoles(response.data.roles);
        } else {
          setUserRoles([]);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setUserRoles([]);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]);

  // Add effect to listen for authentication changes
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated());
    };

    // Check auth state on mount
    checkAuth();

    // Set up interval to check auth state periodically
    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePageChange = (page: number) => {
    setSearchParams(prev => {
      prev.set('page', page.toString());
      return prev;
    });
  };

  const handleSearch = (query: string) => {
    setSearchInput(query);
  };

  useEffect(() => {
    if (debouncedSearchQuery !== searchParams.get('search')) {
      setSearchParams(prev => {
        prev.set('search', debouncedSearchQuery);
        prev.set('page', '1'); // Reset to first page on new search
        return prev;
      });
    }
  }, [debouncedSearchQuery, setSearchParams, searchParams]);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const params: HotelSearchParams = {
          search: debouncedSearchQuery,
          page: currentPage,
          pageSize,
        };
        const response = await hotelService.getHotels(params);
        setHotels(response.data);
        setTotalPages(response.paginate.last_page);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [debouncedSearchQuery, currentPage]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!newHotel.name.trim()) {
      errors.name = 'Hotel name is required';
    }
    if (!newHotel.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newHotel.email)) {
      errors.email = 'Please enter a valid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateHotel = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await hotelService.createHotel(newHotel);
      setHotels(prev => [response, ...prev]);
      setIsCreateModalOpen(false);
      setNewHotel({
        name: '',
        description: '',
        address: '',
        postalCode: '',
        city: '',
        countryCode: '',
        category: '',
        status: 'pending',
        email: '',
        phones: [],
        stateCode: '',
        destinationCode: '',
        zoneCode: '',
        latitude: 0,
        longitude: 0,
        images: [],
        customData: {},
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setFormErrors({});
    } catch (error: any) {
      console.error('Error creating hotel:', error);
      if (error.response?.data?.errors) {
        setFormErrors({ submit: error.response.data.errors });
      } else {
        setFormErrors({ submit: 'Failed to create hotel. Please try again.' });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewHotel(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const canEdit = userRoles.some(role => role.name === 'admin' || role.name === 'travel_agency_operator');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Find Your Perfect Stay
        </h1>
        {canEdit && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Add New Hotel
          </button>
        )}
      </div>
      
      <SearchBar
        value={searchInput}
        onChange={handleSearch}
        placeholder="Search by hotel name..."
      />
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <SkeletonHotelCard key={index} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Create Hotel Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Add New Hotel
            </h2>
            {formErrors.submit && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-200">
                {formErrors.submit}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hotel Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newHotel.name}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.name ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newHotel.email}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.email ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newHotel.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={newHotel.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={newHotel.postalCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={newHotel.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country Code
                </label>
                <input
                  type="text"
                  id="countryCode"
                  name="countryCode"
                  value={newHotel.countryCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={newHotel.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={newHotel.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setFormErrors({});
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateHotel}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Hotel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 