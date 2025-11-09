import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  PauseCircle,
  Power
} from 'lucide-react';
import { MainLayout } from '@components/layout/MainLayout';
import { CheckInButton } from '@components/switch';
import { switchService } from '@services/switch.service';
import { ROUTES } from '@constants/index';
import type { Switch } from '@/types';

/**
 * SwitchDetailPage Component
 *
 * Page for viewing switch details
 * Features:
 * - Switch information display
 * - Check-in button
 * - Edit and delete actions
 * - Messages preview
 * - Status badges
 * - Countdown timer
 * - Theme-aware styling
 * - Multi-language support
 */
export const SwitchDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch switch details
  const { data: switchData, isLoading, error } = useQuery({
    queryKey: ['switch', id],
    queryFn: () => switchService.getSwitch(id!),
    enabled: !!id
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => switchService.deleteSwitch(id!),
    onSuccess: () => {
      toast.success(t('switches.deleteSuccess'));
      navigate(ROUTES.SWITCHES);
    },
    onError: () => {
      toast.error(t('switches.deleteError'));
    }
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (switchId: string) => switchService.performCheckIn(switchId),
    onSuccess: () => {
      toast.success(t('dashboard.checkInSuccess'));
      queryClient.invalidateQueries({ queryKey: ['switch', id] });
    },
    onError: () => {
      toast.error(t('dashboard.checkInError'));
    }
  });

  const handleDelete = () => {
    if (window.confirm(t('switches.deleteConfirm'))) {
      deleteMutation.mutate();
    }
  };

  const handleCheckIn = async (switchId: string) => {
    await checkInMutation.mutateAsync(switchId);
  };

  // Get status configuration
  const getStatusConfig = (status: Switch['status']) => {
    switch (status) {
      case 'ACTIVE':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'PAUSED':
        return {
          icon: PauseCircle,
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800',
          iconColor: 'text-amber-600'
        };
      case 'TRIGGERED':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      default:
        return {
          icon: Power,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  // Format interval
  const formatInterval = (days: number) => {
    return t('switches.interval.everyDay', { count: days });
  };

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-theme-primary flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error || !switchData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-theme-primary">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  {error instanceof Error ? error.message : 'Failed to load switch'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const statusConfig = getStatusConfig(switchData.status);
  const StatusIcon = statusConfig.icon;

  return (
    <MainLayout>
      <div className="min-h-screen bg-theme-primary">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Back Button */}
            <button
              onClick={() => navigate(ROUTES.SWITCHES)}
              className="flex items-center gap-2 text-theme-secondary hover:text-brand-primary mb-6 transition"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{t('common.back')}</span>
            </button>

            {/* Header Section */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-theme-primary">{switchData.name}</h1>
                  <div className={`flex items-center px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
                    <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor} mr-1.5`} />
                    <span className={`text-xs font-medium ${statusConfig.textColor}`}>
                      {t(`switches.status.${switchData.status}`)}
                    </span>
                  </div>
                </div>
                {switchData.description && (
                  <p className="text-theme-secondary">{switchData.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link
                  to={`${ROUTES.SWITCHES}/${id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 border border-theme-primary text-theme-primary rounded-md hover:bg-theme-hover transition"
                >
                  <Edit className="h-4 w-4" />
                  <span>{t('common.edit')}</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{t('common.delete')}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info Card */}
              <div className="lg:col-span-2 space-y-6">
                {/* Switch Details */}
                <div className="bg-theme-card border border-theme-primary rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-theme-primary mb-4">Switch Details</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 text-theme-secondary mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{t('switches.interval.label')}</span>
                      </div>
                      <p className="text-lg font-medium text-theme-primary">
                        {formatInterval(switchData.checkInIntervalDays)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-theme-secondary mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{t('switches.form.gracePeriodDays')}</span>
                      </div>
                      <p className="text-lg font-medium text-theme-primary">
                        {switchData.gracePeriodDays} {t('dashboard.days')}
                      </p>
                    </div>
                    {switchData.nextCheckInDue && (
                      <div>
                        <div className="flex items-center gap-2 text-theme-secondary mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{t('switches.nextCheckIn')}</span>
                        </div>
                        <p className="text-lg font-medium text-theme-primary">
                          {new Date(switchData.nextCheckInDue).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {switchData.lastCheckInAt && (
                      <div>
                        <div className="flex items-center gap-2 text-theme-secondary mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{t('switches.lastCheckIn')}</span>
                        </div>
                        <p className="text-lg font-medium text-theme-primary">
                          {new Date(switchData.lastCheckInAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages Section */}
                <div className="bg-theme-card border border-theme-primary rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-theme-primary flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {t('messages.title')}
                    </h2>
                    <Link
                      to={`${ROUTES.SWITCHES}/${id}/messages/create`}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-theme-inverse rounded-md hover:opacity-90 transition text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      {t('messages.create')}
                    </Link>
                  </div>
                  <div className="text-center py-8 text-theme-secondary">
                    <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">{t('messages.noMessages')}</p>
                    <p className="text-sm mt-1">{t('messages.noMessagesDescription')}</p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Check-in Card */}
                <div className="bg-theme-card border border-theme-primary rounded-lg p-6">
                  <h3 className="font-semibold text-theme-primary mb-4">Quick Actions</h3>
                  <CheckInButton
                    switchData={switchData}
                    onCheckIn={handleCheckIn}
                    variant="primary"
                    size="md"
                    showConfirmation={true}
                  />
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">
                    About This Switch
                  </h3>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    This switch will trigger if you don't check in within{' '}
                    {switchData.checkInIntervalDays + switchData.gracePeriodDays} days. Make sure to add
                    messages that will be sent when triggered.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
