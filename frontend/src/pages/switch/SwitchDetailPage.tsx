import { useState } from 'react';
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
  Power,
  X
} from 'lucide-react';
import { MainLayout } from '@components/layout/MainLayout';
import { CheckInButton } from '@components/switch';
import { MessageList, MessageForm } from '@components/message';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DetailPageSkeleton } from '@/components/common/LoadingSkeleton';
import { switchService } from '@services/switch.service';
import { ROUTES } from '@constants/index';
import type { Switch, Message } from '@/types';

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

  // Message modal state
  const [isMessageFormOpen, setIsMessageFormOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | undefined>(undefined);
  const confirmDialog = useConfirmDialog();

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
    confirmDialog.openDialog({
      title: t('common.confirm'),
      message: t('switches.deleteConfirm'),
      variant: 'danger',
      confirmText: t('common.delete'),
      onConfirm: async () => {
        deleteMutation.mutate();
      },
    });
  };

  const handleCheckIn = async (switchId: string) => {
    await checkInMutation.mutateAsync(switchId);
  };

  const handleCreateMessage = () => {
    setEditingMessage(undefined);
    setIsMessageFormOpen(true);
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setIsMessageFormOpen(true);
  };

  const handleCloseMessageForm = () => {
    setIsMessageFormOpen(false);
    setEditingMessage(undefined);
  };

  const handleMessageFormSuccess = () => {
    handleCloseMessageForm();
    // Messages will auto-refresh via React Query
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
        <DetailPageSkeleton />
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
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary">{switchData.name}</h1>
                  <div className={`flex items-center px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
                    <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor} mr-1.5`} />
                    <span className={`text-xs font-medium ${statusConfig.textColor}`}>
                      {t(`switches.status.${switchData.status}`)}
                    </span>
                  </div>
                </div>
                {switchData.description && (
                  <p className="text-theme-secondary text-sm sm:text-base">{switchData.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to={`${ROUTES.SWITCHES}/${id}/edit`}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-theme-primary text-theme-primary rounded-md hover:bg-theme-hover transition text-sm"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('common.edit')}</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('common.delete')}</span>
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
                    <button
                      onClick={handleCreateMessage}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:opacity-90 transition text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      {t('messages.create')}
                    </button>
                  </div>
                  <MessageList switchId={id!} onEdit={handleEditMessage} />
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
                <div className="bg-theme-secondary border border-theme-primary rounded-lg p-4">
                  <h3 className="font-medium text-theme-primary mb-2 text-sm">
                    {t('switches.detail.infoCardTitle')}
                  </h3>
                  <p className="text-xs text-theme-secondary">
                    {t('switches.detail.infoCardDescription', {
                      totalDays: switchData.checkInIntervalDays + switchData.gracePeriodDays
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Form Modal */}
      {isMessageFormOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={handleCloseMessageForm}
        >
          <div
            className="bg-theme-card border border-theme-primary rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-theme-primary">
              <h2 className="text-xl sm:text-2xl font-bold text-theme-primary">
                {editingMessage ? t('messages.edit') : t('messages.create')}
              </h2>
              <button
                onClick={handleCloseMessageForm}
                className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
                aria-label={t('common.close')}
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              <MessageForm
                switchId={id!}
                message={editingMessage}
                onSuccess={handleMessageFormSuccess}
                onCancel={handleCloseMessageForm}
              />
            </div>
          </div>
        </div>
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
    </MainLayout>
  );
};
