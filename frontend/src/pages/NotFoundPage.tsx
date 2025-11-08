import { Link } from 'react-router-dom';

/**
 * NotFoundPage Component
 *
 * 404 page for unmatched routes
 */
export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <div>
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Page not found
          </h2>
          <p className="mt-2 text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
};
