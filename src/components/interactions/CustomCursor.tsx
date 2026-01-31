'use client';

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

// ============================================
// Custom Cursor Types
// ============================================

export interface CustomCursorProps {
  /** Whether to enable the custom cursor */
  enabled?: boolean;
  /** Primary cursor color */
  color?: string;
  /** Secondary/hover cursor color */
  hoverColor?: string;
  /** Size of the main cursor dot (px) */
  dotSize?: number;
  /** Size of the cursor ring (px) */
  ringSize?: number;
  /** Ring border width (px) */
  ringWidth?: number;
  /** Spring stiffness for cursor movement */
  springStiffness?: number;
  /** Spring damping for cursor movement */
  springDamping?: number;
  /** Custom className for cursor container */
  className?: string;
  /** Children to render (typically the app content) */
  children?: ReactNode;
}

export interface CursorState {
  isHovering: boolean;
  isClicking: boolean;
  isText: boolean;
  isHidden: boolean;
  hoverText?: string;
}

// ============================================
// Custom Cursor Component
// ============================================

/**
 * CustomCursor - A custom cursor that follows mouse movement with spring physics
 *
 * Features:
 * - Smooth spring physics following
 * - Enlarges on link/button hover
 * - Shows text cursor on text areas
 * - Respects prefers-reduced-motion
 * - Automatically disabled on mobile/touch devices
 *
 * @example
 * ```tsx
 * <CustomCursor color="var(--color-primary-500)">
 *   <App />
 * </CustomCursor>
 * ```
 */
