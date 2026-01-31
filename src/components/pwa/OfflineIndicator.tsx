'use client';

import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OfflineIndicatorProps {
  isOnline: boolean;
}

/**
 * 오프라인 상태 표시 컴포넌트
 *
 * - 오프라인 상태일 때 상단에 배너 표시
 */
export function OfflineIndicator({ isOnline }: OfflineIndicatorProps) {
  if (isOnline) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-0 left-0 right-0 z-50 safe-area-inset-top"
      >
        <div className="bg-amber-500 text-white px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <p className="text-sm font-medium">오프라인 상태입니다. 일부 기능이 제한됩니다.</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
