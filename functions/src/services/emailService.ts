/**
 * SendGrid Email Service
 *
 * Handles email sending via SendGrid API.
 * Configuration is done through environment variables.
 */

import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { defineString } from 'firebase-functions/params';
import {
  getInquiryConfirmationEmail,
  getAdminNotificationEmail,
  InquiryConfirmationData,
  AdminNotificationData,
} from '../templates/emailTemplates';

// Define environment parameters
const sendgridApiKey = defineString('SENDGRID_API_KEY');
const senderEmail = defineString('SENDER_EMAIL', { default: 'noreply@artience.io' });
const senderName = defineString('SENDER_NAME', { default: 'Carib by Artience' });
const adminEmail = defineString('ADMIN_EMAIL', { default: 'admin@artience.io' });

// Track initialization status
let isInitialized = false;

/**
 * Initialize SendGrid with API key
 */
function initializeSendGrid(): void {
  if (isInitialized) return;

  const apiKey = sendgridApiKey.value();
  if (!apiKey) {
    console.warn('SendGrid API key not configured. Email sending will be disabled.');
    return;
  }

  sgMail.setApiKey(apiKey);
  isInitialized = true;
  console.log('SendGrid initialized successfully');
}

/**
 * Email sending result interface
 */
interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email via SendGrid
 */
async function sendEmail(mailData: MailDataRequired): Promise<EmailResult> {
  initializeSendGrid();

  if (!isInitialized) {
    console.warn('SendGrid not initialized. Skipping email send.');
    return {
      success: false,
      error: 'SendGrid not initialized. Check API key configuration.',
    };
  }

  try {
    const [response] = await sgMail.send(mailData);

    console.log('Email sent successfully:', {
      to: mailData.to,
      subject: mailData.subject,
      statusCode: response.statusCode,
    });

    return {
      success: true,
      messageId: response.headers['x-message-id'] as string,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to send email:', {
      to: mailData.to,
      subject: mailData.subject,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send inquiry confirmation email to customer
 */
export async function sendInquiryConfirmation(data: InquiryConfirmationData): Promise<EmailResult> {
  const { html, text } = getInquiryConfirmationEmail(data);

  const mailData: MailDataRequired = {
    to: data.email,
    from: {
      email: senderEmail.value(),
      name: senderName.value(),
    },
    subject: `[Carib] 문의가 접수되었습니다 - ${data.subject}`,
    html,
    text,
    categories: ['inquiry-confirmation', 'transactional'],
    customArgs: {
      inquiryId: data.inquiryId,
      inquiryType: data.type,
    },
  };

  return sendEmail(mailData);
}

/**
 * Send notification email to admin team
 */
export async function sendAdminNotification(data: AdminNotificationData): Promise<EmailResult> {
  const { html, text } = getAdminNotificationEmail(data);

  const mailData: MailDataRequired = {
    to: adminEmail.value(),
    from: {
      email: senderEmail.value(),
      name: senderName.value(),
    },
    replyTo: {
      email: data.email,
      name: data.name,
    },
    subject: `[Carib 문의] ${data.subject} - ${data.name}`,
    html,
    text,
    categories: ['admin-notification', 'inquiry'],
    customArgs: {
      inquiryId: data.inquiryId,
      inquiryType: data.type,
    },
  };

  return sendEmail(mailData);
}

/**
 * Send both confirmation and admin notification emails
 */
export async function sendInquiryEmails(
  data: InquiryConfirmationData & { createdAt: string }
): Promise<{
  customerEmail: EmailResult;
  adminEmail: EmailResult;
}> {
  // Send emails in parallel
  const [customerEmail, adminEmailResult] = await Promise.all([
    sendInquiryConfirmation(data),
    sendAdminNotification(data),
  ]);

  return {
    customerEmail,
    adminEmail: adminEmailResult,
  };
}

export { EmailResult };
