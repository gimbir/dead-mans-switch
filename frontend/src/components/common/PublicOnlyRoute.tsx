import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { ROUTES } from '@constants/index';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * PublicOnlyRoute Component
 *
 * Protects routes that should only be accessible to unauthenticated users.
 * Redirects to dashboard if user is already authenticated.
 *
 * Use this for login, register, and other auth pages.
 */
export const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    // User is already logged in, redirect to dashboard
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