export function CustomCursor({
  enabled = true,
  color = 'var(--color-primary-500)',
  hoverColor = 'var(--color-accent-500)',
  dotSize = 8,
  ringSize = 40,
  ringWidth = 2,
  springStiffness = 400,
  springDamping = 28,
  className,
  children,
}: CustomCursorProps) {
  const [cursorState, setCursorState] = useState<CursorState>({
    isHovering: false,
    isClicking: false,
    isText: false,
    isHidden: false,
  });
  const [isMobile, setIsMobile] = useState(true); // Default to true to prevent flash
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Motion values for cursor position
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Spring configuration for smooth following
  const springConfig = {
    stiffness: springStiffness,
    damping: springDamping,
    mass: 0.5,
  };

  // Dot follows more closely
  const dotX = useSpring(cursorX, { ...springConfig, stiffness: springStiffness * 1.5 });
  const dotY = useSpring(cursorY, { ...springConfig, stiffness: springStiffness * 1.5 });

  // Ring follows with more lag
  const ringX = useSpring(cursorX, springConfig);
  const ringY = useSpring(cursorY, springConfig);

  // Check for mobile/touch devices and reduced motion preference
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - msMaxTouchPoints is vendor-specific
        navigator.msMaxTouchPoints > 0;

      const isSmallScreen = window.innerWidth < 768;

      setIsMobile(isTouchDevice || isSmallScreen);
    };

    const checkReducedMotion = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    };

    checkMobile();
    const cleanup = checkReducedMotion();

    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      cleanup?.();
    };
  }, []);

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    },
    [cursorX, cursorY]
  );

  // Mouse down/up handlers
  const handleMouseDown = useCallback(() => {
    setCursorState((prev) => ({ ...prev, isClicking: true }));
  }, []);

  const handleMouseUp = useCallback(() => {
    setCursorState((prev) => ({ ...prev, isClicking: false }));
  }, []);

  // Check element under cursor
  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;

    // Check for interactive elements
    const isInteractive = Boolean(
      target.tagName === 'A' ||
      target.tagName === 'BUTTON' ||
      target.closest('a') ||
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('[data-cursor="pointer"]') ||
      getComputedStyle(target).cursor === 'pointer'
    );

    // Check for text input elements
    const isTextInput = Boolean(
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]') ||
      target.closest('[data-cursor="text"]')
    );

    // Check for hidden cursor areas
    const isHidden = Boolean(
      target.closest('[data-cursor="none"]') ||
      target.closest('[data-cursor="hidden"]')
    );

    // Get custom hover text if any
    const hoverText =
      target.getAttribute('data-cursor-text') ||
      target.closest('[data-cursor-text]')?.getAttribute('data-cursor-text') ||
      undefined;

    setCursorState({
      isHovering: isInteractive,
      isClicking: false,
      isText: isTextInput,
      isHidden: isHidden,
      hoverText,
    });
  }, []);

  // Document leave handler
  const handleMouseLeave = useCallback(() => {
    setCursorState((prev) => ({ ...prev, isHidden: true }));
  }, []);

  const handleMouseEnter = useCallback(() => {
    setCursorState((prev) => ({ ...prev, isHidden: false }));
  }, []);

  // Event listeners
  useEffect(() => {
    if (!enabled || isMobile || prefersReducedMotion) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [
    enabled,
    isMobile,
    prefersReducedMotion,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleMouseOver,
    handleMouseLeave,
    handleMouseEnter,
  ]);

  // Don't render custom cursor on mobile or when motion is reduced
  const shouldShowCursor = enabled && !isMobile && !prefersReducedMotion;

  // Calculate sizes based on state
  const currentDotSize = cursorState.isClicking
    ? dotSize * 0.5
    : cursorState.isHovering
    ? dotSize * 1.5
    : dotSize;

  const currentRingSize = cursorState.isClicking
    ? ringSize * 0.8
    : cursorState.isHovering
    ? ringSize * 1.5
    : ringSize;

  const currentColor = cursorState.isHovering ? hoverColor : color;

  return (
    <div className={cn('relative', className)}>
      {/* Hide default cursor when custom cursor is active */}
      {shouldShowCursor && (
        <style jsx global>{`
          *, *::before, *::after {
            cursor: none !important;
          }
          /* Restore text cursor for inputs and textareas for better UX */
          input, textarea, [contenteditable="true"] {
            cursor: text !important;
          }
        `}</style>
      )}

      {/* Custom cursor elements */}
      <AnimatePresence>
        {shouldShowCursor && !cursorState.isHidden && !cursorState.isText && (
          <>
            {/* Inner dot */}
            <motion.div
              className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
              style={{
                x: dotX,
                y: dotY,
                translateX: '-50%',
                translateY: '-50%',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                width: currentDotSize,
                height: currentDotSize,
                backgroundColor: currentColor,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                opacity: { duration: 0.15 },
                scale: { duration: 0.15 },
                width: { type: 'spring', stiffness: 300, damping: 20 },
                height: { type: 'spring', stiffness: 300, damping: 20 },
              }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: currentColor }}
              />
            </motion.div>

            {/* Outer ring */}
            <motion.div
              className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
              style={{
                x: ringX,
                y: ringY,
                translateX: '-50%',
                translateY: '-50%',
                borderWidth: ringWidth,
                borderStyle: 'solid',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: cursorState.isHovering ? 0.8 : 0.5,
                scale: 1,
                width: currentRingSize,
                height: currentRingSize,
                borderColor: currentColor,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                opacity: { duration: 0.15 },
                scale: { duration: 0.15 },
                width: { type: 'spring', stiffness: 200, damping: 20 },
                height: { type: 'spring', stiffness: 200, damping: 20 },
              }}
            />

            {/* Hover text label */}
            <AnimatePresence>
              {cursorState.hoverText && (
                <motion.div
                  className="fixed top-0 left-0 pointer-events-none z-[9997]"
                  style={{
                    x: ringX,
                    y: ringY,
                    translateX: '-50%',
                    translateY: 'calc(-100% - 20px)',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <span
                    className="px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap"
                    style={{
                      backgroundColor: currentColor,
                      color: 'white',
                    }}
                  >
                    {cursorState.hoverText}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}

// ============================================
// Cursor Context for External Control
// ============================================

import { createContext, useContext } from 'react';

interface CursorContextValue {
  setCursorState: React.Dispatch<React.SetStateAction<CursorState>>;
  cursorState: CursorState;
}

const CursorContext = createContext<CursorContextValue | null>(null);

/**
 * Hook to access and control cursor state from child components
 */
export function useCursor() {
  const context = useContext(CursorContext);
  if (!context) {
    return {
      setCursorState: () => {},
      cursorState: {
        isHovering: false,
        isClicking: false,
        isText: false,
        isHidden: false,
      },
    };
  }
  return context;
}

// ============================================
// Utility Components
// ============================================

export interface CursorAreaProps {
  /** Type of cursor to show in this area */
  type?: 'pointer' | 'text' | 'none' | 'hidden';
  /** Custom text to show near cursor */
  cursorText?: string;
  /** Children content */
  children?: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * CursorArea - Define areas with specific cursor behavior
 *
 * @example
 * ```tsx
 * <CursorArea type="pointer" cursorText="Click me">
 *   <div>Interactive content</div>
 * </CursorArea>
 * ```
 */
export function CursorArea({
  type = 'pointer',
  cursorText,
  children,
  className,
}: CursorAreaProps) {
  return (
    <div
      className={className}
      data-cursor={type}
      data-cursor-text={cursorText}
    >
      {children}
    </div>
  );
}

export interface CursorHideProps {
  /** Children content */
  children?: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * CursorHide - Area where custom cursor is hidden
 */
export function CursorHide({ children, className }: CursorHideProps) {
  return (
    <div className={className} data-cursor="none">
      {children}
    </div>
  );
}

