/**
 * Email Templates for Carib
 *
 * HTML email templates for various notification types.
 * Styled to match Carib brand identity.
 */

interface InquiryConfirmationData {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
  inquiryId: string;
  company?: string;
  phone?: string;
}

interface AdminNotificationData {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
  inquiryId: string;
  company?: string;
  phone?: string;
  createdAt: string;
}

/**
 * Base email layout wrapper
 */
function getEmailLayout(content: string, preheader: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Carib</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }
    /* Custom styles */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
    }
    .button {
      background-color: #1a1a2e;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      display: inline-block;
      font-weight: 600;
      font-size: 16px;
    }
    .button:hover {
      background-color: #2d2d44;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .padding-mobile {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Preheader text (hidden) -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${preheader}
  </div>

  <!-- Main container -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f7;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" class="email-container" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Email header with logo
 */
function getEmailHeader(): string {
  return `
  <!-- Header -->
  <tr>
    <td style="padding: 40px 40px 30px 40px; text-align: center; border-bottom: 1px solid #eaeaef;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td align="center">
            <!-- Logo placeholder - replace with actual logo URL -->
            <div style="font-size: 28px; font-weight: 700; color: #1a1a2e; letter-spacing: -0.5px;">
              CARIB
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px; letter-spacing: 2px;">
              ARTIENCE
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  `;
}

/**
 * Email footer
 */
function getEmailFooter(): string {
  return `
  <!-- Footer -->
  <tr>
    <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td align="center" style="padding-bottom: 16px;">
            <span style="color: #6b7280; font-size: 14px;">
              Carib by Artience
            </span>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom: 16px;">
            <span style="color: #9ca3af; font-size: 12px;">
              AI-Powered Business Solutions
            </span>
          </td>
        </tr>
        <tr>
          <td align="center">
            <span style="color: #9ca3af; font-size: 11px;">
              &copy; ${new Date().getFullYear()} Artience. All rights reserved.
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  `;
}

/**
 * Get inquiry type display name in Korean
 */
function getInquiryTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    'general': '일반 문의',
    'support': '기술 지원',
    'sales': '영업 문의',
    'partnership': '파트너십',
    'coffee-chat': '커피챗',
  };
  return typeLabels[type] || '일반 문의';
}

/**
 * Inquiry confirmation email for customers
 * Sent when a new inquiry is submitted
 */
export function getInquiryConfirmationEmail(data: InquiryConfirmationData): { html: string; text: string } {
  const typeLabel = getInquiryTypeLabel(data.type);

  const content = `
  ${getEmailHeader()}

  <!-- Main Content -->
  <tr>
    <td class="padding-mobile" style="padding: 40px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <!-- Greeting -->
        <tr>
          <td style="padding-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a2e; line-height: 1.4;">
              문의가 접수되었습니다
            </h1>
          </td>
        </tr>

        <!-- Introduction -->
        <tr>
          <td style="padding-bottom: 24px;">
            <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
              안녕하세요, <strong>${data.name}</strong>님!
            </p>
            <p style="margin: 16px 0 0 0; font-size: 16px; color: #374151; line-height: 1.6;">
              Carib에 문의해 주셔서 감사합니다.
              귀하의 문의가 정상적으로 접수되었으며, 담당자가 확인 후 빠른 시일 내에 답변드리겠습니다.
            </p>
          </td>
        </tr>

        <!-- Inquiry Details Box -->
        <tr>
          <td style="padding-bottom: 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #1a1a2e;">
              <tr>
                <td style="padding: 24px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="padding-bottom: 16px;">
                        <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">문의 번호</span>
                        <br>
                        <span style="font-size: 14px; color: #1a1a2e; font-family: monospace;">${data.inquiryId}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 16px;">
                        <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">문의 유형</span>
                        <br>
                        <span style="font-size: 14px; color: #1a1a2e;">${typeLabel}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 16px;">
                        <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">제목</span>
                        <br>
                        <span style="font-size: 14px; color: #1a1a2e;">${data.subject}</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">문의 내용</span>
                        <br>
                        <span style="font-size: 14px; color: #374151; line-height: 1.5; display: block; margin-top: 4px;">${data.message.substring(0, 300)}${data.message.length > 300 ? '...' : ''}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Response Time Notice -->
        <tr>
          <td style="padding-bottom: 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fef3c7; border-radius: 8px;">
              <tr>
                <td style="padding: 16px 20px;">
                  <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
                    <strong>예상 응답 시간:</strong> 영업일 기준 1-2일 이내
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td align="center" style="padding-bottom: 24px;">
            <a href="https://carib.artience.io" class="button" style="background-color: #1a1a2e; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
              Carib 웹사이트 방문하기
            </a>
          </td>
        </tr>

        <!-- Closing -->
        <tr>
          <td>
            <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
              추가 문의사항이 있으시면 언제든지 연락 주세요.
            </p>
            <p style="margin: 16px 0 0 0; font-size: 14px; color: #374151;">
              감사합니다,<br>
              <strong>Carib Team</strong>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  ${getEmailFooter()}
  `;

  const html = getEmailLayout(content, `문의가 접수되었습니다. 문의 번호: ${data.inquiryId}`);

  const text = `
안녕하세요, ${data.name}님!

Carib에 문의해 주셔서 감사합니다.
귀하의 문의가 정상적으로 접수되었으며, 담당자가 확인 후 빠른 시일 내에 답변드리겠습니다.

===== 문의 정보 =====
문의 번호: ${data.inquiryId}
문의 유형: ${typeLabel}
제목: ${data.subject}
내용: ${data.message}
=====================

예상 응답 시간: 영업일 기준 1-2일 이내

추가 문의사항이 있으시면 언제든지 연락 주세요.

감사합니다,
Carib Team

---
Carib by Artience
https://carib.artience.io
  `.trim();

  return { html, text };
}

