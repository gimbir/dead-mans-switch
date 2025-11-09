/**
 * LoadingSkeleton Component
 *
 * Provides loading skeleton screens for different UI elements
 * Variants: card, list, form, table
 * Features shimmer animation and theme-aware styling
 */

interface SkeletonProps {
  className?: string;
}

/**
 * Base Skeleton component with shimmer animation
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
}

/**
 * Card Skeleton - for switch cards, message cards, etc.
 */
interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export function CardSkeleton({ count = 1, className = '' }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`bg-theme-card border border-theme-primary rounded-lg p-6 ${className}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Title */}
              <Skeleton className="h-6 w-3/4 mb-2" />
              {/* Description */}
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-1" />
            </div>
            {/* Status badge */}
            <Skeleton className="h-6 w-20 rounded-full ml-4" />
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Skeleton className="h-3 w-24 mb-1" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div>
              <Skeleton className="h-3 w-24 mb-1" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-theme-primary">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * List Skeleton - for message lists, notification lists, etc.
 */
interface ListSkeletonProps {
  count?: number;
  className?: string;
}

export function ListSkeleton({ count = 3, className = '' }: ListSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-theme-card border border-theme-primary rounded-lg p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Title and status */}
              <div className="flex items-center space-x-3 mb-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>

              {/* Subtitle */}
              <Skeleton className="h-4 w-64 mb-2" />

              {/* Info lines */}
              <Skeleton className="h-4 w-40 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Form Skeleton - for loading form fields
 */
interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

export function FormSkeleton({ fields = 4, className = '' }: FormSkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          {/* Label */}
          <Skeleton className="h-4 w-32 mb-2" />
          {/* Input field */}
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}

      {/* Submit button area */}
      <div className="flex justify-end space-x-4 pt-4">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Table Skeleton - for table rows
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className = '' }: TableSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Table header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-5 w-full" />
        ))}
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 py-3 border-t border-theme-primary"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Page Skeleton - full page loading with header and content
 */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-theme-primary">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-11 w-40 rounded-md" />
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 w-64 rounded-md" />
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton count={6} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Detail Page Skeleton - for detail pages with sidebar
 */
export function DetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-theme-primary">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back button */}
          <Skeleton className="h-6 w-24 mb-6" />

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="flex gap-2 ml-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-theme-card border border-theme-primary rounded-lg p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-theme-card border border-theme-primary rounded-lg p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <ListSkeleton count={2} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-theme-card border border-theme-primary rounded-lg p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-11 w-full rounded-md" />
              </div>

              <div className="bg-theme-card border border-theme-primary rounded-lg p-6">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
