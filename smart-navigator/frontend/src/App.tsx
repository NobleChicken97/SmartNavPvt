import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LoadingSpinner from './components/LoadingSpinner';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import MapPage from './pages/MapPage';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
    // checkAuth is stable in Zustand; include to satisfy lint
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router 
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="App">
  <Toaster position="top-right" />
        <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <MapPage />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/map"
            element={
              <PrivateRoute>
                <MapPage />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600 mt-2">Admin functionality will be implemented here</p>
                </div>
              </AdminRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900">404</h1>
                  <p className="text-gray-600 mt-2">Page not found</p>
                  <a
                    href="/dashboard"
                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            }
          />
  </Routes>
  </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
