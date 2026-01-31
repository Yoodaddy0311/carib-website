'use client';

import { forwardRef, type TextareaHTMLAttributes, useEffect, useRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  // Base styles
  'w-full rounded-xl border bg-white dark:bg-[var(--color-gray-100)] text-[var(--foreground)] transition-all duration-300 outline-none placeholder:text-[var(--color-gray-400)] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-gray-50)] dark:disabled:bg-[var(--color-gray-200)] resize-none',
  {
    variants: {
      variant: {
        default:
          'border-[var(--color-gray-300)] dark:border-[var(--color-gray-300)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20',
        error:
          'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]/20',
      },
      textareaSize: {
        sm: 'px-3 py-2 text-sm min-h-[80px]',
        md: 'px-4 py-3 text-base min-h-[120px]',
        lg: 'px-5 py-4 text-lg min-h-[160px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      textareaSize: 'md',
    },
  }
);

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  error?: string;
  autoResize?: boolean;
  showCharacterCount?: boolean;
  maxCharacters?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      textareaSize,
      error,
      autoResize = false,
      showCharacterCount = false,
      maxCharacters,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const effectiveVariant = hasError ? 'error' : variant;
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const [characterCount, setCharacterCount] = useState(0);

    // Merge refs
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    // Auto-resize functionality
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea && autoResize) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    // Initialize character count and height
    useEffect(() => {
      const initialValue = (value ?? defaultValue ?? '') as string;
      setCharacterCount(initialValue.length);
      if (autoResize) {
        adjustHeight();
      }
    }, [value, defaultValue, autoResize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharacterCount(e.target.value.length);
      if (autoResize) {
        adjustHeight();
      }
      onChange?.(e);
    };

    const isOverLimit = maxCharacters ? characterCount > maxCharacters : false;

    return (
      <div className="w-full">
        <textarea
          ref={textareaRef}
          className={cn(
            textareaVariants({ variant: effectiveVariant, textareaSize }),
            autoResize && 'overflow-hidden',
            className
          )}
          aria-invalid={hasError || isOverLimit}
          aria-describedby={hasError ? `${props.id}-error` : undefined}
          onChange={handleChange}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxCharacters}
          {...props}
        />
        <div className="flex justify-between items-center mt-1.5">
          {error ? (
            <p
              id={props.id ? `${props.id}-error` : undefined}
              className="text-sm text-[var(--color-error)]"
              role="alert"
            >
              {error}
            </p>
          ) : (
            <span />
          )}
          {showCharacterCount && (
            <p
              className={cn(
                'text-sm',
                isOverLimit
                  ? 'text-[var(--color-error)]'
                  : 'text-[var(--color-gray-400)]'
              )}
            >
              {characterCount}
              {maxCharacters && ` / ${maxCharacters}`}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
