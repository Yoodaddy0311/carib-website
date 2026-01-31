/**
 * Loading Component - Optimized for Performance
 *
 * This component uses pure CSS animations instead of motion/react
 * to minimize JavaScript execution during initial page load (TBT optimization).
 */

export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-gray-50)] to-white dark:from-[var(--background)] dark:to-[var(--color-gray-50)]"
      role="status"
      aria-label="페이지 로딩 중"
    >
      <div className="flex flex-col items-center animate-fade-in">
        {/* Carib Logo Spinner - CSS only */}
        <div className="relative mb-8">
          {/* Outer rotating ring */}
          <div
            className="w-20 h-20 rounded-full border-4 border-[var(--color-primary-100)] animate-spin"
            style={{
              borderTopColor: 'var(--color-primary-500)',
              animationDuration: '1s',
            }}
          />

          {/* Inner pulsing dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] animate-pulse" />
          </div>
        </div>

        {/* Brand Text */}
        <div className="text-center">
          <h2 className="text-heading-2 font-bold gradient-text mb-2">
            Carib
          </h2>
          <p className="text-caption text-[var(--color-gray-500)] animate-pulse">
            Loading...
          </p>
        </div>

        {/* Skeleton Preview */}
        <div className="mt-12 w-full max-w-md px-6">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4 rounded-lg mx-auto" />
            <div className="skeleton h-4 w-full rounded-md" />
            <div className="skeleton h-4 w-5/6 rounded-md mx-auto" />
          </div>

          {/* Card skeletons */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="skeleton h-24 rounded-xl" />
            <div className="skeleton h-24 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">페이지를 불러오는 중입니다. 잠시만 기다려 주세요.</span>
    </div>
  );
}
