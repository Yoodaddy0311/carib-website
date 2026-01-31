'use client';

import { useRef, useEffect, useState, useCallback, RefObject } from 'react';
import {
  useScroll,
  useTransform,
  useSpring,
  useInView,
  MotionValue,
  SpringOptions,
} from 'motion/react';

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

export interface ScrollProgressOptions {
  /** Target element reference */
  target?: RefObject<HTMLElement | null>;
  /** Offset for scroll detection ["start end", "end start"] */
  offset?: [string, string];
  /** Enable smooth spring animation */
  smooth?: boolean;
  /** Spring configuration */
  springConfig?: SpringOptions;
}

export interface ParallaxOptions {
  /** Parallax speed multiplier (negative = opposite direction) */
  speed?: number;
  /** Direction of parallax effect */
  direction?: 'vertical' | 'horizontal';
  /** Whether to use spring physics */
  spring?: boolean;
  /** Spring configuration */
  springConfig?: SpringOptions;
  /** Offset range for scroll detection */
  offset?: [string, string];
}

export interface TextRevealOptions {
  /** Trigger threshold (0-1) */
  threshold?: number;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Whether to only animate once */
  once?: boolean;
  /** Stagger delay for children (ms) */
  staggerDelay?: number;
}

export interface ImageRevealOptions {
  /** Initial blur amount (px) */
  initialBlur?: number;
  /** Initial scale */
  initialScale?: number;
  /** Clip path animation type */
  clipType?: 'inset' | 'circle' | 'none';
  /** Animation duration (ms) */
  duration?: number;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Whether to only animate once */
  once?: boolean;
  /** Easing function */
  easing?: string;
}

export interface UseScrollProgressReturn {
  /** Scroll progress value (0-1) */
  progress: MotionValue<number>;
  /** Smoothed scroll progress */
  smoothProgress: MotionValue<number>;
  /** Reference to attach to target element */
  ref: RefObject<HTMLDivElement | null>;
}

export interface UseParallaxReturn {
  /** Transform value for Y axis */
  y: MotionValue<number>;
  /** Transform value for X axis */
  x: MotionValue<number>;
  /** Reference to attach to container element */
  ref: RefObject<HTMLDivElement | null>;
  /** Raw scroll progress */
  progress: MotionValue<number>;
}

export interface UseTextRevealReturn {
  /** Reference to attach to text container */
  ref: RefObject<HTMLDivElement | null>;
  /** Whether the element is in view */
  isInView: boolean;
  /** Animation state */
  isRevealed: boolean;
  /** Style object for the container */
  containerStyle: React.CSSProperties;
  /** Get style for each character/word */
  getItemStyle: (index: number) => React.CSSProperties;
}

export interface UseImageRevealReturn {
  /** Reference to attach to image container */
  ref: RefObject<HTMLDivElement | null>;
  /** Whether the element is in view */
  isInView: boolean;
  /** Animation state */
  isRevealed: boolean;
  /** Style object for the image */
  style: React.CSSProperties;
  /** Blur value (for motion.div style) */
  blur: MotionValue<number>;
  /** Scale value (for motion.div style) */
  scale: MotionValue<number>;
  /** Clip path value */
  clipPath: string;
}

/* --------------------------------------------------------------------------
   useScrollProgress Hook
   스크롤 진행률을 추적하는 훅
   -------------------------------------------------------------------------- */

export function useScrollProgress(
  options: ScrollProgressOptions = {}
): UseScrollProgressReturn {
  const {
    offset = ['start end', 'end start'],
    smooth = true,
    springConfig = { stiffness: 100, damping: 30, mass: 1 },
  } = options;

  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: options.target ?? ref,
    offset: offset as any,
  });

  const smoothProgress = useSpring(scrollYProgress, springConfig);

  return {
    progress: scrollYProgress,
    smoothProgress: smooth ? smoothProgress : scrollYProgress,
    ref,
  };
}

/* --------------------------------------------------------------------------
   useParallax Hook
   패럴랙스 효과를 위한 훅
   -------------------------------------------------------------------------- */

export function useParallax(options: ParallaxOptions = {}): UseParallaxReturn {
  const {
    speed = 0.5,
    direction = 'vertical',
    spring = true,
    springConfig = { stiffness: 100, damping: 30, mass: 1 },
    offset = ['start end', 'end start'],
  } = options;

  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as any,
  });

  // Calculate parallax range based on speed
  const range = 100 * Math.abs(speed);
  const outputRange = speed >= 0 ? [range, -range] : [-range, range];

  const rawY = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'vertical' ? outputRange : [0, 0]
  );

  const rawX = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'horizontal' ? outputRange : [0, 0]
  );

  const y = useSpring(rawY, spring ? springConfig : { stiffness: 1000, damping: 1000 });
  const x = useSpring(rawX, spring ? springConfig : { stiffness: 1000, damping: 1000 });

  return {
    y,
    x,
    ref,
    progress: scrollYProgress,
  };
}

/* --------------------------------------------------------------------------
   useTextReveal Hook
   텍스트 reveal 애니메이션을 위한 훅
   -------------------------------------------------------------------------- */

