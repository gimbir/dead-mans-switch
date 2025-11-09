import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Edit, Trash2, Power, CheckCircle, AlertCircle, PauseCircle } from 'lucide-react';
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

  // Calculate time until due
  const getTimeUntilDue = (dueDate: string) => {
    const now = new Date().getTime();
    const due = new Date(dueDate).getTime();
    const diff = due - now;

    if (diff < 0) {
      return { text: t('dashboard.overdue'), isOverdue: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return { text: `${days} ${t('dashboard.days')}`, isOverdue: false };
    } else if (hours > 0) {
      return { text: `${hours} ${t('dashboard.hours')}`, isOverdue: false };
    } else {
      return { text: `${minutes} ${t('dashboard.minutes')}`, isOverdue: false };
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
  const timeInfo = switchData.nextCheckInDue ? getTimeUntilDue(switchData.nextCheckInDue) : null;

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
        {switchData.nextCheckInDue && (
          <div>
            <p className="text-xs text-theme-secondary mb-1">{t('switches.nextCheckIn')}</p>
            {timeInfo && (
              <p
                className={`text-sm font-medium ${
                  timeInfo.isOverdue ? 'text-red-600' : 'text-theme-primary'
                }`}
              >
                {timeInfo.isOverdue ? timeInfo.text : `${t('dashboard.dueIn')} ${timeInfo.text}`}
              </p>
            )}
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
      {switchData.status === 'ACTIVE' && timeInfo && !timeInfo.isOverdue && (
        <div className="mt-4 pt-4 border-t border-theme-primary">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-theme-secondary" />
            <div className="flex-1">
              <div className="h-2 bg-theme-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-primary transition-all duration-1000"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        ((new Date(switchData.nextCheckInDue!).getTime() - Date.now()) /
                          (switchData.checkInIntervalDays * 24 * 60 * 60 * 1000)) *
                          100
                      )
                    )}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};
