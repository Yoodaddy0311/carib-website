import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout';
import { Footer } from '@/components/layout';
import { GoogleAnalytics } from '@/components/analytics';
import { StructuredData } from '@/components/StructuredData';

// Viewport 설정 분리 (Next.js 14+ 권장)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://carib.team'),
  title: {
    default: 'Carib - AI 업무 자동화 전문가 그룹',
    template: '%s | Carib',
  },
  description:
    '반복되는 업무는 AI에게, 창의적인 일은 사람에게. Carib은 AI 업무 자동화 전문 FDE 팀입니다.',
  keywords: [
    'AI',
    '업무 자동화',
    'AI 컨설팅',
    'FDE',
    '디지털 트랜스포메이션',
    'AI 에이전시',
    'AI 자동화',
    '업무 효율화',
  ],
  authors: [{ name: 'Carib Team', url: 'https://carib.team' }],
  creator: 'Carib Team',
  publisher: 'Carib',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://carib.team',
    siteName: 'Carib',
    title: 'Carib - AI 업무 자동화 전문가 그룹',
    description: '반복되는 업무는 AI에게, 창의적인 일은 사람에게.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Carib - AI 업무 자동화 전문가 그룹',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carib - AI 업무 자동화 전문가 그룹',
    description: '반복되는 업무는 AI에게, 창의적인 일은 사람에게.',
    images: [
      {
        url: '/twitter-image',
        width: 1200,
        height: 630,
        alt: 'Carib - AI 업무 자동화 전문가 그룹',
      },
    ],
    creator: '@carib_team',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Script to prevent flash on initial load
const themeScript = `
  (function() {
    try {
      const savedTheme = localStorage.getItem('carib-theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (savedTheme === 'dark' || (savedTheme === 'system' && systemDark) || (!savedTheme && systemDark)) {
        document.documentElement.classList.add('dark');
      } else if (savedTheme === 'light') {
        document.documentElement.classList.add('light');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical domains for faster resource loading */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://api.dicebear.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />

        {/* Pretendard Font - optimized loading with font-display: swap */}
        <link
          rel="preload"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />

        {/* Preload critical font weights for LCP optimization */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/woff2/PretendardVariable.woff2"
          crossOrigin="anonymous"
        />

        {/* Theme initialization script to prevent flash - inlined for performance */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        {/* PWA Manifest & Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Carib" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Carib" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />

        {/* Apple Splash Screens - iPhone Pro Max / iPhone Pro / iPhone */}
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
          href="/splash/splash-1290x2796.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
          href="/splash/splash-1179x2556.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
          href="/splash/splash-1170x2532.png"
        />

        {/* Structured Data for SEO */}
        <StructuredData />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <GoogleAnalytics />
        <Providers>
          <Header />
          <main id="main-content" className="flex-1" role="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
