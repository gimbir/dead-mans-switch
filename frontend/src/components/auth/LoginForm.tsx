import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuthStore } from '@stores/authStore';
import { PasswordInput } from '@components/common/PasswordInput';

/**
 * LoginForm Component
 *
 * Handles user authentication with email and password
 * Features:
 * - React Hook Form for form state management
 * - Zod validation with i18n error messages
 * - Theme-aware styling with CSS variables
 * - Loading states during authentication
 * - Error handling with toast notifications
 * - Navigation to dashboard on success
 * - Multi-language support
 */
export const LoginForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, isLoading } = useAuthStore();

  // Create schema with translated validation messages
  const loginSchema = z.object({
    email: z.email(t('auth.validation.emailInvalid')).min(1, t('auth.validation.emailRequired')),
    password: z
      .string()
      .min(1, t('auth.validation.passwordRequired'))
      .min(8, t('auth.validation.passwordMin')),
    rememberMe: z.boolean().optional()
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { email, password, rememberMe } = data;
      const result = await login({ email, password }, rememberMe || false);

      // Check if 2FA is required
      if (result.requiresTwoFactor && result.userId) {
        navigate('/verify-2fa', { state: { userId: result.userId }, replace: true });
        return;
      }

      // Normal login success
      toast.success(t('auth.login.success'));
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      toast.error(error.message || t('auth.login.error'));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='mt-8 space-y-6'
    >
      <div className='space-y-4'>
        {/* Email Field */}
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-theme-primary'
          >
            {t('auth.login.email')}
          </label>
          <input
            id='email'
            type='email'
            autoComplete='email'
            disabled={isLoading}
            className={`mt-1 block w-full px-3 py-2 bg-theme-input border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm text-theme-primary ${
              errors.email
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-theme-primary focus:ring-blue-500 focus:border-blue-500'
            } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            placeholder={t('auth.login.emailPlaceholder')}
            {...register('email')}
          />
          {errors.email && <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-theme-primary'
          >
            {t('auth.login.password')}
          </label>
          <PasswordInput
            id='password'
            autoComplete='current-password'
            disabled={isLoading}
            error={!!errors.password}
            isLoading={isLoading}
            placeholder={t('auth.login.passwordPlaceholder')}
            {...register('password')}
          />
          {errors.password && (
            <p className='mt-1 text-sm text-red-600'>{errors.password.message}</p>
          )}
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          <input
            id='remember-me'
            type='checkbox'
            disabled={isLoading}
            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-theme-primary rounded disabled:cursor-not-allowed'
            {...register('rememberMe')}
          />
          <label
            htmlFor='remember-me'
            className='ml-2 block text-sm text-theme-primary'
          >
            {t('auth.login.rememberMe')}
          </label>
        </div>

        <div className='text-sm'>
          <a
            href='#'
            className='font-medium text-brand-primary hover:opacity-80'
            onClick={(e) => {
              e.preventDefault();
              toast(t('toast.passwordResetSoon'), { icon: '🔐' });
            }}
          >
            {t('auth.login.forgotPassword')}
          </a>
        </div>
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
              {t('auth.login.signingIn')}
            </span>
          ) : (
            t('auth.login.signIn')
          )}
        </button>
      </div>

      {/* Register Link */}
      <div className='text-center'>
        <p className='text-sm text-theme-secondary'>
          {t('auth.login.noAccount')}{' '}
          <Link
            to='/register'
            className='font-medium text-brand-primary hover:opacity-80'
          >
            {t('auth.login.signUpNow')}
          </Link>
        </p>
      </div>
    </form>
  );
};
