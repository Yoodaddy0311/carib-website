'use client';

import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type KeyboardEvent,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/useClickOutside';

// Select trigger styles matching Input component
const selectVariants = cva(
  'w-full rounded-xl border bg-white dark:bg-[var(--color-gray-100)] text-[var(--foreground)] transition-all duration-300 outline-none cursor-pointer flex items-center justify-between disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-gray-50)] dark:disabled:bg-[var(--color-gray-200)]',
  {
    variants: {
      variant: {
        default:
          'border-[var(--color-gray-300)] dark:border-[var(--color-gray-300)] hover:border-[var(--color-gray-400)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20',
        error:
          'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]/20',
      },
      selectSize: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base',
        lg: 'h-14 px-5 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      selectSize: 'md',
    },
  }
);

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T = string>
  extends VariantProps<typeof selectVariants> {
  options: SelectOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

// Chevron icon component
const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ duration: 0.2 }}
    className="text-[var(--color-gray-400)] flex-shrink-0"
  >
    <polyline points="6 9 12 15 18 9" />
  </motion.svg>
);

// Search icon component
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[var(--color-gray-400)]"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

// Check icon component
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[var(--color-primary-600)]"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function SelectInner<T = string>(
  {
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    disabled = false,
    error,
    searchable = false,
    searchPlaceholder = 'Search...',
    variant,
    selectSize,
    className,
    id: providedId,
    name,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  }: SelectProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const generatedId = useId();
  const selectId = providedId || generatedId;
  const listboxId = `${selectId}-listbox`;

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const hasError = Boolean(error);
  const effectiveVariant = hasError ? 'error' : variant;

  // Filter options based on search query
  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Find selected option
  const selectedOption = options.find((option) => option.value === value);

  // Close dropdown when clicking outside
  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  }, isOpen);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[
        searchable ? highlightedIndex + 1 : highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, searchable]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setHighlightedIndex(-1);
      setSearchQuery('');
    }
  }, [disabled, isOpen]);

  const handleSelect = useCallback(
    (option: SelectOption<T>) => {
      if (option.disabled) return;
      onChange?.(option.value);
      setIsOpen(false);
      setSearchQuery('');
      setHighlightedIndex(-1);
    },
    [onChange]
  );

  const getNextEnabledIndex = useCallback(
    (currentIndex: number, direction: 1 | -1): number => {
      const totalOptions = filteredOptions.length;
      if (totalOptions === 0) return -1;

      let nextIndex = currentIndex;
      for (let i = 0; i < totalOptions; i++) {
        nextIndex =
          (nextIndex + direction + totalOptions) % totalOptions;
        if (!filteredOptions[nextIndex].disabled) {
          return nextIndex;
        }
      }
      return currentIndex;
    },
    [filteredOptions]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement | HTMLInputElement>) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(getNextEnabledIndex(-1, 1));
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
          event.preventDefault();
          if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex]);
          } else if (!isOpen) {
            setIsOpen(true);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setSearchQuery('');
          setHighlightedIndex(-1);
          break;
        case 'Tab':
          if (isOpen) {
            setIsOpen(false);
            setSearchQuery('');
            setHighlightedIndex(-1);
          }
          break;
        case 'Home':
          if (isOpen) {
            event.preventDefault();
            setHighlightedIndex(getNextEnabledIndex(-1, 1));
          }
          break;
        case 'End':
          if (isOpen) {
            event.preventDefault();
            setHighlightedIndex(getNextEnabledIndex(filteredOptions.length, -1));
          }
          break;
      }
    },
    [isOpen, highlightedIndex, filteredOptions, getNextEnabledIndex, handleSelect]
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        ref={ref}
        type="button"
        id={selectId}
        name={name}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen && highlightedIndex >= 0
            ? `${selectId}-option-${highlightedIndex}`
            : undefined
        }
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${selectId}-error` : undefined}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          selectVariants({ variant: effectiveVariant, selectSize }),
          className
        )}
      >
        <span
          className={cn(
            'truncate',
            !selectedOption && 'text-[var(--color-gray-400)]'
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-[var(--color-gray-100)] border border-[var(--color-gray-200)] rounded-xl shadow-lg overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-[var(--color-gray-100)] dark:border-[var(--color-gray-200)]">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <SearchIcon />
                  </span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setHighlightedIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={searchPlaceholder}
                    className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-[var(--color-gray-200)] bg-white dark:bg-[var(--color-gray-50)] text-[var(--foreground)] outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]/20"
                    aria-label="Search options"
                  />
                </div>
              </div>
            )}

            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label={ariaLabel || 'Options'}
              className="max-h-60 overflow-y-auto py-1"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-2 text-sm text-[var(--color-gray-500)] text-center">
                  No options found
                </li>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = option.value === value;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <li
                      key={String(option.value)}
                      id={`${selectId}-option-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        'px-4 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors',
                        isHighlighted && 'bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-200)]',
                        isSelected && 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/20 text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]',
                        option.disabled &&
                          'opacity-50 cursor-not-allowed text-[var(--color-gray-400)]',
                        !option.disabled &&
                          !isSelected &&
                          'hover:bg-[var(--color-gray-50)] dark:hover:bg-[var(--color-gray-200)]'
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && <CheckIcon />}
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p
          id={`${selectId}-error`}
          className="mt-1.5 text-sm text-[var(--color-error)]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// Use type assertion for forwardRef with generics
const Select = forwardRef(SelectInner) as <T = string>(
  props: SelectProps<T> & { ref?: React.ForwardedRef<HTMLButtonElement> }
) => React.ReactElement;

(Select as React.FC).displayName = 'Select';

export { Select, selectVariants };
