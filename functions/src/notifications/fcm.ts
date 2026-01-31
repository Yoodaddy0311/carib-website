/**
 * Firebase Cloud Messaging (FCM) Push Notification Service
 *
 * Handles sending push notifications to admin devices.
 * Optional feature that can be enabled for real-time mobile notifications.
 */

import * as admin from 'firebase-admin';

// FCM configuration
const FCM_ENABLED = process.env.FCM_ENABLED === 'true';

// Notification interfaces
export interface PushNotificationData {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  priority?: 'normal' | 'high';
  clickAction?: string;
}

export interface AdminDeviceToken {
  token: string;
  userId: string;
  platform: 'web' | 'ios' | 'android';
  createdAt: FirebaseFirestore.Timestamp;
  lastUsedAt: FirebaseFirestore.Timestamp;
}

/**
 * Send push notification to a specific device token
 */
export async function sendPushNotification(
  token: string,
  notification: PushNotificationData
): Promise<string | null> {
  if (!FCM_ENABLED) {
    console.log('FCM disabled, skipping push notification');
    return null;
  }

  try {
    const message: admin.messaging.Message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: notification.data,
      android: {
        priority: notification.priority === 'high' ? 'high' : 'normal',
        notification: {
          clickAction: notification.clickAction || 'FLUTTER_NOTIFICATION_CLICK',
          channelId: 'carib_admin_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.body,
            },
            badge: 1,
            sound: 'default',
          },
        },
      },
      webpush: {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: '/images/logo-192.png',
          badge: '/images/badge-72.png',
        },
        fcmOptions: {
          link: notification.clickAction || '/admin',
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log(`Push notification sent: ${response}`);
    return response;
  } catch (error) {
    console.error('Failed to send push notification:', error);

    // Handle invalid tokens
    if (error instanceof Error && error.message.includes('not-registered')) {
      await removeInvalidToken(token);
    }

    return null;
  }
}

/**
 * Send push notification to all admin devices
 */
export async function sendPushToAllAdmins(notification: PushNotificationData): Promise<{
  success: number;
  failure: number;
}> {
  if (!FCM_ENABLED) {
    console.log('FCM disabled, skipping push notifications to admins');
    return { success: 0, failure: 0 };
  }

  const db = admin.firestore();
  const result = { success: 0, failure: 0 };

  try {
    // Get all admin device tokens
    const tokensSnapshot = await db
      .collection('admin_device_tokens')
      .where('active', '==', true)
      .get();

    if (tokensSnapshot.empty) {
      console.log('No admin device tokens found');
      return result;
    }

    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token as string);

    // Send to multiple devices
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: notification.data,
      android: {
        priority: notification.priority === 'high' ? 'high' : 'normal',
        notification: {
          channelId: 'carib_admin_notifications',
        },
      },
      webpush: {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: '/images/logo-192.png',
        },
        fcmOptions: {
          link: notification.clickAction || '/admin',
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    result.success = response.successCount;
    result.failure = response.failureCount;

    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });

      // Remove invalid tokens
      for (const token of failedTokens) {
        await removeInvalidToken(token);
      }
    }

    console.log(`Push notifications sent: ${result.success} success, ${result.failure} failed`);
    return result;
  } catch (error) {
    console.error('Failed to send push notifications to admins:', error);
    return result;
  }
}

/**
 * Register a device token for an admin user
 */
export async function registerDeviceToken(
  userId: string,
  token: string,
  platform: 'web' | 'ios' | 'android'
): Promise<boolean> {
  const db = admin.firestore();

  try {
    // Check if token already exists
    const existingToken = await db
      .collection('admin_device_tokens')
      .where('token', '==', token)
      .get();

    if (!existingToken.empty) {
      // Update last used timestamp
      const docRef = existingToken.docs[0].ref;
      await docRef.update({
        lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true,
      });
      console.log(`Device token updated for user ${userId}`);
    } else {
      // Add new token
      await db.collection('admin_device_tokens').add({
        token,
        userId,
        platform,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Device token registered for user ${userId}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to register device token:', error);
    return false;
  }
}

/**
 * Remove an invalid or expired device token
 */
async function removeInvalidToken(token: string): Promise<void> {
  const db = admin.firestore();

  try {
    const tokenQuery = await db
      .collection('admin_device_tokens')
      .where('token', '==', token)
      .get();

    const batch = db.batch();
    tokenQuery.docs.forEach((doc) => {
      batch.update(doc.ref, { active: false });
    });
    await batch.commit();

    console.log(`Deactivated invalid token: ${token.substring(0, 20)}...`);
  } catch (error) {
    console.error('Failed to remove invalid token:', error);
  }
}

/**
 * Send new inquiry notification via FCM
 */
export async function notifyAdminsNewInquiry(inquiryData: {
  inquiryId: string;
  type: string;
  name: string;
  company?: string;
}): Promise<{ success: number; failure: number }> {
  const notification: PushNotificationData = {
    title: `New ${formatInquiryType(inquiryData.type)} Inquiry`,
    body: `${inquiryData.name}${inquiryData.company ? ` from ${inquiryData.company}` : ''} submitted a new inquiry.`,
    data: {
      type: 'new_inquiry',
      inquiryId: inquiryData.inquiryId,
      inquiryType: inquiryData.type,
    },
    priority: inquiryData.type === 'coffee-chat' ? 'high' : 'normal',
    clickAction: `/admin/inquiries/${inquiryData.inquiryId}`,
  };

  return sendPushToAllAdmins(notification);
}

/**
 * Format inquiry type for display
 */
function formatInquiryType(type: string): string {
  const typeMap: Record<string, string> = {
    'coffee-chat': 'Coffee Chat',
    'project': 'Project',
    'general': 'General',
    'support': 'Support',
    'sales': 'Sales',
    'partnership': 'Partnership',
  };
  return typeMap[type] || type;
}
