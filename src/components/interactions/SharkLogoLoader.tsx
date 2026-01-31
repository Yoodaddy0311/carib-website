'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { motion, type Variants } from 'motion/react';
import { cn } from '@/lib/utils';

export interface SharkLogoLoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Size of the loader */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Primary color for the shark */
  primaryColor?: string;
  /** Secondary color for accents */
  secondaryColor?: string;
  /** Animation speed multiplier (1 = normal) */
  speed?: number;
  /** Loading text to display */
  text?: string;
  /** Show loading text */
  showText?: boolean;
  /** Whether to show water waves */
  showWaves?: boolean;
}

const sizeMap = {
  sm: { container: 'w-16 h-16', text: 'text-xs' },
  md: { container: 'w-24 h-24', text: 'text-sm' },
  lg: { container: 'w-32 h-32', text: 'text-base' },
  xl: { container: 'w-48 h-48', text: 'text-lg' },
} as const;

/**
 * SharkLogoLoader - Animated shark logo loading indicator
 *
 * A playful loading animation featuring a swimming shark with
 * optional water waves and loading text.
 *
 * @example
 * ```tsx
 * <SharkLogoLoader size="lg" showText text="Loading..." />
 * ```
 */
export const SharkLogoLoader = forwardRef<HTMLDivElement, SharkLogoLoaderProps>(
  (
    {
      size = 'md',
      primaryColor = 'var(--color-primary-500)',
      secondaryColor = 'var(--color-primary-300)',
      speed = 1,
      text = 'Loading...',
      showText = true,
      showWaves = true,
      className,
      ...props
    },
    ref
  ) => {
    const { container, text: textSize } = sizeMap[size];
    const duration = 2 / speed;

    // Shark body animation variants
    const sharkVariants: Variants = {
      swim: {
        x: [-10, 10, -10],
        y: [0, -5, 0, 5, 0],
        rotate: [0, 3, 0, -3, 0],
        transition: {
          duration: duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    };

    // Tail animation variants
    const tailVariants: Variants = {
      wag: {
        rotate: [-15, 15, -15],
        transition: {
          duration: duration * 0.3,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    };

    // Fin animation variants
    const finVariants: Variants = {
      wave: {
        rotate: [-5, 5, -5],
        transition: {
          duration: duration * 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    };

    // Bubble animation variants
    const bubbleVariants: Variants = {
      float: (i: number) => ({
        y: [0, -30],
        x: [0, Math.sin(i) * 10],
        opacity: [0.8, 0],
        scale: [0.5, 1],
        transition: {
          duration: duration * 0.7,
          repeat: Infinity,
          delay: i * 0.2,
          ease: 'easeOut',
        },
      }),
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-4',
          className
        )}
        role="status"
        aria-label={text}
        {...props}
      >
        <div className={cn('relative', container)}>
          {/* Water waves background */}
          {showWaves && (
            <div className="absolute inset-0 overflow-hidden rounded-full opacity-20">
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, transparent 40%, ${secondaryColor} 100%)`,
                }}
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: duration * 0.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          )}

          {/* Shark SVG */}
          <motion.svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            variants={sharkVariants}
            animate="swim"
          >
            {/* Body */}
            <motion.path
              d="M70 50 C70 35, 50 30, 30 40 C20 45, 15 50, 30 60 C50 70, 70 65, 70 50"
              fill={primaryColor}
            />

            {/* Dorsal fin */}
            <motion.path
              d="M50 35 L55 20 L60 35"
              fill={primaryColor}
              variants={finVariants}
              animate="wave"
              style={{ transformOrigin: '55px 35px' }}
            />

            {/* Tail */}
            <motion.path
              d="M70 50 L85 40 L80 50 L85 60 L70 50"
              fill={primaryColor}
              variants={tailVariants}
              animate="wag"
              style={{ transformOrigin: '70px 50px' }}
            />

            {/* Pectoral fin */}
            <motion.path
              d="M45 55 L40 65 L50 60"
              fill={secondaryColor}
              variants={finVariants}
              animate="wave"
              style={{ transformOrigin: '45px 55px' }}
            />

            {/* Eye */}
            <circle cx="30" cy="48" r="3" fill="white" />
            <motion.circle
              cx="30"
              cy="48"
              r="1.5"
              fill="#1a1a2e"
              animate={{
                cx: [29, 31, 29],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Gills */}
            <path
              d="M38 48 L38 52 M41 47 L41 53 M44 46 L44 54"
              stroke={secondaryColor}
              strokeWidth="1"
              strokeLinecap="round"
            />

            {/* Mouth */}
            <motion.path
              d="M22 52 Q25 54 28 52"
              stroke={secondaryColor}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              animate={{
                d: ['M22 52 Q25 54 28 52', 'M22 52 Q25 56 28 52', 'M22 52 Q25 54 28 52'],
              }}
              transition={{
                duration: duration * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Bubbles */}
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={20 - i * 3}
                cy={50 + i * 2}
                r={2 - i * 0.5}
                fill={secondaryColor}
                variants={bubbleVariants}
                animate="float"
                custom={i}
              />
            ))}
          </motion.svg>

          {/* Circular progress track */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke={secondaryColor}
              strokeWidth="2"
              fill="none"
              opacity="0.2"
            />
            {/* Animated progress */}
            <motion.circle
              cx="50"
              cy="50"
              r="46"
              stroke={primaryColor}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="289"
              animate={{
                strokeDashoffset: [289, 0, 289],
              }}
              transition={{
                duration: duration * 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </svg>
        </div>

        {/* Loading text */}
        {showText && (
          <motion.p
            className={cn(
              'text-[var(--color-gray-500)] font-medium',
              textSize
            )}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: duration * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {text}
          </motion.p>
        )}

        <span className="sr-only">{text}</span>
      </div>
    );
  }
);

SharkLogoLoader.displayName = 'SharkLogoLoader';

/**
 * SharkLogoLoaderMinimal - Simplified version without waves
 */
export const SharkLogoLoaderMinimal = forwardRef<
  HTMLDivElement,
  Omit<SharkLogoLoaderProps, 'showWaves'>
>((props, ref) => <SharkLogoLoader ref={ref} showWaves={false} {...props} />);

SharkLogoLoaderMinimal.displayName = 'SharkLogoLoaderMinimal';

/**
 * SharkFin - Just the fin animation for subtle loading indication
 */
export interface SharkFinProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const finSizeMap = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
} as const;

export const SharkFin = forwardRef<HTMLDivElement, SharkFinProps>(
  ({ size = 'md', color = 'var(--color-primary-500)', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center justify-center', className)}
        role="status"
        aria-label="Loading..."
        {...props}
      >
        <motion.svg
          viewBox="0 0 40 40"
          className={finSizeMap[size]}
          animate={{
            y: [0, -3, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Water line */}
          <motion.path
            d="M0 30 Q10 28, 20 30 T40 30"
            stroke={color}
            strokeWidth="1.5"
            fill="none"
            opacity="0.3"
            animate={{
              d: [
                'M0 30 Q10 28, 20 30 T40 30',
                'M0 30 Q10 32, 20 30 T40 30',
                'M0 30 Q10 28, 20 30 T40 30',
              ],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Fin */}
          <motion.path
            d="M20 28 L15 10 L25 28"
            fill={color}
            animate={{
              rotate: [-3, 3, -3],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '20px 28px' }}
          />
        </motion.svg>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

SharkFin.displayName = 'SharkFin';
