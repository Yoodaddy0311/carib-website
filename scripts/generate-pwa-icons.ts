/**
 * PWA 아이콘 생성 스크립트
 *
 * 이 스크립트는 SVG 아이콘에서 다양한 크기의 PNG 아이콘을 생성합니다.
 * Sharp 라이브러리가 필요합니다: pnpm add -D sharp
 *
 * 사용법:
 * 1. pnpm add -D sharp @types/sharp
 * 2. npx tsx scripts/generate-pwa-icons.ts
 */

import fs from 'fs';
import path from 'path';

// 아이콘 크기 설정
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];

// 스플래시 스크린 크기 (iPhone)
const SPLASH_SIZES = [
  { width: 1290, height: 2796, name: '1290x2796' }, // iPhone 14 Pro Max
  { width: 1179, height: 2556, name: '1179x2556' }, // iPhone 14 Pro
  { width: 1284, height: 2778, name: '1284x2778' }, // iPhone 13 Pro Max
  { width: 1170, height: 2532, name: '1170x2532' }, // iPhone 13 Pro
];

// 색상 설정
const PRIMARY_COLOR = '#2563eb';
const GRADIENT_START = '#1e3a8a';
const GRADIENT_END = '#3b82f6';
const TEXT_COLOR = '#ffffff';

/**
 * SVG 아이콘 템플릿 생성
 */
function createIconSVG(size: number, maskable: boolean = false): string {
  const padding = maskable ? size * 0.1 : 0;
  const innerSize = size - padding * 2;
  const fontSize = innerSize * 0.55;
  const borderRadius = maskable ? 0 : size * 0.125;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${GRADIENT_START}"/>
      <stop offset="50%" style="stop-color:${PRIMARY_COLOR}"/>
      <stop offset="100%" style="stop-color:${GRADIENT_END}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" rx="${borderRadius}" ry="${borderRadius}" fill="url(#bg-gradient)"/>

  <!-- Subtle highlights -->
  <ellipse cx="${padding + innerSize * 0.27}" cy="${padding + innerSize * 0.78}" rx="${innerSize * 0.35}" ry="${innerSize * 0.23}" fill="white" fill-opacity="0.08"/>
  <ellipse cx="${padding + innerSize * 0.74}" cy="${padding + innerSize * 0.2}" rx="${innerSize * 0.29}" ry="${innerSize * 0.2}" fill="white" fill-opacity="0.06"/>

  <!-- Letter C -->
  <text
    x="${size / 2}"
    y="${size / 2 + fontSize * 0.32}"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="${fontSize}"
    font-weight="800"
    fill="${TEXT_COLOR}"
    text-anchor="middle">C</text>
</svg>`;
}

/**
 * 스플래시 스크린 SVG 생성
 */
function createSplashSVG(width: number, height: number): string {
  const iconSize = Math.min(width, height) * 0.2;
  const fontSize = iconSize * 0.5;
  const borderRadius = iconSize * 0.125;
  const centerX = width / 2;
  const centerY = height / 2 - iconSize * 0.3;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc"/>
      <stop offset="100%" style="stop-color:#f1f5f9"/>
    </linearGradient>
    <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${GRADIENT_START}"/>
      <stop offset="50%" style="stop-color:${PRIMARY_COLOR}"/>
      <stop offset="100%" style="stop-color:${GRADIENT_END}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${iconSize * 0.04}" stdDeviation="${iconSize * 0.08}" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg-gradient)"/>

  <!-- Icon Container -->
  <rect
    x="${centerX - iconSize / 2}"
    y="${centerY - iconSize / 2}"
    width="${iconSize}"
    height="${iconSize}"
    rx="${borderRadius}"
    ry="${borderRadius}"
    fill="url(#icon-gradient)"
    filter="url(#shadow)"/>

  <!-- Letter C -->
  <text
    x="${centerX}"
    y="${centerY + fontSize * 0.32}"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="${fontSize}"
    font-weight="800"
    fill="${TEXT_COLOR}"
    text-anchor="middle">C</text>

  <!-- Brand Name -->
  <text
    x="${centerX}"
    y="${centerY + iconSize / 2 + iconSize * 0.35}"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="${iconSize * 0.18}"
    font-weight="700"
    fill="#1f2937"
    text-anchor="middle">Carib</text>

  <text
    x="${centerX}"
    y="${centerY + iconSize / 2 + iconSize * 0.55}"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="${iconSize * 0.1}"
    font-weight="400"
    fill="#6b7280"
    text-anchor="middle">AI 업무 자동화</text>
</svg>`;
}

