import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { twoFactorService } from '@services/twoFactor.service';
import type { TwoFactorSetupData } from '@/types';

interface TwoFactorSetupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * TwoFactorSetup Component
 *
 * Complete 2FA setup flow component
 * Features:
 * - QR code display for authenticator app
 * - Backup codes display with copy functionality
 * - Token verification
 * - Step-by-step setup process
 * - Loading states and error handling
 */
export const TwoFactorSetup = ({ onSuccess, onCancel }: TwoFactorSetupProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [step, setStep] = useState<'init' | 'verify'>('init');
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  // Create schema with translated validation messages
  const verifySchema = z.object({
    token: z
      .string()
      .length(6, t('auth.twoFactor.tokenLength'))
      .regex(/^\d{6}$/, t('auth.twoFactor.tokenNumeric')),
  });

  type VerifyFormData = z.infer<typeof verifySchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    mode: 'onBlur',
  });

  // Step 1: Enable 2FA and get QR code
  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      const data = await twoFactorService.enable();
      setSetupData(data);
      setStep('verify');
    } catch (error: any) {
      toast.error(error.message || t('auth.twoFactor.setupError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify token to complete setup
  const onSubmitVerify = async (data: VerifyFormData) => {
    if (!setupData) return;

    setIsLoading(true);
    try {
      await twoFactorService.verifySetup({
        token: data.token,
        encryptedSecret: setupData.secret,
        backupCodes: setupData.backupCodes,
      });

      toast.success(t('auth.twoFactor.enableSuccess'));
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || t('auth.twoFactor.verifyError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyBackupCodes = () => {
    if (!setupData) return;

    const codesText = setupData.backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedBackupCodes(true);
    toast.success(t('auth.twoFactor.backupCodesCopied'));

    setTimeout(() => setCopiedBackupCodes(false), 3000);
  };

  const handleDownloadBackupCodes = () => {
    if (!setupData) return;

    const codesText = setupData.backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deadmansswitch-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(t('auth.twoFactor.backupCodesDownloaded'));
  };

  // Initial state - show enable button
  if (step === 'init') {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t('auth.twoFactor.whatIs2FA')}
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>{t('auth.twoFactor.twoFactorDescription')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-theme-primary">
            {t('auth.twoFactor.setupSteps')}
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-theme-secondary">
            <li>{t('auth.twoFactor.step1')}</li>
            <li>{t('auth.twoFactor.step2')}</li>
            <li>{t('auth.twoFactor.step3')}</li>
            <li>{t('auth.twoFactor.step4')}</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleEnable2FA}
            disabled={isLoading}
            className="px-4 py-2 bg-brand-primary text-theme-inverse rounded-md hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? t('common.loading') : t('auth.twoFactor.enable')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-theme-input text-theme-primary border border-theme-primary rounded-md hover:bg-theme-hover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {t('common.cancel')}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Verification step - show QR code and backup codes
  return (
    <div className="space-y-6">
      {/* QR Code Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-theme-primary">
            {t('auth.twoFactor.scanQRCode')}
          </h3>
          <p className="mt-1 text-sm text-theme-secondary">
            {t('auth.twoFactor.scanInstructions')}
          </p>
        </div>

        {setupData?.qrCodeDataUrl && (
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <img
              src={setupData.qrCodeDataUrl}
              alt="2FA QR Code"
              className="w-64 h-64"
            />
          </div>
        )}

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
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
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {t('auth.twoFactor.saveBackupCodes')}
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>{t('auth.twoFactor.backupCodesWarning')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Codes Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-theme-primary">
          {t('auth.twoFactor.backupCodesTitle')}
        </h3>

        <div className="bg-theme-input border border-theme-primary rounded-lg p-4">
          <div className="grid grid-cols-2 gap-2 font-mono text-sm text-theme-primary">
            {setupData?.backupCodes.map((code, index) => (
              <div key={index} className="p-2 bg-theme-card rounded">
                {code}
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleCopyBackupCodes}
              className="flex items-center gap-2 px-4 py-2 bg-theme-card text-theme-primary border border-theme-primary rounded-md hover:bg-theme-hover"
            >
              {copiedBackupCodes ? (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {t('common.copied')}
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  {t('common.copy')}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadBackupCodes}
              className="flex items-center gap-2 px-4 py-2 bg-theme-card text-theme-primary border border-theme-primary rounded-md hover:bg-theme-hover"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {t('common.download')}
            </button>
          </div>
        </div>
      </div>

      {/* Verification Form */}
      <form onSubmit={handleSubmit(onSubmitVerify)} className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-theme-primary">
            {t('auth.twoFactor.verifySetup')}
          </h3>
          <p className="mt-1 text-sm text-theme-secondary">
            {t('auth.twoFactor.enterCodeFromApp')}
          </p>
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
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-brand-primary text-theme-inverse rounded-md hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? t('auth.twoFactor.verifying') : t('auth.twoFactor.verify')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-theme-input text-theme-primary border border-theme-primary rounded-md hover:bg-theme-hover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
