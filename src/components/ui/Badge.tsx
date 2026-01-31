'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  // Base styles - Google Labs Style
  'inline-flex items-center justify-center font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        default:
          'bg-[#f1f3f4] text-[#5f6368]',
        primary:
          'bg-[#e8f0fe] text-[#1a73e8]',
        secondary:
          'bg-[#e8eaed] text-[#3c4043]',
        accent:
          'bg-[#e8f0fe] text-[#1a73e8]',
        success:
          'bg-[#e6f4ea] text-[#1e8e3e]',
        warning:
          'bg-[#fef7e0] text-[#f9ab00]',
        error:
          'bg-[#fce8e6] text-[#d93025]',
        outline:
          'border border-[#dadce0] text-[#5f6368] bg-transparent',
        // Category-specific variants - Google Labs pastel colors
        'ai-automation':
          'bg-[#f3e8fd] text-[#7c3aed]',
        'no-code':
          'bg-[#e8f0fe] text-[#1a73e8]',
        'productivity':
          'bg-[#e6f4ea] text-[#1e8e3e]',
        'case-study':
          'bg-[#fef7e0] text-[#e37400]',
        'tutorial':
          'bg-[#fce8e6] text-[#d93025]',
        'insight':
          'bg-[#e4f7fb] text-[#0097a7]',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs rounded-full',
        md: 'px-2.5 py-1 text-sm rounded-full',
        lg: 'px-3 py-1.5 text-base rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
