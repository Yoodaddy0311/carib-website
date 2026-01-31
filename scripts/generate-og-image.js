/**
 * OG 이미지 생성 스크립트
 *
 * 이 스크립트는 Puppeteer를 사용하여 HTML 템플릿에서 PNG OG 이미지를 생성합니다.
 *
 * 사용법:
 *   node scripts/generate-og-image.js
 *
 * 사전 요구사항:
 *   npm install puppeteer
 *
 * 생성되는 파일:
 *   - public/images/og/og-image.png (기본 OG 이미지)
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'og');
const TEMPLATE_PATH = path.join(__dirname, '..', 'public', 'og-image-template.html');

async function generateOGImage() {
  console.log('OG 이미지 생성 시작...');

  // 출력 디렉토리 확인
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`디렉토리 생성: ${OUTPUT_DIR}`);
  }

  // Puppeteer 브라우저 실행
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 뷰포트 설정 (OG 이미지 크기)
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 2, // 고해상도
    });

    // HTML 템플릿 로드
    const templateUrl = `file://${TEMPLATE_PATH}`;
    console.log(`템플릿 로드: ${templateUrl}`);
    await page.goto(templateUrl, { waitUntil: 'networkidle0' });

    // 폰트 로딩 대기
    await page.waitForTimeout(1000);

    // 스크린샷 촬영
    const outputPath = path.join(OUTPUT_DIR, 'og-image.png');
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 630,
      },
    });

    console.log(`OG 이미지 생성 완료: ${outputPath}`);

    // 추가: 정사각형 OG 이미지 (일부 플랫폼용)
    await page.setViewport({
      width: 1200,
      height: 1200,
      deviceScaleFactor: 2,
    });

    const squareOutputPath = path.join(OUTPUT_DIR, 'og-image-square.png');
    await page.screenshot({
      path: squareOutputPath,
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 1200,
      },
    });

    console.log(`정사각형 OG 이미지 생성 완료: ${squareOutputPath}`);
  } catch (error) {
    console.error('OG 이미지 생성 실패:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('모든 OG 이미지 생성 완료!');
}

// 메인 실행
generateOGImage().catch((error) => {
  console.error(error);
  process.exit(1);
});
