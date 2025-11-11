import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import type { Switch, CreateSwitchData, UpdateSwitchData } from '@/types';

interface SwitchFormProps {
  initialData?: Switch;
  onSubmit: (data: CreateSwitchData | UpdateSwitchData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

interface SwitchFormData {
  name: string;
  description?: string;
  checkInIntervalDays: number;
  gracePeriodDays: number;
  isActive: boolean;
}

/**
 * SwitchForm Component
 *
 * Form for creating and editing switches
 * Features:
 * - Create and edit modes
 * - Form validation with react-hook-form
 * - Real-time validation feedback
 * - Grace period validation (cannot exceed check-in interval)
 * - Loading states
 * - Theme-aware styling
 * - Multi-language support
 */
export const SwitchForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create'
}: SwitchFormProps) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<SwitchFormData>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      checkInIntervalDays: initialData?.checkInIntervalDays || 7,
      gracePeriodDays: initialData?.gracePeriodDays || 1,
      isActive: initialData?.isActive ?? true
    }
  });

  // Watch check-in interval for grace period validation
  const checkInIntervalDays = watch('checkInIntervalDays');

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || '',
        checkInIntervalDays: initialData.checkInIntervalDays,
        gracePeriodDays: initialData.gracePeriodDays,
        isActive: initialData.isActive
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: SwitchFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-theme-primary mb-2">
          {t('switches.form.name')}
          <span className="text-red-600 ml-1">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name', {
            required: t('switches.form.validation.nameRequired'),
            minLength: {
              value: 3,
              message: t('switches.form.validation.nameMin')
            },
            maxLength: {
              value: 100,
              message: t('switches.form.validation.nameMax')
            }
          })}
          placeholder={t('switches.form.namePlaceholder')}
          className={`w-full px-4 py-2 border rounded-md bg-theme-input text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition ${
            errors.name ? 'border-red-500' : 'border-theme-primary'
          }`}
          disabled={isSubmitting}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        <p className="mt-1 text-xs text-theme-secondary">{t('switches.form.nameHelper')}</p>
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-theme-primary mb-2">
          {t('switches.form.description')}
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description', {
            maxLength: {
              value: 500,
              message: t('switches.form.validation.descriptionMax')
            }
          })}
          placeholder={t('switches.form.descriptionPlaceholder')}
          className={`w-full px-4 py-2 border rounded-md bg-theme-input text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition resize-none ${
            errors.description ? 'border-red-500' : 'border-theme-primary'
          }`}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
        <p className="mt-1 text-xs text-theme-secondary">{t('switches.form.descriptionHelper')}</p>
      </div>

      {/* Check-in Interval Field */}
      <div>
        <label
          htmlFor="checkInIntervalDays"
          className="block text-sm font-medium text-theme-primary mb-2"
        >
          {t('switches.form.checkInIntervalDays')}
          <span className="text-red-600 ml-1">*</span>
        </label>
        <input
          id="checkInIntervalDays"
          type="number"
          min="1"
          max="365"
          {...register('checkInIntervalDays', {
            required: t('switches.form.validation.intervalRequired'),
            valueAsNumber: true,
            min: {
              value: 1,
              message: t('switches.form.validation.intervalMin')
            },
            max: {
              value: 365,
              message: t('switches.form.validation.intervalMax')
            }
          })}
          className={`w-full px-4 py-2 border rounded-md bg-theme-input text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition ${
            errors.checkInIntervalDays ? 'border-red-500' : 'border-theme-primary'
          }`}
          disabled={isSubmitting}
        />
        {errors.checkInIntervalDays && (
          <p className="mt-1 text-sm text-red-600">{errors.checkInIntervalDays.message}</p>
        )}
        <p className="mt-1 text-xs text-theme-secondary">
          {t('switches.form.checkInIntervalHelper')}
        </p>
      </div>

      {/* Grace Period Field */}
      <div>
        <label
          htmlFor="gracePeriodDays"
          className="block text-sm font-medium text-theme-primary mb-2"
        >
          {t('switches.form.gracePeriodDays')}
          <span className="text-red-600 ml-1">*</span>
        </label>
        <input
          id="gracePeriodDays"
          type="number"
          min="0"
          max="365"
          {...register('gracePeriodDays', {
            required: t('switches.form.validation.gracePeriodRequired'),
            valueAsNumber: true,
            min: {
              value: 0,
              message: t('switches.form.validation.gracePeriodMin')
            },
            max: {
              value: 365,
              message: t('switches.form.validation.gracePeriodMax')
            },
            validate: (value) => {
              if (value > checkInIntervalDays) {
                return t('switches.form.validation.gracePeriodTooLong');
              }
              return true;
            }
          })}
          className={`w-full px-4 py-2 border rounded-md bg-theme-input text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition ${
            errors.gracePeriodDays ? 'border-red-500' : 'border-theme-primary'
          }`}
          disabled={isSubmitting}
        />
        {errors.gracePeriodDays && (
          <p className="mt-1 text-sm text-red-600">{errors.gracePeriodDays.message}</p>
        )}
        <p className="mt-1 text-xs text-theme-secondary">
          {t('switches.form.gracePeriodHelper')}
        </p>
      </div>

      {/* Is Active Toggle */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="isActive"
            type="checkbox"
            {...register('isActive')}
            className="w-4 h-4 border border-theme-primary rounded bg-theme-card text-brand-primary focus:ring-2 focus:ring-brand-primary cursor-pointer"
            disabled={isSubmitting}
          />
        </div>
        <div className="ml-3">
          <label htmlFor="isActive" className="font-medium text-theme-primary cursor-pointer">
            {t('switches.form.isActive')}
          </label>
          <p className="text-xs text-theme-secondary">{t('switches.form.isActiveHelper')}</p>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel || (() => reset())}
          disabled={isSubmitting}
          className="px-6 py-2 border border-theme-primary text-theme-primary rounded-md hover:bg-theme-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-theme-inverse rounded-md hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting
            ? mode === 'create'
              ? t('switches.form.creating')
              : t('switches.form.updating')
            : t('common.submit')}
        </button>
      </div>
    </form>
  );
};
