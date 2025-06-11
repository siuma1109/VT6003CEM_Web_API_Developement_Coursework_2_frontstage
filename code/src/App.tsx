import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HotelList } from './features/hotels/HotelList';
import { HotelDetails } from './features/hotels/HotelDetails';
import { Navbar } from './components/Navbar';
import { Modal } from './components/Modal';
import { AuthModal } from './features/auth/AuthModal';
import { DarkModeProvider } from './context/DarkModeContext';
import { AuthProvider } from './context/AuthContext';
import ProfilePage from './pages/ProfilePage';
import { FavouritesPage } from './features/favourites/FavouritesPage';
import { ChatRooms } from './pages/ChatRooms';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authStep, setAuthStep] = useState<'email-check' | 'login' | 'register'>('email-check');
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
    setAuthStep('email-check');
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
    setReturnUrl(null);
    setAuthStep('email-check');
  };

  const getModalTitle = () => {
    switch (authStep) {
      case 'login':
        return 'Sign In';
      case 'register':
        return 'Create Account';
      default:
        return 'Welcome, Enter email for login / register';
    }
  };

  useEffect(() => {
    const handleAuthRequired = (event: CustomEvent) => {
      setReturnUrl(event.detail.returnUrl);
      setIsAuthModalOpen(true);
      setAuthStep('email-check');
    };

    window.addEventListener('authRequired', handleAuthRequired as EventListener);
    return () => window.removeEventListener('authRequired', handleAuthRequired as EventListener);
  }, []);

  return (
    <AuthProvider>
      <DarkModeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Navbar onLoginClick={handleLoginClick} />
            <main className="flex-1 container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HotelList />} />
                <Route path="/hotels/:id" element={<HotelDetails />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/favourites" element={<FavouritesPage />} />
                <Route path="/chat-rooms" element={<ChatRooms />} />
              </Routes>
            </main>
          </div>
          <Modal
            isOpen={isAuthModalOpen}
            onClose={handleCloseAuthModal}
            title={getModalTitle()}
          >
            <AuthModal 
              onClose={handleCloseAuthModal} 
              returnUrl={returnUrl} 
              onStepChange={setAuthStep}
            />
          </Modal>
        </Router>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;
