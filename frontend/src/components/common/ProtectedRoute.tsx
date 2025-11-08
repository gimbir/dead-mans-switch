import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 *
 * Protects routes that require authentication.
 * Redirects to login page if user is not authenticated.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
