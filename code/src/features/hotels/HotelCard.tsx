import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel } from '../../types/hotel';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api/apiService';

interface HotelCardProps {
  hotel: Hotel;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isCheckingFavourite, setIsCheckingFavourite] = useState(true);
  const [favouriteError, setFavouriteError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      checkFavouriteStatus();
    } else {
      setIsCheckingFavourite(false);
    }
  }, [isAuthenticated, hotel.id]);

  const checkFavouriteStatus = async () => {
    try {
      setFavouriteError(null);
      const response = await userService.checkFavourite('me', hotel.id);
      setIsFavourite(response.data.isFavourite);
    } catch (error) {
      console.error('Failed to check favourite status:', error);
      setFavouriteError('Unable to check favorite status');
    } finally {
      setIsCheckingFavourite(false);
    }
  };

  const handleClick = () => {
    navigate(`/hotels/${hotel.id}`);
  };

  const handleFavouriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      return;
    }

    try {
      setFavouriteError(null);
      if (isFavourite) {
        await userService.removeFavourite('me', hotel.id);
      } else {
        await userService.addFavourite('me', hotel.id);
      }
      setIsFavourite(!isFavourite);
    } catch (error: any) {
      if (error.response?.status === 400) {
        checkFavouriteStatus();
      } else {
        console.error('Failed to update favourite status:', error);
        setFavouriteError('Failed to update favorite status');
      }
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg 
                hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1
                cursor-pointer relative"
      onClick={handleClick}
    >
      {isAuthenticated && (
        <button
          onClick={handleFavouriteClick}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 
                   hover:bg-white dark:hover:bg-gray-700 transition-colors"
          title={favouriteError || (isFavourite ? "Remove from favourites" : "Add to favourites")}
        >
          {isCheckingFavourite ? (
            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg
              className={`h-5 w-5 ${favouriteError ? 'text-red-500' : (isFavourite ? 'text-red-500 fill-current' : 'text-gray-500')}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill={isFavourite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      )}
      <div className="relative">
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        {hotel.images && hotel.images.length > 0 ? (
          <img
            src={`https://media.hotelbeds.com/giata/${hotel.images[0]}`}
            alt={hotel.name}
            className="w-full h-48 object-cover"
            onLoad={() => setImageLoading(false)}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">No image available</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {hotel.customData?.name || hotel.name}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-gray-600 dark:text-gray-300">
            {hotel.customData?.city || hotel.city}, {hotel.customData?.countryCode || hotel.countryCode}
          </p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            hotel.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {(typeof hotel.status === 'string' ? hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1) : 'Pending')}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-400 text-sm mb-2">
          {hotel.customData?.category || hotel.category}
        </p>
        <p className="text-gray-700 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {hotel.customData?.description || hotel.description}
        </p>
      </div>
    </div>
  );
}; 