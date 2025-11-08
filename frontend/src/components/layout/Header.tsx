import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@stores/authStore';
import { Shield, LogOut, Menu } from 'lucide-react';
import { ROUTES } from '@constants/index';
import { LanguageSwitcher } from '@components/common/LanguageSwitcher';
import { ThemeSwitcher } from '@components/common/ThemeSwitcher';

/**
 * Header Component
 *
 * Application header with navigation, user menu, language switcher, and theme switcher
 * Features:
 * - Theme-aware styling with CSS variables
 * - Multi-language support
 * - Responsive design
 */
export const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="bg-theme-card shadow-sm border-b border-theme-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-brand-primary" />
            <span className="text-xl font-bold text-theme-primary">
              {t('common.appName')}
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {isAuthenticated && (
              <>
                <Link
                  to={ROUTES.DASHBOARD}
                  className="text-theme-secondary hover:text-brand-primary px-3 py-2 text-sm font-medium"
                >
                  {t('header.dashboard')}
                </Link>
                <Link
                  to={ROUTES.SWITCHES}
                  className="text-theme-secondary hover:text-brand-primary px-3 py-2 text-sm font-medium"
                >
                  {t('header.switches')}
                </Link>
              </>
            )}
            <Link
              to={ROUTES.THEME_DEMO}
              className="text-theme-tertiary hover:text-brand-primary px-3 py-2 text-sm font-medium"
            >
              🎨 Theme
            </Link>
          </nav>

          {/* User Menu + Theme + Language */}
          <div className="flex items-center space-x-2">
            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Actions */}
            {isAuthenticated ? (
              <>
                <span className="text-sm text-theme-secondary hidden md:block px-2">
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-theme-secondary hover:text-brand-primary px-3 py-2 text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">{t('header.logout')}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="text-theme-secondary hover:text-brand-primary px-3 py-2 text-sm font-medium"
                >
                  {t('header.login')}
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="bg-brand-primary text-theme-inverse hover:opacity-90 px-4 py-2 rounded-md text-sm font-medium"
                >
                  {t('header.signUp')}
                </Link>
              </>
            )}
            <button className="md:hidden">
              <Menu className="h-6 w-6 text-theme-primary" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
