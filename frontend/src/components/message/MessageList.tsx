import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Edit, Eye, Mail } from 'lucide-react';
import { useMessages, useDeleteMessage } from '@/hooks/useMessages';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import type { Message } from '@/types';
import { MessagePreview } from './MessagePreview';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ListSkeleton } from '@/components/common/LoadingSkeleton';

interface MessageListProps {
  switchId: string;
  onEdit?: (message: Message) => void;
}

export function MessageList({ switchId, onEdit }: MessageListProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [previewMessage, setPreviewMessage] = useState<Message | null>(null);

  const { data, isLoading, error } = useMessages(switchId, currentPage, 10);
  const deleteMutation = useDeleteMessage(switchId);
  const confirmDialog = useConfirmDialog();

  const handleDelete = (messageId: string, messageName: string) => {
    confirmDialog.openDialog({
      title: t('common.confirm'),
      message: t('messages.confirmDelete', { name: messageName }),
      variant: 'danger',
      confirmText: t('common.delete'),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(messageId);
      },
    });
  };

  const handlePreview = (message: Message) => {
    setPreviewMessage(message);
  };

  const handleClosePreview = () => {
    setPreviewMessage(null);
  };

  if (isLoading) {
    return <ListSkeleton count={3} />;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">
          {t('messages.errors.fetchFailed')}
        </p>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="text-center py-12 bg-theme-card rounded-lg border border-theme-primary">
        <Mail className="mx-auto h-12 w-12 text-theme-tertiary mb-4" />
        <h3 className="text-lg font-medium text-theme-primary mb-2">
          {t('messages.noMessages')}
        </h3>
        <p className="text-theme-secondary">
          {t('messages.noMessagesDescription')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {data.items.map((message) => (
          <div
            key={message.id}
            className="bg-theme-card border border-theme-primary rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-theme-primary">
                    {message.recipientName}
                  </h3>
                  {message.isSent && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                      {t('messages.status.sent')}
                    </span>
                  )}
                </div>

                <p className="text-theme-secondary text-sm mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  {message.recipientEmail}
                </p>

                {message.subject && (
                  <p className="text-theme-primary font-medium mb-2">
                    {t('messages.subject')}: {message.subject}
                  </p>
                )}

                <p className="text-theme-tertiary text-sm">
                  {t('messages.created')}:{' '}
                  {new Date(message.createdAt).toLocaleDateString()}
                </p>

                {message.sentAt && (
                  <p className="text-theme-tertiary text-sm">
                    {t('messages.sentAt')}:{' '}
                    {new Date(message.sentAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handlePreview(message)}
                  className="p-2 text-theme-secondary hover:text-brand-primary hover:bg-theme-hover rounded-lg transition-colors"
                  title={t('messages.actions.preview')}
                  aria-label={`${t('messages.actions.preview')} message to ${message.recipientName}`}
                >
                  <Eye className="h-5 w-5" aria-hidden="true" />
                </button>

                {!message.isSent && (
                  <>
                    <button
                      onClick={() => onEdit?.(message)}
                      className="p-2 text-theme-secondary hover:text-brand-primary hover:bg-theme-hover rounded-lg transition-colors"
                      title={t('messages.actions.edit')}
                      aria-label={`${t('messages.actions.edit')} message to ${message.recipientName}`}
                    >
                      <Edit className="h-5 w-5" aria-hidden="true" />
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(message.id, message.recipientName)
                      }
                      disabled={deleteMutation.isPending}
                      className="p-2 text-theme-secondary hover:text-red-600 hover:bg-theme-hover rounded-lg transition-colors disabled:opacity-50"
                      title={t('messages.actions.delete')}
                      aria-label={`${t('messages.actions.delete')} message to ${message.recipientName}`}
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Pagination */}
        {data.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-theme-primary text-theme-primary rounded-lg hover:bg-theme-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.previous')}
            </button>

            <span className="text-theme-primary">
              {t('common.pageInfo', {
                current: currentPage,
                total: data.pagination.totalPages,
              })}
            </span>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(data.pagination.totalPages, p + 1))
              }
              disabled={currentPage === data.pagination.totalPages}
              className="px-4 py-2 border border-theme-primary text-theme-primary rounded-lg hover:bg-theme-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewMessage && (
        <MessagePreview message={previewMessage} onClose={handleClosePreview} />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.closeDialog}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.config.title}
        message={confirmDialog.config.message}
        confirmText={confirmDialog.config.confirmText}
        cancelText={confirmDialog.config.cancelText}
        variant={confirmDialog.config.variant}
        isLoading={confirmDialog.isLoading}
      />
    </>
  );
}
