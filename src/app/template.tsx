'use client';

import { type ReactNode } from 'react';
import { motion } from 'motion/react';

interface TemplateProps {
  children: ReactNode;
}

/**
 * Template Component - Page Transition Wrapper
 *
 * Next.js template.tsx is re-mounted on every navigation,
 * making it ideal for page transition animations.
 *
 * Animation: fade-in + slide-up on entry
 */
export default function Template({ children }: TemplateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad - smooth deceleration
      }}
    >
      {children}
    </motion.div>
  );
}
