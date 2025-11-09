import { useTranslation } from 'react-i18next';
import { X, Mail, User, Calendar, Send } from 'lucide-react';
import type { Message } from '@/types';

interface MessagePreviewProps {
  message: Message;
  onClose: () => void;
}

export function MessagePreview({ message, onClose }: MessagePreviewProps) {
  const { t } = useTranslation();

  // Close on escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      <div
        className="bg-theme-card border border-theme-primary rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-primary">
          <h2 id="preview-title" className="text-2xl font-bold text-theme-primary">
            {t('messages.preview.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
            aria-label={t('common.close')}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          {message.isSent && (
            <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg">
              <Send className="h-5 w-5" />
              <span className="font-medium">
                {t('messages.status.sent')} -{' '}
                {message.sentAt
                  ? new Date(message.sentAt).toLocaleString()
                  : t('common.unknown')}
              </span>
            </div>
          )}

          {/* Recipient Information */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-theme-tertiary mt-1" />
              <div>
                <p className="text-sm text-theme-tertiary">
                  {t('messages.preview.recipient')}
                </p>
                <p className="text-lg font-semibold text-theme-primary">
                  {message.recipientName}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-theme-tertiary mt-1" />
              <div>
                <p className="text-sm text-theme-tertiary">
                  {t('messages.preview.email')}
                </p>
                <p className="text-lg text-theme-primary">
                  {message.recipientEmail}
                </p>
              </div>
            </div>

            {message.subject && (
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-theme-tertiary mt-1" />
                <div>
                  <p className="text-sm text-theme-tertiary">
                    {t('messages.preview.subject')}
                  </p>
                  <p className="text-lg font-medium text-theme-primary">
                    {message.subject}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-theme-tertiary mt-1" />
              <div>
                <p className="text-sm text-theme-tertiary">
                  {t('messages.preview.created')}
                </p>
                <p className="text-theme-primary">
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="border-t border-theme-primary pt-6">
            <p className="text-sm text-theme-tertiary mb-3">
              {t('messages.preview.content')}
            </p>
            <div className="bg-theme-secondary border border-theme-primary rounded-lg p-4">
              <p className="text-theme-primary whitespace-pre-wrap break-words">
                {message.encryptedContent || t('messages.preview.noContent')}
              </p>
            </div>
            <p className="mt-2 text-xs text-theme-tertiary italic">
              {t('messages.preview.encryptionNote')}
            </p>
          </div>

          {/* Delivery Information */}
          {message.deliveryAttempts > 0 && (
            <div className="border-t border-theme-primary pt-6">
              <p className="text-sm text-theme-tertiary mb-2">
                {t('messages.preview.deliveryInfo')}
              </p>
              <div className="space-y-2 text-sm text-theme-secondary">
                <p>
                  {t('messages.preview.attempts')}: {message.deliveryAttempts}
                </p>
                {message.lastAttemptAt && (
                  <p>
                    {t('messages.preview.lastAttempt')}:{' '}
                    {new Date(message.lastAttemptAt).toLocaleString()}
                  </p>
                )}
                {message.failureReason && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                    <p className="text-red-800 dark:text-red-200 text-xs">
                      {t('messages.preview.failureReason')}:{' '}
                      {message.failureReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-theme-primary">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