/**
 * Admin notification email for new inquiries
 * Sent to admin team when a new inquiry is submitted
 */
export function getAdminNotificationEmail(data: AdminNotificationData): { html: string; text: string } {
  const typeLabel = getInquiryTypeLabel(data.type);

  const content = `
  ${getEmailHeader()}

  <!-- Main Content -->
  <tr>
    <td class="padding-mobile" style="padding: 40px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <!-- Alert Banner -->
        <tr>
          <td style="padding-bottom: 24px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #dbeafe; border-radius: 8px;">
              <tr>
                <td style="padding: 16px 20px;">
                  <p style="margin: 0; font-size: 14px; color: #1e40af; font-weight: 600;">
                    새로운 문의가 접수되었습니다
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Inquiry Details -->
        <tr>
          <td style="padding-bottom: 24px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px;">
              <tr>
                <td style="padding: 24px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <!-- Inquiry ID -->
                    <tr>
                      <td width="120" style="padding-bottom: 12px; vertical-align: top;">
                        <span style="font-size: 13px; color: #6b7280;">문의 번호</span>
                      </td>
                      <td style="padding-bottom: 12px;">
                        <span style="font-size: 14px; color: #1a1a2e; font-family: monospace; font-weight: 600;">${data.inquiryId}</span>
                      </td>
                    </tr>
                    <!-- Type -->
                    <tr>
                      <td width="120" style="padding-bottom: 12px; vertical-align: top;">
                        <span style="font-size: 13px; color: #6b7280;">문의 유형</span>
                      </td>
                      <td style="padding-bottom: 12px;">
                        <span style="display: inline-block; padding: 4px 12px; background-color: #1a1a2e; color: #ffffff; border-radius: 4px; font-size: 12px; font-weight: 600;">${typeLabel}</span>
                      </td>
                    </tr>
                    <!-- Name -->
                    <tr>
                      <td width="120" style="padding-bottom: 12px; vertical-align: top;">
                        <span style="font-size: 13px; color: #6b7280;">이름</span>
                      </td>
                      <td style="padding-bottom: 12px;">
                        <span style="font-size: 14px; color: #1a1a2e; font-weight: 600;">${data.name}</span>
                      </td>
                    </tr>
                    <!-- Email -->
                    <tr>
                      <td width="120" style="padding-bottom: 12px; vertical-align: top;">
                        <span style="font-size: 13px; color: #6b7280;">이메일</span>
                      </td>
                      <td style="padding-bottom: 12px;">
                        <a href="mailto:${data.email}" style="font-size: 14px; color: #2563eb; text-decoration: none;">${data.email}</a>
                      </td>
                    </tr>
                    ${data.phone ? `
                    <!-- Phone -->
                    <tr>
                      <td width="120" style="padding-bottom: 12px; vertical-align: top;">
                        <span style="font-size: 13px; color: #6b7280;">전화번호</span>
                      </td>
                      <td style="padding-bottom: 12px;">
                        <span style="font-size: 14px; color: #1a1a2e;">${data.phone}</span>
                      </td>
                    </tr>
                    ` : ''}
                    ${data.company ? `
                    <!-- Company -->
                    <tr>
                      <td width="120" style="padding-bottom: 12px; vertical-align: top;">
                        <span style="font-size: 13px; color: #6b7280;">회사</span>
                      </td>
                      <td style="padding-bottom: 12px;">
                        <span style="font-size: 14px; color: #1a1a2e;">${data.company}</span>
                      </td>
                    </tr>
                    ` : ''}
                    <!-- Subject -->
                    <tr>
                      <td width="120" style="padding-bottom: 12px; vertical-align: top;">
                        <span style="font-size: 13px; color: #6b7280;">제목</span>
                      </td>
                      <td style="padding-bottom: 12px;">
                        <span style="font-size: 14px; color: #1a1a2e; font-weight: 600;">${data.subject}</span>
                      </td>
                    </tr>
                    <!-- Created At -->
                    <tr>
                      <td width="120" style="vertical-align: top;">
                        <span style="font-size: 13px; color: #6b7280;">접수 시간</span>
                      </td>
                      <td>
                        <span style="font-size: 14px; color: #6b7280;">${data.createdAt}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Message Content -->
        <tr>
          <td style="padding-bottom: 32px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; font-weight: 600;">문의 내용</h3>
            <div style="padding: 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.7; white-space: pre-wrap;">${data.message}</p>
            </div>
          </td>
        </tr>

        <!-- Action Buttons -->
        <tr>
          <td align="center">
            <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" class="button" style="background-color: #1a1a2e; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
              답변하기
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  ${getEmailFooter()}
  `;

  const html = getEmailLayout(content, `새 문의: ${data.subject} - ${data.name}`);

  const text = `
[새로운 문의가 접수되었습니다]

===== 문의 정보 =====
문의 번호: ${data.inquiryId}
문의 유형: ${typeLabel}
접수 시간: ${data.createdAt}

===== 고객 정보 =====
이름: ${data.name}
이메일: ${data.email}
${data.phone ? `전화번호: ${data.phone}` : ''}
${data.company ? `회사: ${data.company}` : ''}

===== 문의 내용 =====
제목: ${data.subject}

${data.message}
=====================

답변: mailto:${data.email}

---
Carib Admin Notification
  `.trim();

  return { html, text };
}

export { InquiryConfirmationData, AdminNotificationData };
