'use client';

import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PWAUpdatePromptProps {
  isUpdateAvailable: boolean;
  onUpdate: () => void;
}

/**
 * PWA 업데이트 알림 컴포넌트
 *
 * - 새 버전이 있을 때 상단에 배너 표시
 */
export function PWAUpdatePrompt({ isUpdateAvailable, onUpdate }: PWAUpdatePromptProps) {
  if (!isUpdateAvailable) {
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
        <div className="bg-blue-600 text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-sm">새로운 버전이 있습니다</p>
                <p className="text-xs text-blue-100">업데이트하여 최신 기능을 사용하세요</p>
              </div>
            </div>
            <button
              onClick={onUpdate}
              className="flex-shrink-0 py-2 px-4 rounded-lg text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 transition-colors"
            >
              업데이트
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
