'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles - Google Labs Style
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary - Black with white text (Google Labs primary style)
        primary:
          'bg-[#202124] text-white hover:bg-[#3c4043] focus-visible:ring-[#202124] rounded-full',
        // Secondary - White with gray border
        secondary:
          'bg-white text-[#202124] border border-[#dadce0] hover:bg-[#f8f9fa] hover:border-[#202124] focus-visible:ring-[#dadce0] rounded-full',
        // Outline - Transparent with border
        outline:
          'border border-[#dadce0] text-[#202124] hover:bg-[#f8f9fa] hover:border-[#202124] focus-visible:ring-[#dadce0] rounded-full',
        // Ghost - Minimal, no background
        ghost:
          'text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] focus-visible:ring-[#dadce0] rounded-lg',
        // Accent - Google Blue
        accent:
          'bg-[#1a73e8] text-white hover:bg-[#1557b0] focus-visible:ring-[#1a73e8] rounded-full',
        // Link - Text only
        link:
          'text-[#1a73e8] underline-offset-4 hover:underline focus-visible:ring-[#1a73e8]',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10 rounded-full',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        aria-busy={isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ duration: 0.15 }}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {isLoading ? (
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            role="img"
          >
            <title>Loading</title>
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>
        ) : null}
        {isLoading && <span className="sr-only">Loading</span>}
        {children}
        {rightIcon && !isLoading && (
          <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
