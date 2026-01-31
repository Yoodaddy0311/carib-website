'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const skeletonVariants = cva(
  // Base styles - uses the .skeleton class from globals.css for shimmer animation
  'skeleton',
  {
    variants: {
      variant: {
        text: 'rounded-md',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'rectangular',
    },
  }
);

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Width of the skeleton (CSS value or number for pixels) */
  width?: string | number;
  /** Height of the skeleton (CSS value or number for pixels) */
  height?: string | number;
}

/**
 * Base Skeleton component for loading states
 */
const SkeletonBase = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, width, height, style, ...props }, ref) => {
    const computedStyle = {
      ...style,
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, className }))}
        style={computedStyle}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

SkeletonBase.displayName = 'Skeleton';

/**
 * Preset: Avatar skeleton for avatar loading states
 */
export interface SkeletonAvatarProps extends Omit<SkeletonProps, 'variant' | 'width' | 'height'> {
  /** Avatar size matching Avatar component sizes */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
} as const;

const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const pixelSize = sizeMap[size];

    return (
      <SkeletonBase
        ref={ref}
        variant="circular"
        width={pixelSize}
        height={pixelSize}
        className={className}
        {...props}
      />
    );
  }
);

SkeletonAvatar.displayName = 'Skeleton.Avatar';

/**
 * Preset: Text skeleton for text line loading states
 */
export interface SkeletonTextProps extends Omit<SkeletonProps, 'variant' | 'height'> {
  /** Number of text lines to render */
  lines?: number;
  /** Height of each line (default: 16px) */
  lineHeight?: number;
  /** Gap between lines (default: 8px) */
  gap?: number;
  /** Make last line shorter (default: true) */
  lastLineShort?: boolean;
}

const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({
    lines = 1,
    lineHeight = 16,
    gap = 8,
    lastLineShort = true,
    width = '100%',
    className,
    style,
    ...props
  }, ref) => {
    if (lines === 1) {
      return (
        <SkeletonBase
          ref={ref}
          variant="text"
          width={width}
          height={lineHeight}
          className={className}
          style={style}
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-col', className)}
        style={{ gap: `${gap}px`, ...style }}
        {...props}
      >
        {Array.from({ length: lines }).map((_, index) => {
          const isLastLine = index === lines - 1;
          const lineWidth = isLastLine && lastLineShort ? '75%' : width;

          return (
            <SkeletonBase
              key={index}
              variant="text"
              width={lineWidth}
              height={lineHeight}
            />
          );
        })}
      </div>
    );
  }
);

SkeletonText.displayName = 'Skeleton.Text';

/**
 * Preset: Card skeleton for card loading states
 */
export interface SkeletonCardProps extends Omit<SkeletonProps, 'variant'> {
  /** Show avatar placeholder */
  showAvatar?: boolean;
  /** Number of text lines */
  textLines?: number;
  /** Show action button placeholder */
  showAction?: boolean;
  /** Card padding */
  padding?: 'sm' | 'md' | 'lg';
}

const paddingMap = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const;

const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({
    showAvatar = true,
    textLines = 3,
    showAction = true,
    padding = 'md',
    className,
    width,
    height,
    style,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border border-[var(--color-gray-200)] bg-white',
          paddingMap[padding],
          className
        )}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          ...style,
        }}
        aria-hidden="true"
        {...props}
      >
        {/* Header with Avatar */}
        {showAvatar && (
          <div className="flex items-center gap-3 mb-4">
            <SkeletonAvatar size="md" />
            <div className="flex-1">
              <SkeletonText width="60%" lineHeight={14} />
              <div className="mt-2">
                <SkeletonText width="40%" lineHeight={12} />
              </div>
            </div>
          </div>
        )}

        {/* Content Lines */}
        <SkeletonText lines={textLines} lineHeight={14} gap={10} />

        {/* Action Button */}
        {showAction && (
          <div className="mt-4 pt-4 border-t border-[var(--color-gray-100)]">
            <SkeletonBase variant="rectangular" width={100} height={36} />
          </div>
        )}
      </div>
    );
  }
);

SkeletonCard.displayName = 'Skeleton.Card';

/**
 * Main Skeleton component with presets attached
 */
type SkeletonComponent = typeof SkeletonBase & {
  Avatar: typeof SkeletonAvatar;
  Text: typeof SkeletonText;
  Card: typeof SkeletonCard;
};

const Skeleton = SkeletonBase as SkeletonComponent;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.Text = SkeletonText;
Skeleton.Card = SkeletonCard;

export { Skeleton, skeletonVariants };