export function useTextReveal(options: TextRevealOptions = {}): UseTextRevealReturn {
  const {
    threshold = 0.2,
    delay = 0,
    duration = 800,
    once = true,
    staggerDelay = 50,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const isInView = useInView(ref, {
    amount: threshold,
    once,
  });

  useEffect(() => {
    if (isInView && !isRevealed) {
      const timer = setTimeout(() => {
        setIsRevealed(true);
      }, delay);
      return () => clearTimeout(timer);
    }
    if (!isInView && !once) {
      setIsRevealed(false);
    }
  }, [isInView, delay, once, isRevealed]);

  const containerStyle: React.CSSProperties = {
    overflow: 'hidden',
  };

  const getItemStyle = useCallback(
    (index: number): React.CSSProperties => ({
      opacity: isRevealed ? 1 : 0,
      transform: isRevealed ? 'translateY(0)' : 'translateY(100%)',
      transition: `opacity ${duration}ms cubic-bezier(0.23, 1, 0.32, 1), transform ${duration}ms cubic-bezier(0.23, 1, 0.32, 1)`,
      transitionDelay: `${index * staggerDelay}ms`,
    }),
    [isRevealed, duration, staggerDelay]
  );

  return {
    ref,
    isInView,
    isRevealed,
    containerStyle,
    getItemStyle,
  };
}

/* --------------------------------------------------------------------------
   useImageReveal Hook
   이미지 reveal 애니메이션을 위한 훅 (clip-path + blur)
   -------------------------------------------------------------------------- */

export function useImageReveal(options: ImageRevealOptions = {}): UseImageRevealReturn {
  const {
    initialBlur = 20,
    initialScale = 1.1,
    clipType = 'inset',
    duration = 1200,
    delay = 0,
    once = true,
    easing = 'cubic-bezier(0.23, 1, 0.32, 1)',
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [clipPath, setClipPath] = useState(getInitialClipPath(clipType));

  const isInView = useInView(ref, {
    amount: 0.2,
    once,
  });

  // Motion values for blur and scale
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  const blurValue = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [initialBlur, initialBlur * 0.3, 0]
  );

  const scaleValue = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [initialScale, initialScale * 0.5 + 0.5, 1]
  );

  const blur = useSpring(blurValue, { stiffness: 100, damping: 30 });
  const scale = useSpring(scaleValue, { stiffness: 100, damping: 30 });

  useEffect(() => {
    if (isInView && !isRevealed) {
      const timer = setTimeout(() => {
        setIsRevealed(true);
        setClipPath(getFinalClipPath(clipType));
      }, delay);
      return () => clearTimeout(timer);
    }
    if (!isInView && !once) {
      setIsRevealed(false);
      setClipPath(getInitialClipPath(clipType));
    }
  }, [isInView, delay, once, clipType, isRevealed]);

  const style: React.CSSProperties = {
    clipPath,
    filter: isRevealed ? 'blur(0px)' : `blur(${initialBlur}px)`,
    transform: isRevealed ? 'scale(1)' : `scale(${initialScale})`,
    transition: `clip-path ${duration}ms ${easing}, filter ${duration}ms ${easing}, transform ${duration}ms ${easing}`,
    transitionDelay: `${delay}ms`,
    willChange: 'clip-path, filter, transform',
  };

  return {
    ref,
    isInView,
    isRevealed,
    style,
    blur,
    scale,
    clipPath,
  };
}

/* --------------------------------------------------------------------------
   Helper Functions
   -------------------------------------------------------------------------- */

function getInitialClipPath(type: 'inset' | 'circle' | 'none'): string {
  switch (type) {
    case 'inset':
      return 'inset(10% 10% 10% 10%)';
    case 'circle':
      return 'circle(0% at 50% 50%)';
    case 'none':
    default:
      return 'none';
  }
}

function getFinalClipPath(type: 'inset' | 'circle' | 'none'): string {
  switch (type) {
    case 'inset':
      return 'inset(0% 0% 0% 0%)';
    case 'circle':
      return 'circle(100% at 50% 50%)';
    case 'none':
    default:
      return 'none';
  }
}

/* --------------------------------------------------------------------------
   Additional Utility Hooks
   -------------------------------------------------------------------------- */

/**
 * useScrollDirection - 스크롤 방향 감지
 */
export function useScrollDirection(): 'up' | 'down' | null {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > prevScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < prevScrollY) {
        setScrollDirection('up');
      }

      setPrevScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollY]);

  return scrollDirection;
}

/**
 * useScrollPosition - 현재 스크롤 위치
 */
export function useScrollPosition(): { x: number; y: number; progress: number } {
  const [position, setPosition] = useState({ x: 0, y: 0, progress: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

      setPosition({
        x: window.scrollX,
        y: window.scrollY,
        progress: Math.min(1, Math.max(0, progress)),
      });
    };

    handleScroll(); // Initial value
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}

/**
 * useElementVisibility - 요소 가시성 퍼센트 추적
 */
export function useElementVisibility(
  ref: RefObject<HTMLElement | null>,
  options: { threshold?: number[] } = {}
): number {
  const { threshold = [0, 0.25, 0.5, 0.75, 1] } = options;
  const [visibility, setVisibility] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setVisibility(entry.intersectionRatio);
        });
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return visibility;
}

/**
 * useStickyAnimation - 스티키 요소 애니메이션
 */
export interface UseStickyAnimationReturn {
  ref: RefObject<HTMLDivElement | null>;
  progress: MotionValue<number>;
  isSticky: boolean;
}

export function useStickyAnimation(
  options: { start?: string; end?: string } = {}
): UseStickyAnimationReturn {
  const { start = 'top top', end = 'bottom bottom' } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [start as any, end as any],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => {
      setIsSticky(value > 0 && value < 1);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  return {
    ref,
    progress: scrollYProgress,
    isSticky,
  };
}
