'use client';

import { motion } from 'motion/react';
import { Search, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-primary-50)] via-white to-[var(--color-gray-50)] dark:from-[#0d1117] dark:via-[var(--background)] dark:to-[#0d1117]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto text-center"
        >
          {/* Animated 404 Illustration */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative inline-flex items-center justify-center">
              {/* Background circles */}
              <motion.div
                className="absolute w-48 h-48 bg-[var(--color-primary-100)] rounded-full opacity-50"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.3, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute w-36 h-36 bg-[var(--color-primary-200)] rounded-full opacity-60"
                animate={{
                  scale: [1.1, 1, 1.1],
                  opacity: [0.6, 0.4, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              />

              {/* 404 Number */}
              <div className="relative flex items-center justify-center">
                <motion.span
                  className="text-[8rem] md:text-[10rem] font-bold text-[var(--color-primary-600)] leading-none select-none"
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  4
                </motion.span>
                <motion.div
                  className="relative mx-2"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Search className="w-20 h-20 md:w-24 md:h-24 text-[var(--color-primary-500)]" />
                </motion.div>
                <motion.span
                  className="text-[8rem] md:text-[10rem] font-bold text-[var(--color-primary-600)] leading-none select-none"
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.3,
                  }}
                >
                  4
                </motion.span>
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
            페이지를 찾을 수 없습니다
          </motion.h1>

          {/* Error Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-body-1 text-[var(--color-gray-600)] mb-8"
          >
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
            <br />
            URL을 확인하시거나 아래 버튼을 이용해 주세요.
          </motion.p>

          {/* Search Suggestion */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8 p-6 bg-white dark:bg-[var(--color-gray-100)] rounded-2xl shadow-md border border-[var(--color-gray-100)] dark:border-[var(--color-gray-200)]"
          >
            <p className="text-caption text-[var(--color-gray-500)] mb-3">
              찾으시는 내용이 있으신가요?
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/#services">
                <span className="inline-flex px-3 py-1.5 bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-200)] dark:hover:bg-[var(--color-gray-300)] text-[var(--color-gray-700)] dark:text-[var(--color-gray-800)] rounded-full text-caption transition-colors cursor-pointer">
                  서비스 소개
                </span>
              </Link>
              <Link href="/threads">
                <span className="inline-flex px-3 py-1.5 bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-200)] dark:hover:bg-[var(--color-gray-300)] text-[var(--color-gray-700)] dark:text-[var(--color-gray-800)] rounded-full text-caption transition-colors cursor-pointer">
                  AI 인사이트
                </span>
              </Link>
              <Link href="/coffee-chat">
                <span className="inline-flex px-3 py-1.5 bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-200)] dark:hover:bg-[var(--color-gray-300)] text-[var(--color-gray-700)] dark:text-[var(--color-gray-800)] rounded-full text-caption transition-colors cursor-pointer">
                  커피챗 예약
                </span>
              </Link>
              <Link href="/#faq">
                <span className="inline-flex px-3 py-1.5 bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-200)] dark:hover:bg-[var(--color-gray-300)] text-[var(--color-gray-700)] dark:text-[var(--color-gray-800)] rounded-full text-caption transition-colors cursor-pointer">
                  자주 묻는 질문
                </span>
              </Link>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Home className="w-5 h-5" />}
              onClick={() => router.push('/')}
            >
              홈으로 돌아가기
            </Button>
            <Button
              variant="outline"
              size="lg"
              leftIcon={<ArrowLeft className="w-5 h-5" />}
              onClick={() => router.back()}
            >
              이전 페이지로
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
