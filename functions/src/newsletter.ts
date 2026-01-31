/**
 * Newsletter Subscription Cloud Functions (BE-007)
 *
 * Implements newsletter subscription system with:
 * - Double opt-in confirmation
 * - Subscription management
 * - Unsubscribe functionality
 * - SendGrid integration for newsletter campaigns
 */

import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import {
  sendSubscriptionConfirmation,
  sendUnsubscribeConfirmation,
  addToSendGridList,
  removeFromSendGridList,
} from './services/newsletterService';
import { getCorsConfig } from './middleware/cors';
import { rateLimit, RATE_LIMITS } from './middleware/rate-limiter';

/**
 * Subscriber interests enum
 */
type SubscriberInterest = 'automation' | 'ai' | 'data-analysis';

/**
 * Subscriber document interface
 */
interface SubscriberDocument {
  email: string;
  interests: SubscriberInterest[];
  status: 'pending' | 'active' | 'unsubscribed';
  confirmToken?: string;
  unsubscribeToken: string;
  subscribedAt: admin.firestore.Timestamp;
  confirmedAt?: admin.firestore.Timestamp;
  unsubscribedAt?: admin.firestore.Timestamp;
  sendGridContactId?: string;
  source?: string;
  metadata?: {
    userAgent?: string;
    referrer?: string;
    page?: string;
  };
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Subscription request validation schema
 */
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  interests: z.array(z.enum(['automation', 'ai', 'data-analysis'])).min(1, 'Select at least one interest'),
  source: z.string().optional(),
  metadata: z.object({
    userAgent: z.string().optional(),
    referrer: z.string().optional(),
    page: z.string().optional(),
  }).optional(),
});

/**
 * HTTP Function: Subscribe to newsletter
 *
 * Creates a new subscriber with pending status and sends confirmation email.
 * Implements double opt-in pattern.
 */
export const subscribe = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 20,
    timeoutSeconds: 30,
    memory: '256MiB',
    region: 'asia-northeast3',
  },
  async (req, res) => {
    // Only allow POST
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    // Rate limiting
    const clientIp = req.headers['x-forwarded-for'] as string || req.ip || 'unknown';
    const rateLimitResult = await rateLimit(clientIp, RATE_LIMITS.FORM_SUBMIT);
    if (!rateLimitResult.allowed) {
      res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: rateLimitResult.retryAfter,
      });
      return;
    }

    try {
      // Validate request body
      const validationResult = subscribeSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: validationResult.error.errors,
        });
        return;
      }

      const { email, interests, source, metadata } = validationResult.data;
      const normalizedEmail = email.toLowerCase().trim();

      const db = admin.firestore();

      // Check if subscriber already exists
      const existingQuery = await db
        .collection('subscribers')
        .where('email', '==', normalizedEmail)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        const existingDoc = existingQuery.docs[0];
        const existingData = existingDoc.data() as SubscriberDocument;

        if (existingData.status === 'active') {
          // Already subscribed, update interests
          await existingDoc.ref.update({
            interests,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          res.status(200).json({
            success: true,
            message: 'Subscription updated successfully.',
            alreadySubscribed: true,
          });
          return;
        } else if (existingData.status === 'pending') {
          // Resend confirmation email
          await sendSubscriptionConfirmation({
            email: normalizedEmail,
            confirmToken: existingData.confirmToken!,
            interests,
          });
          res.status(200).json({
            success: true,
            message: 'Confirmation email resent. Please check your inbox.',
            pending: true,
          });
          return;
        } else if (existingData.status === 'unsubscribed') {
          // Resubscribe
          const confirmToken = generateToken();
          await existingDoc.ref.update({
            status: 'pending',
            interests,
            confirmToken,
            subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
            unsubscribedAt: admin.firestore.FieldValue.deleteField(),
          });
          await sendSubscriptionConfirmation({
            email: normalizedEmail,
            confirmToken,
            interests,
          });
          res.status(200).json({
            success: true,
            message: 'Please check your email to confirm your subscription.',
          });
          return;
        }
      }

      // Create new subscriber
      const confirmToken = generateToken();
      const unsubscribeToken = generateToken();

      const subscriberData: Omit<SubscriberDocument, 'subscribedAt'> & { subscribedAt: admin.firestore.FieldValue } = {
        email: normalizedEmail,
        interests,
        status: 'pending',
        confirmToken,
        unsubscribeToken,
        subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
        source: source || 'website',
        metadata,
      };

      const docRef = await db.collection('subscribers').add(subscriberData);

      // Send confirmation email
      await sendSubscriptionConfirmation({
        email: normalizedEmail,
        confirmToken,
        interests,
      });

      console.log(`New subscription created: ${docRef.id} for ${normalizedEmail}`);

      res.status(200).json({
        success: true,
        message: 'Please check your email to confirm your subscription.',
      });
    } catch (error) {
      console.error('Subscription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process subscription. Please try again.',
      });
    }
  }
);

