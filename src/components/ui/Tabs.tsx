'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  variant: 'default' | 'pills' | 'underline';
  registerTab: (value: string, element: HTMLButtonElement | null) => void;
  getTabElement: (value: string) => HTMLButtonElement | null;
  tabValues: string[];
}

// ============================================================================
// Context
// ============================================================================

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within a Tabs component');
  }
  return context;
}

// ============================================================================
// Tabs Root
// ============================================================================

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value: controlledValue, onValueChange, variant = 'default', className, children, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');
    const tabRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
    const [tabValues, setTabValues] = useState<string[]>([]);

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

    const registerTab = useCallback((tabValue: string, element: HTMLButtonElement | null) => {
      tabRefs.current.set(tabValue, element);
      setTabValues((prev) => {
        if (!prev.includes(tabValue)) {
          return [...prev, tabValue];
        }
        return prev;
      });
    }, []);

    const getTabElement = useCallback((tabValue: string) => {
      return tabRefs.current.get(tabValue) || null;
    }, []);

    return (
      <TabsContext.Provider
        value={{
          value,
          onValueChange: handleValueChange,
          variant,
          registerTab,
          getTabElement,
          tabValues,
        }}
      >
        <div ref={ref} className={cn('w-full', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = 'Tabs';

// ============================================================================
// TabsList
// ============================================================================

const tabsListVariants = cva('flex', {
  variants: {
    variant: {
      default:
        'gap-1 rounded-xl bg-[var(--color-gray-100)] p-1',
      pills:
        'gap-2',
      underline:
        'gap-6 border-b border-[var(--color-gray-200)]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(({ className, children, ...props }, ref) => {
  const { variant, value, tabValues, getTabElement } = useTabsContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    top?: number;
    height?: number;
  }>({ left: 0, width: 0 });

  // Calculate indicator position
  useEffect(() => {
    const activeTab = getTabElement(value);
    const container = containerRef.current;
    if (activeTab && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
        top: variant === 'underline' ? tabRect.height - 2 : 0,
        height: variant === 'underline' ? 2 : tabRect.height,
      });
    }
  }, [value, getTabElement, variant, tabValues]);

  return (
    <div
      ref={(node) => {
        // Combine refs
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      role="tablist"
      className={cn(tabsListVariants({ variant }), 'relative', className)}
      {...props}
    >
      {/* Animated indicator */}
      {(variant === 'default' || variant === 'pills') && indicatorStyle.width > 0 && (
        <motion.div
          className={cn(
            'absolute z-0',
            variant === 'default' && 'rounded-lg bg-white shadow-[var(--shadow-1)]',
            variant === 'pills' && 'rounded-full bg-[var(--color-primary-600)]'
          )}
          initial={false}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            height: indicatorStyle.height,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ top: indicatorStyle.top || 0 }}
        />
      )}
      {variant === 'underline' && indicatorStyle.width > 0 && (
        <motion.div
          className="absolute bottom-0 h-0.5 bg-[var(--color-primary-600)]"
          initial={false}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      {children}
    </div>
  );
});

TabsList.displayName = 'TabsList';

// ============================================================================
// TabsTrigger
// ============================================================================

const tabsTriggerVariants = cva(
  'relative z-10 inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'rounded-lg px-4 py-2 text-sm text-[var(--color-gray-600)] data-[state=active]:text-[var(--color-gray-900)]',
        pills:
          'rounded-full px-5 py-2 text-sm text-[var(--color-gray-600)] data-[state=active]:text-white',
        underline:
          'pb-3 text-sm text-[var(--color-gray-500)] hover:text-[var(--color-gray-700)] data-[state=active]:text-[var(--color-primary-600)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange, variant, registerTab, tabValues } = useTabsContext();
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const isSelected = value === selectedValue;

    // Register this tab
    useEffect(() => {
      registerTab(value, buttonRef.current);
    }, [value, registerTab]);

    // Keyboard navigation
    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      const currentIndex = tabValues.indexOf(value);
      let nextIndex: number;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabValues.length - 1;
          onValueChange(tabValues[nextIndex]);
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextIndex = currentIndex < tabValues.length - 1 ? currentIndex + 1 : 0;
          onValueChange(tabValues[nextIndex]);
          break;
        case 'Home':
          event.preventDefault();
          onValueChange(tabValues[0]);
          break;
        case 'End':
          event.preventDefault();
          onValueChange(tabValues[tabValues.length - 1]);
          break;
      }
    };

    return (
      <button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        type="button"
        role="tab"
        aria-selected={isSelected}
        data-state={isSelected ? 'active' : 'inactive'}
        tabIndex={isSelected ? 0 : -1}
        className={cn(tabsTriggerVariants({ variant }), className)}
        onClick={() => onValueChange(value)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

// ============================================================================
// TabsContent
// ============================================================================

export interface TabsContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  value: string;
  forceMount?: boolean;
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, forceMount = false, className, children, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext();
    const isSelected = value === selectedValue;

    if (!forceMount && !isSelected) {
      return null;
    }

    return (
      <AnimatePresence mode="wait">
        {isSelected && (
          <motion.div
            ref={ref}
            role="tabpanel"
            aria-labelledby={`tab-${value}`}
            tabIndex={0}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' as const }}
            className={cn('mt-4 focus-visible:outline-none', className)}
            {...props}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

TabsContent.displayName = 'TabsContent';

// ============================================================================
// Exports
// ============================================================================

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants };
