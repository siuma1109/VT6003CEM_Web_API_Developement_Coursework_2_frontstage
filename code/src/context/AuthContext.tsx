import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());

  const login = async (email: string, password: string) => {
    try {
      await authService.login({ email, password });
      setIsAuthenticated(true);
      // Dispatch auth success event
      window.dispatchEvent(new CustomEvent('authSuccess'));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // First try to call the logout API
      await authService.logout();
    } catch (error) {
      // Even if the API call fails, we should still clear local state
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state and tokens
      setIsAuthenticated(false);
      // Dispatch auth logout event
      window.dispatchEvent(new CustomEvent('authLogout'));
      
      // Clear any other auth-related data from localStorage if needed
      localStorage.removeItem('user');
      
      // Redirect to home page if needed
      window.location.href = '/';
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await authService.register({ email, password, name });
      // After successful registration, automatically log in
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    // Check authentication status on mount
    setIsAuthenticated(authService.isAuthenticated());

    // Listen for auth success events
    const handleAuthSuccess = () => {
      setIsAuthenticated(true);
    };

    // Listen for auth logout events
    const handleAuthLogout = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener('authSuccess', handleAuthSuccess);
    window.addEventListener('authLogout', handleAuthLogout);

    return () => {
      window.removeEventListener('authSuccess', handleAuthSuccess);
      window.removeEventListener('authLogout', handleAuthLogout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}; 