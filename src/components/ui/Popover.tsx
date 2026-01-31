'use client';

import {
  useState,
  useRef,
  useCallback,
  useId,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { motion, AnimatePresence, type TargetAndTransition } from 'motion/react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/useClickOutside';

type AnimationVariant = { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition };

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type PopoverAlign = 'start' | 'center' | 'end';
export type PopoverTriggerType = 'click' | 'hover';

export interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  triggerType?: PopoverTriggerType;
  showArrow?: boolean;
  className?: string;
  contentClassName?: string;
  offset?: number;
  hoverDelay?: number;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Arrow component
const Arrow = ({ side }: { side: PopoverSide }) => {
  const baseClasses =
    'absolute w-2.5 h-2.5 bg-white border-[var(--color-gray-200)] rotate-45';

  const positionClasses: Record<PopoverSide, string> = {
    top: 'bottom-[-5px] border-r border-b',
    bottom: 'top-[-5px] border-l border-t',
    left: 'right-[-5px] border-t border-r',
    right: 'left-[-5px] border-b border-l',
  };

  return <div className={cn(baseClasses, positionClasses[side])} />;
};

// Get animation variants based on side
const getAnimationVariants = (side: PopoverSide): AnimationVariant => {
  const variants: Record<PopoverSide, AnimationVariant> = {
    top: {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 8 },
    },
    bottom: {
      initial: { opacity: 0, y: -8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
    },
    left: {
      initial: { opacity: 0, x: 8 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 8 },
    },
    right: {
      initial: { opacity: 0, x: -8 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -8 },
    },
  };
  return variants[side];
};

// Get position styles based on side and align
const getPositionStyles = (
  side: PopoverSide,
  align: PopoverAlign,
  offset: number
): CSSProperties => {
  const basePositions: Record<PopoverSide, CSSProperties> = {
    top: { bottom: '100%', marginBottom: offset },
    bottom: { top: '100%', marginTop: offset },
    left: { right: '100%', marginRight: offset },
    right: { left: '100%', marginLeft: offset },
  };

  const alignments: Record<PopoverSide, Record<PopoverAlign, CSSProperties>> = {
    top: {
      start: { left: 0 },
      center: { left: '50%', transform: 'translateX(-50%)' },
      end: { right: 0 },
    },
    bottom: {
      start: { left: 0 },
      center: { left: '50%', transform: 'translateX(-50%)' },
      end: { right: 0 },
    },
    left: {
      start: { top: 0 },
      center: { top: '50%', transform: 'translateY(-50%)' },
      end: { bottom: 0 },
    },
    right: {
      start: { top: 0 },
      center: { top: '50%', transform: 'translateY(-50%)' },
      end: { bottom: 0 },
    },
  };

  return {
    ...basePositions[side],
    ...alignments[side][align],
  };
};

// Get arrow position styles
const getArrowPositionStyles = (
  side: PopoverSide,
  align: PopoverAlign
): CSSProperties => {
  const alignments: Record<PopoverSide, Record<PopoverAlign, CSSProperties>> = {
    top: {
      start: { left: 12 },
      center: { left: '50%', transform: 'translateX(-50%) rotate(45deg)' },
      end: { right: 12 },
    },
    bottom: {
      start: { left: 12 },
      center: { left: '50%', transform: 'translateX(-50%) rotate(45deg)' },
      end: { right: 12 },
    },
    left: {
      start: { top: 12 },
      center: { top: '50%', transform: 'translateY(-50%) rotate(45deg)' },
      end: { bottom: 12 },
    },
    right: {
      start: { top: 12 },
      center: { top: '50%', transform: 'translateY(-50%) rotate(45deg)' },
      end: { bottom: 12 },
    },
  };

  return alignments[side][align];
};

export function Popover({
  trigger,
  content,
  side = 'bottom',
  align = 'center',
  triggerType = 'click',
  showArrow = false,
  className,
  contentClassName,
  offset = 8,
  hoverDelay = 200,
  disabled = false,
  open: controlledOpen,
  onOpenChange,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const popoverId = useId();
  const contentId = `${popoverId}-content`;

  const containerRef = useRef<HTMLDivElement>(null);

  // Controlled vs uncontrolled state
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = useCallback(
    (open: boolean) => {
      if (!isControlled) {
        setInternalOpen(open);
      }
      onOpenChange?.(open);
    },
    [isControlled, onOpenChange]
  );

  // Close popover when clicking outside
  useClickOutside(
    containerRef,
    () => {
      if (triggerType === 'click') {
        setIsOpen(false);
      }
    },
    isOpen && triggerType === 'click'
  );

  const handleClick = useCallback(() => {
    if (disabled || triggerType !== 'click') return;
    setIsOpen(!isOpen);
  }, [disabled, triggerType, isOpen, setIsOpen]);

  const handleMouseEnter = useCallback(() => {
    if (disabled || triggerType !== 'hover') return;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, hoverDelay);
  }, [disabled, triggerType, hoverDelay, setIsOpen]);

  const handleMouseLeave = useCallback(() => {
    if (triggerType !== 'hover') return;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  }, [triggerType, setIsOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        setIsOpen(false);
      }
    },
    [isOpen, setIsOpen]
  );

  const animationVariants = getAnimationVariants(side);
  const positionStyles = getPositionStyles(side, align, offset);
  const arrowStyles = getArrowPositionStyles(side, align);

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={contentId}
        disabled={disabled}
        onClick={handleClick}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 rounded-lg"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={contentId}
            role="dialog"
            aria-modal="false"
            initial={animationVariants.initial}
            animate={animationVariants.animate}
            exit={animationVariants.exit}
            transition={{ duration: 0.15, ease: 'easeOut' as const }}
            style={positionStyles}
            className={cn(
              'absolute z-50 bg-white border border-[var(--color-gray-200)] rounded-xl shadow-lg',
              contentClassName
            )}
          >
            {showArrow && (
              <div style={arrowStyles} className="absolute">
                <Arrow side={side} />
              </div>
            )}
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

Popover.displayName = 'Popover';
