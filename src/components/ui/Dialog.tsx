'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from './Modal';
import { Button } from './Button';

const dialogIconVariants = cva(
  'w-12 h-12 rounded-full flex items-center justify-center mb-4',
  {
    variants: {
      variant: {
        info: 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]',
        warning: 'bg-[var(--color-warning-100)] text-[var(--color-warning-600)]',
        danger: 'bg-[var(--color-error-100)] text-[var(--color-error-600)]',
        success: 'bg-[var(--color-success-100)] text-[var(--color-success-600)]',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const dialogButtonVariants = cva('', {
  variants: {
    variant: {
      info: '',
      warning: '',
      danger: '',
      success: '',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

export interface DialogProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof dialogIconVariants> {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

// Icons for each variant
const InfoIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const DangerIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const SuccessIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const variantIcons = {
  info: InfoIcon,
  warning: WarningIcon,
  danger: DangerIcon,
  success: SuccessIcon,
};

const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      className,
      isOpen,
      onClose,
      onConfirm,
      title,
      description,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      variant = 'info',
      isLoading = false,
      ...props
    },
    ref
  ) => {
    const Icon = variantIcons[variant || 'info'];

    const getConfirmButtonVariant = () => {
      switch (variant) {
        case 'danger':
          return 'primary' as const;
        case 'warning':
          return 'accent' as const;
        case 'success':
          return 'primary' as const;
        default:
          return 'primary' as const;
      }
    };

    const getConfirmButtonClass = () => {
      switch (variant) {
        case 'danger':
          return 'bg-[var(--color-error-600)] hover:bg-[var(--color-error-700)] focus-visible:ring-[var(--color-error-500)]';
        case 'warning':
          return 'bg-[var(--color-warning-600)] hover:bg-[var(--color-warning-700)] focus-visible:ring-[var(--color-warning-500)]';
        case 'success':
          return 'bg-[var(--color-success-600)] hover:bg-[var(--color-success-700)] focus-visible:ring-[var(--color-success-500)]';
        default:
          return '';
      }
    };

    return (
      <Modal
        ref={ref}
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
        showCloseButton={false}
        className={cn(className)}
        {...props}
      >
        <ModalBody className="pt-6 text-center">
          <div className="flex justify-center">
            <div className={cn(dialogIconVariants({ variant }))}>
              <Icon />
            </div>
          </div>
          <h3 className="text-heading-4 font-semibold text-[var(--color-gray-900)]">
            {title}
          </h3>
          {description && (
            <p className="mt-2 text-body-2 text-[var(--color-gray-500)]">
              {description}
            </p>
          )}
        </ModalBody>

        <ModalFooter className="justify-center gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            onClick={onConfirm}
            isLoading={isLoading}
            className={getConfirmButtonClass()}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
);

Dialog.displayName = 'Dialog';

export { Dialog, dialogIconVariants };
