'use client';

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { motion } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// ============================================================================
// Variants
// ============================================================================

const segmentedControlVariants = cva(
  'inline-flex items-center rounded-xl p-1 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-gray-100)]',
        outline: 'border-2 border-[var(--color-gray-200)] bg-transparent',
        elevated: 'bg-white shadow-[var(--shadow-2)]',
      },
      size: {
        sm: 'gap-0.5 p-0.5',
        md: 'gap-1 p-1',
        lg: 'gap-1.5 p-1.5',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const segmentVariants = cva(
  'relative z-10 inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-[var(--color-gray-600)] data-[state=active]:text-[var(--color-gray-900)]',
        outline: 'text-[var(--color-gray-600)] data-[state=active]:text-[var(--color-primary-600)]',
        elevated: 'text-[var(--color-gray-600)] data-[state=active]:text-[var(--color-gray-900)]',
      },
      size: {
        sm: 'gap-1.5 rounded-lg px-3 py-1.5 text-xs',
        md: 'gap-2 rounded-lg px-4 py-2 text-sm',
        lg: 'gap-2.5 rounded-xl px-5 py-2.5 text-base',
      },
      fullWidth: {
        true: 'flex-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const indicatorVariants = cva('absolute z-0 transition-shadow duration-200', {
  variants: {
    variant: {
      default: 'bg-white shadow-[var(--shadow-1)]',
      outline: 'bg-[var(--color-primary-50)] border border-[var(--color-primary-200)]',
      elevated: 'bg-[var(--color-gray-100)]',
    },
    size: {
      sm: 'rounded-md',
      md: 'rounded-lg',
      lg: 'rounded-xl',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

// ============================================================================
// SegmentedControl
// ============================================================================

export interface SegmentedControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>,
    VariantProps<typeof segmentedControlVariants> {
  options: SegmentedControlOption[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      options,
      defaultValue,
      value: controlledValue,
      onValueChange,
      variant = 'default',
      size = 'md',
      fullWidth,
      className,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(
      defaultValue || options[0]?.value || ''
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const segmentRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
    const [indicatorStyle, setIndicatorStyle] = useState<{
      left: number;
      width: number;
      height: number;
    }>({ left: 0, width: 0, height: 0 });

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const handleValueChange = useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange]
    );

    // Calculate indicator position
    useEffect(() => {
      const activeSegment = segmentRefs.current.get(value);
      const container = containerRef.current;
      if (activeSegment && container) {
        const containerRect = container.getBoundingClientRect();
        const segmentRect = activeSegment.getBoundingClientRect();
        setIndicatorStyle({
          left: segmentRect.left - containerRect.left,
          width: segmentRect.width,
          height: segmentRect.height,
        });
      }
    }, [value, options]);

    // Keyboard navigation
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      const enabledOptions = options.filter((opt) => !opt.disabled);
      const currentIndex = enabledOptions.findIndex((opt) => opt.value === value);
      let nextIndex: number;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : enabledOptions.length - 1;
          handleValueChange(enabledOptions[nextIndex].value);
          segmentRefs.current.get(enabledOptions[nextIndex].value)?.focus();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextIndex = currentIndex < enabledOptions.length - 1 ? currentIndex + 1 : 0;
          handleValueChange(enabledOptions[nextIndex].value);
          segmentRefs.current.get(enabledOptions[nextIndex].value)?.focus();
          break;
        case 'Home':
          event.preventDefault();
          handleValueChange(enabledOptions[0].value);
          segmentRefs.current.get(enabledOptions[0].value)?.focus();
          break;
        case 'End':
          event.preventDefault();
          handleValueChange(enabledOptions[enabledOptions.length - 1].value);
          segmentRefs.current.get(enabledOptions[enabledOptions.length - 1].value)?.focus();
          break;
      }
    };

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        role="radiogroup"
        className={cn(segmentedControlVariants({ variant, size, fullWidth }), 'relative', className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Sliding indicator */}
        {indicatorStyle.width > 0 && (
          <motion.div
            className={cn(indicatorVariants({ variant, size }))}
            initial={false}
            animate={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              height: indicatorStyle.height,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          />
        )}

        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              ref={(node) => {
                segmentRefs.current.set(option.value, node);
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-state={isSelected ? 'active' : 'inactive'}
              tabIndex={isSelected ? 0 : -1}
              disabled={option.disabled}
              className={cn(segmentVariants({ variant, size, fullWidth }))}
              onClick={() => !option.disabled && handleValueChange(option.value)}
            >
              {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }
);

SegmentedControl.displayName = 'SegmentedControl';

// ============================================================================
// Exports
// ============================================================================

export { SegmentedControl, segmentedControlVariants, segmentVariants };
