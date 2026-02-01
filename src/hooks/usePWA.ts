'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  swRegistration: ServiceWorkerRegistration | null;
  swUpdateAvailable: boolean;
}

interface UsePWAReturn extends PWAState {
  installApp: () => Promise<boolean>;
  updateApp: () => void;
  checkForUpdates: () => Promise<void>;
}

/**
 * PWA 기능 관리 훅
 *
 * - Service Worker 등록 및 업데이트 관리
 * - 앱 설치 프롬프트 처리
 * - 온라인/오프라인 상태 감지
 */
export function usePWA(): UsePWAReturn {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    isOnline: true, // Hydration mismatch 방지를 위해 항상 true로 초기화 (클라이언트 마운트 후 실제 상태 확인)
    isStandalone: false,
    swRegistration: null,
    swUpdateAvailable: false,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Service Worker 등록
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[PWA] Service Worker registered:', registration.scope);

        setState((prev) => ({ ...prev, swRegistration: registration }));

        // 업데이트 확인
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New content available');
              setState((prev) => ({ ...prev, swUpdateAvailable: true }));
            }
          });
        });

        // 주기적 업데이트 체크 (1시간마다)
        setInterval(
          () => {
            registration.update();
          },
          60 * 60 * 1000
        );
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();

    // 컨트롤러 변경 감지 (새 SW 활성화)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] Controller changed, reloading...');
      window.location.reload();
    });
  }, []);

  // Standalone 모드 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setState((prev) => ({ ...prev, isStandalone, isInstalled: isStandalone }));

    // display-mode 변경 감지
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setState((prev) => ({
        ...prev,
        isStandalone: e.matches,
        isInstalled: e.matches,
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 설치 프롬프트 이벤트 처리
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState((prev) => ({ ...prev, isInstallable: true }));
      console.log('[PWA] Install prompt ready');
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
      }));
      console.log('[PWA] App installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 온라인/오프라인 상태 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 초기 마운트 시 실제 상태 확인
    setState((prev) => ({ ...prev, isOnline: navigator.onLine }));

    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      console.log('[PWA] Online');
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
      console.log('[PWA] Offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 앱 설치 요청
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('[PWA] Install prompt not available');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      console.log('[PWA] Install prompt outcome:', outcome);

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setState((prev) => ({ ...prev, isInstallable: false }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('[PWA] Install failed:', error);
      return false;
    }
  }, [deferredPrompt]);

  // 앱 업데이트
  const updateApp = useCallback(() => {
    if (!state.swRegistration?.waiting) return;

    state.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }, [state.swRegistration]);

  // 업데이트 확인
  const checkForUpdates = useCallback(async () => {
    if (!state.swRegistration) return;

    try {
      await state.swRegistration.update();
      console.log('[PWA] Update check complete');
    } catch (error) {
      console.error('[PWA] Update check failed:', error);
    }
  }, [state.swRegistration]);

  return {
    ...state,
    installApp,
    updateApp,
    checkForUpdates,
  };
}
