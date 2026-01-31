/**
 * Email Notification Service using SendGrid
 *
 * Handles sending email notifications to admins and users.
 */

import * as sgMail from '@sendgrid/mail';

// Email templates
const EMAIL_TEMPLATES = {
  ADMIN_NEW_INQUIRY: 'd-admin-new-inquiry', // SendGrid Dynamic Template ID
  USER_CONFIRMATION: 'd-user-confirmation',
  STATUS_UPDATE: 'd-status-update',
};

// Admin email recipients
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || ['admin@carib.team'];
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@carib.team';
const FROM_NAME = process.env.FROM_NAME || 'Carib Team';

// Initialize SendGrid with API key
export function initializeSendGrid(apiKey?: string): void {
  const key = apiKey || process.env.SENDGRID_API_KEY;
  if (key) {
    sgMail.setApiKey(key);
    console.log('SendGrid initialized');
  } else {
    console.warn('SendGrid API key not provided. Email notifications will be disabled.');
  }
}

// Email interfaces
export interface InquiryEmailData {
  inquiryId: string;
  type: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject?: string;
  message?: string;
  createdAt: string;
  dashboardUrl?: string;
}

export interface UserConfirmationEmailData {
  name: string;
  email: string;
  inquiryType: string;
  message?: string;
}

export interface StatusUpdateEmailData {
  name: string;
  email: string;
  inquiryType: string;
  previousStatus: string;
  newStatus: string;
  message?: string;
}

/**
 * Send email notification to admins for new inquiry
 */
export async function sendAdminNewInquiryEmail(data: InquiryEmailData): Promise<boolean> {
  try {
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid not configured, skipping admin email notification');
      return false;
    }

    const dashboardUrl = data.dashboardUrl || `https://carib.team/admin/inquiries/${data.inquiryId}`;

    // Build email content (plain text + HTML for simple delivery)
    const subject = `[Carib] New ${formatInquiryType(data.type)} Inquiry from ${data.name}`;

    const textContent = `
New Inquiry Received

Type: ${formatInquiryType(data.type)}
Name: ${data.name}
Email: ${data.email}
${data.company ? `Company: ${data.company}` : ''}
${data.phone ? `Phone: ${data.phone}` : ''}
${data.subject ? `Subject: ${data.subject}` : ''}

Message:
${data.message || 'No message provided'}

---
View in Dashboard: ${dashboardUrl}
Received at: ${new Date(data.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 12px; }
    .label { font-weight: 600; color: #374151; }
    .value { color: #1f2937; }
    .message-box { background: white; border: 1px solid #e5e7eb; border-radius: 4px; padding: 12px; margin-top: 8px; }
    .button { display: inline-block; background: #2563EB; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .badge-coffee-chat { background: #FEF3C7; color: #92400E; }
    .badge-project { background: #DBEAFE; color: #1E40AF; }
    .badge-general { background: #E5E7EB; color: #374151; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 20px;">New Inquiry Received</h1>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">Type:</span>
        <span class="badge badge-${data.type}">${formatInquiryType(data.type)}</span>
      </div>
      <div class="field">
        <span class="label">Name:</span>
        <span class="value">${escapeHtml(data.name)}</span>
      </div>
      <div class="field">
        <span class="label">Email:</span>
        <span class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></span>
      </div>
      ${data.company ? `<div class="field"><span class="label">Company:</span> <span class="value">${escapeHtml(data.company)}</span></div>` : ''}
      ${data.phone ? `<div class="field"><span class="label">Phone:</span> <span class="value">${escapeHtml(data.phone)}</span></div>` : ''}
      ${data.subject ? `<div class="field"><span class="label">Subject:</span> <span class="value">${escapeHtml(data.subject)}</span></div>` : ''}

      <div class="field" style="margin-top: 16px;">
        <span class="label">Message:</span>
        <div class="message-box">${escapeHtml(data.message || 'No message provided')}</div>
      </div>

      <a href="${dashboardUrl}" class="button">View in Dashboard</a>

      <div class="footer">
        Received at: ${new Date(data.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const msg = {
      to: ADMIN_EMAILS,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject,
      text: textContent,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`Admin notification email sent for inquiry ${data.inquiryId}`);
    return true;
  } catch (error) {
    console.error('Failed to send admin email notification:', error);
    return false;
  }
}

/**
 * Send confirmation email to user
 */
export async function sendUserConfirmationEmail(data: UserConfirmationEmailData): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid not configured, skipping user confirmation email');
      return false;
    }

    const subject = `[Carib] Thank you for your inquiry`;

    const textContent = `
Hello ${data.name},

Thank you for reaching out to Carib! We have received your ${formatInquiryType(data.inquiryType).toLowerCase()} inquiry.

Our team will review your message and get back to you within 1-2 business days.

${data.inquiryType === 'coffee-chat' ? `
We're excited to chat with you! We'll reach out shortly to schedule a time that works for both of us.
` : ''}

If you have any urgent questions, feel free to reply to this email.

Best regards,
Carib Team

---
https://carib.team
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .logo { font-size: 24px; font-weight: bold; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .footer { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center; color: #6b7280; font-size: 14px; }
    .highlight { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 20px 0; border-radius: 0 4px 4px 0; }
    a { color: #2563EB; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Carib</div>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">AI Automation Experts</p>
    </div>
    <div class="content">
      <h2 style="margin-top: 0;">Hello ${escapeHtml(data.name)},</h2>
      <p>Thank you for reaching out to Carib! We have received your <strong>${formatInquiryType(data.inquiryType).toLowerCase()}</strong> inquiry.</p>

      <p>Our team will review your message and get back to you within <strong>1-2 business days</strong>.</p>

      ${data.inquiryType === 'coffee-chat' ? `
      <div class="highlight">
        <strong>Coffee Chat Request</strong><br>
        We're excited to chat with you! We'll reach out shortly to schedule a time that works for both of us.
      </div>
      ` : ''}

      <p>If you have any urgent questions, feel free to reply to this email.</p>

      <p style="margin-bottom: 0;">
        Best regards,<br>
        <strong>Carib Team</strong>
      </p>
    </div>
    <div class="footer">
      <a href="https://carib.team">carib.team</a>
    </div>
  </div>
</body>
</html>
    `.trim();

    const msg = {
      to: data.email,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject,
      text: textContent,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`Confirmation email sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error('Failed to send user confirmation email:', error);
    return false;
  }
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

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}
