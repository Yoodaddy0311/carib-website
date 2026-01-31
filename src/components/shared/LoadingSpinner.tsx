'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  'inline-flex items-center justify-center',
  {
    variants: {
      size: {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
      },
      color: {
        primary: '',
        white: '',
        gray: '',
        accent: '',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
    },
  }
);

const colorMap = {
  primary: {
    track: 'var(--color-primary-100)',
    indicator: 'var(--color-primary-500)',
  },
  white: {
    track: 'rgba(255, 255, 255, 0.3)',
    indicator: '#FFFFFF',
  },
  gray: {
    track: 'var(--color-gray-200)',
    indicator: 'var(--color-gray-500)',
  },
  accent: {
    track: 'var(--color-accent-100)',
    indicator: 'var(--color-accent-500)',
  },
} as const;

const sizeStrokeMap = {
  sm: 3,
  md: 4,
  lg: 4,
  xl: 5,
} as const;

export interface LoadingSpinnerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof spinnerVariants> {
  /** Custom label for screen readers */
  label?: string;
  /** Show loading text below spinner */
  showText?: boolean;
  /** Custom loading text */
  text?: string;
}

/**
 * Reusable Loading Spinner Component
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" color="primary" />
 * <LoadingSpinner size="sm" color="white" label="Submitting form..." />
 * <LoadingSpinner showText text="Loading data..." />
 * ```
 */
const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    {
      className,
      size = 'md',
      color = 'primary',
      label = 'Loading...',
      showText = false,
      text = 'Loading...',
      ...props
    },
    ref
  ) => {
    const colors = colorMap[color ?? 'primary'];
    const strokeWidth = sizeStrokeMap[size ?? 'md'];

    return (
      <div
        ref={ref}
        className={cn('inline-flex flex-col items-center gap-2', className)}
        role="status"
        aria-label={label}
        {...props}
      >
        <motion.div className={cn(spinnerVariants({ size }))}>
          <svg
            className="w-full h-full"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background track */}
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke={colors.track}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Animated indicator */}
            <motion.circle
              cx="25"
              cy="25"
              r="20"
              stroke={colors.indicator}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray="126"
              strokeDashoffset="100"
              animate={{
                strokeDashoffset: [100, 0, 100],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                transformOrigin: 'center',
              }}
            />
          </svg>
        </motion.div>

        {showText && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              'text-caption',
              color === 'white' ? 'text-white' : 'text-[var(--color-gray-500)]'
            )}
          >
            {text}
          </motion.span>
        )}

        {/* Screen reader only text */}
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Dots Loading Animation
 * Alternative loading indicator with animated dots
 */
export interface LoadingDotsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray' | 'accent';
}

const dotSizeMap = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
} as const;

const dotColorMap = {
  primary: 'bg-[var(--color-primary-500)]',
  white: 'bg-white',
  gray: 'bg-[var(--color-gray-400)]',
  accent: 'bg-[var(--color-accent-500)]',
} as const;

const LoadingDots = forwardRef<HTMLDivElement, LoadingDotsProps>(
  ({ className, size = 'md', color = 'primary', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center gap-1', className)}
        role="status"
        aria-label="Loading..."
        {...props}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={cn('rounded-full', dotSizeMap[size], dotColorMap[color])}
            animate={{
              y: [0, -6, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.15,
            }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

LoadingDots.displayName = 'LoadingDots';

/**
 * Pulse Loading Animation
 * Simple pulsing circle animation
 */
export interface LoadingPulseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray' | 'accent';
}

const pulseSizeMap = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
} as const;

const pulseColorMap = {
  primary: 'bg-[var(--color-primary-500)]',
  white: 'bg-white',
  gray: 'bg-[var(--color-gray-400)]',
  accent: 'bg-[var(--color-accent-500)]',
} as const;

const LoadingPulse = forwardRef<HTMLDivElement, LoadingPulseProps>(
  ({ className, size = 'md', color = 'primary', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        role="status"
        aria-label="Loading..."
        {...props}
      >
        <motion.div
          className={cn('rounded-full', pulseSizeMap[size], pulseColorMap[color])}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0.3, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className={cn(
            'absolute rounded-full',
            pulseSizeMap[size],
            pulseColorMap[color],
            'opacity-50'
          )}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

LoadingPulse.displayName = 'LoadingPulse';

export { LoadingSpinner, LoadingDots, LoadingPulse };
