import type { TaskEntry, ROICalculationResult } from '../page';

interface TaskType {
  value: string;
  label: string;
  automationRate: number;
}

interface FrequencyOption {
  value: string;
  label: string;
  multiplier: number;
}

/**
 * Generate PDF report for ROI calculation results
 * Using browser's print functionality for PDF generation
 */
export async function generatePDFReport(
  tasks: TaskEntry[],
  result: ROICalculationResult,
  hourlyRate: number,
  taskTypes: readonly TaskType[],
  frequencyOptions: readonly FrequencyOption[]
): Promise<void> {
  // Create a new window for the print view
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
    return;
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(value));
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${Math.round(value)}%`;
  };

  // Get task type label
  const getTaskTypeLabel = (value: string) => {
    return taskTypes.find((t) => t.value === value)?.label || value;
  };

  // Get frequency label
  const getFrequencyLabel = (value: string) => {
    return frequencyOptions.find((f) => f.value === value)?.label || value;
  };

  // Current date
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Generate task rows
  const taskRows = tasks
    .map(
      (task, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${getTaskTypeLabel(task.taskType)}</td>
        <td>${task.hoursPerWeek}시간</td>
        <td>${getFrequencyLabel(task.frequency)}</td>
        <td>${task.staffCount}명</td>
        <td>${formatPercent((taskTypes.find((t) => t.value === task.taskType)?.automationRate || 0) * 100)}</td>
      </tr>
    `
    )
    .join('');

  // HTML content for the PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI 업무 자동화 ROI 분석 리포트 - Carib</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Segoe UI', sans-serif;
          color: #111827;
          line-height: 1.6;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }

        @media print {
          body {
            padding: 20px;
          }

          .no-print {
            display: none;
          }

          .page-break {
            page-break-before: always;
          }
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #2563EB;
        }

        .logo {
          font-size: 28px;
          font-weight: 700;
          color: #2563EB;
          margin-bottom: 8px;
        }

        .report-title {
          font-size: 24px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        .report-date {
          font-size: 14px;
          color: #6B7280;
        }

        .section {
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #E5E7EB;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .summary-card {
          padding: 16px;
          background: #F9FAFB;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
        }

        .summary-card.highlight {
          background: #EBF5FF;
          border-color: #2563EB;
        }

        .summary-label {
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 4px;
        }

        .summary-value {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .summary-card.highlight .summary-value {
          color: #2563EB;
        }

        .summary-unit {
          font-size: 14px;
          font-weight: 400;
          color: #6B7280;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #E5E7EB;
        }

        th {
          background: #F9FAFB;
          font-weight: 600;
          font-size: 13px;
          color: #374151;
        }

        td {
          font-size: 14px;
          color: #111827;
        }

        .highlight-box {
          padding: 20px;
          background: linear-gradient(135deg, #EBF5FF 0%, #F0FDFA 100%);
          border-radius: 12px;
          text-align: center;
          margin: 24px 0;
        }

        .highlight-box .value {
          font-size: 36px;
          font-weight: 700;
          color: #2563EB;
          margin-bottom: 4px;
        }

        .highlight-box .label {
          font-size: 14px;
          color: #6B7280;
        }

        .disclaimer {
          margin-top: 40px;
          padding: 16px;
          background: #F9FAFB;
          border-radius: 8px;
          font-size: 12px;
          color: #6B7280;
        }

        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          text-align: center;
          font-size: 12px;
          color: #9CA3AF;
        }

        .cta-box {
          margin-top: 32px;
          padding: 24px;
          background: #111827;
          border-radius: 12px;
          text-align: center;
          color: white;
        }

        .cta-box h3 {
          font-size: 18px;
          margin-bottom: 8px;
        }

        .cta-box p {
          font-size: 14px;
          color: #9CA3AF;
          margin-bottom: 16px;
        }

        .cta-box a {
          display: inline-block;
          padding: 12px 24px;
          background: #2563EB;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
        }

        .print-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background: #2563EB;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .print-btn:hover {
          background: #1D4ED8;
        }
      </style>
    </head>
    <body>
      <button class="print-btn no-print" onclick="window.print()">PDF 다운로드 / 인쇄</button>

      <div class="header">
        <div class="logo">Carib</div>
        <h1 class="report-title">AI 업무 자동화 ROI 분석 리포트</h1>
        <p class="report-date">작성일: ${currentDate}</p>
      </div>

      <div class="section">
        <h2 class="section-title">핵심 지표 요약</h2>
        <div class="summary-grid">
          <div class="summary-card highlight">
            <div class="summary-label">연간 예상 절감액</div>
            <div class="summary-value">${formatCurrency(result.savingsPerYear)} <span class="summary-unit">원</span></div>
          </div>
          <div class="summary-card highlight">
            <div class="summary-label">투자 회수 기간</div>
            <div class="summary-value">${result.paybackPeriodMonths} <span class="summary-unit">개월</span></div>
          </div>
          <div class="summary-card">
            <div class="summary-label">연간 절감 시간</div>
            <div class="summary-value">${formatCurrency(result.savedHoursPerYear)} <span class="summary-unit">시간</span></div>
          </div>
          <div class="summary-card">
            <div class="summary-label">3년 ROI</div>
            <div class="summary-value">${formatPercent(result.threeYearROI)}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">분석 대상 업무</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>업무 유형</th>
              <th>주간 소요</th>
              <th>반복 주기</th>
              <th>인력 수</th>
              <th>자동화율</th>
            </tr>
          </thead>
          <tbody>
            ${taskRows}
          </tbody>
        </table>
        <p style="font-size: 13px; color: #6B7280;">
          * 적용 시급: ${formatCurrency(hourlyRate)}원
        </p>
      </div>

      <div class="section">
        <h2 class="section-title">상세 분석</h2>
        <table>
          <tr>
            <th>항목</th>
            <th>현재</th>
            <th>AI 도입 후</th>
            <th>절감</th>
          </tr>
          <tr>
            <td>연간 업무 시간</td>
            <td>${formatCurrency(result.totalCurrentHoursPerYear)}시간</td>
            <td>${formatCurrency(result.totalCurrentHoursPerYear - result.savedHoursPerYear)}시간</td>
            <td style="color: #10B981; font-weight: 600;">${formatCurrency(result.savedHoursPerYear)}시간</td>
          </tr>
          <tr>
            <td>연간 인건비</td>
            <td>${formatCurrency(result.currentCostPerYear)}원</td>
            <td>${formatCurrency(result.currentCostPerYear - result.savingsPerYear)}원</td>
            <td style="color: #10B981; font-weight: 600;">${formatCurrency(result.savingsPerYear)}원</td>
          </tr>
          <tr>
            <td>월간 절감액</td>
            <td>-</td>
            <td>-</td>
            <td style="color: #10B981; font-weight: 600;">${formatCurrency(result.savingsPerYear / 12)}원</td>
          </tr>
        </table>
      </div>

      <div class="highlight-box">
        <div class="value">${formatPercent(result.fiveYearROI)}</div>
        <div class="label">5년 예상 투자수익률 (ROI)</div>
      </div>

      <div class="section">
        <h2 class="section-title">투자 분석</h2>
        <table>
          <tr>
            <td>예상 도입 비용</td>
            <td style="font-weight: 600;">${formatCurrency(result.implementationCost)}원</td>
          </tr>
          <tr>
            <td>손익분기점</td>
            <td style="font-weight: 600;">${result.paybackPeriodMonths}개월</td>
          </tr>
          <tr>
            <td>3년 순이익</td>
            <td style="font-weight: 600; color: #10B981;">${formatCurrency(result.savingsPerYear * 3 - result.implementationCost)}원</td>
          </tr>
          <tr>
            <td>5년 순이익</td>
            <td style="font-weight: 600; color: #10B981;">${formatCurrency(result.savingsPerYear * 5 - result.implementationCost)}원</td>
          </tr>
        </table>
      </div>

      <div class="disclaimer">
        <strong>안내사항</strong><br>
        본 리포트는 입력된 데이터를 기반으로 한 예상 수치이며, 실제 결과는 업무 환경, 도입 방식,
        시스템 복잡도 등에 따라 달라질 수 있습니다. 정확한 분석을 위해 Carib 전문가와 상담을 권장드립니다.
      </div>

      <div class="cta-box no-print">
        <h3>AI 자동화 도입을 고민 중이신가요?</h3>
        <p>Carib 전문가와 함께 귀사에 최적화된 AI 자동화 솔루션을 설계해 드립니다.</p>
        <a href="https://carib.team/coffee-chat" target="_blank">무료 상담 신청하기</a>
      </div>

      <div class="footer">
        <p>Carib - AI 업무 자동화 전문가 그룹</p>
        <p>https://carib.team | contact@carib.team</p>
      </div>
    </body>
    </html>
  `;

  // Write content to the new window
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
