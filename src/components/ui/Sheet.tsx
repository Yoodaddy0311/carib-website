'use client';

import {
  forwardRef,
  useEffect,
  useRef,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type HTMLMotionProps } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const sheetVariants = cva(
  'fixed bg-white shadow-[var(--shadow-4)] overflow-y-auto',
  {
    variants: {
      side: {
        left: 'inset-y-0 left-0 h-full w-full max-w-sm border-r border-[var(--color-gray-200)]',
        right: 'inset-y-0 right-0 h-full w-full max-w-sm border-l border-[var(--color-gray-200)]',
        top: 'inset-x-0 top-0 w-full h-auto max-h-[80vh] border-b border-[var(--color-gray-200)]',
        bottom: 'inset-x-0 bottom-0 w-full h-auto max-h-[80vh] border-t border-[var(--color-gray-200)]',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);

export interface SheetProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof sheetVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const slideAnimations = {
  left: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
  },
  right: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
  },
  top: {
    initial: { y: '-100%' },
    animate: { y: 0 },
    exit: { y: '-100%' },
  },
  bottom: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
  },
};

const Sheet = forwardRef<HTMLDivElement, SheetProps>(
  (
    {
      className,
      isOpen,
      onClose,
      children,
      side = 'right',
      closeOnBackdrop = true,
      closeOnEscape = true,
      showCloseButton = true,
      ...props
    },
    ref
  ) => {
    const sheetRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Handle escape key
    const handleEscape = useCallback(
      (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape') {
          onClose();
        }
      },
      [closeOnEscape, onClose]
    );

    // Handle backdrop click
    const handleBackdropClick = useCallback(
      (event: React.MouseEvent) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
          onClose();
        }
      },
      [closeOnBackdrop, onClose]
    );

    // Focus trap
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const sheet = sheetRef.current;
      if (!sheet) return;

      const focusableElements = sheet.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }, []);

    // Set up event listeners and focus management
    useEffect(() => {
      if (isOpen) {
        previousActiveElement.current = document.activeElement as HTMLElement;
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        // Focus first focusable element
        setTimeout(() => {
          const sheet = sheetRef.current;
          const firstFocusable = sheet?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          firstFocusable?.focus();
        }, 0);
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';

        // Restore focus
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }, [isOpen, handleEscape, handleKeyDown]);

    const animation = slideAnimations[side || 'right'];

    // Portal rendering
    if (typeof window === 'undefined') return null;

    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleBackdropClick}
              aria-hidden="true"
            />

            {/* Sheet Content */}
            <motion.div
              ref={(node) => {
                (sheetRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                if (typeof ref === 'function') {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
              }}
              className={cn(sheetVariants({ side, className }))}
              initial={animation.initial}
              animate={animation.animate}
              exit={animation.exit}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              role="dialog"
              aria-modal="true"
              {...(props as HTMLMotionProps<'div'>)}
            >
              {/* Close Button */}
              {showCloseButton && (
                <button
                  type="button"
                  className="absolute top-4 right-4 p-2 rounded-lg text-[var(--color-gray-400)] hover:text-[var(--color-gray-600)] hover:bg-[var(--color-gray-100)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] z-10"
                  onClick={onClose}
                  aria-label="Close sheet"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
  }
);

Sheet.displayName = 'Sheet';

// Sheet subcomponents
const SheetHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-b border-[var(--color-gray-200)]', className)}
      {...props}
    />
  )
);
SheetHeader.displayName = 'SheetHeader';

const SheetTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-heading-4 font-semibold text-[var(--color-gray-900)]', className)}
      {...props}
    />
  )
);
SheetTitle.displayName = 'SheetTitle';

const SheetDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('mt-1 text-body-2 text-[var(--color-gray-500)]', className)}
      {...props}
    />
  )
);
SheetDescription.displayName = 'SheetDescription';

const SheetBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 flex-1', className)}
      {...props}
    />
  )
);
SheetBody.displayName = 'SheetBody';

const SheetFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-t border-[var(--color-gray-200)] flex items-center justify-end gap-3', className)}
      {...props}
    />
  )
);
SheetFooter.displayName = 'SheetFooter';

export {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
  sheetVariants,
};
