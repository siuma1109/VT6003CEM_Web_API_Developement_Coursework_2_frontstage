import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatRoomService, ChatRoom, ChatMessage } from '../services/api/apiService';
import { Pagination } from '../components/Pagination';

export const ChatRooms: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [messagePages, setMessagePages] = useState(1);
  const [currentMessagePage, setCurrentMessagePage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const pageSize = 10;
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await chatRoomService.getChatRooms({ 
          page: currentPage, 
          limit: pageSize 
        });
        
        if (response.success) {
          setChatRooms(response.data);
          setTotalPages(response.paginate.last_page);
        } else {
          setError(response.message || 'Failed to fetch chat rooms');
        }
      } catch (err) {
        console.error('Error fetching chat rooms:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch chat rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [isAuthenticated, navigate, currentPage]);

  const fetchMessages = async (roomId: number, page: number = 1) => {
    try {
      setLoadingMessages(true);
      const response = await chatRoomService.getMessages(roomId, { page, limit: pageSize });
      if (response.success) {
        if (page === 1) {
          setMessages(response.data);
        } else {
          setMessages(prev => [...prev, ...response.data]);
        }
        setMessagePages(response.paginate.last_page);
        setCurrentMessagePage(page);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleRoomSelect = async (room: ChatRoom) => {
    setSelectedRoom(room);
    setMessages([]);
    setCurrentMessagePage(1);
    setShowModal(true);
    await fetchMessages(room.id, 1);
  };

  const handleScroll = async () => {
    if (!messagesContainerRef.current || !selectedRoom) return;

    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop === 0 && currentMessagePage < messagePages) {
      const nextPage = currentMessagePage + 1;
      await fetchMessages(selectedRoom.id, nextPage);
    }
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => {
      prev.set('page', page.toString());
      return prev;
    });
  };

  const handleSendMessage = async () => {
    if (!selectedRoom || !newMessage.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      const response = await chatRoomService.createMessage(selectedRoom.id, newMessage.trim());
      
      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        // Scroll to bottom after sending message
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex-1 p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!chatRooms || chatRooms.length === 0) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex-1 p-4">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Chat Rooms</h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">No chat rooms available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 h-100">
      <div className="flex-1 flex overflow-hidden">
        {/* Chat list */}
        <div className="w-full bg-white dark:bg-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Chats</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chatRooms.map((room) => (
              <div
                key={room.id}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                  selectedRoom?.id === room.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
                onClick={() => handleRoomSelect(room)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                      {room.hotel?.name?.[0] || 'H'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                      {room.hotel?.name || 'Unnamed Hotel'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {room.messages && room.messages.length > 0
                        ? room.messages[room.messages.length - 1].content
                        : 'No messages yet'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {room.messages && room.messages.length > 0
                      ? new Date(room.messages[room.messages.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {showModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 max-w-2xl h-3/4 flex flex-col">
            {/* Chat header */}
            <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    {selectedRoom.hotel?.name?.[0] || 'H'}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {selectedRoom.hotel?.name || 'Unnamed Hotel'}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages container */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
              onScroll={handleScroll}
            >
              {loadingMessages && currentMessagePage === 1 && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
                </div>
              )}
              
              {messages.map((message) => {
                const isOwnMessage = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600">
                          {message.sender?.avatar ? (
                            <img
                              src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/${message.sender.avatar}`}
                              alt={message.sender.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {message.sender?.name || 'Unknown User'}
                        </span>
                        <div
                          className={`rounded-lg p-3 ${
                            isOwnMessage
                              ? 'bg-blue-500 text-white rounded-br-none'
                              : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage
                              ? 'text-blue-100'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="flex-none p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={sendingMessage}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sendingMessage || !newMessage.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {sendingMessage ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 