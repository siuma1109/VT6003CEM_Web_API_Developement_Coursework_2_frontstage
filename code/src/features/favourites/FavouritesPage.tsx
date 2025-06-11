import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/api/apiService';
import { HotelCard } from '../hotels/HotelCard';
import { useAuth } from '../../context/AuthContext';
import { Hotel } from '../../types/hotel';

interface FavouriteHotel {
  id: number;
  hotelId: number;
  hotel: Hotel;
}

export const FavouritesPage: React.FC = () => {
  const [favourites, setFavourites] = useState<FavouriteHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchFavourites();
  }, [isAuthenticated, navigate]);

  const fetchFavourites = async () => {
    try {
      setLoading(true);
      const response = await userService.getFavourites('me');
      setFavourites(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load favourites. Please try again later.');
      console.error('Error fetching favourites:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            {error}
          </h2>
          <button
            onClick={fetchFavourites}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        My Favourite Hotels
      </h1>
      {favourites.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            You haven't added any hotels to your favourites yet.
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Browse Hotels
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((favourite) => (
            <HotelCard
              key={favourite.id}
              hotel={favourite.hotel}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 