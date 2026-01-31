'use client';

/**
 * Admin Notification Panel
 *
 * Real-time notification panel for the Admin Dashboard.
 * Shows live updates when new inquiries arrive.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useNotifications, AdminNotification } from '@/hooks/useNotifications';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const notificationTypeConfig: Record<
  AdminNotification['type'],
  {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }
> = {
  new_inquiry: {
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'text-[var(--color-primary-600)]',
    bgColor: 'bg-[var(--color-primary-100)]',
  },
  status_change: {
    icon: <RefreshCw className="w-4 h-4" />,
    color: 'text-[var(--color-accent-600)]',
    bgColor: 'bg-[var(--color-accent-100)]',
  },
  urgent: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'text-[var(--color-error)]',
    bgColor: 'bg-red-100',
  },
  system: {
    icon: <Clock className="w-4 h-4" />,
    color: 'text-[var(--color-gray-600)]',
    bgColor: 'bg-[var(--color-gray-100)]',
  },
  reminder: {
    icon: <Bell className="w-4 h-4" />,
    color: 'text-[var(--color-warning)]',
    bgColor: 'bg-amber-100',
  },
};

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications({
    limit: 30,
    enabled: isOpen,
  });

  const [markingAllRead, setMarkingAllRead] = useState(false);

  const handleMarkAllRead = async () => {
    setMarkingAllRead(true);
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleNotificationClick = async (notification: AdminNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const getNotificationLink = (notification: AdminNotification): string | null => {
    if (notification.type === 'new_inquiry' || notification.type === 'status_change') {
      const inquiryId = notification.data?.inquiryId as string;
      if (inquiryId) {
        return `/admin/inquiries?id=${inquiryId}`;
      }
    }
    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[var(--color-gray-900)] shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-gray-200)]">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-[var(--color-primary-100)] text-[var(--color-primary-700)] rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllRead}
                    disabled={markingAllRead}
                    className="text-xs"
                  >
                    <CheckCheck className="w-4 h-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--color-gray-100)] transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--color-gray-500)]" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-3 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)] rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-40 text-[var(--color-gray-500)]">
                  <AlertCircle className="w-10 h-10 mb-2 text-[var(--color-error)]" />
                  <p>Failed to load notifications</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-[var(--color-gray-500)]">
                  <Bell className="w-10 h-10 mb-2 text-[var(--color-gray-300)]" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-gray-100)]">
                  {notifications.map((notification) => {
                    const config = notificationTypeConfig[notification.type];
                    const link = getNotificationLink(notification);

                    const content = (
                      <div
                        className={`p-4 hover:bg-[var(--color-gray-50)] transition-colors cursor-pointer ${
                          !notification.read ? 'bg-[var(--color-primary-50)]/30' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor} ${config.color}`}
                          >
                            {config.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-sm text-[var(--foreground)]">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-[var(--color-primary-500)] rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-[var(--color-gray-600)] mt-0.5 line-clamp-2">
                              {notification.body}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-[var(--color-gray-400)]">
                                {formatDistanceToNow(notification.createdAt, {
                                  addSuffix: true,
                                  locale: ko,
                                })}
                              </span>
                              {link && (
                                <ExternalLink className="w-3 h-3 text-[var(--color-gray-400)]" />
                              )}
                            </div>
                          </div>

                          {/* Mark as read button */}
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-[var(--color-gray-100)] transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 text-[var(--color-gray-400)]" />
                            </button>
                          )}
                        </div>
                      </div>
                    );

                    if (link) {
                      return (
                        <Link key={notification.id} href={link} onClick={onClose}>
                          {content}
                        </Link>
                      );
                    }

                    return <div key={notification.id}>{content}</div>;
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--color-gray-200)]">
              <Link href="/admin/inquiries" onClick={onClose}>
                <Button variant="outline" fullWidth>
                  View All Inquiries
                </Button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
