import { MainLayout } from '@components/layout/MainLayout';

/**
 * SwitchListPage Component
 *
 * List all switches with filtering and pagination
 * Will be fully implemented in SPRINT 12
 */
export const SwitchListPage = () => {
  return (
    <MainLayout>
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">My Switches</h1>
            <p className="mt-2 text-gray-600">
              Manage your dead man's switches
            </p>
            <div className="mt-6">
              <p className="text-gray-500">
                Switch list will be fully implemented in SPRINT 12
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
