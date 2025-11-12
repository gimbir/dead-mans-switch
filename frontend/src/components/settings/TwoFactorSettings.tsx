import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { twoFactorService } from '@services/twoFactor.service';
import { TwoFactorSetup } from './TwoFactorSetup';
import { PasswordInput } from '@components/common/PasswordInput';
import { useAuthStore } from '@stores/authStore';

interface TwoFactorSettingsProps {
  isEnabled: boolean;
  onStatusChange?: (enabled: boolean) => void;
}

/**
 * TwoFactorSettings Component
 *
 * Settings section for managing 2FA
 * Features:
 * - Enable/disable toggle
 * - Setup flow integration
 * - Disable confirmation with password
 * - Status display
 */
export const TwoFactorSettings = ({
  isEnabled: initialEnabled,
  onStatusChange,
}: TwoFactorSettingsProps) => {
  const { t } = useTranslation();
  const { update2FAStatus } = useAuthStore();
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Create schema for disable form
  const disableSchema = z.object({
    password: z.string().min(1, t('auth.validation.passwordRequired')),
    token: z
      .string()
      .min(1, t('auth.twoFactor.tokenRequired'))
      .length(6, t('auth.twoFactor.tokenLength'))
      .regex(/^\d{6}$/, t('auth.twoFactor.tokenNumeric')),
  });

  type DisableFormData = z.infer<typeof disableSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DisableFormData>({
    resolver: zodResolver(disableSchema),
    mode: 'onBlur',
  });

  const handleEnable = () => {
    setShowSetup(true);
  };

  const handleSetupSuccess = () => {
    setIsEnabled(true);
    setShowSetup(false);
    onStatusChange?.(true);
    update2FAStatus(true); // Update auth store
  };

  const handleSetupCancel = () => {
    setShowSetup(false);
  };

  const handleDisableClick = () => {
    setShowDisableForm(true);
  };

  const handleDisableCancel = () => {
    setShowDisableForm(false);
    reset();
  };

  const onSubmitDisable = async (data: DisableFormData) => {
    setIsLoading(true);
    try {
      await twoFactorService.disable({
        password: data.password,
        token: data.token,
      });

      setIsEnabled(false);
      setShowDisableForm(false);
      reset();
      toast.success(t('auth.twoFactor.disableSuccess'));
      onStatusChange?.(false);
      update2FAStatus(false); // Update auth store
    } catch (error: any) {
      toast.error(error.message || t('auth.twoFactor.disableError'));
    } finally {
      setIsLoading(false);
    }
  };

  // If showing setup flow
  if (showSetup) {
    return (
      <div className="bg-theme-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-theme-primary mb-6">
          {t('auth.twoFactor.setupTitle')}
        </h2>
        <TwoFactorSetup onSuccess={handleSetupSuccess} onCancel={handleSetupCancel} />
      </div>
    );
  }

  // If showing disable form
  if (showDisableForm) {
    return (
      <div className="bg-theme-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-theme-primary mb-6">
          {t('auth.twoFactor.disableTitle')}
        </h2>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {t('auth.twoFactor.disableWarningTitle')}
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{t('auth.twoFactor.disableWarning')}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmitDisable)} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-theme-primary"
            >
              {t('auth.login.password')}
            </label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              disabled={isLoading}
              error={!!errors.password}
              isLoading={isLoading}
              placeholder={t('auth.twoFactor.enterPasswordToDisable')}
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium text-theme-primary"
            >
              {t('auth.twoFactor.tokenLabel')}
            </label>
            <input
              id="token"
              type="text"
              autoComplete="one-time-code"
              disabled={isLoading}
              className={`mt-1 block w-full px-3 py-2 bg-theme-input border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm text-center text-xl tracking-widest font-mono text-theme-primary ${
                errors.token
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-theme-primary focus:ring-blue-500 focus:border-blue-500'
              } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              placeholder="000000"
              maxLength={6}
              {...register('token')}
            />
            {errors.token && (
              <p className="mt-1 text-sm text-red-600">{errors.token.message}</p>
            )}
            <p className="mt-1 text-xs text-theme-tertiary">
              {t('auth.twoFactor.disableTokenHelp')}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? t('common.loading') : t('auth.twoFactor.disableConfirm')}
            </button>
            <button
              type="button"
              onClick={handleDisableCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-theme-input text-theme-primary border border-theme-primary rounded-md hover:bg-theme-hover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Main settings view
  return (
    <div className="bg-theme-card rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-theme-primary">
            {t('auth.twoFactor.title')}
          </h2>
          <p className="mt-2 text-sm text-theme-secondary">
            {t('auth.twoFactor.description')}
          </p>

          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-theme-primary mr-3">
                {t('common.status')}:
              </span>
              {isEnabled ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <svg
                    className="mr-1.5 h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 8 8"
                  >
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  {t('common.enabled')}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                  <svg
                    className="mr-1.5 h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 8 8"
                  >
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  {t('common.disabled')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="ml-6">
          {isEnabled ? (
            <button
              type="button"
              onClick={handleDisableClick}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              {t('common.disable')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEnable}
              className="px-4 py-2 bg-brand-primary text-theme-inverse rounded-md hover:opacity-90"
            >
              {t('common.enable')}
            </button>
          )}
        </div>
      </div>

      {isEnabled && (
        <div className="mt-6 pt-6 border-t border-theme-primary">
          <h3 className="text-sm font-medium text-theme-primary mb-2">
            {t('auth.twoFactor.recoveryOptions')}
          </h3>
          <p className="text-sm text-theme-secondary">
            {t('auth.twoFactor.backupCodesInfo')}
          </p>
        </div>
      )}
    </div>
  );
};
