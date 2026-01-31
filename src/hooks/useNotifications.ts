'use client';

/**
 * Real-time Admin Notifications Hook
 *
 * Uses Firestore real-time subscription for live notification updates.
 * Provides notification management functions for the Admin Dashboard.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Notification types
export interface AdminNotification {
  id: string;
  type: 'new_inquiry' | 'status_change' | 'urgent' | 'system' | 'reminder';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  priority: 'low' | 'normal' | 'high';
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

interface UseNotificationsOptions {
  limit?: number;
  unreadOnly?: boolean;
  enabled?: boolean;
}

interface UseNotificationsReturn {
  notifications: AdminNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => void;
}

/**
 * Parse Firestore document to AdminNotification
 */
function parseNotificationDoc(doc: QueryDocumentSnapshot<DocumentData>): AdminNotification {
  const data = doc.data();
  return {
    id: doc.id,
    type: data.type || 'system',
    title: data.title || '',
    body: data.body || '',
    data: data.data,
    priority: data.priority || 'normal',
    read: data.read || false,
    readAt: data.readAt?.toDate?.(),
    createdAt: data.createdAt?.toDate?.() || new Date(),
  };
}

/**
 * Hook for real-time admin notifications
 *
 * @param options - Configuration options
 * @returns Notifications state and management functions
 *
 * @example
 * ```tsx
 * const { notifications, unreadCount, markAsRead } = useNotifications({
 *   limit: 20,
 *   unreadOnly: false,
 * });
 * ```
 */
export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { limit: queryLimit = 20, unreadOnly = false, enabled = true } = options;

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Subscribe to notifications
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Build query for notifications
    let notificationsQuery = query(
      collection(db, 'admin_notifications'),
      orderBy('createdAt', 'desc'),
      limit(queryLimit)
    );

    if (unreadOnly) {
      notificationsQuery = query(
        collection(db, 'admin_notifications'),
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(queryLimit)
      );
    }

    // Subscribe to notifications
    const unsubscribeNotifications = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationsList = snapshot.docs.map(parseNotificationDoc);
        setNotifications(notificationsList);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error subscribing to notifications:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    // Subscribe to unread count (separate query for accurate count)
    const unreadQuery = query(
      collection(db, 'admin_notifications'),
      where('read', '==', false)
    );

    const unsubscribeUnread = onSnapshot(
      unreadQuery,
      (snapshot) => {
        setUnreadCount(snapshot.size);
      },
      (err) => {
        console.error('Error subscribing to unread count:', err);
      }
    );

    return () => {
      unsubscribeNotifications();
      unsubscribeUnread();
    };
  }, [queryLimit, unreadOnly, enabled, refreshTrigger]);

  // Mark a single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'admin_notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadQuery = query(
        collection(db, 'admin_notifications'),
        where('read', '==', false)
      );

      const snapshot = await getDocs(unreadQuery);

      if (snapshot.empty) return;

      const batch = writeBatch(db);

      snapshot.docs.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, {
          read: true,
          readAt: Timestamp.now(),
        });
      });

      await batch.commit();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, []);

  // Refresh function
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}

/**
 * Hook for notification badge (minimal version for header)
 * Only subscribes to unread count for performance
 */
export function useNotificationBadge(enabled = true): {
  unreadCount: number;
  isLoading: boolean;
} {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const unreadQuery = query(
      collection(db, 'admin_notifications'),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(
      unreadQuery,
      (snapshot) => {
        setUnreadCount(snapshot.size);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error subscribing to notification badge:', err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [enabled]);

  return { unreadCount, isLoading };
}
