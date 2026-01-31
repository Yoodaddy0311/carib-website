import type { NextConfig } from 'next';

/**
 * Security Headers Configuration
 *
 * Content Security Policy (CSP) and other security headers
 * to protect against XSS, clickjacking, and other attacks.
 */
const securityHeaders = [
  {
    // Content Security Policy - Strict policy to prevent XSS
    key: 'Content-Security-Policy',
    value: [
      // Default: only allow from same origin
      "default-src 'self'",
      // Scripts: self, inline (for Next.js), and specific trusted sources
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com",
      // Styles: self and inline (for styled-components/emotion)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      // Images: self, data URIs, and specific trusted sources
      "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://pbs.twimg.com https://avatars.githubusercontent.com https://images.unsplash.com https://www.google-analytics.com https://www.googletagmanager.com https://api.dicebear.com",
      // Fonts: self, Google Fonts, and jsDelivr CDN
      "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
      // Connect: API endpoints and Firebase
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.google.com https://*.google-analytics.com https://*.cloudfunctions.net wss://*.firebaseio.com https://api.dicebear.com",
      // Frames: self and specific trusted sources (for auth popups)
      "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com",
      // Objects: none (disable plugins)
      "object-src 'none'",
      // Base URI: self only
      "base-uri 'self'",
      // Form action: self only
      "form-action 'self'",
      // Frame ancestors: prevent clickjacking
      "frame-ancestors 'self'",
      // Block mixed content
      "block-all-mixed-content",
      // Upgrade insecure requests in production
      "upgrade-insecure-requests",
    ].join('; '),
  },
  {
    // X-Frame-Options - Prevent clickjacking (legacy, CSP frame-ancestors is preferred)
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    // X-Content-Type-Options - Prevent MIME type sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // X-XSS-Protection - Enable XSS filter (legacy, but still useful for older browsers)
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    // Referrer-Policy - Control referrer information
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Permissions-Policy - Restrict browser features
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', '),
  },
  {
    // Strict-Transport-Security - Force HTTPS (HSTS)
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,

  /**
   * Performance Optimizations
   */
  // Enable React strict mode for better development
  reactStrictMode: true,

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Experimental features for performance
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: [
      'lucide-react',
      'motion',
      'date-fns',
      '@tanstack/react-query',
      'recharts',
    ],
  },

  /**
   * Image Optimization
   */
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
    // Image formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  typescript: { ignoreBuildErrors: false },

  /**
   * Bundle Analyzer (enable in development for debugging)
   */
  // webpack: (config, { isServer }) => {
  //   if (process.env.ANALYZE === 'true') {
  //     const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  //     config.plugins.push(
  //       new BundleAnalyzerPlugin({
  //         analyzerMode: 'static',
  //         reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
  //       })
  //     );
  //   }
  //   return config;
  // },

  /**
   * Security Headers
   * Applied to all routes for comprehensive protection
   *
   * Note: For static export (output: 'export'), these headers
   * need to be configured at the hosting level (Firebase Hosting).
   * The headers below are for reference and server-side Next.js deployments.
   */
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Cache static assets aggressively
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache fonts
        source: '/:path*.woff2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
