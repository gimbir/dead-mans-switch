import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { MainLayout } from '@components/layout/MainLayout';
import { SwitchForm } from '@components/switch';
import { useSwitch, useUpdateSwitch } from '@/hooks/useSwitches';
import { ROUTES } from '@constants/index';
import type { CreateSwitchData, UpdateSwitchData } from '@/types';

/**
 * SwitchEditPage Component
 *
 * Page for editing an existing switch
 * Features:
 * - Load existing switch data
 * - SwitchForm pre-populated with current values
 * - Form validation
 * - Success/error handling
 * - Redirect to switch detail after update
 * - Loading and error states
 * - Back navigation
 * - Theme-aware styling
 * - Multi-language support
 */
export const SwitchEditPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);

  // Fetch switch data using custom hook
  const {
    data: switchData,
    isLoading,
    error: fetchError
  } = useSwitch(id!);

  // Update mutation using custom hook
  const updateMutation = useUpdateSwitch();

  const handleSubmit = async (data: CreateSwitchData | UpdateSwitchData) => {
    if (!id) return;
    setError(null);
    try {
      const updatedSwitch = await updateMutation.mutateAsync({
        id,
        data: data as UpdateSwitchData
      });
      // Redirect to switch detail page (toast is shown by hook)
      navigate(`${ROUTES.SWITCHES}/${updatedSwitch.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : t('switches.form.updateError'));
    }
  };

  const handleBack = () => {
    navigate(`${ROUTES.SWITCHES}/${id}`);
  };

  if (!id) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-theme-primary flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-theme-primary text-lg">Invalid switch ID</p>
          </div>
        </div>
      </MainLayout>
    );
  }

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
              <h1 className="text-3xl font-bold text-theme-primary">{t('switches.edit')}</h1>
              <p className="mt-2 text-theme-secondary">
                Update your dead man's switch configuration
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
              </div>
            )}

            {/* Fetch Error */}
            {fetchError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800">
                    {fetchError instanceof Error ? fetchError.message : 'Failed to load switch'}
                  </p>
                </div>
              </div>
            )}

            {/* Update Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Form Card */}
            {switchData && !isLoading && (
              <>
                <div className="bg-theme-card border border-theme-primary rounded-lg p-6 shadow-sm">
                  <SwitchForm
                    initialData={switchData}
                    onSubmit={handleSubmit}
                    isSubmitting={updateMutation.isPending}
                    mode="edit"
                  />
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                    Important Notes
                  </h3>
                  <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                    <li>
                      Changing the check-in interval will recalculate your next check-in due date
                    </li>
                    <li>Your existing messages will not be affected by these changes</li>
                    <li>
                      If the switch has already been triggered, you cannot modify its configuration
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
