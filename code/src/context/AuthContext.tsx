import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';
import { UserData } from '../services/api/apiService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, signUpCode?: string) => Promise<void>;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    return storedAuth === 'true';
  });
  const [user, setUser] = useState<UserData | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setIsAuthenticated(true);
      setUser(response.user);
      // Save to localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(response.user));
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
      setUser(null);
      // Clear localStorage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      // Dispatch auth logout event
      window.dispatchEvent(new CustomEvent('authLogout'));
    }
  };

  const register = async (email: string, password: string, name: string, signUpCode?: string) => {
    try {
      const response = await authService.register({ email, password, name, signUpCode });
      // After successful registration, automatically log in
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    // Check authentication status on mount
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('user');
    
    if (storedAuth === 'true' && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }

    // Listen for auth success events
    const handleAuthSuccess = () => {
      setIsAuthenticated(true);
    };

    // Listen for auth logout events
    const handleAuthLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
    };

    window.addEventListener('authSuccess', handleAuthSuccess);
    window.addEventListener('authLogout', handleAuthLogout);

    return () => {
      window.removeEventListener('authSuccess', handleAuthSuccess);
      window.removeEventListener('authLogout', handleAuthLogout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}; 