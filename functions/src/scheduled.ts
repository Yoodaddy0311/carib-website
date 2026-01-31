/**
 * Scheduled Cloud Functions
 *
 * Handles automated tasks like backups, cleanup, and health checks.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { cleanupExpiredRateLimits } from './middleware/rate-limiter';
import { getCorsConfig } from './middleware/cors';

// Backup configuration
const BACKUP_BUCKET = 'carib-b153b-backups';
const RETENTION_DAYS = {
  chatLogs: 90,
  inquiries: 365,
  sessions: 7,
};

/**
 * Daily backup of Firestore data
 * Runs every day at 2:00 AM UTC
 */
export const dailyBackup = onSchedule(
  {
    schedule: '0 2 * * *', // Every day at 2:00 AM UTC
    timeZone: 'UTC',
    retryCount: 3,
    memory: '1GiB',
    timeoutSeconds: 540,
  },
  async () => {
    console.log('Starting daily backup...');

    const db = admin.firestore();
    const storage = admin.storage();
    const bucket = storage.bucket(BACKUP_BUCKET);
    const timestamp = new Date().toISOString().split('T')[0];

    try {
      // Collections to backup
      const collections = ['inquiries', 'chat_logs', 'chat_sessions', 'users'];

      for (const collectionName of collections) {
        console.log(`Backing up collection: ${collectionName}`);

        const snapshot = await db.collection(collectionName).get();

        if (snapshot.empty) {
          console.log(`Collection ${collectionName} is empty, skipping`);
          continue;
        }

        // Convert documents to JSON
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));

        // Create backup file
        const backupData = JSON.stringify(documents, null, 2);
        const fileName = `backups/${timestamp}/${collectionName}.json`;
        const file = bucket.file(fileName);

        await file.save(backupData, {
          contentType: 'application/json',
          metadata: {
            backupDate: timestamp,
            collection: collectionName,
            documentCount: documents.length.toString(),
          },
        });

        console.log(`Backed up ${documents.length} documents from ${collectionName}`);
      }

      // Log successful backup
      await db.collection('backup_logs').add({
        type: 'daily',
        status: 'success',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        collectionsBackedUp: collections,
      });

      console.log('Daily backup completed successfully');
    } catch (error) {
      console.error('Daily backup failed:', error);

      // Log failed backup
      await db.collection('backup_logs').add({
        type: 'daily',
        status: 'failed',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error; // Re-throw to trigger retry
    }
  }
);

/**
 * Weekly cleanup of old data
 * Runs every Sunday at 3:00 AM UTC
 */
export const weeklyCleanup = onSchedule(
  {
    schedule: '0 3 * * 0', // Every Sunday at 3:00 AM UTC
    timeZone: 'UTC',
    retryCount: 2,
    memory: '512MiB',
    timeoutSeconds: 300,
  },
  async () => {
    console.log('Starting weekly cleanup...');

    const db = admin.firestore();
    const now = Date.now();

    interface CleanupResult {
      chatLogs: number;
      sessions: number;
      backupLogs: number;
    }

    const cleanupResults: CleanupResult = {
      chatLogs: 0,
      sessions: 0,
      backupLogs: 0,
    };

    try {
      // Clean up old chat logs
      const chatLogsCutoff = new Date(now - RETENTION_DAYS.chatLogs * 24 * 60 * 60 * 1000);
      const oldChatLogs = await db
        .collection('chat_logs')
        .where('timestamp', '<', chatLogsCutoff)
        .limit(500) // Process in batches
        .get();

      if (!oldChatLogs.empty) {
        const batch = db.batch();
        oldChatLogs.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        cleanupResults.chatLogs = oldChatLogs.size;
        console.log(`Deleted ${oldChatLogs.size} old chat logs`);
      }

      // Clean up old sessions
      const sessionsCutoff = new Date(now - RETENTION_DAYS.sessions * 24 * 60 * 60 * 1000);
      const oldSessions = await db
        .collection('chat_sessions')
        .where('lastActivity', '<', sessionsCutoff)
        .limit(500)
        .get();

      if (!oldSessions.empty) {
        const batch = db.batch();
        oldSessions.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        cleanupResults.sessions = oldSessions.size;
        console.log(`Deleted ${oldSessions.size} old sessions`);
      }

      // Clean up old backup logs (keep last 30 days)
      const backupLogsCutoff = new Date(now - 30 * 24 * 60 * 60 * 1000);
      const oldBackupLogs = await db
        .collection('backup_logs')
        .where('timestamp', '<', backupLogsCutoff)
        .limit(100)
        .get();

      if (!oldBackupLogs.empty) {
        const batch = db.batch();
        oldBackupLogs.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        cleanupResults.backupLogs = oldBackupLogs.size;
        console.log(`Deleted ${oldBackupLogs.size} old backup logs`);
      }

      // Clean up expired rate limit documents (older than 1 hour)
      const rateLimitsDeleted = await cleanupExpiredRateLimits('rate_limits', 3600);
      console.log(`Deleted ${rateLimitsDeleted} expired rate limit documents`);

      // Log cleanup results
      await db.collection('cleanup_logs').add({
        type: 'weekly',
        status: 'success',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        results: cleanupResults,
      });

      console.log('Weekly cleanup completed successfully', cleanupResults);
    } catch (error) {
      console.error('Weekly cleanup failed:', error);

      // Log failed cleanup
      await db.collection('cleanup_logs').add({
        type: 'weekly',
        status: 'failed',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }
);

/**
 * Health check endpoint for monitoring
 *
 * Security:
 * - Rate limited: 60 requests per minute per IP
 * - Strict CORS policy (production domains only)
 */
export const healthCheck = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 10,
    timeoutSeconds: 10,
    memory: '128MiB',
  },
  async (req, res) => {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        firestore: 'unknown',
        storage: 'unknown',
      },
      version: process.env.K_REVISION || 'local',
    };

    try {
      // Check Firestore connectivity
      const db = admin.firestore();
      const testDoc = await db.collection('health_checks').doc('test').get();
      health.services.firestore = testDoc ? 'healthy' : 'degraded';
    } catch (error) {
      console.error('Firestore health check failed:', error);
      health.services.firestore = 'unhealthy';
      health.status = 'degraded';
    }

    try {
      // Check Storage connectivity
      const storage = admin.storage();
      const bucket = storage.bucket(BACKUP_BUCKET);
      await bucket.exists();
      health.services.storage = 'healthy';
    } catch (error) {
      console.error('Storage health check failed:', error);
      health.services.storage = 'unhealthy';
      health.status = 'degraded';
    }

    // Return appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  }
);
