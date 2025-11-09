import { Component } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors in child component tree and displays fallback UI
 * Features:
 * - Catches rendering errors
 * - Logs error details to console
 * - Shows user-friendly error message
 * - Reset functionality
 * - Theme-aware styling
 * - Custom fallback support
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-theme-primary flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-theme-card border border-theme-primary rounded-xl shadow-lg p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-theme-primary text-center mb-3">
                Oops! Something went wrong
              </h1>

              <p className="text-theme-secondary text-center mb-6">
                We're sorry for the inconvenience. An unexpected error occurred.
              </p>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 overflow-auto">
                  <p className="text-sm font-mono text-red-800 dark:text-red-200 mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs font-mono text-red-700 dark:text-red-300 mt-2">
                      <summary className="cursor-pointer font-semibold">
                        Component Stack Trace
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg hover:opacity-90 transition font-medium"
                >
                  <RefreshCw className="h-5 w-5" />
                  Try Again
                </button>

                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-theme-primary text-theme-primary rounded-lg hover:bg-theme-hover transition font-medium"
                >
                  <RefreshCw className="h-5 w-5" />
                  Reload Page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-theme-primary text-theme-primary rounded-lg hover:bg-theme-hover transition font-medium"
                >
                  <Home className="h-5 w-5" />
                  Go Home
                </button>
              </div>

              {/* Help Text */}
              <p className="text-xs text-theme-tertiary text-center mt-6">
                If this problem persists, please contact support or try again later.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Normal render when no error
    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onReset?: () => void
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onReset={onReset}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
