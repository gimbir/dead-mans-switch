import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Clock, AlertCircle, CheckCircle, PauseCircle, Power } from 'lucide-react';
import { MainLayout } from '@components/layout/MainLayout';
import { switchService } from '@services/switch.service';
import { ROUTES } from '@constants/index';
import type { Switch } from '@/types';

/**
 * DashboardPage Component
 *
 * Main dashboard showing switches overview and statistics
 * Features:
 * - Switch statistics (total, active, triggered, paused)
 * - Upcoming check-ins list
 * - Quick action buttons
 * - Empty state for new users
 * - Loading and error states
 * - Multi-language support
 * - Theme-aware styling
 */
export const DashboardPage = () => {
  const { t } = useTranslation();

  // Fetch all switches
  const {
    data: switchesResponse,
    isLoading,
    error
  } = useQuery({
    queryKey: ['switches'],
    queryFn: () => switchService.getSwitches()
  });

  const switches = switchesResponse?.items || [];

  // Calculate statistics
  const stats = {
    total: switches.length,
    active: switches.filter((s: Switch) => s.status === 'ACTIVE').length,
    triggered: switches.filter((s: Switch) => s.status === 'TRIGGERED').length,
    paused: switches.filter((s: Switch) => s.status === 'PAUSED').length
  };

  // Get upcoming check-ins (sorted by nextCheckInDue)
  const upcomingCheckIns = switches
    .filter((s: Switch) => s.status === 'ACTIVE' && s.nextCheckInDue)
    .sort((a: Switch, b: Switch) => {
      if (!a.nextCheckInDue || !b.nextCheckInDue) return 0;
      return new Date(a.nextCheckInDue).getTime() - new Date(b.nextCheckInDue).getTime();
    })
    .slice(0, 5);

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

  return (
    <MainLayout>
      <div className='min-h-screen bg-theme-primary'>
        <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>
            {/* Header */}
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-theme-primary'>{t('dashboard.title')}</h1>
              <p className='mt-2 text-theme-secondary'>{t('dashboard.welcome')}</p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className='flex justify-center items-center h-64'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary'></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <div className='flex items-center'>
                  <AlertCircle className='h-5 w-5 text-red-600 mr-2' />
                  <p className='text-red-800'>
                    {error instanceof Error ? error.message : 'Failed to load switches'}
                  </p>
                </div>
              </div>
            )}

            {/* Content */}
            {!isLoading && !error && (
              <>
                {/* Empty State */}
                {stats.total === 0 ? (
                  <div className='text-center py-12'>
                    <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-theme-secondary mb-4'>
                      <Power className='h-8 w-8 text-theme-secondary' />
                    </div>
                    <h3 className='text-lg font-medium text-theme-primary mb-2'>
                      {t('dashboard.emptySwitches')}
                    </h3>
                    <p className='text-theme-secondary mb-6'>{t('dashboard.emptyDescription')}</p>
                    <Link
                      to={ROUTES.SWITCH_CREATE}
                      className='inline-flex items-center px-4 py-2 bg-brand-primary text-theme-inverse rounded-md hover:opacity-90 transition'
                    >
                      <Plus className='h-5 w-5 mr-2' />
                      {t('dashboard.createNew')}
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Statistics Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                      {/* Total Switches */}
                      <div className='bg-theme-card border border-theme-primary rounded-lg p-6'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm text-theme-secondary'>
                              {t('dashboard.totalSwitches')}
                            </p>
                            <p className='text-3xl font-bold text-theme-primary mt-1'>
                              {stats.total}
                            </p>
                          </div>
                          <div className='bg-theme-secondary rounded-full p-3'>
                            <Power className='h-6 w-6 text-theme-secondary' />
                          </div>
                        </div>
                      </div>

                      {/* Active Switches */}
                      <div className='bg-theme-card border border-theme-primary rounded-lg p-6'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm text-theme-secondary'>
                              {t('dashboard.activeSwitches')}
                            </p>
                            <p className='text-3xl font-bold text-green-600 mt-1'>{stats.active}</p>
                          </div>
                          <div className='bg-green-100 rounded-full p-3'>
                            <CheckCircle className='h-6 w-6 text-green-600' />
                          </div>
                        </div>
                      </div>

                      {/* Triggered Switches */}
                      <div className='bg-theme-card border border-theme-primary rounded-lg p-6'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm text-theme-secondary'>
                              {t('dashboard.triggeredSwitches')}
                            </p>
                            <p className='text-3xl font-bold text-red-600 mt-1'>
                              {stats.triggered}
                            </p>
                          </div>
                          <div className='bg-red-100 rounded-full p-3'>
                            <AlertCircle className='h-6 w-6 text-red-600' />
                          </div>
                        </div>
                      </div>

                      {/* Paused Switches */}
                      <div className='bg-theme-card border border-theme-primary rounded-lg p-6'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm text-theme-secondary'>
                              {t('dashboard.pausedSwitches')}
                            </p>
                            <p className='text-3xl font-bold text-amber-600 mt-1'>{stats.paused}</p>
                          </div>
                          <div className='bg-amber-100 rounded-full p-3'>
                            <PauseCircle className='h-6 w-6 text-amber-600' />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Check-ins */}
                    <div className='bg-theme-card border border-theme-primary rounded-lg p-6 mb-8'>
                      <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-xl font-semibold text-theme-primary'>
                          {t('dashboard.upcomingCheckIns')}
                        </h2>
                        <Clock className='h-5 w-5 text-theme-secondary' />
                      </div>

                      {upcomingCheckIns.length === 0 ? (
                        <p className='text-theme-secondary text-center py-4'>
                          {t('dashboard.noCheckIns')}
                        </p>
                      ) : (
                        <div className='space-y-3'>
                          {upcomingCheckIns.map((switchItem: Switch) => {
                            const timeInfo = getTimeUntilDue(switchItem.nextCheckInDue!);
                            return (
                              <Link
                                key={switchItem.id}
                                to={`${ROUTES.SWITCHES}/${switchItem.id}`}
                                className='block p-4 bg-theme-hover rounded-lg hover:bg-theme-secondary transition'
                              >
                                <div className='flex items-center justify-between'>
                                  <div className='flex-1'>
                                    <h3 className='font-medium text-theme-primary'>
                                      {switchItem.name}
                                    </h3>
                                    {switchItem.description && (
                                      <p className='text-sm text-theme-secondary mt-1'>
                                        {switchItem.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className='text-right ml-4'>
                                    <p
                                      className={`text-sm font-medium ${
                                        timeInfo.isOverdue ? 'text-red-600' : 'text-theme-primary'
                                      }`}
                                    >
                                      {timeInfo.isOverdue
                                        ? timeInfo.text
                                        : `${t('dashboard.dueIn')} ${timeInfo.text}`}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className='flex flex-col sm:flex-row gap-4'>
                      <Link
                        to={ROUTES.SWITCH_CREATE}
                        className='flex-1 inline-flex items-center justify-center px-6 py-3 bg-brand-primary text-theme-inverse rounded-md hover:opacity-90 transition font-medium'
                      >
                        <Plus className='h-5 w-5 mr-2' />
                        {t('dashboard.createNew')}
                      </Link>
                      <Link
                        to={ROUTES.SWITCHES}
                        className='flex-1 inline-flex items-center justify-center px-6 py-3 bg-theme-secondary text-theme-primary border border-theme-primary rounded-md hover:bg-theme-hover transition font-medium'
                      >
                        {t('dashboard.viewAll')}
                      </Link>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
