import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, User, Bell, Globe } from 'lucide-react';
import { MainLayout } from '@components/layout/MainLayout';
import { TwoFactorSettings } from '@components/settings/TwoFactorSettings';
import { useAuthStore } from '@stores/authStore';

/**
 * SettingsPage Component
 *
 * User settings and preferences page
 * Features:
 * - Two-Factor Authentication settings
 * - Profile information (coming soon)
 * - Notification preferences (coming soon)
 * - Language selection (coming soon)
 * - Tab-based navigation
 * - Theme-aware styling
 */
export const SettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'security' | 'profile' | 'notifications' | 'preferences'>('security');

  // Initialize 2FA status from user data
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorEnabled ?? false);

  // Update 2FA status when user changes
  useEffect(() => {
    if (user) {
      setIs2FAEnabled(user.twoFactorEnabled);
    }
  }, [user]);

  const tabs = [
    { id: 'security' as const, label: t('settings.tabs.security'), icon: Shield },
    { id: 'profile' as const, label: t('settings.tabs.profile'), icon: User },
    { id: 'notifications' as const, label: t('settings.tabs.notifications'), icon: Bell },
    { id: 'preferences' as const, label: t('settings.tabs.preferences'), icon: Globe },
  ];

  const handle2FAStatusChange = (enabled: boolean) => {
    setIs2FAEnabled(enabled);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-theme-primary">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-theme-primary">
                {t('settings.title')}
              </h1>
              <p className="mt-2 text-theme-secondary">
                {t('settings.description')}
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-theme-primary">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                          ${
                            isActive
                              ? 'border-brand-primary text-brand-primary'
                              : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-secondary'
                          }
                        `}
                      >
                        <Icon
                          className={`
                            -ml-0.5 mr-2 h-5 w-5
                            ${isActive ? 'text-brand-primary' : 'text-theme-tertiary group-hover:text-theme-secondary'}
                          `}
                        />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Two-Factor Authentication */}
                  <TwoFactorSettings
                    isEnabled={is2FAEnabled}
                    onStatusChange={handle2FAStatusChange}
                  />

                  {/* Password Change - Coming Soon */}
                  <div className="bg-theme-card rounded-lg shadow p-6 opacity-60">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-theme-primary">
                          {t('settings.security.passwordTitle')}
                        </h2>
                        <p className="mt-2 text-sm text-theme-secondary">
                          {t('settings.security.passwordDescription')}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                        {t('common.comingSoon')}
                      </span>
                    </div>
                  </div>

                  {/* Sessions - Coming Soon */}
                  <div className="bg-theme-card rounded-lg shadow p-6 opacity-60">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-theme-primary">
                          {t('settings.security.sessionsTitle')}
                        </h2>
                        <p className="mt-2 text-sm text-theme-secondary">
                          {t('settings.security.sessionsDescription')}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                        {t('common.comingSoon')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* User Information */}
                  <div className="bg-theme-card rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-theme-primary mb-4">
                      {t('settings.profile.infoTitle')}
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-primary">
                          {t('settings.profile.name')}
                        </label>
                        <p className="mt-1 text-theme-secondary">{user?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-theme-primary">
                          {t('settings.profile.email')}
                        </label>
                        <p className="mt-1 text-theme-secondary">{user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-theme-primary">
                          {t('settings.profile.accountCreated')}
                        </label>
                        <p className="mt-1 text-theme-secondary">
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                        {t('common.comingSoon')} - {t('settings.profile.editInfo')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-theme-card rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-theme-primary mb-4">
                    {t('settings.notifications.title')}
                  </h2>
                  <p className="text-theme-secondary mb-6">
                    {t('settings.notifications.description')}
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                    {t('common.comingSoon')}
                  </span>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="bg-theme-card rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-theme-primary mb-4">
                    {t('settings.preferences.title')}
                  </h2>
                  <p className="text-theme-secondary mb-6">
                    {t('settings.preferences.description')}
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                    {t('common.comingSoon')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
