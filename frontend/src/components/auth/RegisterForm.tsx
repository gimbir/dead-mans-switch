import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuthStore } from '@stores/authStore';
import { PasswordInput } from '@components/common/PasswordInput';

/**
 * RegisterForm Component
 *
 * Handles user registration with email, password, and name
 * Features:
 * - React Hook Form for form state management
 * - Zod validation with i18n error messages
 * - Password strength indicator with visual feedback
 * - Password confirmation matching
 * - Theme-aware styling with CSS variables
 * - Loading states during registration
 * - Error handling with toast notifications
 * - Navigation to dashboard on success
 * - Multi-language support
 */
export const RegisterForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register: registerUser, isLoading } = useAuthStore();

  // Create schema with translated validation messages
  const registerSchema = z
    .object({
      name: z
        .string()
        .min(1, t('auth.validation.nameRequired'))
        .min(2, t('auth.validation.nameMin'))
        .max(50, t('auth.validation.nameMax')),
      email: z.email(t('auth.validation.emailInvalid')).min(1, t('auth.validation.emailRequired')),
      password: z
        .string()
        .min(1, t('auth.validation.passwordRequired'))
        .min(8, t('auth.validation.passwordMin'))
        .max(72, t('auth.validation.passwordMax'))
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('auth.validation.passwordStrength')),
      confirmPassword: z.string().min(1, t('auth.validation.confirmPasswordRequired'))
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.validation.passwordMismatch'),
      path: ['confirmPassword']
    });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur'
  });

  // Watch password for strength indicator
  const password = watch('password');

  // Calculate password strength
  const getPasswordStrength = (pwd: string): { level: number; text: string; color: string } => {
    if (!pwd) return { level: 0, text: '', color: '' };

    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength <= 2)
      return { level: 1, text: t('auth.register.strengthWeak'), color: 'bg-red-500' };
    if (strength === 3)
      return { level: 2, text: t('auth.register.strengthMedium'), color: 'bg-yellow-500' };
    if (strength === 4)
      return { level: 3, text: t('auth.register.strengthStrong'), color: 'bg-green-500' };
    return { level: 4, text: t('auth.register.strengthVeryStrong'), color: 'bg-green-600' };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      toast.success(t('auth.register.success'));
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || t('auth.register.error'));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='mt-8 space-y-6'
    >
      <div className='space-y-4'>
        {/* Name Field */}
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-theme-primary'
          >
            {t('auth.register.name')}
          </label>
          <input
            id='name'
            type='text'
            autoComplete='name'
            disabled={isLoading}
            className={`mt-1 block w-full px-3 py-2 bg-theme-input border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm text-theme-primary ${
              errors.name
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-theme-primary focus:ring-blue-500 focus:border-blue-500'
            } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            placeholder={t('auth.register.namePlaceholder')}
            {...register('name')}
          />
          {errors.name && <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-theme-primary'
          >
            {t('auth.register.email')}
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
            placeholder={t('auth.register.emailPlaceholder')}
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
            {t('auth.register.password')}
          </label>
          <PasswordInput
            id='password'
            autoComplete='new-password'
            disabled={isLoading}
            error={!!errors.password}
            isLoading={isLoading}
            placeholder={t('auth.register.passwordPlaceholder')}
            {...register('password')}
          />
          {errors.password && (
            <p className='mt-1 text-sm text-red-600'>{errors.password.message}</p>
          )}

          {/* Password Strength Indicator */}
          {password && passwordStrength.level > 0 && (
            <div className='mt-2'>
              <div className='flex justify-between items-center mb-1'>
                <span className='text-xs text-theme-secondary'>
                  {t('auth.register.passwordStrength')}
                </span>
                <span className='text-xs font-medium text-theme-primary'>
                  {passwordStrength.text}
                </span>
              </div>
              <div className='w-full h-2 bg-theme-hover rounded-full overflow-hidden'>
                <div
                  className={`h-full ${passwordStrength.color} transition-all duration-300`}
                  style={{ width: `${(passwordStrength.level / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Password Requirements */}
          <div className='mt-2'>
            <p className='text-xs text-theme-secondary'>
              {t('auth.register.passwordRequirements')}
            </p>
            <ul className='mt-1 space-y-0.5 text-xs text-theme-secondary'>
              <li className={password && password.length >= 8 ? 'text-green-600' : ''}>
                • {t('auth.register.requirement1')}
              </li>
              <li
                className={
                  password && /[A-Z]/.test(password) && /[a-z]/.test(password)
                    ? 'text-green-600'
                    : ''
                }
              >
                • {t('auth.register.requirement2')}
              </li>
              <li className={password && /\d/.test(password) ? 'text-green-600' : ''}>
                • {t('auth.register.requirement3')}
              </li>
            </ul>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor='confirmPassword'
            className='block text-sm font-medium text-theme-primary'
          >
            {t('auth.register.confirmPassword')}
          </label>
          <PasswordInput
            id='confirmPassword'
            autoComplete='new-password'
            disabled={isLoading}
            error={!!errors.confirmPassword}
            isLoading={isLoading}
            placeholder={t('auth.register.passwordPlaceholder')}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className='mt-1 text-sm text-red-600'>{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Terms of Service */}
      <div className='flex items-start'>
        <input
          id='terms'
          name='terms'
          type='checkbox'
          required
          disabled={isLoading}
          className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-theme-primary rounded disabled:cursor-not-allowed mt-0.5'
        />
        <label
          htmlFor='terms'
          className='ml-2 block text-sm text-theme-primary'
        >
          {t('auth.register.terms')}{' '}
          <a
            href='#'
            className='font-medium text-brand-primary hover:opacity-80'
          >
            {t('auth.register.termsOfService')}
          </a>{' '}
          {t('auth.register.and')}{' '}
          <a
            href='#'
            className='font-medium text-brand-primary hover:opacity-80'
          >
            {t('auth.register.privacyPolicy')}
          </a>
        </label>
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
              {t('auth.register.creatingAccount')}
            </span>
          ) : (
            t('auth.register.createAccount')
          )}
        </button>
      </div>

      {/* Login Link */}
      <div className='text-center'>
        <p className='text-sm text-theme-secondary'>
          {t('auth.register.hasAccount')}{' '}
          <Link
            to='/login'
            className='font-medium text-brand-primary hover:opacity-80'
          >
            {t('auth.register.signIn')}
          </Link>
        </p>
      </div>
    </form>
  );
};
