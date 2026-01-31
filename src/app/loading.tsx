/**
 * Loading Component - Brandazine Style Minimal Design
 *
 * Features:
 * - Brand logo pulse animation
 * - Loading progress bar
 * - Pure CSS animations for performance (TBT optimization)
 * - Respects prefers-reduced-motion
 */

export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] via-white to-[#f8f9fa]"
      role="status"
      aria-label="Loading page"
      aria-live="polite"
    >
      <div className="flex flex-col items-center animate-fade-in">
        {/* Carib Brand Logo with Pulse Animation */}
        <div className="relative mb-10">
          {/* Outer glow rings - animated */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-28 h-28 rounded-full bg-[#1a73e8] opacity-20 animate-ping"
              style={{ animationDuration: '2s' }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-24 h-24 rounded-full bg-[#1a73e8] opacity-30 animate-ping"
              style={{ animationDuration: '2s', animationDelay: '0.3s' }}
            />
          </div>

          {/* Main logo container */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Rotating gradient ring */}
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                background: 'conic-gradient(from 0deg, #1a73e8, #34a853, #1a73e8)',
                animationDuration: '2s',
                animationTimingFunction: 'linear',
              }}
            />

            {/* Inner background */}
            <div className="absolute inset-[3px] rounded-full bg-white" />

            {/* Logo text - pulsing */}
            <div className="relative z-10 flex items-center justify-center animate-pulse">
              <span
                className="text-2xl font-bold bg-gradient-to-br from-[#1a73e8] to-[#34a853] bg-clip-text text-transparent"
              >
                C
              </span>
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#1a73e8] to-[#34a853] bg-clip-text text-transparent">
            Carib
          </h2>
          <p className="text-sm text-[#5f6368] animate-pulse">
            AI Automation Experts
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-[#e8eaed] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full animate-[loading-progress_2s_ease-in-out_infinite]"
            style={{
              background: 'linear-gradient(90deg, #1a73e8, #34a853, #1a73e8)',
              backgroundSize: '200% 100%',
            }}
          />
        </div>

        {/* Loading dots */}
        <div className="flex items-center gap-1.5 mt-6">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] animate-bounce"
              style={{
                animationDelay: `${index * 0.15}s`,
                animationDuration: '0.6s',
              }}
            />
          ))}
        </div>

        {/* Skeleton Preview - Minimal */}
        <div className="mt-12 w-full max-w-xs px-4 opacity-40">
          {/* Header skeleton */}
          <div className="space-y-3">
            <div className="h-6 w-2/3 rounded-lg mx-auto bg-[#e8eaed] animate-pulse" />
            <div className="h-3 w-full rounded-md bg-[#e8eaed] animate-pulse" />
            <div className="h-3 w-4/5 rounded-md mx-auto bg-[#e8eaed] animate-pulse" />
          </div>

          {/* Card skeleton grid */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl bg-[#e8eaed] animate-pulse" />
            <div className="h-16 rounded-xl bg-[#e8eaed] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading page content. Please wait.</span>
    </div>
  );
}
