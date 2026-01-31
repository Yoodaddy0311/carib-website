'use client';

import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const avatarVariants = cva(
  // Base styles
  'relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-gray-200)] bg-[var(--color-gray-100)] flex-shrink-0',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
} as const;

export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof avatarVariants> {
  /** Image source URL */
  src?: string;
  /** Alt text for the image (required for accessibility) */
  alt: string;
  /** Fallback initials to display when image is unavailable */
  fallback?: string;
  /** Border color override */
  borderColor?: string;
}

/**
 * Generates a consistent background color based on the fallback string
 */
function getColorFromString(str: string): string {
  const colors = [
    'var(--color-primary-100)',
    'var(--color-primary-200)',
    'var(--color-accent-100)',
    'var(--color-accent-200)',
    'var(--color-gray-200)',
    'var(--color-gray-300)',
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Generates initials from a string (e.g., "John Doe" -> "JD")
 */
function getInitials(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', borderColor, style, ...props }, ref) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(!!src);

    const displayFallback = !src || imageError;
    const initials = fallback || getInitials(alt);
    const backgroundColor = getColorFromString(initials);
    const pixelSize = sizeMap[size || 'md'];

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, className }))}
        style={{
          ...style,
          ...(borderColor && { borderColor }),
          ...(displayFallback && { backgroundColor }),
        }}
        {...props}
      >
        {/* Loading Skeleton */}
        {isLoading && !imageError && (
          <div className="skeleton absolute inset-0 rounded-full" />
        )}

        {/* Image */}
        {src && !imageError && (
          <Image
            src={src}
            alt={alt}
            width={pixelSize}
            height={pixelSize}
            className="h-full w-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImageError(true);
              setIsLoading(false);
            }}
          />
        )}

        {/* Fallback Initials */}
        {displayFallback && (
          <span
            className="font-semibold text-[var(--color-gray-700)] select-none"
            aria-hidden="true"
          >
            {initials}
          </span>
        )}

        {/* Screen reader text */}
        <span className="sr-only">{alt}</span>
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar, avatarVariants };
