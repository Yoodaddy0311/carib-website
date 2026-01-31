/**
 * Email Notification Functions
 *
 * Firestore triggers for automatic email notifications.
 * Uses SendGrid for email delivery.
 * Integrates with GCP Pub/Sub for scalable notification system.
 */

import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import {
  sendInquiryConfirmation,
  sendAdminNotification,
  EmailResult,
} from './services/emailService';
import {
  notifyNewInquiry,
  publishStatusChange,
  storeNotification,
} from './notifications/pubsub';
import { notifyAdminsNewInquiry } from './notifications/fcm';

/**
 * Inquiry document interface
 */
interface InquiryDocument {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  type: 'general' | 'support' | 'sales' | 'partnership' | 'coffee-chat';
  status: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  metadata?: {
    userAgent?: string;
    referrer?: string;
    page?: string;
  };
  emailSent?: boolean;
  emailSentAt?: admin.firestore.Timestamp;
  emailError?: string;
}

/**
 * Format timestamp to Korean date string
 */
function formatKoreanDate(timestamp: admin.firestore.Timestamp): string {
  const date = timestamp.toDate();
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Firestore trigger: Send confirmation email when new inquiry is created
 *
 * This function is automatically triggered when a new document is created
 * in the 'inquiries' collection.
 */
export const onInquiryCreated = onDocumentCreated(
  {
    document: 'inquiries/{inquiryId}',
    region: 'asia-northeast3', // Seoul region
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }

    const inquiryId = event.params.inquiryId;
    const data = snapshot.data() as InquiryDocument;

    console.log(`New inquiry created: ${inquiryId}`, {
      name: data.name,
      email: data.email,
      type: data.type,
      subject: data.subject,
    });

    // Skip if email already sent (in case of retry)
    if (data.emailSent) {
      console.log(`Email already sent for inquiry: ${inquiryId}`);
      return;
    }

    const createdAt = data.createdAt
      ? formatKoreanDate(data.createdAt)
      : new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    // Prepare email data
    const emailData = {
      inquiryId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      subject: data.subject,
      message: data.message,
      type: data.type,
      createdAt,
    };

    // Send both emails in parallel
    let customerResult: EmailResult;
    let adminResult: EmailResult;

    try {
      // Send emails in parallel
      [customerResult, adminResult] = await Promise.all([
        sendInquiryConfirmation(emailData),
        sendAdminNotification(emailData),
      ]);

      console.log('Email sending results:', {
        inquiryId,
        customerEmail: customerResult.success,
        adminEmail: adminResult.success,
      });

      // Publish to Pub/Sub and store Firestore notification for real-time dashboard
      try {
        const pubsubResult = await notifyNewInquiry(inquiryId, {
          type: data.type,
          name: data.name,
          email: data.email,
          company: data.company,
          subject: data.subject,
          message: data.message,
          source: data.metadata?.page || 'website',
        });
        console.log(`Pub/Sub message ID: ${pubsubResult.pubsubMessageId}`);
        console.log(`Firestore notification ID: ${pubsubResult.firestoreNotificationId}`);
      } catch (pubsubError) {
        console.error('Pub/Sub notification failed (non-critical):', pubsubError);
      }

      // Send FCM push notification to admin devices (optional)
      try {
        const fcmResult = await notifyAdminsNewInquiry({
          inquiryId,
          type: data.type,
          name: data.name,
          company: data.company,
        });
        console.log(`FCM notifications: ${fcmResult.success} success, ${fcmResult.failure} failed`);
      } catch (fcmError) {
        console.error('FCM notification failed (non-critical):', fcmError);
      }

      // Update document with email status
      const updateData: Partial<InquiryDocument> = {
        emailSent: customerResult.success && adminResult.success,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      };

      if (!customerResult.success || !adminResult.success) {
        const errors: string[] = [];
        if (!customerResult.success) errors.push(`Customer: ${customerResult.error}`);
        if (!adminResult.success) errors.push(`Admin: ${adminResult.error}`);
        updateData.emailError = errors.join('; ');
      }

      await snapshot.ref.update(updateData);

      console.log(`Inquiry ${inquiryId} email status updated`);
    } catch (error) {
      console.error(`Error sending emails for inquiry ${inquiryId}:`, error);

      // Update document with error status
      await snapshot.ref.update({
        emailSent: false,
        emailError: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * Firestore trigger: Handle inquiry status changes
 *
 * This function is automatically triggered when an inquiry document is updated.
 * Publishes status changes to Pub/Sub for real-time dashboard updates.
 */
export const onInquiryUpdated = onDocumentUpdated(
  {
    document: 'inquiries/{inquiryId}',
    region: 'asia-northeast3',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (event) => {
    const beforeData = event.data?.before?.data() as InquiryDocument | undefined;
    const afterData = event.data?.after?.data() as InquiryDocument | undefined;

    if (!beforeData || !afterData) {
      console.log('No data associated with the event');
      return;
    }

    const inquiryId = event.params.inquiryId;
    const previousStatus = beforeData.status;
    const newStatus = afterData.status;

    // Only process if status changed
    if (previousStatus === newStatus) {
      return;
    }

    console.log(`Inquiry ${inquiryId} status changed: ${previousStatus} -> ${newStatus}`);

    try {
      // Publish status change to Pub/Sub
      await publishStatusChange({
        inquiryId,
        previousStatus,
        newStatus,
        changedAt: new Date().toISOString(),
      });

      // Store notification in Firestore for dashboard real-time update
      await storeNotification({
        type: 'status_change',
        title: 'Inquiry Status Updated',
        body: `Inquiry from ${afterData.name || 'Unknown'} changed from ${formatStatus(previousStatus)} to ${formatStatus(newStatus)}`,
        data: {
          inquiryId,
          previousStatus,
          newStatus,
          name: afterData.name,
        },
        priority: 'normal',
      });

      console.log(`Status change notification sent for inquiry ${inquiryId}`);
    } catch (error) {
      console.error(`Error processing status change for ${inquiryId}:`, error);
    }
  }
);

/**
 * Format status for display
 */
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    new: 'New',
    contacted: 'Contacted',
    scheduled: 'Scheduled',
    completed: 'Completed',
    archived: 'Archived',
  };
  return statusMap[status] || status;
}

/**
 * HTTP trigger: Manually resend confirmation email
 *
 * Useful for cases where the automatic email failed or wasn't sent.
 */
export const resendInquiryEmail = onRequest(
  {
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    // Only allow POST
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    // Verify admin authentication
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

    const { inquiryId } = req.body;
    if (!inquiryId) {
      res.status(400).json({ success: false, error: 'inquiryId is required' });
      return;
    }

    try {
      const db = admin.firestore();
      const docRef = db.collection('inquiries').doc(inquiryId);
      const doc = await docRef.get();

      if (!doc.exists) {
        res.status(404).json({ success: false, error: 'Inquiry not found' });
        return;
      }

      const data = doc.data() as InquiryDocument;
      const createdAt = data.createdAt
        ? formatKoreanDate(data.createdAt)
        : new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

      const emailData = {
        inquiryId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        subject: data.subject,
        message: data.message,
        type: data.type,
        createdAt,
      };

      const [customerResult, adminResult] = await Promise.all([
        sendInquiryConfirmation(emailData),
        sendAdminNotification(emailData),
      ]);

      // Update document
      await docRef.update({
        emailSent: customerResult.success && adminResult.success,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        emailError: (!customerResult.success || !adminResult.success)
          ? `Customer: ${customerResult.error || 'OK'}, Admin: ${adminResult.error || 'OK'}`
          : null,
      });

      res.status(200).json({
        success: true,
        results: {
          customer: customerResult,
          admin: adminResult,
        },
      });
    } catch (error) {
      console.error('Error resending email:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * HTTP trigger: Test email configuration
 *
 * Sends a test email to verify SendGrid setup.
 * Admin only.
 */
export const testEmailConfig = onRequest(
  {
    cors: true,
    maxInstances: 5,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    // Verify admin authentication
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

    const { testEmail } = req.body;
    if (!testEmail) {
      res.status(400).json({ success: false, error: 'testEmail is required' });
      return;
    }

    try {
      const testData = {
        inquiryId: 'TEST-' + Date.now(),
        name: 'Test User',
        email: testEmail,
        subject: '이메일 설정 테스트',
        message: '이것은 SendGrid 이메일 설정을 테스트하기 위한 메시지입니다.',
        type: 'general' as const,
        createdAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      };

      const result = await sendInquiryConfirmation(testData);

      res.status(200).json({
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      });
    } catch (error) {
      console.error('Error testing email:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);
