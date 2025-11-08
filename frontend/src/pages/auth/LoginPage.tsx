import { useTranslation } from 'react-i18next';
import { LoginForm } from '@components/auth/LoginForm';

/**
 * LoginPage Component
 *
 * User login page with authentication form
 * Features:
 * - Email and password login
 * - Form validation with Zod
 * - Loading states and error handling
 * - Navigation to dashboard on success
 * - Multi-language support
 */
export const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-theme-card rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-brand-primary text-theme-inverse rounded-full p-3">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-theme-primary">
              {t('auth.login.title')}
            </h2>
            <p className="mt-2 text-sm text-theme-secondary">
              {t('common.appName')} - {t('common.tagline')}
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-theme-tertiary">
            {t('auth.login.securityNote')}
          </p>
        </div>
      </div>
    </div>
  );
};
