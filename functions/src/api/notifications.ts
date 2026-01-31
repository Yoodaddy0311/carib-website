/**
 * Admin Notification API
 *
 * HTTP endpoints for managing admin notifications.
 * Used by the Admin Dashboard for real-time notification display.
 */

import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { registerDeviceToken } from '../notifications/fcm';

/**
 * Get notifications for admin dashboard
 * Supports pagination and filtering
 */
export const getNotifications = onRequest(
  {
    cors: true,
    maxInstances: 20,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    // Only allow GET requests
    if (req.method !== 'GET') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    try {
      const token = authHeader.split('Bearer ')[1];
      await admin.auth().verifyIdToken(token);
    } catch {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }

    try {
      const db = admin.firestore();

      // Parse query parameters
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const unreadOnly = req.query.unread === 'true';
      const type = req.query.type as string;
      const lastId = req.query.lastId as string;

      // Build query
      let query: FirebaseFirestore.Query = db
        .collection('admin_notifications')
        .orderBy('createdAt', 'desc');

      if (unreadOnly) {
        query = query.where('read', '==', false);
      }

      if (type) {
        query = query.where('type', '==', type);
      }

      // Pagination with cursor
      if (lastId) {
        const lastDoc = await db.collection('admin_notifications').doc(lastId).get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      query = query.limit(limit + 1); // Fetch one extra to check if there are more

      const snapshot = await query.get();
      const notifications = snapshot.docs.slice(0, limit).map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
      }));

      // Get unread count
      const unreadSnapshot = await db
        .collection('admin_notifications')
        .where('read', '==', false)
        .count()
        .get();

      res.status(200).json({
        success: true,
        notifications,
        hasMore: snapshot.docs.length > limit,
        unreadCount: unreadSnapshot.data().count,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * Mark a notification as read
 */
export const markNotificationRead = onRequest(
  {
    cors: true,
    maxInstances: 20,
    timeoutSeconds: 10,
    memory: '128MiB',
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    try {
      const token = authHeader.split('Bearer ')[1];
      await admin.auth().verifyIdToken(token);
    } catch {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }

    const { notificationId } = req.body;
    if (!notificationId) {
      res.status(400).json({ success: false, error: 'notificationId is required' });
      return;
    }

    try {
      const db = admin.firestore();
      const docRef = db.collection('admin_notifications').doc(notificationId);

      const doc = await docRef.get();
      if (!doc.exists) {
        res.status(404).json({ success: false, error: 'Notification not found' });
        return;
      }

      await docRef.update({
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = onRequest(
  {
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    try {
      const token = authHeader.split('Bearer ')[1];
      await admin.auth().verifyIdToken(token);
    } catch {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }

    try {
      const db = admin.firestore();

      // Get all unread notifications
      const unreadSnapshot = await db
        .collection('admin_notifications')
        .where('read', '==', false)
        .get();

      if (unreadSnapshot.empty) {
        res.status(200).json({ success: true, updatedCount: 0 });
        return;
      }

      // Batch update (max 500 per batch)
      const batches: FirebaseFirestore.WriteBatch[] = [];
      let currentBatch = db.batch();
      let operationCount = 0;

      for (const doc of unreadSnapshot.docs) {
        currentBatch.update(doc.ref, {
          read: true,
          readAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        operationCount++;

        if (operationCount === 500) {
          batches.push(currentBatch);
          currentBatch = db.batch();
          operationCount = 0;
        }
      }

      if (operationCount > 0) {
        batches.push(currentBatch);
      }

      // Commit all batches
      await Promise.all(batches.map((batch) => batch.commit()));

      res.status(200).json({
        success: true,
        updatedCount: unreadSnapshot.size,
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * Register FCM token for push notifications
 */
export const registerFcmToken = onRequest(
  {
    cors: true,
    maxInstances: 20,
    timeoutSeconds: 10,
    memory: '128MiB',
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    let userId: string;
    try {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      userId = decodedToken.uid;
    } catch {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }

    const { fcmToken, platform } = req.body;
    if (!fcmToken) {
      res.status(400).json({ success: false, error: 'fcmToken is required' });
      return;
    }

    const validPlatforms = ['web', 'ios', 'android'];
    const devicePlatform = validPlatforms.includes(platform) ? platform : 'web';

    try {
      const success = await registerDeviceToken(userId, fcmToken, devicePlatform);

      res.status(200).json({ success });
    } catch (error) {
      console.error('Error registering FCM token:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);
