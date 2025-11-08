import { useTranslation } from 'react-i18next';
import { RegisterForm } from '@components/auth/RegisterForm';

/**
 * RegisterPage Component
 *
 * User registration page with signup form
 * Features:
 * - Name, email, and password registration
 * - Password strength indicator
 * - Form validation with Zod
 * - Loading states and error handling
 * - Navigation to dashboard on success
 * - Multi-language support
 */
export const RegisterPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-theme-primary">
              {t('auth.register.title')}
            </h2>
            <p className="mt-2 text-sm text-theme-secondary">
              {t('auth.register.tagline')}
            </p>
          </div>

          {/* Register Form */}
          <RegisterForm />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-theme-tertiary">
            {t('auth.register.securityNote')}
          </p>
        </div>
      </div>
    </div>
  );
};
