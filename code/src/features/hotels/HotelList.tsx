import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../../components/SearchBar';
import { Pagination } from '../../components/Pagination';
import { HotelCard } from './HotelCard';
import { hotelService } from '../../services/api/hotelService';
import { Hotel, HotelSearchParams } from '../../types/hotel';

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

  const pageSize = 6;
  const currentPage = Number(searchParams.get('page')) || 1;
  const debouncedSearchQuery = useDebounce(searchInput, 500); // 500ms delay

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

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        Find Your Perfect Stay
      </h1>
      
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
    </div>
  );
}; 