/**
 * Notification Services Index
 *
 * Central export for all notification-related functionality.
 */

// Pub/Sub notifications
export {
  TOPICS,
  publishNewInquiry,
  publishStatusChange,
  publishAdminNotification,
  storeNotification,
  notifyNewInquiry,
} from './pubsub';

export type {
  NewInquiryMessage,
  StatusChangedMessage,
  AdminNotificationMessage,
} from './pubsub';

// Email notifications (SendGrid)
export {
  initializeSendGrid,
  sendAdminNewInquiryEmail,
  sendUserConfirmationEmail,
} from './email';

export type {
  InquiryEmailData,
  UserConfirmationEmailData,
  StatusUpdateEmailData,
} from './email';

// FCM Push notifications
export {
  sendPushNotification,
  sendPushToAllAdmins,
  registerDeviceToken,
  notifyAdminsNewInquiry,
} from './fcm';

export type {
  PushNotificationData,
  AdminDeviceToken,
} from './fcm';