/**
 * HTTP Function: Confirm subscription (Double opt-in)
 *
 * Activates the subscription after user clicks confirmation link.
 */
export const confirmSubscription = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: '256MiB',
    region: 'asia-northeast3',
  },
  async (req, res) => {
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({ success: false, error: 'Invalid confirmation link' });
      return;
    }

    try {
      const db = admin.firestore();

      // Find subscriber by confirmation token
      const subscriberQuery = await db
        .collection('subscribers')
        .where('confirmToken', '==', token)
        .where('status', '==', 'pending')
        .limit(1)
        .get();

      if (subscriberQuery.empty) {
        res.status(404).json({
          success: false,
          error: 'Invalid or expired confirmation link.',
        });
        return;
      }

      const subscriberDoc = subscriberQuery.docs[0];
      const subscriberData = subscriberDoc.data() as SubscriberDocument;

      // Activate subscription
      await subscriberDoc.ref.update({
        status: 'active',
        confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
        confirmToken: admin.firestore.FieldValue.deleteField(),
      });

      // Add to SendGrid marketing list
      try {
        const sendGridResult = await addToSendGridList({
          email: subscriberData.email,
          interests: subscriberData.interests,
        });
        if (sendGridResult.contactId) {
          await subscriberDoc.ref.update({
            sendGridContactId: sendGridResult.contactId,
          });
        }
      } catch (sendGridError) {
        console.error('SendGrid integration error (non-critical):', sendGridError);
      }

      console.log(`Subscription confirmed: ${subscriberDoc.id} - ${subscriberData.email}`);

      // Redirect to success page or return JSON
      if (req.headers.accept?.includes('text/html')) {
        res.redirect('https://carib.artience.io/newsletter/confirmed');
      } else {
        res.status(200).json({
          success: true,
          message: 'Your subscription has been confirmed. Welcome!',
        });
      }
    } catch (error) {
      console.error('Confirmation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to confirm subscription. Please try again.',
      });
    }
  }
);

/**
 * HTTP Function: Unsubscribe from newsletter
 *
 * Allows users to unsubscribe via unique token link.
 */
export const unsubscribe = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: '256MiB',
    region: 'asia-northeast3',
  },
  async (req, res) => {
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({ success: false, error: 'Invalid unsubscribe link' });
      return;
    }

    try {
      const db = admin.firestore();

      // Find subscriber by unsubscribe token
      const subscriberQuery = await db
        .collection('subscribers')
        .where('unsubscribeToken', '==', token)
        .limit(1)
        .get();

      if (subscriberQuery.empty) {
        res.status(404).json({
          success: false,
          error: 'Invalid unsubscribe link.',
        });
        return;
      }

      const subscriberDoc = subscriberQuery.docs[0];
      const subscriberData = subscriberDoc.data() as SubscriberDocument;

      if (subscriberData.status === 'unsubscribed') {
        res.status(200).json({
          success: true,
          message: 'You have already unsubscribed.',
        });
        return;
      }

      // Update status to unsubscribed
      await subscriberDoc.ref.update({
        status: 'unsubscribed',
        unsubscribedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Remove from SendGrid list
      if (subscriberData.sendGridContactId) {
        try {
          await removeFromSendGridList(subscriberData.sendGridContactId);
        } catch (sendGridError) {
          console.error('SendGrid removal error (non-critical):', sendGridError);
        }
      }

      // Send unsubscribe confirmation email
      try {
        await sendUnsubscribeConfirmation(subscriberData.email);
      } catch (emailError) {
        console.error('Unsubscribe confirmation email error (non-critical):', emailError);
      }

      console.log(`Unsubscribed: ${subscriberDoc.id} - ${subscriberData.email}`);

      // Redirect to unsubscribe confirmation page or return JSON
      if (req.headers.accept?.includes('text/html')) {
        res.redirect('https://carib.artience.io/newsletter/unsubscribed');
      } else {
        res.status(200).json({
          success: true,
          message: 'You have been successfully unsubscribed.',
        });
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process unsubscribe request. Please try again.',
      });
    }
  }
);

/**
 * Firestore Trigger: On new subscriber created
 *
 * Handles post-subscription tasks like analytics tracking.
 */
