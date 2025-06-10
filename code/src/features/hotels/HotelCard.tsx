import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel } from '../../types/hotel';

interface HotelCardProps {
  hotel: Hotel;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/hotels/${hotel.id}`);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg 
                hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1
                cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative">
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        <img
          src={`https://media.hotelbeds.com/giata/${hotel.images[0]}`}
          alt={hotel.name}
          className="w-full h-48 object-cover"
          onLoad={() => setImageLoading(false)}
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {hotel.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          {hotel.city}, {hotel.countryCode}
        </p>
        <p className="text-gray-700 dark:text-gray-400 text-sm mb-2">
          {hotel.category}
        </p>
        <p className="text-gray-700 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {hotel.description}
        </p>
      </div>
    </div>
  );
}; 