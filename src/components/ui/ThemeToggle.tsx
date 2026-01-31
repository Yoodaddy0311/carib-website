'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeToggleProps {
  /** Additional CSS classes */
  className?: string;
  /** Size of the toggle button */
  size?: 'sm' | 'md' | 'lg';
  /** Show labels for each theme option */
  showLabels?: boolean;
}

const THEME_STORAGE_KEY = 'carib-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme, enableTransition = false) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Enable transition animation
  if (enableTransition) {
    root.classList.add('theme-transition');
    // Remove transition class after animation completes
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
  }

  if (theme === 'system') {
    const systemTheme = getSystemTheme();
    root.classList.remove('light', 'dark');
    if (systemTheme === 'dark') {
      root.classList.add('dark');
    }
  } else if (theme === 'dark') {
    root.classList.remove('light');
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
}

export function ThemeToggle({
  className,
  size = 'md',
  showLabels = false,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to system preference
      applyTheme('system');
    }
  }, []);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];

    setTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme, true); // Enable transition animation
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Prevent hydration mismatch by showing a placeholder during SSR
  if (!mounted) {
    return (
      <button
        className={cn(
          'relative flex items-center justify-center rounded-full',
          'bg-[var(--color-gray-100)] text-[var(--color-gray-600)]',
          'transition-colors duration-200',
          sizeClasses[size],
          className
        )}
        aria-label="Theme toggle loading"
        disabled
      >
        <div className={cn(iconSizes[size], 'opacity-50')}>
          <Monitor className="w-full h-full" />
        </div>
      </button>
    );
  }

  const currentIcon = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  }[theme];

  const Icon = currentIcon;

  const labels = {
    light: '라이트 모드',
    dark: '다크 모드',
    system: '시스템 설정',
  };

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'relative flex items-center justify-center rounded-full',
        'bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-200)]',
        'text-[var(--color-gray-600)] hover:text-[var(--foreground)]',
        'transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[var(--background)]',
        sizeClasses[size],
        className
      )}
      aria-label={`현재: ${labels[theme]}. 클릭하여 테마 변경`}
      title={labels[theme]}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={iconSizes[size]}
      >
        <Icon className="w-full h-full" />
      </motion.div>
      {showLabels && (
        <span className="sr-only">{labels[theme]}</span>
      )}
    </button>
  );
}

// Hook for consuming theme state in other components
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
      setResolvedTheme(savedTheme === 'system' ? getSystemTheme() : savedTheme);
    } else {
      setResolvedTheme(getSystemTheme());
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const changeTheme = (newTheme: Theme, enableTransition = true) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyTheme(newTheme, enableTransition);
    setResolvedTheme(newTheme === 'system' ? getSystemTheme() : newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme: changeTheme,
    mounted,
  };
}
