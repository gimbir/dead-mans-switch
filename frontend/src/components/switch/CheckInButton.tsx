import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { Switch } from '@/types';

interface CheckInButtonProps {
  switchData: Switch;
  onCheckIn: (switchId: string) => Promise<void>;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showConfirmation?: boolean;
  disabled?: boolean;
}

/**
 * CheckInButton Component
 *
 * Button for performing check-ins on a switch
 * Features:
 * - Loading state during check-in
 * - Optional confirmation dialog
 * - Disabled state for triggered switches
 * - Multiple size and style variants
 * - Theme-aware styling
 * - Multi-language support
 */
export const CheckInButton = ({
  switchData,
  onCheckIn,
  variant = 'primary',
  size = 'md',
  showConfirmation = false,
  disabled = false
}: CheckInButtonProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const confirmDialog = useConfirmDialog();

  // Check if switch can be checked in
  const canCheckIn =
    !disabled &&
    (switchData.status === 'ACTIVE' || switchData.status === 'PAUSED') &&
    switchData.isActive;

  const performCheckIn = async () => {
    try {
      setIsLoading(true);
      await onCheckIn(switchData.id);
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = () => {
    if (!canCheckIn || isLoading) return;

    // Show confirmation if enabled
    if (showConfirmation) {
      confirmDialog.openDialog({
        title: t('dashboard.confirmCheckIn'),
        message: t('dashboard.confirmCheckInMessage'),
        variant: 'primary',
        confirmText: t('dashboard.checkInNow'),
        onConfirm: performCheckIn,
      });
    } else {
      performCheckIn();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-brand-primary text-theme-inverse hover:opacity-90',
    secondary:
      'bg-theme-secondary text-theme-primary border border-theme-primary hover:bg-theme-hover'
  };

  // Disabled classes
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <>
      <button
        onClick={handleCheckIn}
        disabled={!canCheckIn || isLoading}
        className={`
          flex items-center justify-center gap-2 rounded-md font-medium transition
          ${sizeClasses[size]}
          ${!canCheckIn || isLoading ? disabledClasses : variantClasses[variant]}
        `}
        aria-label={t('dashboard.checkInNow')}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('dashboard.checkingIn')}</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            <span>{t('dashboard.checkInNow')}</span>
          </>
        )}
      </button>

      {/* Confirm Dialog */}
      {showConfirmation && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={confirmDialog.closeDialog}
          onConfirm={confirmDialog.handleConfirm}
          title={confirmDialog.config.title}
          message={confirmDialog.config.message}
          confirmText={confirmDialog.config.confirmText}
          cancelText={confirmDialog.config.cancelText}
          variant={confirmDialog.config.variant}
          isLoading={confirmDialog.isLoading || isLoading}
        />
      )}
    </>
  );
};
