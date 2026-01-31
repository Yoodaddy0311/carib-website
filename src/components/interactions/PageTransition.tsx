'use client';

import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';

// ============================================
// Page Transition Types
// ============================================

export interface PageTransitionProps {
  /** Children content (page) */
  children: ReactNode;
  /** Animation variant */
  variant?: 'fade' | 'slide' | 'scale' | 'none';
  /** Animation duration in seconds */
  duration?: number;
  /** Custom className */
  className?: string;
}

// ============================================
// Animation Variants
// ============================================

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
  },
};

// ============================================
// Page Transition Component
// ============================================

/**
 * PageTransition - Wrapper for smooth page transitions
 *
 * Provides fade-in + slide-up on entry, fade-out on exit.
 * Respects prefers-reduced-motion automatically via motion/react.
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <PageTransition>
 *   {children}
 * </PageTransition>
 * ```
 */
export function PageTransition({
  children,
  variant = 'slide',
  duration = 0.3,
  className,
}: PageTransitionProps) {
  const pathname = usePathname();

  // Get animation variant
  const animationVariant = variants[variant];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={animationVariant.initial}
        animate={animationVariant.animate}
        exit={animationVariant.exit}
        transition={{
          duration,
          ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// Page Wrapper for Individual Pages
// ============================================

export interface PageWrapperProps {
  /** Children content */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * PageWrapper - Wrap individual page content for animations
 *
 * Use this in individual page components for consistent entry animations.
 *
 * @example
 * ```tsx
 * // In page.tsx
 * export default function Page() {
 *   return (
 *     <PageWrapper>
 *       <YourPageContent />
 *     </PageWrapper>
 *   );
 * }
 * ```
 */
export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Section Reveal Animation
// ============================================

export interface SectionRevealProps {
  /** Children content */
  children: ReactNode;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Animation direction */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Additional className */
  className?: string;
}

/**
 * SectionReveal - Animate sections as they come into view
 *
 * @example
 * ```tsx
 * <SectionReveal delay={0.1} direction="up">
 *   <Section />
 * </SectionReveal>
 * ```
 */
export function SectionReveal({
  children,
  delay = 0,
  direction = 'up',
  className,
}: SectionRevealProps) {
  const directionOffset = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directionOffset[direction],
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Stagger Container
// ============================================

export interface StaggerContainerProps {
  /** Children content */
  children: ReactNode;
  /** Delay between each child animation (seconds) */
  staggerDelay?: number;
  /** Additional className */
  className?: string;
}

/**
 * StaggerContainer - Container that staggers children animations
 *
 * @example
 * ```tsx
 * <StaggerContainer staggerDelay={0.1}>
 *   <StaggerItem>Item 1</StaggerItem>
 *   <StaggerItem>Item 2</StaggerItem>
 *   <StaggerItem>Item 3</StaggerItem>
 * </StaggerContainer>
 * ```
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerItemProps {
  /** Children content */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * StaggerItem - Child item for StaggerContainer
 */
export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
