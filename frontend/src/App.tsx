import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Providers
import { ThemeProvider } from '@/contexts/ThemeContext';

// Components
import { ProtectedRoute } from '@components/common/ProtectedRoute';

// Pages
import { LoginPage } from '@pages/auth/LoginPage';
import { RegisterPage } from '@pages/auth/RegisterPage';
import { DashboardPage } from '@pages/dashboard/DashboardPage';
import { SwitchListPage, SwitchCreatePage, SwitchDetailPage } from '@pages/switch';
import { ThemeDemoPage } from '@pages/ThemeDemoPage';
import { NotFoundPage } from '@pages/NotFoundPage';

// Constants
import { ROUTES } from '@constants/index';

/**
 * App Component
 *
 * Main application component with routing configuration
 * Features:
 * - Theme management (light/dark/system)
 * - Internationalization (i18n)
 * - Auth state persistence
 */
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
      {/* Toast notifications */}
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff'
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route
          path={ROUTES.LOGIN}
          element={<LoginPage />}
        />
        <Route
          path={ROUTES.REGISTER}
          element={<RegisterPage />}
        />
        <Route
          path={ROUTES.THEME_DEMO}
          element={<ThemeDemoPage />}
        />

        {/* Protected Routes */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SWITCHES}
          element={
            <ProtectedRoute>
              <SwitchListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SWITCH_CREATE}
          element={
            <ProtectedRoute>
              <SwitchCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SWITCH_DETAIL}
          element={
            <ProtectedRoute>
              <SwitchDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect root to dashboard or login */}
        <Route
          path={ROUTES.HOME}
          element={
            <Navigate
              to={ROUTES.DASHBOARD}
              replace
            />
          }
        />

        {/* 404 Page */}
        <Route
          path='*'
          element={<NotFoundPage />}
        />
      </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
