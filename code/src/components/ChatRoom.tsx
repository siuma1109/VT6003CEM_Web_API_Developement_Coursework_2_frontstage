import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../services/api/apiService';
import { useAuth } from '../context/AuthContext';

export interface ChatRoomProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSendMessage: (message: string) => Promise<void>;
  messages: ChatMessage[];
  loading: boolean;
  sendingMessage: boolean;
  newMessage: string;
  setNewMessage: (message: string) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  isOpen,
  onClose,
  title,
  onSendMessage,
  messages,
  loading,
  sendingMessage,
  newMessage,
  setNewMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;
    await onSendMessage(newMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 max-w-2xl h-3/4 flex flex-col">
        {/* Chat header */}
        <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
            </div>
          ) : (
            messages.map((message) => {
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
            })
          )}
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
  );
}; 