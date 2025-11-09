import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Providers
import { ThemeProvider } from '@/contexts/ThemeContext';

// Components
import { ProtectedRoute } from '@components/common/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Pages
import { HomePage } from '@pages/HomePage';
import { LoginPage } from '@pages/auth/LoginPage';
import { RegisterPage } from '@pages/auth/RegisterPage';
import { DashboardPage } from '@pages/dashboard/DashboardPage';
import {
  SwitchListPage,
  SwitchCreatePage,
  SwitchDetailPage,
  SwitchEditPage
} from '@pages/switch';
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
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
        {/* Toast notifications */}
        <Toaster
          position='top-right'
          toastOptions={{
            duration: 4000,
            className: '',
            style: {
              background: 'rgb(var(--bg-card))',
              color: 'rgb(var(--text-primary))',
              border: '1px solid rgb(var(--border-primary))',
              borderRadius: '0.5rem',
              padding: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              fontSize: '0.875rem',
              fontWeight: '500',
            },
            success: {
              duration: 3000,
              style: {
                background: 'rgb(var(--bg-card))',
                color: 'rgb(var(--text-primary))',
                border: '1px solid rgb(34 197 94)',
              },
              iconTheme: {
                primary: 'rgb(34 197 94)',
                secondary: 'rgb(var(--bg-card))',
              }
            },
            error: {
              duration: 5000,
              style: {
                background: 'rgb(var(--bg-card))',
                color: 'rgb(var(--text-primary))',
                border: '1px solid rgb(239 68 68)',
              },
              iconTheme: {
                primary: 'rgb(239 68 68)',
                secondary: 'rgb(var(--bg-card))',
              }
            },
            loading: {
              style: {
                background: 'rgb(var(--bg-card))',
                color: 'rgb(var(--text-primary))',
                border: '1px solid rgb(var(--color-primary))',
              },
              iconTheme: {
                primary: 'rgb(var(--color-primary))',
                secondary: 'rgb(var(--bg-card))',
              }
            }
          }}
        />

        <Routes>
        {/* Public Routes */}
        <Route
          path={ROUTES.HOME}
          element={<HomePage />}
        />
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
          path={ROUTES.SWITCH_EDIT}
          element={
            <ProtectedRoute>
              <SwitchEditPage />
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

        {/* 404 Page */}
        <Route
          path='*'
          element={<NotFoundPage />}
        />
        </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
