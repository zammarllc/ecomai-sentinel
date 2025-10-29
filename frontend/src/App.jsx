import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginModal from './components/LoginModal.jsx';
import { isAuthenticated } from './utils/auth.js';

function App() {
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authSnapshot, setAuthSnapshot] = useState(() => isAuthenticated());

  useEffect(() => {
    setAuthSnapshot(isAuthenticated());
  }, [location.key]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setIsLoginOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/' && location.state?.from && !isAuthenticated()) {
      setIsLoginOpen(true);
    }
  }, [location]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleStorage = () => {
      setAuthSnapshot(isAuthenticated());
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleOpenLogin = () => {
    setIsLoginOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  const handleLoginSuccess = () => {
    setAuthSnapshot(true);
    setIsLoginOpen(false);
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<LandingPage onLoginClick={handleOpenLogin} isAuthenticated={authSnapshot} />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <LoginModal isOpen={isLoginOpen} onClose={handleCloseLogin} onSuccess={handleLoginSuccess} />
    </>
  );
}

export default App;
