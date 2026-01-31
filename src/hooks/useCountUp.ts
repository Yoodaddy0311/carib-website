'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type EasingFunction = 'ease-out' | 'ease-out-expo' | 'ease-out-cubic' | 'ease-out-quad';

/** Number format type for large numbers */
type NumberFormat = 'default' | 'compact' | 'abbreviated';

interface UseCountUpOptions {
  /** Animation duration in milliseconds (default: 2000) */
  duration?: number;
  /** Starting value (default: 0) */
  start?: number;
  /** Number of decimal places (default: 0) */
  decimals?: number;
  /** Start animation when element is in view (default: true) */
  startOnView?: boolean;
  /** Easing function type (default: 'ease-out') */
  easing?: EasingFunction;
  /** Format number with thousand separators (default: false) */
  formatWithCommas?: boolean;
  /** Number format for large numbers (default: 'default')
   * - 'default': No abbreviation (1000 -> 1000)
   * - 'compact': Use compact notation (1000 -> 1K, 1000000 -> 1M)
   * - 'abbreviated': Same as compact but with full words (1000 -> 1천, 1000000 -> 100만)
   */
  numberFormat?: NumberFormat;
  /** Threshold for abbreviation (default: 1000). Numbers below this won't be abbreviated */
  abbreviationThreshold?: number;
}

interface UseCountUpReturn {
  /** Current animated count value */
  count: number;
  /** Formatted count string with thousand separators */
  formattedCount: string;
  /** Abbreviated count string (e.g., 1K, 1M) */
  abbreviatedCount: string;
  /** Ref to attach to the element for IntersectionObserver */
  ref: React.RefObject<HTMLElement | null>;
  /** Whether the animation has started */
  hasStarted: boolean;
  /** Manually restart the animation */
  restart: () => void;
}

/**
 * Easing functions for smooth animations
 */
const easingFunctions = {
  /** ease-out (same as ease-out-quad) - smooth deceleration */
  'ease-out': (t: number): number => 1 - (1 - t) * (1 - t),
  /** ease-out-quad - quadratic deceleration */
  'ease-out-quad': (t: number): number => 1 - (1 - t) * (1 - t),
  /** ease-out-cubic - cubic deceleration (slightly more dramatic) */
  'ease-out-cubic': (t: number): number => 1 - Math.pow(1 - t, 3),
  /** ease-out-expo - exponential deceleration (most dramatic) */
  'ease-out-expo': (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

/**
 * Format number with specified decimal places
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number
 */
function formatNumber(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Format number with thousand separators
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted string with commas
 */
function formatWithCommas(value: number, decimals: number): string {
  return formatNumber(value, decimals).toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Abbreviation units for compact number formatting
 */
const abbreviationUnits = [
  { value: 1_000_000_000_000, suffix: 'T', koreanSuffix: '조' },
  { value: 1_000_000_000, suffix: 'B', koreanSuffix: '억' },
  { value: 1_000_000, suffix: 'M', koreanSuffix: '백만' },
  { value: 1_000, suffix: 'K', koreanSuffix: '천' },
];

/**
 * Format number with abbreviation (1K, 1M, etc.)
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @param threshold - Minimum value to abbreviate (default: 1000)
 * @param format - Format type ('compact' for K/M or 'abbreviated' for Korean)
 * @returns Abbreviated string
 */
function formatAbbreviated(
  value: number,
  decimals: number = 1,
  threshold: number = 1000,
  format: NumberFormat = 'compact'
): string {
  // Return as-is if below threshold
  if (Math.abs(value) < threshold) {
    return formatNumber(value, decimals).toString();
  }

  // Find appropriate unit
  for (const unit of abbreviationUnits) {
    if (Math.abs(value) >= unit.value) {
      const formattedValue = value / unit.value;
      const rounded = formatNumber(formattedValue, decimals);
      // Remove trailing zeros after decimal point
      const cleanedValue = parseFloat(rounded.toString()).toString();
      const suffix = format === 'abbreviated' ? unit.koreanSuffix : unit.suffix;
      return `${cleanedValue}${suffix}`;
    }
  }

  return formatNumber(value, decimals).toString();
}

/**
 * Animated counter hook for trust metrics and statistics
 * Uses requestAnimationFrame for smooth animation with configurable easing
 * Supports IntersectionObserver for triggering animation when element is in view
 *
 * @param end - Target number to count up to
 * @param options - Configuration options
 * @returns Object with current count, formatted count, ref, and control functions
 *
 * @example
 * ```tsx
 * function TrustMetric({ value, label, suffix }: { value: number; label: string; suffix: string }) {
 *   const { count, formattedCount, ref } = useCountUp(value, {
 *     duration: 2000,
 *     easing: 'ease-out',
 *     formatWithCommas: true,
 *   });
 *   return (
 *     <div ref={ref as React.RefObject<HTMLDivElement>}>
 *       <span>{formattedCount}{suffix}</span>
 *       <span>{label}</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCountUp(
  end: number,
  options?: UseCountUpOptions
): UseCountUpReturn {
  const {
    duration = 2000,
    start = 0,
    decimals = 0,
    startOnView = true,
    easing = 'ease-out',
    formatWithCommas: useCommas = false,
    numberFormat = 'default',
    abbreviationThreshold = 1000,
  } = options || {};

  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Get the easing function
  const easingFn = easingFunctions[easing];

  // Animation function using requestAnimationFrame
  const animate = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);
      const currentValue = start + (end - start) * easedProgress;

      setCount(formatNumber(currentValue, decimals));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    },
    [duration, start, end, decimals, easingFn]
  );

  // Start animation function
  const startAnimation = useCallback(() => {
    if (hasStarted) return;
    setHasStarted(true);
    startTimeRef.current = null;
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [hasStarted, animate]);

  // Restart animation function (exposed to user)
  const restart = useCallback(() => {
    // Cancel any ongoing animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    // Reset state
    setCount(start);
    setHasStarted(false);
    startTimeRef.current = null;
    // Start new animation on next tick
    setTimeout(() => {
      setHasStarted(true);
      animationFrameRef.current = requestAnimationFrame(animate);
    }, 0);
  }, [start, animate]);

  // IntersectionObserver for startOnView
  useEffect(() => {
    if (!startOnView) {
      // Start immediately if startOnView is false
      startAnimation();
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            startAnimation();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [startOnView, startAnimation, hasStarted]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Reset animation if end value changes
  useEffect(() => {
    if (hasStarted) {
      // Cancel any ongoing animation
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Reset and restart
      setHasStarted(false);
      setCount(start);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end, start]);

  // Compute formatted count
  const formattedCount = useCommas
    ? formatWithCommas(count, decimals)
    : formatNumber(count, decimals).toString();

  // Compute abbreviated count (e.g., 1K, 1M)
  const abbreviatedCount =
    numberFormat === 'default'
      ? formattedCount
      : formatAbbreviated(count, decimals, abbreviationThreshold, numberFormat);

  return {
    count,
    formattedCount,
    abbreviatedCount,
    ref,
    hasStarted,
    restart,
  };
}

export default useCountUp;
