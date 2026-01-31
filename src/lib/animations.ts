import type { Variants, Transition } from 'motion/react';

// ============================================
// Motion Variants for Reuse
// ============================================

/**
 * Simple fade in animation
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * Fade in with upward movement
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * Fade in with downward movement
 */
export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * Scale in animation (from smaller size)
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

/**
 * Scale up animation (for hover effects)
 */
export const scaleUp: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.98 },
};

/**
 * Slide in from left
 */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.19, 1, 0.22, 1], // ease-out-expo
    },
  },
};

/**
 * Slide in from right
 */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.19, 1, 0.22, 1], // ease-out-expo
    },
  },
};

/**
 * Container for stagger children animations
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Stagger container with larger delay
 */
export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

/**
 * Item variant for use with stagger containers
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * Card variant with scale effect for stagger
 */
export const staggerCardItem: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.19, 1, 0.22, 1], // ease-out-expo
    },
  },
};

/**
 * Mobile menu slide animation
 */
export const mobileMenuSlide: Variants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 200,
    },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 200,
    },
  },
};

/**
 * Accordion content expand/collapse
 */
export const accordionContent: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.2 },
    },
  },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.3, delay: 0.1 },
    },
  },
};

/**
 * Pop in animation for notifications/badges
 */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    },
  },
};

// ============================================
// Transition Presets
// ============================================

export const transitions = {
  /**
   * Smooth spring animation - good for most UI elements
   */
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  } as Transition,

  /**
   * Expo easing for smooth deceleration
   */
  smooth: {
    duration: 0.3,
    ease: [0.19, 1, 0.22, 1],
  } as Transition,

  /**
   * Bouncy spring - good for playful interactions
   */
  bounce: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  } as Transition,

  /**
   * Quick and snappy
   */
  quick: {
    duration: 0.2,
    ease: 'easeOut',
  } as Transition,

  /**
   * Slower, more deliberate
   */
  slow: {
    duration: 0.5,
    ease: 'easeInOut',
  } as Transition,

  /**
   * Tab indicator animation
   */
  tab: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  } as Transition,
} as const;

// ============================================
// Animation Utilities
// ============================================

/**
 * Creates a stagger delay for array items
 * @param index - The index of the item
 * @param baseDelay - Base delay before stagger starts
 * @param staggerDelay - Delay between each item
 */
export function getStaggerDelay(
  index: number,
  baseDelay: number = 0.1,
  staggerDelay: number = 0.1
): number {
  return baseDelay + index * staggerDelay;
}

/**
 * Creates viewport options for scroll-triggered animations
 * @param margin - Margin around the viewport
 * @param amount - How much of the element should be visible
 */
export function getViewportOptions(
  margin: string = '-100px',
  amount: 'some' | 'all' | number = 'some'
) {
  return {
    once: true,
    margin,
    amount,
  };
}

/**
 * Default viewport options for section animations
 */
export const defaultViewport = {
  once: true,
  margin: '-100px',
} as const;

// ============================================
// Hover Animation Presets
// ============================================

export const hoverAnimations = {
  /**
   * Lift effect for cards
   */
  lift: {
    y: -4,
    transition: transitions.smooth,
  },

  /**
   * Scale up slightly
   */
  scale: {
    scale: 1.02,
    transition: transitions.spring,
  },

  /**
   * Glow effect (requires box-shadow support)
   */
  glow: {
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    transition: transitions.smooth,
  },
} as const;

// ============================================
// Scroll-triggered Animations
// ============================================

/**
 * Fade up animation optimized for scroll triggers
 */
export const scrollFadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: defaultViewport,
  transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] },
};

/**
 * Scale in animation optimized for scroll triggers
 */
export const scrollScaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: defaultViewport,
  transition: { duration: 0.5, ease: 'easeOut' },
};