async function main() {
  const publicDir = path.join(process.cwd(), 'public');
  const iconsDir = path.join(publicDir, 'icons');
  const splashDir = path.join(publicDir, 'splash');
  const screenshotsDir = path.join(publicDir, 'screenshots');

  // 디렉토리 생성
  [iconsDir, splashDir, screenshotsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log('PWA 아이콘 SVG 파일 생성 중...\n');

  // 일반 아이콘 SVG 생성
  for (const size of ICON_SIZES) {
    const svg = createIconSVG(size);
    const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
    fs.writeFileSync(svgPath, svg);
    console.log(`  생성됨: icons/icon-${size}x${size}.svg`);
  }

  // Maskable 아이콘 SVG 생성
  for (const size of MASKABLE_SIZES) {
    const svg = createIconSVG(size, true);
    const svgPath = path.join(iconsDir, `icon-maskable-${size}x${size}.svg`);
    fs.writeFileSync(svgPath, svg);
    console.log(`  생성됨: icons/icon-maskable-${size}x${size}.svg`);
  }

  // 스플래시 스크린 SVG 생성
  console.log('\n스플래시 스크린 SVG 파일 생성 중...\n');
  for (const { width, height, name } of SPLASH_SIZES) {
    const svg = createSplashSVG(width, height);
    const svgPath = path.join(splashDir, `splash-${name}.svg`);
    fs.writeFileSync(svgPath, svg);
    console.log(`  생성됨: splash/splash-${name}.svg`);
  }

  console.log('\n');
  console.log('============================================');
  console.log('SVG 파일이 생성되었습니다!');
  console.log('');
  console.log('PNG 변환을 위해 다음 단계를 진행하세요:');
  console.log('');
  console.log('방법 1: Sharp 라이브러리 사용');
  console.log('  1. pnpm add -D sharp');
  console.log('  2. 아래 코드 주석 해제 후 실행');
  console.log('');
  console.log('방법 2: 온라인 변환 도구 사용');
  console.log('  - https://cloudconvert.com/svg-to-png');
  console.log('  - https://svgtopng.com/');
  console.log('');
  console.log('방법 3: 브라우저에서 직접 변환');
  console.log('  - SVG 파일을 브라우저에서 열고');
  console.log('  - 개발자 도구에서 캔버스로 렌더링 후 PNG 저장');
  console.log('============================================');

  // Sharp가 설치되어 있으면 PNG 변환 실행
  try {
    const sharp = await import('sharp');

    console.log('\nSharp 감지됨. PNG 변환 중...\n');

    // 아이콘 PNG 변환
    for (const size of ICON_SIZES) {
      const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
      const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      const svgContent = fs.readFileSync(svgPath);

      await sharp
        .default(svgContent)
        .resize(size, size)
        .png({ quality: 100 })
        .toFile(pngPath);

      console.log(`  변환됨: icons/icon-${size}x${size}.png`);
    }

    // Maskable 아이콘 PNG 변환
    for (const size of MASKABLE_SIZES) {
      const svgPath = path.join(iconsDir, `icon-maskable-${size}x${size}.svg`);
      const pngPath = path.join(iconsDir, `icon-maskable-${size}x${size}.png`);
      const svgContent = fs.readFileSync(svgPath);

      await sharp
        .default(svgContent)
        .resize(size, size)
        .png({ quality: 100 })
        .toFile(pngPath);

      console.log(`  변환됨: icons/icon-maskable-${size}x${size}.png`);
    }

    // 스플래시 스크린 PNG 변환
    console.log('\n스플래시 스크린 PNG 변환 중...\n');
    for (const { width, height, name } of SPLASH_SIZES) {
      const svgPath = path.join(splashDir, `splash-${name}.svg`);
      const pngPath = path.join(splashDir, `splash-${name}.png`);
      const svgContent = fs.readFileSync(svgPath);

      await sharp
        .default(svgContent)
        .resize(width, height)
        .png({ quality: 100 })
        .toFile(pngPath);

      console.log(`  변환됨: splash/splash-${name}.png`);
    }

    console.log('\n모든 PWA 아이콘과 스플래시 스크린이 생성되었습니다!');
  } catch {
    console.log('\nSharp가 설치되지 않았습니다. SVG 파일만 생성되었습니다.');
    console.log('PNG 변환을 위해 위의 방법 중 하나를 사용하세요.');
  }
}

main().catch(console.error);
