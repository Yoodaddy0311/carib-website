'use client';

import {
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

export interface Card3DTiltProps {
  /** Child elements to render inside the card */
  children: ReactNode;
  /** Maximum tilt angle in degrees */
  maxTilt?: number;
  /** Perspective value for 3D effect */
  perspective?: number;
  /** Scale on hover */
  scale?: number;
  /** Spring stiffness for smooth animation */
  springStiffness?: number;
  /** Spring damping */
  springDamping?: number;
  /** Enable/disable glare effect */
  glare?: boolean;
  /** Maximum glare opacity */
  glareOpacity?: number;
  /** Disable the tilt effect */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Card3DTilt - 3D tilt effect on mouse hover
 *
 * Creates an interactive card that tilts based on mouse position,
 * providing a depth effect and optional glare highlight.
 *
 * @example
 * ```tsx
 * <Card3DTilt maxTilt={15} glare>
 *   <div className="p-6">
 *     <h3>Card Title</h3>
 *     <p>Card content goes here</p>
 *   </div>
 * </Card3DTilt>
 * ```
 */
export function Card3DTilt({
  children,
  maxTilt = 10,
  perspective = 1000,
  scale = 1.02,
  springStiffness = 300,
  springDamping = 30,
  glare = true,
  glareOpacity = 0.15,
  disabled = false,
  className,
}: Card3DTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw motion values for mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring animations for smooth transitions
  const springConfig = { stiffness: springStiffness, damping: springDamping };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);

  // Glare position
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalized position from -0.5 to 0.5
    const normalizedX = (e.clientX - centerX) / rect.width;
    const normalizedY = (e.clientY - centerY) / rect.height;

    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-white dark:bg-[var(--color-gray-100)]',
        'border border-[var(--color-gray-200)] dark:border-[var(--color-gray-200)]',
        'shadow-[var(--shadow-2)]',
        !disabled && 'cursor-pointer',
        className
      )}
      style={{
        perspective,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          rotateX: disabled ? 0 : rotateX,
          rotateY: disabled ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isHovered && !disabled ? scale : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Content */}
        <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
          {children}
        </div>

        {/* Glare effect */}
        {glare && !disabled && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,${glareOpacity}), transparent 60%)`,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Subtle inner shadow for depth */}
        <div
          className="absolute inset-0 pointer-events-none z-0 rounded-2xl"
          style={{
            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.03)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export interface Card3DTiltContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card3DTiltContent - Helper component for consistent padding
 */
export function Card3DTiltContent({
  children,
  className,
}: Card3DTiltContentProps) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
}
