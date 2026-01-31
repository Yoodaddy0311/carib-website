'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  // Base styles
  'w-full rounded-xl border bg-white dark:bg-[var(--color-gray-100)] text-[var(--foreground)] transition-all duration-300 outline-none placeholder:text-[var(--color-gray-400)] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-gray-50)]',
  {
    variants: {
      variant: {
        default:
          'border-[var(--color-gray-300)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20 dark:border-[var(--color-gray-300)]',
        error:
          'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]/20',
      },
      inputSize: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base',
        lg: 'h-14 px-5 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      error,
      leftIcon,
      rightIcon,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const effectiveVariant = hasError ? 'error' : variant;

    // Adjust padding based on icons
    const leftPadding = leftIcon
      ? inputSize === 'sm'
        ? 'pl-9'
        : inputSize === 'lg'
        ? 'pl-12'
        : 'pl-10'
      : '';
    const rightPadding = rightIcon
      ? inputSize === 'sm'
        ? 'pr-9'
        : inputSize === 'lg'
        ? 'pr-12'
        : 'pr-10'
      : '';

    // Icon size based on input size
    const iconSize =
      inputSize === 'sm' ? 'w-4 h-4' : inputSize === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    const iconLeftPosition =
      inputSize === 'sm' ? 'left-3' : inputSize === 'lg' ? 'left-5' : 'left-4';
    const iconRightPosition =
      inputSize === 'sm' ? 'right-3' : inputSize === 'lg' ? 'right-5' : 'right-4';

    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <span
              className={cn(
                'absolute top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] pointer-events-none',
                iconLeftPosition,
                iconSize
              )}
            >
              {leftIcon}
            </span>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              inputVariants({ variant: effectiveVariant, inputSize }),
              leftPadding,
              rightPadding,
              className
            )}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${props.id}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <span
              className={cn(
                'absolute top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] pointer-events-none',
                iconRightPosition,
                iconSize
              )}
            >
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p
            id={props.id ? `${props.id}-error` : undefined}
            className="mt-1.5 text-sm text-[var(--color-error)]"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