export const onSubscriberCreated = onDocumentCreated(
  {
    document: 'subscribers/{subscriberId}',
    region: 'asia-northeast3',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }

    const subscriberId = event.params.subscriberId;
    const data = snapshot.data() as SubscriberDocument;

    console.log(`New subscriber created: ${subscriberId}`, {
      email: data.email,
      interests: data.interests,
      status: data.status,
    });

    // Track subscription analytics
    try {
      const db = admin.firestore();
      const today = new Date().toISOString().split('T')[0];
      const statsRef = db.collection('analytics_stats').doc(`subscribers_${today}`);

      await db.runTransaction(async (transaction) => {
        const statsDoc = await transaction.get(statsRef);

        if (statsDoc.exists) {
          const currentData = statsDoc.data();
          transaction.update(statsRef, {
            totalSubscriptions: (currentData?.totalSubscriptions || 0) + 1,
            byInterest: {
              ...currentData?.byInterest,
              ...data.interests.reduce((acc, interest) => ({
                ...acc,
                [interest]: ((currentData?.byInterest?.[interest]) || 0) + 1,
              }), {}),
            },
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          transaction.set(statsRef, {
            date: today,
            totalSubscriptions: 1,
            byInterest: data.interests.reduce((acc, interest) => ({
              ...acc,
              [interest]: 1,
            }), {}),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      });
    } catch (statsError) {
      console.error('Analytics tracking error (non-critical):', statsError);
    }
  }
);

/**
 * HTTP Function: Get subscriber statistics (Admin only)
 */
export const getSubscriberStats = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 5,
    timeoutSeconds: 30,
    memory: '256MiB',
    region: 'asia-northeast3',
  },
  async (req, res) => {
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

    try {
      const db = admin.firestore();

      // Get total counts by status
      const [activeSnapshot, pendingSnapshot, unsubscribedSnapshot] = await Promise.all([
        db.collection('subscribers').where('status', '==', 'active').count().get(),
        db.collection('subscribers').where('status', '==', 'pending').count().get(),
        db.collection('subscribers').where('status', '==', 'unsubscribed').count().get(),
      ]);

      // Get recent subscribers
      const recentQuery = await db
        .collection('subscribers')
        .orderBy('subscribedAt', 'desc')
        .limit(10)
        .get();

      const recentSubscribers = recentQuery.docs.map((doc) => {
        const data = doc.data() as SubscriberDocument;
        return {
          id: doc.id,
          email: data.email,
          interests: data.interests,
          status: data.status,
          subscribedAt: data.subscribedAt?.toDate?.()?.toISOString() || null,
          confirmedAt: data.confirmedAt?.toDate?.()?.toISOString() || null,
        };
      });

      res.status(200).json({
        success: true,
        stats: {
          total: activeSnapshot.data().count + pendingSnapshot.data().count + unsubscribedSnapshot.data().count,
          active: activeSnapshot.data().count,
          pending: pendingSnapshot.data().count,
          unsubscribed: unsubscribedSnapshot.data().count,
        },
        recentSubscribers,
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscriber statistics.',
      });
    }
  }
);

/**
 * HTTP Function: List all subscribers (Admin only, paginated)
 */
export const listSubscribers = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 5,
    timeoutSeconds: 30,
    memory: '256MiB',
    region: 'asia-northeast3',
  },
  async (req, res) => {
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

    try {
      const db = admin.firestore();
      const { status, interest, limit: limitStr, startAfter } = req.query;
      const limitNum = Math.min(parseInt(limitStr as string) || 50, 100);

      let query: admin.firestore.Query = db.collection('subscribers');

      // Apply filters
      if (status && ['active', 'pending', 'unsubscribed'].includes(status as string)) {
        query = query.where('status', '==', status);
      }

      if (interest && ['automation', 'ai', 'data-analysis'].includes(interest as string)) {
        query = query.where('interests', 'array-contains', interest);
      }

      query = query.orderBy('subscribedAt', 'desc').limit(limitNum);

      // Pagination
      if (startAfter) {
        const startDoc = await db.collection('subscribers').doc(startAfter as string).get();
        if (startDoc.exists) {
          query = query.startAfter(startDoc);
        }
      }

      const snapshot = await query.get();

      const subscribers = snapshot.docs.map((doc) => {
        const data = doc.data() as SubscriberDocument;
        return {
          id: doc.id,
          email: data.email,
          interests: data.interests,
          status: data.status,
          source: data.source,
          subscribedAt: data.subscribedAt?.toDate?.()?.toISOString() || null,
          confirmedAt: data.confirmedAt?.toDate?.()?.toISOString() || null,
          unsubscribedAt: data.unsubscribedAt?.toDate?.()?.toISOString() || null,
        };
      });

      res.status(200).json({
        success: true,
        subscribers,
        hasMore: snapshot.docs.length === limitNum,
        lastId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
      });
    } catch (error) {
      console.error('List subscribers error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscribers.',
      });
    }
  }
);
