'use client';

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

// Magnetic Field Context
interface MagneticFieldContextValue {
  registerElement: (id: string, ref: HTMLElement, strength: number) => void;
  unregisterElement: (id: string) => void;
  mouseX: number;
  mouseY: number;
}

const MagneticFieldContext = createContext<MagneticFieldContextValue | null>(null);

export interface MagneticFieldProps {
  /** Maximum magnetic effect distance in pixels */
  maxDistance?: number;
  /** Global strength multiplier */
  strengthMultiplier?: number;
  /** Children content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MagneticField - Container that creates a magnetic effect zone
 *
 * Wrap elements with MagneticHover inside this container to create
 * a zone where elements react to mouse proximity.
 *
 * @example
 * ```tsx
 * <MagneticField maxDistance={200}>
 *   <MagneticHover strength={0.5}>
 *     <button>Hover me!</button>
 *   </MagneticHover>
 * </MagneticField>
 * ```
 */
export function MagneticField({
  maxDistance = 300,
  strengthMultiplier = 1,
  children,
  className,
}: MagneticFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const elementsRef = useRef<Map<string, { ref: HTMLElement; strength: number }>>(
    new Map()
  );

  const registerElement = useCallback(
    (id: string, ref: HTMLElement, strength: number) => {
      elementsRef.current.set(id, { ref, strength: strength * strengthMultiplier });
    },
    [strengthMultiplier]
  );

  const unregisterElement = useCallback((id: string) => {
    elementsRef.current.delete(id);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
    setMouseY(e.clientY - rect.top);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(-9999);
    setMouseY(-9999);
  }, []);

  return (
    <MagneticFieldContext.Provider
      value={{ registerElement, unregisterElement, mouseX, mouseY }}
    >
      <div
        ref={containerRef}
        className={cn('relative', className)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </MagneticFieldContext.Provider>
  );
}

export interface MagneticHoverProps {
  /** Magnetic attraction strength (0-1) */
  strength?: number;
  /** Maximum movement distance in pixels */
  maxOffset?: number;
  /** Spring stiffness */
  springStiffness?: number;
  /** Spring damping */
  springDamping?: number;
  /** Scale on hover */
  hoverScale?: number;
  /** Show magnetic field indicator (debug) */
  showField?: boolean;
  /** Unique identifier (auto-generated if not provided) */
  id?: string;
  /** Disable the magnetic effect */
  disabled?: boolean;
  /** Only activate when mouse is very close */
  proximity?: boolean;
  /** Proximity distance threshold */
  proximityDistance?: number;
  /** Children content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

let idCounter = 0;

/**
 * MagneticHover - Element that responds to nearby mouse movement
 *
 * Creates an attractive magnetic effect where the element moves
 * towards the mouse cursor when within range.
 *
 * @example
 * ```tsx
 * <MagneticHover strength={0.3} hoverScale={1.1}>
 *   <Button>Magnetic Button</Button>
 * </MagneticHover>
 * ```
 */
export function MagneticHover({
  strength = 0.3,
  maxOffset = 30,
  springStiffness = 150,
  springDamping = 15,
  hoverScale = 1,
  showField = false,
  id: providedId,
  disabled = false,
  proximity = false,
  proximityDistance = 150,
  children,
  className,
}: MagneticHoverProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [elementId] = useState(() => providedId || `magnetic-${++idCounter}`);
  const context = useContext(MagneticFieldContext);

  // Motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring animations
  const springConfig = { stiffness: springStiffness, damping: springDamping };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Register with parent field if exists
  useEffect(() => {
    if (context && elementRef.current) {
      context.registerElement(elementId, elementRef.current, strength);
      return () => context.unregisterElement(elementId);
    }
  }, [context, elementId, strength]);

  // Update position based on mouse
  useEffect(() => {
    if (disabled || !elementRef.current) return;

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = context?.mouseX ?? 0;
    const mouseY = context?.mouseY ?? 0;

    // Calculate distance from center
    const deltaX = mouseX - centerX + (elementRef.current.parentElement?.getBoundingClientRect().left ?? 0);
    const deltaY = mouseY - centerY + (elementRef.current.parentElement?.getBoundingClientRect().top ?? 0);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Check proximity if enabled
    if (proximity && distance > proximityDistance) {
      x.set(0);
      y.set(0);
      return;
    }

    // Calculate magnetic effect (inverse square falloff)
    const maxDist = context ? proximityDistance : 200;
    const effectStrength = Math.max(0, 1 - distance / maxDist);

    if (effectStrength > 0) {
      const offsetX = deltaX * strength * effectStrength;
      const offsetY = deltaY * strength * effectStrength;

      // Clamp to maxOffset
      x.set(Math.max(-maxOffset, Math.min(maxOffset, offsetX)));
      y.set(Math.max(-maxOffset, Math.min(maxOffset, offsetY)));
    } else {
      x.set(0);
      y.set(0);
    }
  }, [
    context?.mouseX,
    context?.mouseY,
    strength,
    maxOffset,
    disabled,
    proximity,
    proximityDistance,
    x,
    y,
  ]);

  // Standalone mode (no parent MagneticField)
  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (context || disabled || !elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      x.set(deltaX * strength);
      y.set(deltaY * strength);
    },
    [context, disabled, strength, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    if (!context) {
      x.set(0);
      y.set(0);
    }
  }, [context, x, y]);

  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={elementRef}
      className={cn('relative inline-block', className)}
      style={{
        x: springX,
        y: springY,
      }}
      animate={{
        scale: isHovered && hoverScale !== 1 ? hoverScale : 1,
      }}
      transition={{ duration: 0.2 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseLeave();
      }}
    >
      {/* Debug field indicator */}
      {showField && (
        <div
          className="absolute rounded-full border border-dashed border-[var(--color-primary-300)] opacity-30 pointer-events-none"
          style={{
            width: proximityDistance * 2,
            height: proximityDistance * 2,
            left: `calc(50% - ${proximityDistance}px)`,
            top: `calc(50% - ${proximityDistance}px)`,
          }}
        />
      )}

      {children}
    </motion.div>
  );
}

/**
 * MagneticButton - Pre-styled magnetic button
 */
export interface MagneticButtonProps extends MagneticHoverProps {
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Click handler */
  onClick?: () => void;
}

const buttonVariants = {
  default:
    'bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)]',
  outline:
    'border-2 border-[var(--color-primary-500)] text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)]',
  ghost:
    'text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)]',
};

const buttonSizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function MagneticButton({
  variant = 'default',
  size = 'md',
  onClick,
  children,
  strength = 0.4,
  hoverScale = 1.05,
  ...props
}: MagneticButtonProps) {
  return (
    <MagneticHover strength={strength} hoverScale={hoverScale} {...props}>
      <motion.button
        className={cn(
          'rounded-xl font-medium transition-colors duration-200',
          buttonVariants[variant],
          buttonSizes[size]
        )}
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
      >
        {children}
      </motion.button>
    </MagneticHover>
  );
}

/**
 * MagneticIcon - Magnetic effect for icons
 */
export interface MagneticIconProps extends MagneticHoverProps {
  /** Icon size in pixels */
  iconSize?: number;
}

export function MagneticIcon({
  iconSize = 24,
  children,
  strength = 0.5,
  hoverScale = 1.2,
  ...props
}: MagneticIconProps) {
  return (
    <MagneticHover strength={strength} hoverScale={hoverScale} {...props}>
      <div
        className="flex items-center justify-center text-[var(--color-gray-600)] hover:text-[var(--color-primary-500)] transition-colors duration-200"
        style={{ width: iconSize, height: iconSize }}
      >
        {children}
      </div>
    </MagneticHover>
  );
}

/**
 * MagneticLink - Magnetic effect for links/navigation
 */
export interface MagneticLinkProps extends MagneticHoverProps {
  /** Link href */
  href?: string;
  /** Open in new tab */
  external?: boolean;
}

export function MagneticLink({
  href,
  external = false,
  children,
  strength = 0.3,
  hoverScale = 1.05,
  className,
  ...props
}: MagneticLinkProps) {
  const Component = href ? 'a' : 'span';

  return (
    <MagneticHover
      strength={strength}
      hoverScale={hoverScale}
      className={className}
      {...props}
    >
      <Component
        href={href}
        className="inline-block text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] transition-colors duration-200 cursor-pointer"
        {...(external && href ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </Component>
    </MagneticHover>
  );
}
