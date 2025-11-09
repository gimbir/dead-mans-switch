import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Power } from 'lucide-react';
import type { Switch, PaginatedResponse } from '@/types';
import { SwitchCard } from './SwitchCard';
import { CardSkeleton } from '@/components/common/LoadingSkeleton';

interface SwitchListProps {
  data?: PaginatedResponse<Switch>;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  emptyMessage?: string;
}

/**
 * SwitchList Component
 *
 * Displays a paginated list of switches in a grid layout
 * Features:
 * - Grid layout (responsive: 1/2/3 columns)
 * - Pagination controls with page numbers
 * - Loading state with skeleton cards
 * - Empty state
 * - Delete functionality
 * - Theme-aware styling
 * - Multi-language support
 */
export const SwitchList = ({
  data,
  isLoading = false,
  onPageChange,
  onDelete,
  showActions = true,
  emptyMessage
}: SwitchListProps) => {
  const { t } = useTranslation();

  // Loading State - Skeleton Cards
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton count={6} />
        </div>
      </div>
    );
  }

  // Empty State
  if (!data || data.items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-theme-secondary mb-4">
          <Power className="h-8 w-8 text-theme-secondary" />
        </div>
        <h3 className="text-lg font-medium text-theme-primary mb-2">
          {emptyMessage || t('dashboard.emptySwitches')}
        </h3>
        <p className="text-theme-secondary">{t('dashboard.emptyDescription')}</p>
      </div>
    );
  }

  const { items, pagination } = data;
  const totalPages = pagination.totalPages;
  const currentPage = pagination.page;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div className="space-y-6">
      {/* Switch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((switchData) => (
          <SwitchCard
            key={switchData.id}
            switchData={switchData}
            onDelete={onDelete}
            showActions={showActions}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center justify-center w-10 h-10 rounded-md border border-theme-primary transition ${
              currentPage === 1
                ? 'opacity-50 cursor-not-allowed bg-theme-secondary'
                : 'bg-theme-card hover:bg-theme-hover'
            }`}
            aria-label={t('common.previous')}
          >
            <ChevronLeft className="h-5 w-5 text-theme-primary" />
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex items-center justify-center w-10 h-10 text-theme-secondary"
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`flex items-center justify-center w-10 h-10 rounded-md border transition font-medium text-sm ${
                  isActive
                    ? 'bg-brand-primary text-theme-inverse border-brand-primary'
                    : 'bg-theme-card text-theme-primary border-theme-primary hover:bg-theme-hover'
                }`}
                aria-label={`Page ${pageNumber}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center w-10 h-10 rounded-md border border-theme-primary transition ${
              currentPage === totalPages
                ? 'opacity-50 cursor-not-allowed bg-theme-secondary'
                : 'bg-theme-card hover:bg-theme-hover'
            }`}
            aria-label={t('common.next')}
          >
            <ChevronRight className="h-5 w-5 text-theme-primary" />
          </button>
        </div>
      )}

      {/* Results Info */}
      <div className="text-center text-sm text-theme-secondary">
        {t('common.showing')} {(currentPage - 1) * pagination.limit + 1} -{' '}
        {Math.min(currentPage * pagination.limit, pagination.total)} {t('common.of')}{' '}
        {pagination.total}
      </div>
    </div>
  );
};
