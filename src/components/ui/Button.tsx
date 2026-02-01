'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles - Artience Style
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary - Artience Black with white text
        primary:
          'bg-[#1F2937] text-white hover:shadow-[0_4px_12px_rgba(31,41,55,0.3)] focus-visible:ring-[#1F2937] rounded-lg',
        // Secondary - White with gray border
        secondary:
          'bg-white text-[#1F2937] border border-[#E5E7EB] hover:border-[#1F2937] focus-visible:ring-[#E5E7EB] rounded-lg',
        // Outline - Transparent with border
        outline:
          'border border-[#E5E7EB] text-[#1F2937] hover:border-[#1F2937] focus-visible:ring-[#E5E7EB] rounded-lg',
        // Ghost - Minimal, no background
        ghost:
          'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#1F2937] focus-visible:ring-[#E5E7EB] rounded-lg',
        // Accent - Artience Blue
        accent:
          'bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] focus-visible:ring-[#3B82F6] rounded-lg',
        // Link - Text only
        link:
          'text-[#3B82F6] underline-offset-4 hover:underline focus-visible:ring-[#3B82F6]',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-10 px-6 text-sm',
        lg: 'h-12 px-8 text-sm',
        icon: 'h-10 w-10 rounded-lg',
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
        whileHover={{ y: disabled || isLoading ? 0 : -2 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ duration: 0.2 }}
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
