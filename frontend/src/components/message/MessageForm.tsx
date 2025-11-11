import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { useCreateMessage, useUpdateMessage } from '@/hooks/useMessages';
import type { Message } from '@/types';

interface MessageFormProps {
  switchId: string;
  message?: Message;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MessageForm({ switchId, message, onSuccess, onCancel }: MessageFormProps) {
  const { t } = useTranslation();
  const isEditing = !!message;
  const [backendError, setBackendError] = useState<string | null>(null);

  const createMutation = useCreateMessage(switchId);
  const updateMutation = useUpdateMessage(message?.id || '', switchId);

  // Create validation schema with translated messages
  const messageSchema = z.object({
    recipientEmail: z
      .email(t('messages.form.validation.emailInvalid'))
      .min(1, t('messages.form.validation.emailRequired')),
    recipientName: z
      .string()
      .min(1, t('messages.form.validation.nameRequired'))
      .min(2, t('messages.form.validation.nameMin'))
      .max(100, t('messages.form.validation.nameMax')),
    subject: z
      .string()
      .max(200, t('messages.form.validation.subjectMax'))
      .optional()
      .or(z.literal('')),
    content: z
      .string()
      .min(1, t('messages.form.validation.contentRequired'))
      .min(10, t('messages.form.validation.contentMin'))
      .max(5000, t('messages.form.validation.contentMax'))
  });

  type MessageFormData = z.infer<typeof messageSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    mode: 'onBlur', // Validate on blur for real-time feedback
    defaultValues: message
      ? {
          recipientEmail: message.recipientEmail,
          recipientName: message.recipientName,
          subject: message.subject || '',
          content: message.encryptedContent // Note: Backend handles encryption
        }
      : undefined
  });

  const onSubmit = async (data: MessageFormData) => {
    try {
      setBackendError(null); // Clear previous errors

      if (isEditing) {
        await updateMutation.mutateAsync({
          recipientEmail: data.recipientEmail,
          recipientName: data.recipientName,
          subject: data.subject || undefined,
          encryptedContent: data.content // Backend will re-encrypt
        });
      } else {
        await createMutation.mutateAsync({
          recipientEmail: data.recipientEmail,
          recipientName: data.recipientName,
          subject: data.subject || undefined,
          encryptedContent: data.content // Backend will encrypt
        });
      }

      onSuccess?.();
    } catch (error: any) {
      // Set backend error for display
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        (isEditing ? t('messages.errors.updateFailed') : t('messages.errors.createFailed'));
      setBackendError(errorMessage);
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-6'
    >
      {/* Backend Error Display */}
      {backendError && (
        <div
          className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'
          role="alert"
          aria-live="assertive"
        >
          <div className='flex items-start'>
            <AlertCircle className='h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0' aria-hidden="true" />
            <div className='flex-1'>
              <p className='text-sm text-red-800 dark:text-red-200 font-medium'>{backendError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recipient Email */}
      <div>
        <label
          htmlFor='recipientEmail'
          className='block text-sm font-medium text-theme-primary mb-2'
        >
          {t('messages.form.recipientEmail')}
        </label>
        <input
          {...register('recipientEmail')}
          type='email'
          id='recipientEmail'
          autoComplete='email'
          aria-invalid={errors.recipientEmail ? 'true' : 'false'}
          aria-describedby={errors.recipientEmail ? 'recipientEmail-error' : undefined}
          className={`w-full px-4 py-2 border rounded-lg bg-theme-input text-theme-primary focus:outline-none focus:ring-2 transition-colors ${
            errors.recipientEmail
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-theme-primary focus:ring-brand-primary focus:border-brand-primary'
          } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          placeholder={t('messages.form.recipientEmailPlaceholder')}
          disabled={isLoading}
        />
        {errors.recipientEmail && (
          <p id='recipientEmail-error' className='mt-2 text-sm text-red-600 dark:text-red-400 flex items-center' role="alert">
            <AlertCircle className='h-4 w-4 mr-1' aria-hidden="true" />
            {errors.recipientEmail.message}
          </p>
        )}
      </div>

      {/* Recipient Name */}
      <div>
        <label
          htmlFor='recipientName'
          className='block text-sm font-medium text-theme-primary mb-2'
        >
          {t('messages.form.recipientName')}
        </label>
        <input
          {...register('recipientName')}
          type='text'
          id='recipientName'
          autoComplete='name'
          className={`w-full px-4 py-2 border rounded-lg bg-theme-input text-theme-primary focus:outline-none focus:ring-2 transition-colors ${
            errors.recipientName
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-theme-primary focus:ring-brand-primary focus:border-brand-primary'
          } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          placeholder={t('messages.form.recipientNamePlaceholder')}
          disabled={isLoading}
        />
        {errors.recipientName && (
          <p className='mt-2 text-sm text-red-600 dark:text-red-400 flex items-center'>
            <AlertCircle className='h-4 w-4 mr-1' />
            {errors.recipientName.message}
          </p>
        )}
      </div>

      {/* Subject (Optional) */}
      <div>
        <label
          htmlFor='subject'
          className='block text-sm font-medium text-theme-primary mb-2'
        >
          {t('messages.form.subject')}{' '}
          <span className='text-theme-tertiary text-xs'>({t('common.optional')})</span>
        </label>
        <input
          {...register('subject')}
          type='text'
          id='subject'
          className={`w-full px-4 py-2 border rounded-lg bg-theme-input text-theme-primary focus:outline-none focus:ring-2 transition-colors ${
            errors.subject
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-theme-primary focus:ring-brand-primary focus:border-brand-primary'
          } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          placeholder={t('messages.form.subjectPlaceholder')}
          disabled={isLoading}
        />
        {errors.subject && (
          <p className='mt-2 text-sm text-red-600 dark:text-red-400 flex items-center'>
            <AlertCircle className='h-4 w-4 mr-1' />
            {errors.subject.message}
          </p>
        )}
      </div>

      {/* Message Content */}
      <div>
        <label
          htmlFor='content'
          className='block text-sm font-medium text-theme-primary mb-2'
        >
          {t('messages.form.content')}
        </label>
        <textarea
          {...register('content')}
          id='content'
          rows={8}
          className={`w-full px-4 py-2 border rounded-lg bg-theme-input text-theme-primary focus:outline-none focus:ring-2 resize-y transition-colors ${
            errors.content
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-theme-primary focus:ring-brand-primary focus:border-brand-primary'
          } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          placeholder={t('messages.form.contentPlaceholder')}
          disabled={isLoading}
        />
        {errors.content && (
          <p className='mt-2 text-sm text-red-600 dark:text-red-400 flex items-center'>
            <AlertCircle className='h-4 w-4 mr-1 flex-shrink-0' />
            <span>{errors.content.message}</span>
          </p>
        )}
        <p className='mt-2 text-xs text-theme-tertiary italic'>
          {t('messages.form.encryptionNote')}
        </p>
      </div>

      {/* Actions */}
      <div className='flex flex-col sm:flex-row justify-end gap-3 sm:gap-4'>
        {onCancel && (
          <button
            type='button'
            onClick={onCancel}
            disabled={isLoading}
            className='w-full sm:w-auto px-6 py-2 border border-theme-primary text-theme-primary rounded-lg hover:bg-theme-hover transition-colors disabled:opacity-50 order-2 sm:order-1'
          >
            {t('common.cancel')}
          </button>
        )}
        <button
          type='submit'
          disabled={isLoading}
          className='w-full sm:w-auto px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 order-1 sm:order-2'
        >
          {isLoading && (
            <svg
              className='animate-spin h-5 w-5 text-white'
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
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
          )}
          <span>{isEditing ? t('messages.form.update') : t('messages.form.create')}</span>
        </button>
      </div>
    </form>
  );
}
