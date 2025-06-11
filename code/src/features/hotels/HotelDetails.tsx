import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import { hotelService } from '../../services/api/hotelService';
import { userService, Role, chatRoomService, ChatMessage } from '../../services/api/apiService';
import { Hotel } from '../../types/hotel';
import { ChatRoom } from '../../components/ChatRoom';
import { useAuth } from '../../context/AuthContext';

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
  const { isAuthenticated } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedHotel, setEditedHotel] = useState<Partial<Hotel>>({});
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isCheckingFavourite, setIsCheckingFavourite] = useState(true);
  const [favouriteError, setFavouriteError] = useState<string | null>(null);
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const fetchHotelDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await hotelService.getHotelById(id);
      setHotel(response.data);
      setEditedHotel({
        ...response.data,
        name: response.data.customData?.name || response.data.name,
        description: response.data.customData?.description || response.data.description,
        address: response.data.customData?.address || response.data.address,
        postalCode: response.data.customData?.postalCode || response.data.postalCode,
        category: response.data.customData?.category || response.data.category,
        city: response.data.customData?.city || response.data.city,
        countryCode: response.data.customData?.countryCode || response.data.countryCode,
      });
      setError(null);
    } catch (err) {
      setError('Failed to load hotel details. Please try again later.');
      console.error('Error fetching hotel details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoadingUser(true);
      if (isAuthenticated) {
        const response = await userService.getProfile();
        setUserRoles(response.data.roles);
      } else {
        setUserRoles([]);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUserRoles([]);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const checkFavouriteStatus = async () => {
    if (!isAuthenticated) {
      setIsCheckingFavourite(false);
      return;
    }

    try {
      setFavouriteError(null);
      const response = await userService.checkFavourite('me', Number(id));
      setIsFavourite(response.data.isFavourite);
    } catch (error) {
      console.error('Failed to check favourite status:', error);
      setFavouriteError('Unable to check favorite status');
    } finally {
      setIsCheckingFavourite(false);
    }
  };

  const handleFavouriteClick = async () => {
    if (!isAuthenticated || !id) return;

    try {
      setFavouriteError(null);
      if (isFavourite) {
        await userService.removeFavourite('me', Number(id));
      } else {
        await userService.addFavourite('me', Number(id));
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

  // Effect to handle auth state changes
  useEffect(() => {
    fetchUserProfile();
    fetchHotelDetails();
    checkFavouriteStatus();
  }, [id, isAuthenticated]);

  const handleUpdateHotel = async () => {
    if (!id || !editedHotel) return;

    try {
      const response = await hotelService.updateHotel(id, editedHotel);
      setHotel(response.data);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Failed to update hotel details. Please try again later.');
      console.error('Error updating hotel:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedHotel(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteHotel = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        await hotelService.deleteHotel(id);
        navigate('/');
      } catch (err) {
        setError('Failed to delete hotel. Please try again later.');
        console.error('Error deleting hotel:', err);
      }
    }
  };

  const canEdit = isAuthenticated && userRoles.some(role => role.name === 'admin' || role.name === 'travel_agency_operator');

  const handleSendMessage = async (message: string) => {
    if (!hotel || !chatRoomId) return;

    try {
      setSendingMessage(true);
      const response = await chatRoomService.createMessage(chatRoomId, message);
      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const fetchChatRoom = async () => {
    if (!hotel || !isAuthenticated) return;

    try {
      setLoadingMessages(true);
      const response = await hotelService.getChatRoom(hotel.id.toString());
      if (response && response.data) {
        setChatRoomId(response.data.id);
        const messagesResponse = await chatRoomService.getMessages(response.data.id);
        if (messagesResponse.success) {
          setMessages(messagesResponse.data);
        }
      }
    } catch (err) {
      console.error('Error fetching chat room:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isChatOpen) {
      fetchChatRoom();
    }
  }, [isChatOpen, hotel]);

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
        <div className="md:col-span-3 min-h-[500px]">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hotel Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editedHotel.name || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hotel Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editedHotel.description || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={4}
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
                  value={editedHotel.address || ''}
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
                  value={editedHotel.postalCode || ''}
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
                  value={editedHotel.category || ''}
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
                  value={editedHotel.city || ''}
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
                  value={editedHotel.countryCode || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              {canEdit && (
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={editedHotel.status || hotel.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
              <div className="flex gap-4">
                <button
                  onClick={handleUpdateHotel}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {hotel.customData?.name || hotel.name}
              </h1>
              <div className="flex items-center mb-4">
                <span className="text-gray-600 dark:text-gray-300">
                  {(hotel.customData?.category || hotel.category)} • {(hotel.customData?.city || hotel.city)}, {(hotel.customData?.countryCode || hotel.countryCode)}
                </span>
                <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                  hotel.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {(typeof hotel.status === 'string' ? hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1) : 'Unknown')}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {(hotel.customData?.address || hotel.address)}, {(hotel.customData?.postalCode || hotel.postalCode)}
              </p>
              <div className="prose dark:prose-invert max-w-none mb-6">
                <p>{hotel.customData?.description || hotel.description}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                {isAuthenticated && (
                  <button
                    onClick={handleFavouriteClick}
                    className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white 
                             rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors 
                             flex items-center gap-2 border border-gray-300 dark:border-gray-600"
                    disabled={isCheckingFavourite}
                    title={favouriteError || (isFavourite ? 'Remove from Favourites' : 'Add to Favourites')}
                  >
                    {isCheckingFavourite ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    {isFavourite ? 'Remove from Favourites' : 'Add to Favourites'}
                  </button>
                )}
                {hotel.status === 'active' && isAuthenticated && (
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    Send Message
                  </button>
                )}
                {canEdit && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      Edit Hotel
                    </button>
                    <button
                      onClick={handleDeleteHotel}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      Delete Hotel
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* Chat Room */}
          {hotel && (
            <ChatRoom
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              title={`Chat with ${hotel.name}`}
              onSendMessage={handleSendMessage}
              messages={messages}
              loading={loadingMessages}
              sendingMessage={sendingMessage}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
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