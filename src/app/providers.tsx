'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { PWAProvider } from '@/components/pwa';
import { I18nProvider } from '@/components/i18n';
import { CustomCursor } from '@/components/interactions';

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
          <CustomCursor
            color="var(--color-primary-500)"
            hoverColor="var(--color-accent-500)"
            dotSize={8}
            ringSize={36}
          >
            {children}
          </CustomCursor>
        </PWAProvider>
        <ToastContainer position="bottom-right" />
      </I18nProvider>
    </QueryClientProvider>
  );
}
