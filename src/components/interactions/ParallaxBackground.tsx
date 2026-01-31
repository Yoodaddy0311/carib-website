'use client';

import {
  useRef,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

export interface ParallaxLayerConfig {
  /** Unique identifier for the layer */
  id: string;
  /** Content to render in this layer */
  content: ReactNode;
  /** Speed multiplier (negative = opposite direction, 0 = fixed, 1 = normal scroll) */
  speed: number;
  /** Z-index for layer stacking */
  zIndex?: number;
  /** Additional CSS classes */
  className?: string;
  /** Opacity range based on scroll [start, end] */
  opacityRange?: [number, number];
}

export interface ParallaxBackgroundProps {
  /** Array of parallax layers */
  layers: ParallaxLayerConfig[];
  /** Height of the parallax container */
  height?: string | number;
  /** Whether to use smooth spring animation */
  smooth?: boolean;
  /** Spring stiffness (only when smooth=true) */
  springStiffness?: number;
  /** Spring damping (only when smooth=true) */
  springDamping?: number;
  /** Static content that doesn't scroll */
  staticContent?: ReactNode;
  /** Children content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ParallaxBackground - Scroll-based parallax effect
 *
 * Creates a layered parallax background effect where different layers
 * move at different speeds based on scroll position.
 *
 * @example
 * ```tsx
 * <ParallaxBackground
 *   height="100vh"
 *   layers={[
 *     { id: 'bg', content: <div className="bg-blue-500 w-full h-full" />, speed: 0.2 },
 *     { id: 'mid', content: <Clouds />, speed: 0.5 },
 *     { id: 'front', content: <Mountains />, speed: 0.8 },
 *   ]}
 * >
 *   <YourContent />
 * </ParallaxBackground>
 * ```
 */
export function ParallaxBackground({
  layers,
  height = '100vh',
  smooth = true,
  springStiffness = 100,
  springDamping = 30,
  staticContent,
  children,
  className,
}: ParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={{ height }}
    >
      {/* Parallax layers */}
      {layers.map((layer) => (
        <ParallaxLayer
          key={layer.id}
          layer={layer}
          scrollYProgress={scrollYProgress}
          smooth={smooth}
          springStiffness={springStiffness}
          springDamping={springDamping}
          containerHeight={height}
        />
      ))}

      {/* Static content (no parallax) */}
      {staticContent && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          {staticContent}
        </div>
      )}

      {/* Main content */}
      {children && (
        <div className="relative z-50 h-full pointer-events-auto">
          {children}
        </div>
      )}
    </div>
  );
}

interface ParallaxLayerProps {
  layer: ParallaxLayerConfig;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  smooth: boolean;
  springStiffness: number;
  springDamping: number;
  containerHeight: string | number;
}

function ParallaxLayer({
  layer,
  scrollYProgress,
  smooth,
  springStiffness,
  springDamping,
  containerHeight,
}: ParallaxLayerProps) {
  const { speed, zIndex = 0, className, opacityRange, content } = layer;

  // Calculate max offset based on speed
  const maxOffset = typeof containerHeight === 'number' ? containerHeight : 500;
  const yOffset = speed * maxOffset;

  // Transform scroll progress to Y position
  const rawY = useTransform(scrollYProgress, [0, 1], [0, -yOffset]);
  const y = smooth
    ? useSpring(rawY, { stiffness: springStiffness, damping: springDamping })
    : rawY;

  // Opacity transform if specified
  const opacity = opacityRange
    ? useTransform(scrollYProgress, [0, 0.5, 1], [opacityRange[0], 1, opacityRange[1]])
    : 1;

  return (
    <motion.div
      className={cn(
        'absolute inset-0 w-full h-full pointer-events-none',
        className
      )}
      style={{
        y,
        opacity,
        zIndex,
        willChange: 'transform',
      }}
    >
      {content}
    </motion.div>
  );
}

/**
 * ParallaxSection - A section with built-in parallax scrolling
 *
 * Simpler API for common parallax use cases.
 */
export interface ParallaxSectionProps {
  /** Background element/image */
  background?: ReactNode;
  /** Background parallax speed (0-1, lower = slower) */
  backgroundSpeed?: number;
  /** Foreground elements */
  foreground?: ReactNode;
  /** Foreground parallax speed */
  foregroundSpeed?: number;
  /** Section minimum height */
  minHeight?: string | number;
  /** Children content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function ParallaxSection({
  background,
  backgroundSpeed = 0.3,
  foreground,
  foregroundSpeed = 0.7,
  minHeight = '100vh',
  children,
  className,
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', `${backgroundSpeed * 30}%`]
  );

  const foregroundY = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', `${foregroundSpeed * -20}%`]
  );

  return (
    <section
      ref={sectionRef}
      className={cn('relative overflow-hidden', className)}
      style={{ minHeight }}
    >
      {/* Background layer */}
      {background && (
        <motion.div
          className="absolute inset-0 w-full h-[120%] -top-[10%] z-0"
          style={{ y: backgroundY }}
        >
          {background}
        </motion.div>
      )}

      {/* Foreground layer */}
      {foreground && (
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ y: foregroundY }}
        >
          {foreground}
        </motion.div>
      )}

      {/* Main content */}
      <div className="relative z-20">{children}</div>
    </section>
  );
}

/**
 * ScrollReveal - Reveal elements on scroll
 */
export interface ScrollRevealProps {
  /** Animation direction */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** Animation distance in pixels */
  distance?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation starts */
  delay?: number;
  /** Viewport threshold to trigger animation (0-1) */
  threshold?: number;
  /** Only animate once */
  once?: boolean;
  /** Children content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function ScrollReveal({
  direction = 'up',
  distance = 50,
  duration = 0.6,
  delay = 0,
  threshold = 0.1,
  once = true,
  children,
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, once]);

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const initial = getInitialPosition();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...initial }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, ...initial }
      }
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
