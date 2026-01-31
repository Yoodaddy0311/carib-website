'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PWAInstallPromptProps {
  isInstallable: boolean;
  isInstalled: boolean;
  onInstall: () => Promise<boolean>;
}

/**
 * PWA 설치 프롬프트 컴포넌트
 *
 * - 설치 가능할 때 하단에 배너 표시
 * - 로컬 스토리지에 닫기 상태 저장
 */
export function PWAInstallPrompt({ isInstallable, isInstalled, onInstall }: PWAInstallPromptProps) {
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  // 로컬 스토리지에서 닫기 상태 복원
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    // 일주일 이내에 닫았으면 다시 표시하지 않음
    if (Date.now() - dismissedTime < oneWeek) {
      setIsDismissed(true);
    } else {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await onInstall();
    setIsInstalling(false);

    if (success) {
      setIsDismissed(true);
    }
  };

  // 이미 설치됐거나 설치 불가능하거나 닫힌 상태면 표시 안함
  if (isInstalled || !isInstallable || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <div className="rounded-2xl bg-white shadow-2xl border border-gray-100 dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-4">
              {/* 아이콘 */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400 flex items-center justify-content-center shadow-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white">앱으로 설치하기</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  홈 화면에 Carib을 추가하여 더 빠르게 접근하세요
                </p>
              </div>

              {/* 닫기 버튼 */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 버튼 영역 */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                나중에
              </button>
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isInstalling ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    설치 중...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    설치하기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
