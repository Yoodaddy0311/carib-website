/**
 * GCP Pub/Sub Notification System
 *
 * Handles publishing messages to Pub/Sub topics for inquiry notifications.
 * Replaces Slack webhook with GCP-native Pub/Sub messaging.
 */

import { PubSub, Topic } from '@google-cloud/pubsub';
import * as admin from 'firebase-admin';

// Pub/Sub client (automatically uses application default credentials)
const pubsub = new PubSub();

// Topic names
export const TOPICS = {
  NEW_INQUIRY: 'new-inquiry-topic',
  INQUIRY_STATUS_CHANGED: 'inquiry-status-changed-topic',
  ADMIN_NOTIFICATION: 'admin-notification-topic',
} as const;

// Message interfaces
export interface NewInquiryMessage {
  inquiryId: string;
  type: 'coffee-chat' | 'project' | 'general' | 'support' | 'sales' | 'partnership';
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  createdAt: string;
  source?: string;
}

export interface StatusChangedMessage {
  inquiryId: string;
  previousStatus: string;
  newStatus: string;
  changedBy?: string;
  changedAt: string;
}

export interface AdminNotificationMessage {
  type: 'new_inquiry' | 'urgent' | 'system' | 'reminder';
  title: string;
  body: string;
  data?: Record<string, string>;
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
}

/**
 * Get or create a Pub/Sub topic
 */
async function getOrCreateTopic(topicName: string): Promise<Topic> {
  const topic = pubsub.topic(topicName);

  try {
    const [exists] = await topic.exists();
    if (!exists) {
      console.log(`Creating topic: ${topicName}`);
      await pubsub.createTopic(topicName);
    }
  } catch (error) {
    // Topic might already exist (race condition) or we lack permissions
    console.warn(`Topic check/create warning for ${topicName}:`, error);
  }

  return topic;
}

/**
 * Publish a message to a Pub/Sub topic
 */
async function publishMessage<T extends object>(
  topicName: string,
  message: T,
  attributes?: Record<string, string>
): Promise<string> {
  const topic = await getOrCreateTopic(topicName);

  const messageBuffer = Buffer.from(JSON.stringify(message));

  try {
    const messageId = await topic.publishMessage({
      data: messageBuffer,
      attributes: {
        ...attributes,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`Published message ${messageId} to topic ${topicName}`);
    return messageId;
  } catch (error) {
    console.error(`Failed to publish to ${topicName}:`, error);
    throw error;
  }
}

/**
 * Publish new inquiry notification to Pub/Sub
 */
export async function publishNewInquiry(inquiry: NewInquiryMessage): Promise<string> {
  return publishMessage(TOPICS.NEW_INQUIRY, inquiry, {
    type: 'new_inquiry',
    inquiryType: inquiry.type,
  });
}

/**
 * Publish inquiry status change notification
 */
export async function publishStatusChange(change: StatusChangedMessage): Promise<string> {
  return publishMessage(TOPICS.INQUIRY_STATUS_CHANGED, change, {
    type: 'status_change',
    newStatus: change.newStatus,
  });
}

/**
 * Publish admin notification
 */
export async function publishAdminNotification(notification: AdminNotificationMessage): Promise<string> {
  return publishMessage(TOPICS.ADMIN_NOTIFICATION, notification, {
    type: notification.type,
    priority: notification.priority,
  });
}

/**
 * Store notification in Firestore for real-time dashboard updates
 */
export async function storeNotification(notification: {
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  priority?: string;
  read?: boolean;
}): Promise<string> {
  const db = admin.firestore();

  const notificationDoc = await db.collection('admin_notifications').add({
    ...notification,
    read: notification.read ?? false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Stored notification: ${notificationDoc.id}`);
  return notificationDoc.id;
}

/**
 * Create a notification for new inquiry and publish to all channels
 */
export async function notifyNewInquiry(
  inquiryId: string,
  inquiryData: {
    type: string;
    name: string;
    email: string;
    company?: string;
    subject?: string;
    message?: string;
    source?: string;
  }
): Promise<{
  pubsubMessageId: string;
  firestoreNotificationId: string;
}> {
  const createdAt = new Date().toISOString();

  // Publish to Pub/Sub
  const pubsubMessageId = await publishNewInquiry({
    inquiryId,
    type: inquiryData.type as NewInquiryMessage['type'],
    name: inquiryData.name,
    email: inquiryData.email,
    company: inquiryData.company,
    subject: inquiryData.subject || `New ${inquiryData.type} inquiry`,
    message: inquiryData.message || '',
    createdAt,
    source: inquiryData.source,
  });

  // Store in Firestore for real-time updates
  const firestoreNotificationId = await storeNotification({
    type: 'new_inquiry',
    title: `New ${formatInquiryType(inquiryData.type)} Inquiry`,
    body: `${inquiryData.name}${inquiryData.company ? ` from ${inquiryData.company}` : ''} submitted a new inquiry.`,
    data: {
      inquiryId,
      inquiryType: inquiryData.type,
      name: inquiryData.name,
      email: inquiryData.email,
    },
    priority: inquiryData.type === 'coffee-chat' ? 'high' : 'normal',
    read: false,
  });

  return { pubsubMessageId, firestoreNotificationId };
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
