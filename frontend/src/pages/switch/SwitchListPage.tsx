import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, Filter } from 'lucide-react';
import { MainLayout } from '@components/layout/MainLayout';
import { SwitchList } from '@components/switch';
import { switchService } from '@services/switch.service';
import { ROUTES } from '@constants/index';
import type { SwitchStatus } from '@/types';

/**
 * SwitchListPage Component
 *
 * Page for listing and managing all switches
 * Features:
 * - Search by name/description
 * - Filter by status
 * - Pagination
 * - Delete switches with confirmation
 * - Create new switch button
 * - Loading and error states
 * - Theme-aware styling
 * - Multi-language support
 */
export const SwitchListPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // State for filters and pagination
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SwitchStatus | 'ALL'>('ALL');
  const limit = 12; // Items per page

  // Fetch switches with filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['switches', page, limit, statusFilter],
    queryFn: () =>
      switchService.getSwitches({
        page,
        limit
        // Add status filter when backend supports it
        // status: statusFilter !== 'ALL' ? statusFilter : undefined
      })
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => switchService.deleteSwitch(id),
    onSuccess: () => {
      // Invalidate and refetch switches
      queryClient.invalidateQueries({ queryKey: ['switches'] });
    }
  });

  // Handle delete with confirmation
  const handleDelete = async (id: string) => {
    if (window.confirm(t('switches.deleteConfirm'))) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success(t('switches.deleteSuccess'));
      } catch (error) {
        toast.error(t('switches.deleteError'));
        console.error('Delete failed:', error);
      }
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter data by search (client-side for now)
  const filteredData = data?.items
    ? {
        ...data,
        items: data.items.filter((switchItem) => {
          const matchesSearch =
            search === '' ||
            switchItem.name.toLowerCase().includes(search.toLowerCase()) ||
            (switchItem.description &&
              switchItem.description.toLowerCase().includes(search.toLowerCase()));

          const matchesStatus =
            statusFilter === 'ALL' || switchItem.status === statusFilter;

          return matchesSearch && matchesStatus;
        })
      }
    : undefined;

  return (
    <MainLayout>
      <div className="min-h-screen bg-theme-primary">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-theme-primary">{t('switches.list')}</h1>
                <p className="mt-2 text-theme-secondary">{t('switches.listDescription')}</p>
              </div>
              <Link
                to={ROUTES.SWITCH_CREATE}
                className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-theme-inverse rounded-md hover:opacity-90 transition font-medium"
              >
                <Plus className="h-5 w-5" />
                {t('switches.create')}
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-secondary" />
                <input
                  type="text"
                  placeholder={t('switches.search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-theme-primary rounded-md bg-theme-card text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Status Filter */}
              <div className="relative sm:w-64">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-secondary pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as SwitchStatus | 'ALL')}
                  className="w-full pl-10 pr-4 py-2 border border-theme-primary rounded-md bg-theme-card text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary appearance-none cursor-pointer"
                >
                  <option value="ALL">{t('switches.allStatuses')}</option>
                  <option value="ACTIVE">{t('switches.status.ACTIVE')}</option>
                  <option value="PAUSED">{t('switches.status.PAUSED')}</option>
                  <option value="TRIGGERED">{t('switches.status.TRIGGERED')}</option>
                  <option value="INACTIVE">{t('switches.status.INACTIVE')}</option>
                </select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="text-red-800">
                  {error instanceof Error ? error.message : 'Failed to load switches'}
                </p>
              </div>
            )}

            {/* Switch List */}
            <SwitchList
              data={filteredData}
              isLoading={isLoading}
              onPageChange={handlePageChange}
              onDelete={handleDelete}
              showActions={true}
              emptyMessage={
                search || statusFilter !== 'ALL'
                  ? 'No switches match your filters'
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
