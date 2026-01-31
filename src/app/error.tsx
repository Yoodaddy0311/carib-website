'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error('Global Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-gray-50)] to-white dark:from-[var(--background)] dark:to-[var(--background)]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto text-center"
        >
          {/* Error Icon with Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative inline-flex">
              <motion.div
                className="absolute inset-0 bg-[var(--color-accent-200)] rounded-full opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.3, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <div className="relative w-24 h-24 bg-[var(--color-accent-100)] rounded-full flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-[var(--color-accent-600)]" />
              </div>
            </div>
          </motion.div>

          {/* Error Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-display-3 md:text-display-2 font-bold text-[var(--foreground)] mb-4"
          >
            문제가 발생했습니다
          </motion.h1>

          {/* Error Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-body-1 text-[var(--color-gray-600)] mb-8"
          >
            페이지를 불러오는 중 오류가 발생했습니다.
            <br />
            잠시 후 다시 시도해 주세요.
          </motion.p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8 p-4 bg-[var(--color-gray-100)] rounded-xl text-left"
            >
              <p className="text-caption font-mono text-[var(--color-gray-700)] break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-small font-mono text-[var(--color-gray-500)] mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={reset}
              leftIcon={<RefreshCw className="w-5 h-5" />}
            >
              다시 시도
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Home className="w-5 h-5" />}
              >
                홈으로 돌아가기
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
