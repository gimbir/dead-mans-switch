import { MainLayout } from '@components/layout/MainLayout';

/**
 * DashboardPage Component
 *
 * Main dashboard showing switches overview
 * Will be fully implemented in SPRINT 12
 */
export const DashboardPage = () => {
  return (
    <MainLayout>
      <div className='bg-gray-50'>
        <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>
            <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
            <p className='mt-2 text-gray-600'>Welcome to Dead Man's Switch Dashboard</p>
            <div className='mt-6'>
              <p className='text-gray-500'>Dashboard will be fully implemented in SPRINT 12</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
