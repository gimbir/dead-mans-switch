import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  // Handle Escape key to close dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  // Handle Enter key to confirm
  useEffect(() => {
    if (!isOpen) return;

    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleEnter);
    return () => document.removeEventListener('keydown', handleEnter);
  }, [isOpen, isLoading, onConfirm]);

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={!isLoading ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-theme-card rounded-lg shadow-xl max-w-md w-full mx-auto animate-slide-in-right">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-theme-tertiary hover:text-theme-primary transition-colors disabled:opacity-50"
          aria-label={t('common.close')}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Icon and Title */}
          <div className="flex items-start space-x-4 mb-4">
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                isDanger
                  ? 'bg-red-100 dark:bg-red-900/20'
                  : 'bg-blue-100 dark:bg-blue-900/20'
              }`}
            >
              <AlertTriangle
                className={`h-6 w-6 ${
                  isDanger ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                }`}
              />
            </div>
            <div className="flex-1">
              <h3
                id="confirm-dialog-title"
                className="text-lg font-semibold text-theme-primary mb-2"
              >
                {title}
              </h3>
              <p id="confirm-dialog-description" className="text-sm text-theme-secondary">
                {message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-theme-primary text-theme-primary rounded-lg hover:bg-theme-hover transition-colors disabled:opacity-50"
            >
              {cancelText || t('common.cancel')}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 flex items-center space-x-2 ${
                isDanger
                  ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                  : 'bg-brand-primary hover:bg-indigo-700'
              }`}
            >
              {isLoading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              <span>{confirmText || t('common.confirm')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
