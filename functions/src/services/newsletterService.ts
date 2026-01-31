/**
 * Newsletter Email Service (BE-007)
 *
 * Handles email sending for newsletter subscriptions via SendGrid.
 * Integrates with SendGrid Marketing Campaigns for list management.
 */

import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { defineString } from 'firebase-functions/params';
import {
  getSubscriptionConfirmationEmail,
  getUnsubscribeConfirmationEmail,
  getWelcomeEmail,
} from '../templates/newsletterTemplates';

// Define environment parameters
const sendgridApiKey = defineString('SENDGRID_API_KEY');
const sendgridListId = defineString('SENDGRID_NEWSLETTER_LIST_ID', { default: '' });
const senderEmail = defineString('SENDER_EMAIL', { default: 'noreply@artience.io' });
const senderName = defineString('SENDER_NAME', { default: 'Carib by Artience' });
const baseUrl = defineString('BASE_URL', { default: 'https://carib.artience.io' });

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
  console.log('SendGrid initialized for newsletter');
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

    console.log('Newsletter email sent successfully:', {
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
    console.error('Failed to send newsletter email:', {
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
 * Subscriber interests type
 */
type SubscriberInterest = 'automation' | 'ai' | 'data-analysis';

/**
 * Send subscription confirmation email (Double opt-in)
 */
export async function sendSubscriptionConfirmation(data: {
  email: string;
  confirmToken: string;
  interests: SubscriberInterest[];
}): Promise<EmailResult> {
  const confirmUrl = `${baseUrl.value()}/api/newsletter/confirm?token=${data.confirmToken}`;
  const { html, text } = getSubscriptionConfirmationEmail({
    email: data.email,
    confirmUrl,
    interests: data.interests,
  });

  const mailData: MailDataRequired = {
    to: data.email,
    from: {
      email: senderEmail.value(),
      name: senderName.value(),
    },
    subject: '[Carib] 뉴스레터 구독 확인',
    html,
    text,
    categories: ['newsletter', 'subscription-confirmation'],
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  };

  return sendEmail(mailData);
}

/**
 * Send welcome email after subscription is confirmed
 */
export async function sendWelcomeEmail(data: {
  email: string;
  unsubscribeToken: string;
  interests: SubscriberInterest[];
}): Promise<EmailResult> {
  const unsubscribeUrl = `${baseUrl.value()}/api/newsletter/unsubscribe?token=${data.unsubscribeToken}`;
  const { html, text } = getWelcomeEmail({
    email: data.email,
    unsubscribeUrl,
    interests: data.interests,
  });

  const mailData: MailDataRequired = {
    to: data.email,
    from: {
      email: senderEmail.value(),
      name: senderName.value(),
    },
    subject: '[Carib] 뉴스레터 구독을 환영합니다!',
    html,
    text,
    categories: ['newsletter', 'welcome'],
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  };

  return sendEmail(mailData);
}

/**
 * Send unsubscribe confirmation email
 */
export async function sendUnsubscribeConfirmation(email: string): Promise<EmailResult> {
  const { html, text } = getUnsubscribeConfirmationEmail({ email });

  const mailData: MailDataRequired = {
    to: email,
    from: {
      email: senderEmail.value(),
      name: senderName.value(),
    },
    subject: '[Carib] 뉴스레터 구독이 취소되었습니다',
    html,
    text,
    categories: ['newsletter', 'unsubscribe-confirmation'],
  };

  return sendEmail(mailData);
}

/**
 * SendGrid Marketing API integration
 */

interface SendGridAddContactResult {
  success: boolean;
  contactId?: string;
  error?: string;
}

/**
 * Add subscriber to SendGrid Marketing List
 */
export async function addToSendGridList(data: {
  email: string;
  interests: SubscriberInterest[];
}): Promise<SendGridAddContactResult> {
  const apiKey = sendgridApiKey.value();
  const listId = sendgridListId.value();

  if (!apiKey || !listId) {
    console.warn('SendGrid Marketing not configured. Skipping list addition.');
    return {
      success: false,
      error: 'SendGrid Marketing not configured.',
    };
  }

  try {
    // Map interests to custom field values
    const interestLabels: Record<SubscriberInterest, string> = {
      'automation': '자동화',
      'ai': 'AI',
      'data-analysis': '데이터 분석',
    };

    const interestString = data.interests.map(i => interestLabels[i]).join(', ');

    // Add contact to SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        list_ids: [listId],
        contacts: [
          {
            email: data.email,
            custom_fields: {
              interests: interestString,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.message || 'SendGrid API error');
    }

    const result = await response.json();

    console.log('Contact added to SendGrid list:', {
      email: data.email,
      jobId: result.job_id,
    });

    return {
      success: true,
      contactId: result.job_id, // Job ID for tracking
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to add to SendGrid list:', {
      email: data.email,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Remove subscriber from SendGrid Marketing List
 */
export async function removeFromSendGridList(contactId: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = sendgridApiKey.value();

  if (!apiKey) {
    console.warn('SendGrid Marketing not configured. Skipping list removal.');
    return {
      success: false,
      error: 'SendGrid Marketing not configured.',
    };
  }

  try {
    // Delete contact from SendGrid
    const response = await fetch(`https://api.sendgrid.com/v3/marketing/contacts?ids=${contactId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.message || 'SendGrid API error');
    }

    console.log('Contact removed from SendGrid list:', contactId);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to remove from SendGrid list:', {
      contactId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get SendGrid list statistics
 */
export async function getSendGridListStats(): Promise<{
  success: boolean;
  stats?: {
    contactCount: number;
    listId: string;
  };
  error?: string;
}> {
  const apiKey = sendgridApiKey.value();
  const listId = sendgridListId.value();

  if (!apiKey || !listId) {
    return {
      success: false,
      error: 'SendGrid Marketing not configured.',
    };
  }

  try {
    const response = await fetch(`https://api.sendgrid.com/v3/marketing/lists/${listId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.message || 'SendGrid API error');
    }

    const result = await response.json();

    return {
      success: true,
      stats: {
        contactCount: result.contact_count || 0,
        listId,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to get SendGrid list stats:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}
