'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'motion/react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Toast as ToastType } from '@/hooks/useToast';

const toastVariants = cva(
  // Base styles
  'relative flex items-start gap-3 w-full max-w-sm rounded-xl p-4 shadow-[var(--shadow-3)] border backdrop-blur-sm',
  {
    variants: {
      variant: {
        success:
          'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
        error:
          'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
        warning:
          'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
        info:
          'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconVariants = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColorVariants = {
  success: 'text-[var(--color-success-500)]',
  error: 'text-[var(--color-error-500)]',
  warning: 'text-[var(--color-warning-500)]',
  info: 'text-[var(--color-primary-500)]',
};

export interface ToastProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id'>,
    VariantProps<typeof toastVariants> {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ className, toast, onDismiss, ...props }, ref) => {
    const Icon = iconVariants[toast.type];

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, x: 100, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.9 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
        className={cn(toastVariants({ variant: toast.type, className }))}
        role="alert"
        aria-live="assertive"
        {...(props as HTMLMotionProps<'div'>)}
      >
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-0.5', iconColorVariants[toast.type])}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-sm opacity-90">{toast.description}</p>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className={cn(
            'flex-shrink-0 rounded-lg p-1 transition-colors duration-200',
            'hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2',
            toast.type === 'success' && 'focus:ring-[var(--color-success-500)]',
            toast.type === 'error' && 'focus:ring-[var(--color-error-500)]',
            toast.type === 'warning' && 'focus:ring-[var(--color-warning-500)]',
            toast.type === 'info' && 'focus:ring-[var(--color-primary-500)]'
          )}
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }
);

Toast.displayName = 'Toast';

export { Toast, toastVariants };
