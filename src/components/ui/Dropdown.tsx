'use client';

import {
  useState,
  useRef,
  useCallback,
  useId,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/useClickOutside';

export type DropdownItemType = 'action' | 'link' | 'separator' | 'header';

export interface DropdownItem {
  type: DropdownItemType;
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  danger?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
}

export function Dropdown({
  trigger,
  items,
  align = 'left',
  className,
  menuClassName,
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const dropdownId = useId();
  const menuId = `${dropdownId}-menu`;

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get actionable items (excluding separators and headers)
  const actionableItems = items
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item }) =>
        (item.type === 'action' || item.type === 'link') && !item.disabled
    );

  // Close dropdown when clicking outside
  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, isOpen);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setHighlightedIndex(-1);
    }
  }, [disabled, isOpen]);

  const handleItemClick = useCallback((item: DropdownItem) => {
    if (item.disabled) return;

    if (item.type === 'action' && item.onClick) {
      item.onClick();
    }

    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const getNextEnabledIndex = useCallback(
    (currentHighlight: number, direction: 1 | -1): number => {
      if (actionableItems.length === 0) return -1;

      // Find current position in actionable items
      const currentActionableIndex = actionableItems.findIndex(
        ({ index }) => index === currentHighlight
      );

      let nextActionableIndex: number;
      if (currentActionableIndex === -1) {
        // No current selection, start from beginning or end
        nextActionableIndex = direction === 1 ? 0 : actionableItems.length - 1;
      } else {
        nextActionableIndex =
          (currentActionableIndex + direction + actionableItems.length) %
          actionableItems.length;
      }

      return actionableItems[nextActionableIndex].index;
    },
    [actionableItems]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            if (actionableItems.length > 0) {
              setHighlightedIndex(actionableItems[0].index);
            }
          } else {
            setHighlightedIndex((prev) => getNextEnabledIndex(prev, 1));
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) => getNextEnabledIndex(prev, -1));
          }
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const item = items[highlightedIndex];
            if (item && (item.type === 'action' || item.type === 'link')) {
              handleItemClick(item);
            }
          } else if (!isOpen) {
            setIsOpen(true);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        case 'Tab':
          if (isOpen) {
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
          break;
        case 'Home':
          if (isOpen && actionableItems.length > 0) {
            event.preventDefault();
            setHighlightedIndex(actionableItems[0].index);
          }
          break;
        case 'End':
          if (isOpen && actionableItems.length > 0) {
            event.preventDefault();
            setHighlightedIndex(actionableItems[actionableItems.length - 1].index);
          }
          break;
      }
    },
    [isOpen, highlightedIndex, items, actionableItems, getNextEnabledIndex, handleItemClick]
  );

  const renderItem = (item: DropdownItem, index: number) => {
    const isHighlighted = index === highlightedIndex;

    if (item.type === 'separator') {
      return (
        <div
          key={`separator-${index}`}
          className="h-px my-1 bg-[var(--color-gray-200)]"
          role="separator"
        />
      );
    }

    if (item.type === 'header') {
      return (
        <div
          key={`header-${index}`}
          className="px-3 py-2 text-xs font-semibold text-[var(--color-gray-500)] uppercase tracking-wider"
        >
          {item.label}
        </div>
      );
    }

    const baseClasses = cn(
      'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors rounded-lg mx-1',
      'first:mt-1 last:mb-1',
      isHighlighted && 'bg-[var(--color-gray-100)]',
      item.disabled && 'opacity-50 cursor-not-allowed',
      item.danger && !item.disabled && 'text-[var(--color-error)]',
      !item.disabled &&
        !item.danger &&
        'text-[var(--color-gray-700)] hover:bg-[var(--color-gray-100)]'
    );

    const content = (
      <>
        {item.icon && (
          <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
        )}
        <span className="truncate">{item.label}</span>
      </>
    );

    if (item.type === 'link' && item.href && !item.disabled) {
      return (
        <a
          key={`link-${index}`}
          id={`${dropdownId}-item-${index}`}
          href={item.href}
          role="menuitem"
          className={cn(baseClasses, 'no-underline')}
          onClick={() => {
            setIsOpen(false);
            setHighlightedIndex(-1);
          }}
          onMouseEnter={() => setHighlightedIndex(index)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        key={`action-${index}`}
        id={`${dropdownId}-item-${index}`}
        type="button"
        role="menuitem"
        disabled={item.disabled}
        onClick={() => handleItemClick(item)}
        onMouseEnter={() => !item.disabled && setHighlightedIndex(index)}
        className={baseClasses}
        style={{ width: 'calc(100% - 8px)' }}
      >
        {content}
      </button>
    );
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 rounded-lg"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-orientation="vertical"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 mt-2 min-w-[160px] bg-white border border-[var(--color-gray-200)] rounded-xl shadow-lg overflow-hidden',
              align === 'left' ? 'left-0' : 'right-0',
              menuClassName
            )}
          >
            <div className="py-1">{items.map(renderItem)}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

Dropdown.displayName = 'Dropdown';
