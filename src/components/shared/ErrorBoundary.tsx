'use client';

import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI to render when an error occurs */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Callback function when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Custom error message to display */
  errorMessage?: string;
  /** Show a compact version of the error UI */
  compact?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Reusable Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and displays a fallback UI.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={<CustomErrorUI />}
 *   onError={(error) => logToService(error)}
 * >
 *   <SomeComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, errorMessage, compact } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.handleReset);
        }
        return fallback;
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={error}
          errorMessage={errorMessage}
          onReset={this.handleReset}
          compact={compact}
        />
      );
    }

    return children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  errorMessage?: string;
  onReset: () => void;
  compact?: boolean;
}

function DefaultErrorFallback({
  error,
  errorMessage,
  onReset,
  compact = false,
}: DefaultErrorFallbackProps) {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 p-4 bg-[var(--color-accent-50)] border border-[var(--color-accent-200)] rounded-xl"
      >
        <AlertTriangle className="w-5 h-5 text-[var(--color-accent-600)] flex-shrink-0" />
        <p className="text-caption text-[var(--color-accent-700)] flex-1">
          {errorMessage || '컴포넌트를 불러오는 중 오류가 발생했습니다.'}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          재시도
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-8 bg-[var(--color-gray-50)] rounded-2xl border border-[var(--color-gray-200)]"
    >
      {/* Error Icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="w-16 h-16 bg-[var(--color-accent-100)] rounded-full flex items-center justify-center mb-4"
      >
        <AlertTriangle className="w-8 h-8 text-[var(--color-accent-600)]" />
      </motion.div>

      {/* Error Title */}
      <h3 className="text-heading-3 font-semibold text-[var(--color-gray-900)] mb-2">
        오류가 발생했습니다
      </h3>

      {/* Error Message */}
      <p className="text-body-2 text-[var(--color-gray-600)] text-center mb-6 max-w-sm">
        {errorMessage || '이 섹션을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
      </p>

      {/* Error Details (Development only) */}
      {process.env.NODE_ENV === 'development' && error.message && (
        <div className="w-full mb-6 p-3 bg-[var(--color-gray-100)] rounded-lg">
          <p className="text-small font-mono text-[var(--color-gray-600)] break-all">
            {error.message}
          </p>
        </div>
      )}

      {/* Retry Button */}
      <Button
        variant="primary"
        size="md"
        onClick={onReset}
        leftIcon={<RefreshCw className="w-4 h-4" />}
      >
        다시 시도
      </Button>
    </motion.div>
  );
}

export { ErrorBoundary, DefaultErrorFallback };
export type { ErrorBoundaryProps, ErrorBoundaryState };
