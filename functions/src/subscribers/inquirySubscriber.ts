/**
 * Pub/Sub Subscriber for Inquiry Notifications
 *
 * Handles messages published to the new-inquiry-topic.
 * Can be used for additional processing or external integrations.
 */

import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import * as admin from 'firebase-admin';
import { TOPICS, NewInquiryMessage, StatusChangedMessage } from '../notifications/pubsub';

/**
 * Subscribe to new inquiry topic
 * Processes new inquiry notifications for additional handling
 */
export const processNewInquiry = onMessagePublished(
  {
    topic: TOPICS.NEW_INQUIRY,
    region: 'asia-northeast3',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    console.log('Received message from new-inquiry-topic');

    const message = event.data.message;

    // Parse the message data
    let inquiryData: NewInquiryMessage;
    try {
      const dataString = message.data
        ? Buffer.from(message.data, 'base64').toString()
        : '{}';
      inquiryData = JSON.parse(dataString) as NewInquiryMessage;
    } catch (error) {
      console.error('Failed to parse message data:', error);
      return;
    }

    console.log('Inquiry data:', JSON.stringify(inquiryData));

    const db = admin.firestore();

    try {
      // Log the Pub/Sub message processing
      await db.collection('pubsub_logs').add({
        topic: TOPICS.NEW_INQUIRY,
        messageId: message.messageId,
        data: inquiryData,
        attributes: message.attributes,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'processed',
      });

      // Additional processing can be added here:
      // - Analytics tracking
      // - External CRM integration
      // - Webhook calls to other services
      // - Custom business logic

      // Example: Track inquiry analytics
      const today = new Date().toISOString().split('T')[0];
      const analyticsRef = db.collection('analytics').doc(`daily-${today}`);

      await db.runTransaction(async (transaction) => {
        const analyticsDoc = await transaction.get(analyticsRef);

        if (analyticsDoc.exists) {
          transaction.update(analyticsRef, {
            totalInquiries: admin.firestore.FieldValue.increment(1),
            [`inquiriesByType.${inquiryData.type}`]: admin.firestore.FieldValue.increment(1),
            lastInquiryAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          transaction.set(analyticsRef, {
            date: today,
            totalInquiries: 1,
            inquiriesByType: {
              [inquiryData.type]: 1,
            },
            lastInquiryAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      });

      console.log(`Processed new inquiry: ${inquiryData.inquiryId}`);
    } catch (error) {
      console.error('Error processing new inquiry message:', error);

      // Log the error
      await db.collection('pubsub_logs').add({
        topic: TOPICS.NEW_INQUIRY,
        messageId: message.messageId,
        data: inquiryData,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error; // Retry the message
    }
  }
);

/**
 * Subscribe to inquiry status change topic
 * Handles status change notifications
 */
export const processStatusChange = onMessagePublished(
  {
    topic: TOPICS.INQUIRY_STATUS_CHANGED,
    region: 'asia-northeast3',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (event) => {
    console.log('Received message from inquiry-status-changed-topic');

    const message = event.data.message;

    // Parse the message data
    let statusData: StatusChangedMessage;
    try {
      const dataString = message.data
        ? Buffer.from(message.data, 'base64').toString()
        : '{}';
      statusData = JSON.parse(dataString) as StatusChangedMessage;
    } catch (error) {
      console.error('Failed to parse message data:', error);
      return;
    }

    console.log('Status change data:', JSON.stringify(statusData));

    const db = admin.firestore();

    try {
      // Log the status change
      await db.collection('pubsub_logs').add({
        topic: TOPICS.INQUIRY_STATUS_CHANGED,
        messageId: message.messageId,
        data: statusData,
        attributes: message.attributes,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'processed',
      });

      // Track status change in analytics
      const today = new Date().toISOString().split('T')[0];
      const analyticsRef = db.collection('analytics').doc(`daily-${today}`);

      await analyticsRef.set(
        {
          statusChanges: admin.firestore.FieldValue.increment(1),
          [`statusTransitions.${statusData.previousStatus}_to_${statusData.newStatus}`]:
            admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );

      // If status changed to 'completed', track conversion
      if (statusData.newStatus === 'completed') {
        await analyticsRef.set(
          {
            conversions: admin.firestore.FieldValue.increment(1),
          },
          { merge: true }
        );
      }

      console.log(`Processed status change for inquiry: ${statusData.inquiryId}`);
    } catch (error) {
      console.error('Error processing status change message:', error);
      throw error;
    }
  }
);
