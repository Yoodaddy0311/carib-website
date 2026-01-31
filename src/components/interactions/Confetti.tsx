'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  shape: 'square' | 'circle' | 'triangle' | 'star';
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
}

export interface ConfettiConfig {
  /** Number of confetti pieces */
  count?: number;
  /** Colors to use for confetti */
  colors?: string[];
  /** Shapes to include */
  shapes?: Array<'square' | 'circle' | 'triangle' | 'star'>;
  /** Initial velocity range for X axis */
  velocityX?: [number, number];
  /** Initial velocity range for Y axis (negative = upward) */
  velocityY?: [number, number];
  /** Gravity effect */
  gravity?: number;
  /** Wind effect */
  wind?: number;
  /** Duration before pieces start fading */
  duration?: number;
  /** Spread angle in degrees */
  spread?: number;
  /** Origin point [x, y] in percentage (0-1) */
  origin?: [number, number];
}

export interface ConfettiProps {
  /** Initial configuration */
  config?: ConfettiConfig;
  /** Auto-trigger on mount */
  autoTrigger?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export interface ConfettiRef {
  /** Trigger confetti burst */
  fire: (config?: Partial<ConfettiConfig>) => void;
  /** Clear all confetti */
  clear: () => void;
}

const defaultConfig: Required<ConfettiConfig> = {
  count: 100,
  colors: [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#FFE66D', // Yellow
    '#95E1D3', // Mint
    '#F38181', // Coral
    '#AA96DA', // Purple
    '#FCBAD3', // Pink
    '#A8D8EA', // Sky blue
  ],
  shapes: ['square', 'circle', 'triangle'],
  velocityX: [-15, 15],
  velocityY: [-25, -10],
  gravity: 0.5,
  wind: 0,
  duration: 3000,
  spread: 180,
  origin: [0.5, 0.5],
};

/**
 * Confetti - Success celebration animation
 *
 * Trigger colorful confetti bursts for success celebrations,
 * achievements, or special moments.
 *
 * @example
 * ```tsx
 * const confettiRef = useRef<ConfettiRef>(null);
 *
 * <Confetti ref={confettiRef} />
 * <button onClick={() => confettiRef.current?.fire()}>
 *   Celebrate!
 * </button>
 * ```
 */
export const Confetti = forwardRef<ConfettiRef, ConfettiProps>(
  ({ config = {}, autoTrigger = false, onComplete, className }, ref) => {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const lastTimeRef = useRef<number>(0);

    const mergedConfig = { ...defaultConfig, ...config };

    const createPiece = useCallback(
      (id: number, cfg: Required<ConfettiConfig>): ConfettiPiece => {
        const angle =
          (Math.random() * cfg.spread - cfg.spread / 2) * (Math.PI / 180);
        const speed = 10 + Math.random() * 15;

        return {
          id,
          x: cfg.origin[0] * 100,
          y: cfg.origin[1] * 100,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
          color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
          shape: cfg.shapes[Math.floor(Math.random() * cfg.shapes.length)],
          velocityX: Math.sin(angle) * speed + (Math.random() - 0.5) * cfg.velocityX[1],
          velocityY: Math.cos(angle) * speed * -1 + cfg.velocityY[0],
          rotationSpeed: (Math.random() - 0.5) * 20,
        };
      },
      []
    );

    const fire = useCallback(
      (overrideConfig?: Partial<ConfettiConfig>) => {
        const cfg = { ...mergedConfig, ...overrideConfig };
        const newPieces = Array.from({ length: cfg.count }, (_, i) =>
          createPiece(Date.now() + i, cfg)
        );
        setPieces((prev) => [...prev, ...newPieces]);

        // Clear pieces after duration
        setTimeout(() => {
          setPieces((prev) =>
            prev.filter((p) => !newPieces.some((np) => np.id === p.id))
          );
          onComplete?.();
        }, cfg.duration + 1000);
      },
      [mergedConfig, createPiece, onComplete]
    );

    const clear = useCallback(() => {
      setPieces([]);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      fire,
      clear,
    }));

    // Physics update loop
    useEffect(() => {
      const updatePhysics = (timestamp: number) => {
        if (!lastTimeRef.current) {
          lastTimeRef.current = timestamp;
        }

        const deltaTime = Math.min((timestamp - lastTimeRef.current) / 16, 2);
        lastTimeRef.current = timestamp;

        setPieces((prev) =>
          prev.map((piece) => ({
            ...piece,
            x: piece.x + piece.velocityX * deltaTime * 0.1,
            y: piece.y + piece.velocityY * deltaTime * 0.1,
            velocityY: piece.velocityY + mergedConfig.gravity * deltaTime,
            velocityX: piece.velocityX + mergedConfig.wind * deltaTime * 0.1,
            rotation: piece.rotation + piece.rotationSpeed * deltaTime,
          }))
        );

        animationRef.current = requestAnimationFrame(updatePhysics);
      };

      if (pieces.length > 0) {
        animationRef.current = requestAnimationFrame(updatePhysics);
      }

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [pieces.length, mergedConfig.gravity, mergedConfig.wind]);

    // Auto-trigger on mount
    useEffect(() => {
      if (autoTrigger) {
        fire();
      }
    }, [autoTrigger, fire]);

    return (
      <div
        ref={containerRef}
        className={cn(
          'fixed inset-0 pointer-events-none overflow-hidden z-[9999]',
          className
        )}
      >
        <AnimatePresence>
          {pieces.map((piece) => (
            <ConfettiPieceComponent key={piece.id} piece={piece} />
          ))}
        </AnimatePresence>
      </div>
    );
  }
);

Confetti.displayName = 'Confetti';

interface ConfettiPieceComponentProps {
  piece: ConfettiPiece;
}

function ConfettiPieceComponent({ piece }: ConfettiPieceComponentProps) {
  const shapeSize = 10 * piece.scale;

  const renderShape = () => {
    switch (piece.shape) {
      case 'circle':
        return (
          <div
            className="rounded-full"
            style={{
              width: shapeSize,
              height: shapeSize,
              backgroundColor: piece.color,
            }}
          />
        );
      case 'triangle':
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${shapeSize / 2}px solid transparent`,
              borderRight: `${shapeSize / 2}px solid transparent`,
              borderBottom: `${shapeSize}px solid ${piece.color}`,
            }}
          />
        );
      case 'star':
        return (
          <svg
            width={shapeSize}
            height={shapeSize}
            viewBox="0 0 24 24"
            fill={piece.color}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      default: // square
        return (
          <div
            style={{
              width: shapeSize,
              height: shapeSize,
              backgroundColor: piece.color,
            }}
          />
        );
    }
  };

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${piece.x}%`,
        top: `${piece.y}%`,
        rotate: piece.rotation,
      }}
      initial={{ opacity: 1, scale: piece.scale }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {renderShape()}
    </motion.div>
  );
}

/**
 * SuccessConfetti - Pre-configured success celebration
 */
export interface SuccessConfettiProps extends Omit<ConfettiProps, 'config'> {
  /** Intensity of celebration (affects count and velocity) */
  intensity?: 'low' | 'medium' | 'high';
}

export const SuccessConfetti = forwardRef<ConfettiRef, SuccessConfettiProps>(
  ({ intensity = 'medium', ...props }, ref) => {
    const intensityConfig = {
      low: { count: 50, velocityY: [-20, -8] as [number, number] },
      medium: { count: 100, velocityY: [-25, -10] as [number, number] },
      high: { count: 200, velocityY: [-35, -15] as [number, number] },
    };

    return (
      <Confetti
        ref={ref}
        config={{
          ...intensityConfig[intensity],
          colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#FBBF24', '#FCD34D'],
        }}
        {...props}
      />
    );
  }
);

SuccessConfetti.displayName = 'SuccessConfetti';

/**
 * useConfetti - Hook for easy confetti control
 */
export function useConfetti(config?: ConfettiConfig) {
  const ref = useRef<ConfettiRef>(null);

  const fire = useCallback(
    (overrideConfig?: Partial<ConfettiConfig>) => {
      ref.current?.fire(overrideConfig);
    },
    []
  );

  const clear = useCallback(() => {
    ref.current?.clear();
  }, []);

  const ConfettiComponent = useCallback(
    (props: Omit<ConfettiProps, 'ref'>) => (
      <Confetti ref={ref} config={config} {...props} />
    ),
    [config]
  );

  return {
    ref,
    fire,
    clear,
    Confetti: ConfettiComponent,
  };
}
