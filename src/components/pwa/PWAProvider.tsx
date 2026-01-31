'use client';

import { useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { PWAUpdatePrompt } from './PWAUpdatePrompt';
import { OfflineIndicator } from './OfflineIndicator';

/**
 * PWA 기능 Provider 컴포넌트
 *
 * - Service Worker 등록
 * - 설치 프롬프트 표시
 * - 업데이트 알림 표시
 * - 오프라인 상태 표시
 */
export function PWAProvider({ children }: { children: React.ReactNode }) {
  const pwa = usePWA();

  // 개발 환경에서 PWA 상태 로깅
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PWA] State:', {
        isInstalled: pwa.isInstalled,
        isInstallable: pwa.isInstallable,
        isOnline: pwa.isOnline,
        isStandalone: pwa.isStandalone,
        swUpdateAvailable: pwa.swUpdateAvailable,
      });
    }
  }, [pwa]);

  return (
    <>
      {children}

      {/* 오프라인 상태 표시 */}
      <OfflineIndicator isOnline={pwa.isOnline} />

      {/* 설치 프롬프트 */}
      <PWAInstallPrompt
        isInstallable={pwa.isInstallable}
        isInstalled={pwa.isInstalled}
        onInstall={pwa.installApp}
      />

      {/* 업데이트 알림 */}
      <PWAUpdatePrompt isUpdateAvailable={pwa.swUpdateAvailable} onUpdate={pwa.updateApp} />
    </>
  );
}
