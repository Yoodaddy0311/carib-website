'use client';

/**
 * Notification Bell Button
 *
 * Header button that shows unread notification count.
 * Opens the NotificationPanel when clicked.
 */

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotificationBadge } from '@/hooks/useNotifications';
import { NotificationPanel } from './NotificationPanel';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { unreadCount, isLoading } = useNotificationBadge();

  return (
    <>
      <button
        onClick={() => setIsPanelOpen(true)}
        className={`relative p-2 rounded-lg hover:bg-[var(--color-gray-100)] transition-colors ${className}`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5 text-[var(--color-gray-600)]" />

        {/* Badge */}
        <AnimatePresence>
          {!isLoading && unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-[var(--color-primary-600)] rounded-full"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse animation for new notifications */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary-400)] opacity-75" />
          </span>
        )}
      </button>

      <NotificationPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
}
