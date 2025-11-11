import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Edit, Trash2, Power, CheckCircle, AlertCircle, PauseCircle } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import type { Switch } from '@/types';
import { ROUTES } from '@constants/index';

interface SwitchCardProps {
  switchData: Switch;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

/**
 * SwitchCard Component
 *
 * Displays a switch with its information and countdown timer
 * Features:
 * - Status badge with appropriate colors
 * - Countdown timer to next check-in
 * - Quick action buttons (Edit, Delete)
 * - Click to view details
 * - Theme-aware styling
 * - Multi-language support
 */
export const SwitchCard = ({ switchData, onDelete, showActions = true }: SwitchCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Use real-time countdown hook
  const countdown = useCountdown(switchData.nextCheckInDue, switchData.checkInIntervalDays);

  // Get progress bar color based on time remaining
  const getProgressBarColor = (percentageRemaining: number): string => {
    if (percentageRemaining > 50) {
      // Green: Plenty of time (>50%)
      return 'bg-green-500';
    } else if (percentageRemaining > 25) {
      // Yellow/Amber: Moderate time (25-50%)
      return 'bg-amber-500';
    } else if (percentageRemaining > 10) {
      // Orange: Low time (10-25%)
      return 'bg-orange-500';
    } else {
      // Red: Critical time (<10%)
      return 'bg-red-500';
    }
  };

  // Get status badge configuration
  const getStatusConfig = (status: Switch['status']) => {
    switch (status) {
      case 'ACTIVE':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          label: t('switches.status.ACTIVE')
        };
      case 'PAUSED':
        return {
          icon: PauseCircle,
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800',
          iconColor: 'text-amber-600',
          label: t('switches.status.PAUSED')
        };
      case 'TRIGGERED':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          label: t('switches.status.TRIGGERED')
        };
      default:
        return {
          icon: Power,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          label: t('switches.status.INACTIVE')
        };
    }
  };

  // Format interval for display (interval is in days)
  const formatInterval = (intervalDays: number) => {
    return t('switches.interval.everyDay', { count: intervalDays });
  };

  const statusConfig = getStatusConfig(switchData.status);
  const StatusIcon = statusConfig.icon;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(switchData.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`${ROUTES.SWITCHES}/${switchData.id}/edit`);
  };

  return (
    <Link
      to={`${ROUTES.SWITCHES}/${switchData.id}`}
      className="block bg-theme-card border border-theme-primary rounded-lg p-6 hover:bg-theme-hover transition-colors"
      aria-label={`View details for ${switchData.name} switch`}
    >
      {/* Header: Name + Status Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-theme-primary mb-1">{switchData.name}</h3>
          {switchData.description && (
            <p className="text-sm text-theme-secondary line-clamp-2">
              {switchData.description}
            </p>
          )}
        </div>
        <div className={`flex items-center px-3 py-1 rounded-full ${statusConfig.bgColor} ml-4`}>
          <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor} mr-1.5`} />
          <span className={`text-xs font-medium ${statusConfig.textColor}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Check-in Interval */}
        <div>
          <p className="text-xs text-theme-secondary mb-1">{t('switches.interval.label')}</p>
          <p className="text-sm font-medium text-theme-primary">
            {formatInterval(switchData.checkInIntervalDays)}
          </p>
        </div>

        {/* Next Check-in */}
        {switchData.nextCheckInDue && countdown && (
          <div>
            <p className="text-xs text-theme-secondary mb-1">{t('switches.nextCheckIn')}</p>
            <p
              className={`text-sm font-medium ${
                countdown.isOverdue ? 'text-red-600' : 'text-theme-primary'
              }`}
            >
              {countdown.isOverdue ? countdown.text : `${t('dashboard.dueIn')} ${countdown.text}`}
            </p>
          </div>
        )}

        {/* Last Check-in */}
        {switchData.lastCheckInAt && (
          <div>
            <p className="text-xs text-theme-secondary mb-1">{t('switches.lastCheckIn')}</p>
            <p className="text-sm font-medium text-theme-primary">
              {new Date(switchData.lastCheckInAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-theme-primary">
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-theme-secondary hover:text-brand-primary transition"
            aria-label={`Edit ${switchData.name} switch`}
          >
            <Edit className="h-4 w-4" aria-hidden="true" />
            <span>{t('common.edit')}</span>
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 transition"
              aria-label={`Delete ${switchData.name} switch`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>{t('common.delete')}</span>
            </button>
          )}
        </div>
      )}

      {/* Countdown Timer Visual Indicator */}
      {switchData.status === 'ACTIVE' && countdown && !countdown.isOverdue && (
        <div className="mt-4 pt-4 border-t border-theme-primary">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-theme-secondary" />
            <div className="flex-1 relative group">
              {/* Progress Bar */}
              <div className="h-2 bg-theme-secondary rounded-full overflow-hidden cursor-help">
                <div
                  className={`h-full transition-all duration-1000 ${getProgressBarColor(countdown.percentageRemaining)}`}
                  style={{ width: `${countdown.percentageRemaining}%` }}
                />
              </div>

              {/* Tooltip - Shows on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 pointer-events-none">
                <div className="flex flex-col gap-1">
                  <div className="font-semibold text-center border-b border-gray-600 pb-1 mb-1">
                    {t('dashboard.timeRemaining')}
                  </div>
                  {countdown.timeLeft.days > 0 && (
                    <div className="flex justify-between gap-4">
                      <span>{t('dashboard.days')}:</span>
                      <span className="font-medium">{countdown.timeLeft.days}</span>
                    </div>
                  )}
                  {(countdown.timeLeft.days > 0 || countdown.timeLeft.hours > 0) && (
                    <div className="flex justify-between gap-4">
                      <span>{t('dashboard.hours')}:</span>
                      <span className="font-medium">{countdown.timeLeft.hours}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <span>{t('dashboard.minutes')}:</span>
                    <span className="font-medium">{countdown.timeLeft.minutes}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-gray-400">
                    <span>{t('dashboard.seconds')}:</span>
                    <span className="font-medium">{countdown.timeLeft.seconds}</span>
                  </div>
                </div>
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};
