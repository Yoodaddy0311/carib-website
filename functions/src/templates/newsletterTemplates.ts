/**
 * Newsletter Email Templates (BE-007)
 *
 * HTML email templates for newsletter subscription system.
 * Styled to match Carib brand identity.
 */

type SubscriberInterest = 'automation' | 'ai' | 'data-analysis';

/**
 * Interest labels in Korean
 */
const interestLabels: Record<SubscriberInterest, string> = {
  'automation': '자동화',
  'ai': 'AI',
  'data-analysis': '데이터 분석',
};

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
  <title>Carib Newsletter</title>
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
      padding: 16px 32px;
      border-radius: 8px;
      display: inline-block;
      font-weight: 600;
      font-size: 16px;
    }
    .button:hover {
      background-color: #2d2d44;
    }
    .interest-tag {
      display: inline-block;
      background-color: #e0e7ff;
      color: #3730a3;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 13px;
      margin: 2px;
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
            <div style="font-size: 28px; font-weight: 700; color: #1a1a2e; letter-spacing: -0.5px;">
              CARIB
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px; letter-spacing: 2px;">
              NEWSLETTER
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  `;
}

/**
 * Email footer with unsubscribe link
 */
function getEmailFooter(unsubscribeUrl?: string): string {
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
        ${unsubscribeUrl ? `
        <tr>
          <td align="center" style="padding-bottom: 16px;">
            <a href="${unsubscribeUrl}" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">
              뉴스레터 구독 취소
            </a>
          </td>
        </tr>
        ` : ''}
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
 * Format interests as HTML tags
 */
function formatInterestTags(interests: SubscriberInterest[]): string {
  return interests
    .map((interest) => `<span class="interest-tag" style="display: inline-block; background-color: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 16px; font-size: 13px; margin: 2px;">${interestLabels[interest]}</span>`)
    .join(' ');
}

/**
 * Subscription confirmation email (Double opt-in)
 */
export function getSubscriptionConfirmationEmail(data: {
  email: string;
  confirmUrl: string;
  interests: SubscriberInterest[];
}): { html: string; text: string } {
  const interestTags = formatInterestTags(data.interests);
  const interestText = data.interests.map(i => interestLabels[i]).join(', ');

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
              뉴스레터 구독 확인
            </h1>
          </td>
        </tr>

        <!-- Introduction -->
        <tr>
          <td style="padding-bottom: 24px;">
            <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
              안녕하세요!
            </p>
            <p style="margin: 16px 0 0 0; font-size: 16px; color: #374151; line-height: 1.6;">
              Carib 뉴스레터 구독을 신청해 주셔서 감사합니다.
              구독을 완료하려면 아래 버튼을 클릭해 주세요.
            </p>
          </td>
        </tr>

        <!-- Interests -->
        <tr>
          <td style="padding-bottom: 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px;">
              <tr>
                <td style="padding: 20px;">
                  <span style="font-size: 13px; color: #6b7280; display: block; margin-bottom: 8px;">관심 분야</span>
                  ${interestTags}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td align="center" style="padding-bottom: 32px;">
            <a href="${data.confirmUrl}" class="button" style="background-color: #1a1a2e; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
              구독 확인하기
            </a>
          </td>
        </tr>

        <!-- Note -->
        <tr>
          <td>
            <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
              이 이메일을 요청하지 않으셨다면, 무시하셔도 됩니다.
              버튼을 클릭하지 않으면 구독이 완료되지 않습니다.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  ${getEmailFooter()}
  `;

  const html = getEmailLayout(content, 'Carib 뉴스레터 구독을 확인해 주세요.');

  const text = `
Carib 뉴스레터 구독 확인

안녕하세요!

Carib 뉴스레터 구독을 신청해 주셔서 감사합니다.
구독을 완료하려면 아래 링크를 클릭해 주세요.

관심 분야: ${interestText}

구독 확인 링크:
${data.confirmUrl}

이 이메일을 요청하지 않으셨다면, 무시하셔도 됩니다.
링크를 클릭하지 않으면 구독이 완료되지 않습니다.

---
Carib by Artience
https://carib.artience.io
  `.trim();

  return { html, text };
}

/**
 * Welcome email after subscription is confirmed
 */
