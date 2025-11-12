import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { twoFactorService } from '@services/twoFactor.service';
import { apiService } from '@services/api';
import { useAuthStore } from '@stores/authStore';
import { ROUTES } from '@constants/index';

/**
 * Verify2FAPage Component
 *
 * Two-Factor Authentication verification page during login
 * Features:
 * - 6-digit TOTP code input
 * - Backup code alternative
 * - Form validation with Zod
 * - Loading states and error handling
 * - Navigation to dashboard on success
 * - Multi-language support
 */
export const Verify2FAPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { setAuthenticatedUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Get userId from navigation state (passed from login page)
  const userId = location.state?.userId as string | undefined;

  // Redirect to login if no userId
  if (!userId) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Create schema with translated validation messages
  const verify2FASchema = z.object({
    token: useBackupCode
      ? z
          .string()
          .min(1, t('auth.twoFactor.tokenRequired'))
          .regex(/^\w{4}-\w{4}-\w{4}$/, t('auth.twoFactor.backupCodeFormat'))
      : z
          .string()
          .length(6, t('auth.twoFactor.tokenLength'))
          .regex(/^\d{6}$/, t('auth.twoFactor.tokenNumeric'))
  });

  type Verify2FAFormData = z.infer<typeof verify2FASchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<Verify2FAFormData>({
    resolver: zodResolver(verify2FASchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: Verify2FAFormData) => {
    setIsLoading(true);
    try {
      const result = await twoFactorService.verifyLogin({
        userId,
        token: data.token
      });

      // Store tokens
      apiService.setTokens(result.tokens.accessToken, result.tokens.refreshToken);

      // Update auth store with user data
      setAuthenticatedUser(result.user);

      toast.success(t('auth.twoFactor.verifySuccess'));

      // Use hard redirect to ensure tokens are loaded properly
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (error: any) {
      toast.error(error.message || t('auth.twoFactor.verifyError'));
      setIsLoading(false);
    }
  };

  const handleToggleBackupCode = () => {
    setUseBackupCode(!useBackupCode);
    reset(); // Clear form when switching modes
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full'>
        {/* Card Container */}
        <div className='bg-theme-card rounded-lg shadow-xl p-8'>
          {/* Header */}
          <div className='text-center'>
            <div className='flex justify-center mb-4'>
              <div className='bg-brand-primary text-theme-inverse rounded-full p-3'>
                <svg
                  className='h-8 w-8'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  />
                </svg>
              </div>
            </div>
            <h2 className='text-3xl font-extrabold text-theme-primary'>
              {t('auth.twoFactor.verifyTitle')}
            </h2>
            <p className='mt-2 text-sm text-theme-secondary'>
              {useBackupCode
                ? t('auth.twoFactor.backupCodeInstructions')
                : t('auth.twoFactor.verifyInstructions')}
            </p>
          </div>

          {/* Verification Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='mt-8 space-y-6'
          >
            <div>
              <label
                htmlFor='token'
                className='block text-sm font-medium text-theme-primary'
              >
                {useBackupCode
                  ? t('auth.twoFactor.backupCodeLabel')
                  : t('auth.twoFactor.tokenLabel')}
              </label>
              <input
                id='token'
                type='text'
                autoComplete='one-time-code'
                autoFocus
                disabled={isLoading}
                className={`mt-1 block w-full px-3 py-2 bg-theme-input border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm text-center text-xl tracking-widest font-mono text-theme-primary ${
                  errors.token
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-theme-primary focus:ring-blue-500 focus:border-blue-500'
                } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                placeholder={
                  useBackupCode
                    ? t('auth.twoFactor.backupCodePlaceholder')
                    : t('auth.twoFactor.tokenPlaceholder')
                }
                maxLength={useBackupCode ? 14 : 6}
                {...register('token')}
              />
              {errors.token && <p className='mt-1 text-sm text-red-600'>{errors.token.message}</p>}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type='submit'
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-theme-inverse focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-brand-primary ${
                  isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
                }`}
              >
                {isLoading ? (
                  <span className='flex items-center'>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-theme-inverse'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    {t('auth.twoFactor.verifying')}
                  </span>
                ) : (
                  t('auth.twoFactor.verify')
                )}
              </button>
            </div>

            {/* Toggle Backup Code */}
            <div className='text-center'>
              <button
                type='button'
                onClick={handleToggleBackupCode}
                disabled={isLoading}
                className='text-sm font-medium text-brand-primary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {useBackupCode
                  ? t('auth.twoFactor.useAuthenticatorCode')
                  : t('auth.twoFactor.useBackupCode')}
              </button>
            </div>

            {/* Back to Login */}
            <div className='text-center'>
              <Link
                to={ROUTES.LOGIN}
                className='text-sm text-theme-secondary hover:text-theme-primary'
              >
                {t('auth.twoFactor.backToLogin')}
              </Link>
            </div>
          </form>
        </div>

        {/* Security Note */}
        <div className='mt-8 text-center'>
          <p className='text-xs text-theme-tertiary'>{t('auth.twoFactor.securityNote')}</p>
        </div>
      </div>
    </div>
  );
};
