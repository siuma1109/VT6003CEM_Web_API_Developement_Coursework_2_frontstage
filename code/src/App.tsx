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

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    const handleAuthRequired = () => {
      setIsAuthModalOpen(true);
    };

    window.addEventListener('authRequired', handleAuthRequired);
    return () => window.removeEventListener('authRequired', handleAuthRequired);
  }, []);

  return (
    <AuthProvider>
      <DarkModeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar onLoginClick={handleLoginClick} />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HotelList />} />
                <Route path="/hotels/:id" element={<HotelDetails />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </main>
          </div>
          <Modal
            isOpen={isAuthModalOpen}
            onClose={handleCloseAuthModal}
            title="Login / Register"
          >
            <AuthModal onClose={handleCloseAuthModal} />
          </Modal>
        </Router>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;