export function getWelcomeEmail(data: {
  email: string;
  unsubscribeUrl: string;
  interests: SubscriberInterest[];
}): { html: string; text: string } {
  const interestTags = formatInterestTags(data.interests);
  const interestText = data.interests.map(i => interestLabels[i]).join(', ');

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
              환영합니다!
            </h1>
          </td>
        </tr>

        <!-- Introduction -->
        <tr>
          <td style="padding-bottom: 24px;">
            <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
              Carib 뉴스레터 구독이 완료되었습니다.
            </p>
            <p style="margin: 16px 0 0 0; font-size: 16px; color: #374151; line-height: 1.6;">
              앞으로 비즈니스 자동화, AI 활용법, 데이터 분석 등
              유용한 인사이트를 정기적으로 보내드리겠습니다.
            </p>
          </td>
        </tr>

        <!-- Interests -->
        <tr>
          <td style="padding-bottom: 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px;">
              <tr>
                <td style="padding: 20px;">
                  <span style="font-size: 13px; color: #6b7280; display: block; margin-bottom: 8px;">구독 관심 분야</span>
                  ${interestTags}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- What to expect -->
        <tr>
          <td style="padding-bottom: 32px;">
            <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1a1a2e;">
              앞으로 받으실 내용
            </h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaef;">
                  <span style="font-size: 15px; color: #374151;">
                    <strong style="color: #1a1a2e;">최신 트렌드</strong> - 비즈니스 자동화와 AI 최신 동향
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaef;">
                  <span style="font-size: 15px; color: #374151;">
                    <strong style="color: #1a1a2e;">실용 가이드</strong> - 바로 적용할 수 있는 팁과 방법
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0;">
                  <span style="font-size: 15px; color: #374151;">
                    <strong style="color: #1a1a2e;">케이스 스터디</strong> - 실제 적용 사례와 결과
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td align="center" style="padding-bottom: 24px;">
            <a href="https://carib.artience.io/threads" class="button" style="background-color: #1a1a2e; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
              최신 글 읽어보기
            </a>
          </td>
        </tr>

        <!-- Closing -->
        <tr>
          <td>
            <p style="margin: 0; font-size: 14px; color: #374151;">
              감사합니다,<br>
              <strong>Carib Team</strong>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  ${getEmailFooter(data.unsubscribeUrl)}
  `;

  const html = getEmailLayout(content, 'Carib 뉴스레터에 오신 것을 환영합니다!');

  const text = `
Carib 뉴스레터에 오신 것을 환영합니다!

Carib 뉴스레터 구독이 완료되었습니다.

앞으로 비즈니스 자동화, AI 활용법, 데이터 분석 등
유용한 인사이트를 정기적으로 보내드리겠습니다.

구독 관심 분야: ${interestText}

앞으로 받으실 내용:
- 최신 트렌드: 비즈니스 자동화와 AI 최신 동향
- 실용 가이드: 바로 적용할 수 있는 팁과 방법
- 케이스 스터디: 실제 적용 사례와 결과

최신 글 읽어보기: https://carib.artience.io/threads

감사합니다,
Carib Team

---
구독 취소: ${data.unsubscribeUrl}
Carib by Artience
https://carib.artience.io
  `.trim();

  return { html, text };
}

/**
 * Unsubscribe confirmation email
 */
export function getUnsubscribeConfirmationEmail(data: {
  email: string;
}): { html: string; text: string } {
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
              구독이 취소되었습니다
            </h1>
          </td>
        </tr>

        <!-- Introduction -->
        <tr>
          <td style="padding-bottom: 24px;">
            <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
              Carib 뉴스레터 구독이 취소되었습니다.
              더 이상 뉴스레터를 받지 않으실 것입니다.
            </p>
            <p style="margin: 16px 0 0 0; font-size: 16px; color: #374151; line-height: 1.6;">
              혹시 실수로 구독을 취소하셨거나 다시 구독을 원하신다면,
              아래 버튼을 클릭해 다시 구독하실 수 있습니다.
            </p>
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td align="center" style="padding-bottom: 32px;">
            <a href="https://carib.artience.io#newsletter" class="button" style="background-color: #6b7280; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
              다시 구독하기
            </a>
          </td>
        </tr>

        <!-- Feedback -->
        <tr>
          <td style="padding-bottom: 24px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fef3c7; border-radius: 8px;">
              <tr>
                <td style="padding: 20px;">
                  <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
                    <strong>피드백을 환영합니다:</strong> 구독을 취소하신 이유가 있으시다면,
                    저희에게 알려주세요. 더 나은 콘텐츠를 제공하기 위해 노력하겠습니다.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Closing -->
        <tr>
          <td>
            <p style="margin: 0; font-size: 14px; color: #374151;">
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

  const html = getEmailLayout(content, 'Carib 뉴스레터 구독이 취소되었습니다.');

  const text = `
Carib 뉴스레터 구독이 취소되었습니다

Carib 뉴스레터 구독이 취소되었습니다.
더 이상 뉴스레터를 받지 않으실 것입니다.

혹시 실수로 구독을 취소하셨거나 다시 구독을 원하신다면,
아래 링크를 통해 다시 구독하실 수 있습니다.

다시 구독하기: https://carib.artience.io#newsletter

피드백을 환영합니다:
구독을 취소하신 이유가 있으시다면, 저희에게 알려주세요.
더 나은 콘텐츠를 제공하기 위해 노력하겠습니다.

감사합니다,
Carib Team

---
Carib by Artience
https://carib.artience.io
  `.trim();

  return { html, text };
}
