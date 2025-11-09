import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { MainLayout } from '@components/layout/MainLayout';
import { SwitchForm } from '@components/switch';
import { switchService } from '@services/switch.service';
import { ROUTES } from '@constants/index';
import type { CreateSwitchData, UpdateSwitchData } from '@/types';

/**
 * SwitchCreatePage Component
 *
 * Page for creating a new switch
 * Features:
 * - SwitchForm for input
 * - Form validation
 * - Success/error handling
 * - Redirect to switch detail after creation
 * - Back navigation
 * - Theme-aware styling
 * - Multi-language support
 */
export const SwitchCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateSwitchData) => switchService.createSwitch(data),
    onSuccess: (createdSwitch) => {
      // Show success message
      toast.success(t('switches.form.createSuccess'));
      // Redirect to switch detail page
      navigate(`${ROUTES.SWITCHES}/${createdSwitch.id}`);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : t('switches.form.createError'));
      toast.error(t('switches.form.createError'));
    }
  });

  const handleSubmit = async (data: CreateSwitchData | UpdateSwitchData) => {
    setError(null);
    await createMutation.mutateAsync(data as CreateSwitchData);
  };

  const handleBack = () => {
    navigate(ROUTES.SWITCHES);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-theme-primary">
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-theme-secondary hover:text-brand-primary mb-6 transition"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{t('common.back')}</span>
            </button>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-theme-primary">{t('switches.create')}</h1>
              <p className="mt-2 text-theme-secondary">
                Create a new dead man's switch to protect your important information
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-theme-card border border-theme-primary rounded-lg p-6 shadow-sm">
              <SwitchForm
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending}
                mode="create"
              />
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                How it works
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Set your check-in interval - how often you need to check in</li>
                <li>Add a grace period - extra time before the switch triggers</li>
                <li>
                  If you don't check in within the interval + grace period, your switch will trigger
                </li>
                <li>Once created, add messages that will be sent when the switch triggers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
