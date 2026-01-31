'use client';

import { AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { Toast } from './Toast';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastContainerProps {
  position?: ToastPosition;
  className?: string;
}

const positionClasses: Record<ToastPosition, string> = {
  'top-left': 'top-4 left-4 items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'top-right': 'top-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-4 right-4 items-end',
};

export function ToastContainer({
  position = 'bottom-right',
  className,
}: ToastContainerProps) {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className={cn(
        'fixed z-[9999] flex flex-col gap-3 pointer-events-none',
        positionClasses[position],
        className
      )}
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

ToastContainer.displayName = 'ToastContainer';
