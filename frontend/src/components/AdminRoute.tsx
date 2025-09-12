import { memo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from './LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = memo<AdminRouteProps>(({ children }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
});

AdminRoute.displayName = 'AdminRoute';

export default AdminRoute;
