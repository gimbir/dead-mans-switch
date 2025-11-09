import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@stores/authStore';
import { Shield, LogOut, Menu, X } from 'lucide-react';
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
 * - Responsive design with mobile menu
 */
export const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate(ROUTES.LOGIN);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className='bg-theme-card shadow-sm border-b border-theme-primary'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo - Always show full name (menu items are separate now) */}
          <Link
            to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
            className='flex items-center space-x-2'
          >
            <Shield className='h-7 w-7 sm:h-8 sm:w-8 text-brand-primary flex-shrink-0' />
            <span className='text-sm sm:text-base lg:text-xl font-bold text-theme-primary'>
              {t('common.appName')}
            </span>
          </Link>

          {/* Navigation */}
          <nav className='hidden md:flex space-x-8'>
            {isAuthenticated && (
              <>
                <Link
                  to={ROUTES.DASHBOARD}
                  className='text-theme-secondary hover:text-brand-primary px-3 py-2 text-sm font-medium'
                >
                  {t('header.dashboard')}
                </Link>
                <Link
                  to={ROUTES.SWITCHES}
                  className='text-theme-secondary hover:text-brand-primary px-3 py-2 text-sm font-medium'
                >
                  {t('header.switches')}
                </Link>
              </>
            )}
            {/* <Link
              to={ROUTES.THEME_DEMO}
              className="text-theme-tertiary hover:text-brand-primary px-3 py-2 text-sm font-medium"
            >
              🎨 Theme
            </Link> */}
          </nav>

          {/* User Menu + Theme + Language */}
          <div className='flex items-center space-x-1 lg:space-x-2'>
            {/* Theme Switcher - Hidden on mobile, icon-only on tablet, full on desktop */}
            <div className='hidden sm:block'>
              <ThemeSwitcher />
            </div>

            {/* Language Switcher - Hidden on mobile, flag-only on tablet, full on desktop */}
            <div className='hidden sm:block'>
              <LanguageSwitcher />
            </div>

            {/* Desktop User Actions */}
            <div className='hidden md:flex items-center space-x-2'>
              {isAuthenticated ? (
                <>
                  {/* User email/name - Hidden on tablet (md), visible on desktop (lg+) */}
                  <span className='hidden lg:block text-sm text-theme-secondary px-2'>
                    {user?.name || user?.email}
                  </span>
                  {/* Logout - Icon only on tablet, icon+text on desktop */}
                  <button
                    onClick={handleLogout}
                    className='flex items-center space-x-1 text-theme-secondary hover:text-brand-primary px-2 lg:px-3 py-2 text-sm font-medium'
                    title={t('header.logout')}
                  >
                    <LogOut className='h-5 w-5' />
                    <span className='hidden lg:inline'>{t('header.logout')}</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Login - Compact on tablet */}
                  <Link
                    to={ROUTES.LOGIN}
                    className='text-theme-secondary hover:text-brand-primary px-2 lg:px-3 py-2 text-sm font-medium'
                  >
                    {t('header.login')}
                  </Link>
                  {/* Sign Up - Primary CTA */}
                  <Link
                    to={ROUTES.REGISTER}
                    className='bg-brand-primary text-theme-inverse hover:opacity-90 px-3 lg:px-4 py-2 rounded-md text-sm font-medium'
                  >
                    {t('header.signUp')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='md:hidden p-2 rounded-md hover:bg-theme-hover'
              aria-label='Toggle menu'
            >
              {mobileMenuOpen ? (
                <X className='h-6 w-6 text-theme-primary' />
              ) : (
                <Menu className='h-6 w-6 text-theme-primary' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop with Blur and Fade-in Animation */}
            <div
              className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in'
              onClick={closeMobileMenu}
              aria-hidden='true'
            />

            {/* Slide-in Drawer from Right with Animation */}
            <div className='fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-theme-card shadow-2xl z-50 md:hidden overflow-y-auto animate-slide-in-right'>
              {/* Drawer Header */}
              <div className='flex items-center justify-between p-4 border-b border-theme-primary'>
                <div className='flex items-center space-x-2'>
                  <Shield className='h-6 w-6 text-brand-primary' />
                  <span className='text-lg font-bold text-theme-primary'>Menu</span>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className='p-2 rounded-md hover:bg-theme-hover'
                  aria-label='Close menu'
                >
                  <X className='h-6 w-6 text-theme-primary' />
                </button>
              </div>

              {/* Drawer Content */}
              <div className='px-4 py-6 space-y-1'>
                {/* User Info Section (if authenticated) */}
                {isAuthenticated && user && (
                  <>
                    <div className='px-3 py-4 rounded-lg bg-theme-secondary/10 border border-theme-primary mb-4'>
                      <p className='text-xs text-theme-tertiary mb-1'>Signed in as</p>
                      <p className='text-sm font-semibold text-theme-primary truncate mb-3'>
                        {user.name || user.email}
                      </p>
                      {/* Logout Button under user info */}
                      <button
                        onClick={handleLogout}
                        className='w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium bg-theme-hover text-theme-secondary hover:text-brand-primary border border-theme-primary transition-colors'
                      >
                        <LogOut className='h-4 w-4' />
                        <span>{t('header.logout')}</span>
                      </button>
                    </div>
                  </>
                )}

                {/* Navigation Links */}
                {isAuthenticated && (
                  <>
                    <Link
                      to={ROUTES.DASHBOARD}
                      onClick={closeMobileMenu}
                      className='block px-4 py-3 rounded-lg text-base font-medium text-theme-secondary hover:text-brand-primary hover:bg-theme-hover transition-colors'
                    >
                      {t('header.dashboard')}
                    </Link>
                    <Link
                      to={ROUTES.SWITCHES}
                      onClick={closeMobileMenu}
                      className='block px-4 py-3 rounded-lg text-base font-medium text-theme-secondary hover:text-brand-primary hover:bg-theme-hover transition-colors'
                    >
                      {t('header.switches')}
                    </Link>
                    {/* <Link
                      to={ROUTES.THEME_DEMO}
                      onClick={closeMobileMenu}
                      className='block px-4 py-3 rounded-lg text-base font-medium text-theme-tertiary hover:text-brand-primary hover:bg-theme-hover transition-colors'
                    >
                      🎨 Theme
                    </Link> */}
                  </>
                )}

                {/* Guest Navigation */}
                {!isAuthenticated && (
                  <>
                    {/* Login Button - Secondary style */}
                    <Link
                      to={ROUTES.LOGIN}
                      onClick={closeMobileMenu}
                      className='block px-4 py-3 rounded-lg text-base font-medium bg-theme-hover text-theme-primary hover:bg-theme-secondary/20 border-2 border-theme-primary text-center transition-colors'
                    >
                      {t('header.login')}
                    </Link>
                    {/* Sign Up Button - Primary style */}
                    <Link
                      to={ROUTES.REGISTER}
                      onClick={closeMobileMenu}
                      className='block px-4 py-3 rounded-lg text-base font-medium bg-brand-primary text-theme-inverse hover:opacity-90 text-center transition-opacity'
                    >
                      {t('header.signUp')}
                    </Link>
                  </>
                )}

                {/* Settings Section */}
                <div className='border-t border-theme-primary my-4'></div>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between px-4 py-3'>
                    <span className='text-sm font-medium text-theme-secondary'>Theme</span>
                    <ThemeSwitcher />
                  </div>
                  <div className='flex items-center justify-between px-4 py-3'>
                    <span className='text-sm font-medium text-theme-secondary'>Language</span>
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
