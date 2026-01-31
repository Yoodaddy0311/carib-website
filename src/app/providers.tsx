'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { PWAProvider } from '@/components/pwa';
import { I18nProvider } from '@/components/i18n';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <PWAProvider>
          {children}
        </PWAProvider>
        <ToastContainer position="bottom-right" />
      </I18nProvider>
    </QueryClientProvider>
  );
}
