'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { GA_MEASUREMENT_ID, trackPageView, isAnalyticsEnabled } from '@/lib/analytics';

/**
 * Component to handle page view tracking on route changes
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAnalyticsEnabled()) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Google Analytics 4 Script Component
 * Loads the GA4 gtag.js script and handles automatic page view tracking
 *
 * Only loads when:
 * - Running in production environment, OR
 * - GA_MEASUREMENT_ID environment variable is set
 *
 * @example
 * ```tsx
 * // In your layout.tsx
 * <GoogleAnalytics />
 * ```
 */
export function GoogleAnalytics() {
  // Don't render anything if analytics is disabled or no measurement ID
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/* Google Analytics 4 Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            send_page_view: true
          });
        `}
      </Script>

      {/* Page View Tracker - wrapped in Suspense for searchParams */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

export default GoogleAnalytics;
