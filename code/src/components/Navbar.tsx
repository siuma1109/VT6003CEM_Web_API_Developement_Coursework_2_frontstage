import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api/apiService';

interface NavbarProps {
  onLoginClick: () => void;
}

interface UserData {
  avatar?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isAuthenticated, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const getAvatarUrl = (avatarPath: string) => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
    return `${baseUrl}/${avatarPath}`;
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Clear all search parameters
    setSearchParams({});
    // Force a navigation to home with replace
    navigate('/', { replace: true });
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, close the menu
      setIsUserMenuOpen(false);
    }
  };

  return (
    <nav className="bg-primary-dark text-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" onClick={handleHomeClick} className="flex items-center space-x-2">
          <span className="text-2xl font-bold">Travel Agency</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-white"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.45 4.75a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM17 10a1 1 0 11-2 0 1 1 0 012 0zm-4.75.45a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM10 17a1 1 0 110-2 1 1 0 010 2zm-4.75-.45a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM3 10a1 1 0 112 0 1 1 0 01-2 0zm3.75-4.75a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-white hover:text-gray-200 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                  {userData?.avatar ? (
                    <img
                      src={getAvatarUrl(userData.avatar)}
                      alt="Profile"
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
                <span>My Account</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transform transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 rounded-md bg-white text-primary-dark hover:bg-gray-100 transition-colors"
            >
              Login / Register
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}; 