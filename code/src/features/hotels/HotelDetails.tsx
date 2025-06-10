import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import { hotelService } from '../../services/api/hotelService';
import { Hotel } from '../../types/hotel';
import { ChatRoom } from '../../components/ChatRoom';

const SkeletonHotelDetails: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
      </div>
    </div>
  );
};

export const HotelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await hotelService.getHotelById(id);
        setHotel(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load hotel details. Please try again later.');
        console.error('Error fetching hotel details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id]);

  if (loading) {
    return <SkeletonHotelDetails />;
  }

  if (error || !hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            {error || 'Hotel not found'}
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const hasImages = hotel.images && hotel.images.length > 0;
  const galleryImages = hasImages
    ? hotel.images.map(image => ({
        original: `https://media.hotelbeds.com/giata/${image}`,
        thumbnail: `https://media.hotelbeds.com/giata/${image}`,
      }))
    : [];

  const handleSendMessage = (message: string) => {
    // Here you can implement the actual message sending logic
    console.log('Sending message to hotel:', message);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Image Gallery */}
      {hasImages && (
        <div className="mb-8">
          <div className="rounded-lg overflow-hidden">
            <ImageGallery
              items={galleryImages}
              showPlayButton={false}
              showFullscreenButton={true}
              showNav={true}
              showThumbnails={true}
              thumbnailPosition="bottom"
              slideInterval={3000}
              slideOnThumbnailOver={true}
              additionalClass="custom-gallery"
              useBrowserFullscreen={true}
              showIndex={true}
              lazyLoad={true}
              renderItem={(item) => (
                <div className="image-gallery-image-container">
                  <img
                    src={item.original}
                    alt={hotel.name}
                    className="image-gallery-image"
                  />
                </div>
              )}
            />
          </div>
        </div>
      )}

      {/* Hotel Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {hotel.name}
          </h1>
          <div className="flex items-center mb-4">
            <span className="text-gray-600 dark:text-gray-300">
              {hotel.category} • {hotel.city}, {hotel.countryCode}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {hotel.address}, {hotel.postalCode}
          </p>
          <div className="prose dark:prose-invert max-w-none mb-6">
            <p>{hotel.description}</p>
          </div>
          
          {/* Send Message Button */}
          <div className="mb-6">
            <button
              onClick={() => setIsChatOpen(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              Send Message
            </button>
          </div>

          {/* Chat Room */}
          {hotel && (
            <ChatRoom
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              title={`Chat with ${hotel.name}`}
              onSendMessage={handleSendMessage}
            />
          )}
          
          {/* Contact Information */}
          <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Email:</span> {hotel.email}
                </p>
                {hotel.phones && hotel.phones.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">Phone Numbers:</p>
                    {hotel.phones.map((phone, index) => (
                      <p key={index} className="text-gray-600 dark:text-gray-300">
                        {phone.phoneType}: {phone.phoneNumber}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Location:</span> {hotel.latitude}, {hotel.longitude}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Destination Code:</span> {hotel.destinationCode}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Zone Code:</span> {hotel.zoneCode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 