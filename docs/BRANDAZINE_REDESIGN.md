# Brandazine 스타일 UX/UI 리디자인 문서

> 작성일: 2026-02-01
> 기준 사이트: https://www.brandazine.com/

---

## 1. 완료된 작업

### 1.1 Hero 섹션 리디자인

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 레이아웃 | 중앙 정렬 | 비대칭 2컬럼 (텍스트 60% + 이미지 40%) |
| 타이포그래피 | text-4xl~5xl | text-5xl~8xl (대형 헤드라인) |
| 이미지 | 없음 (3D 도형) | Unsplash 팀 협업 이미지 + clip-path |
| 애니메이션 | 기본 fade-in | 패럴랙스 스크롤 + 이미지 blur reveal |

**파일**: `src/app/page.tsx`

**추가된 기능**:
- `HeroImage` 컴포넌트 - 대각선 clip-path, blur-to-sharp reveal
- 스크롤 연동 패럴랙스 (텍스트 빠르게, 이미지 느리게)
- Trust Metrics 에디토리얼 스타일 (대형 숫자, 컬러 악센트)
- 스크롤 인디케이터 (세로 텍스트)

---

### 1.2 Services 섹션 리디자인

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 그리드 | 균일한 4컬럼 | 벤토 그리드 (Featured 2x2 + 일반 1x1) |
| 카드 스타일 | 미니멀 흰색 | Featured: 이미지 배경 / 일반: 호버 시 색상 반전 |
| 호버 효과 | y축 이동 | 전체 카드 확대 + 배경색 변화 |

**파일**: `src/app/page.tsx`

**이미지**:
- Featured 카드: `https://images.unsplash.com/photo-1485827404703-89b55fcc595e` (AI/로봇)

---

### 1.3 Process 섹션 리디자인

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 레이아웃 | 세로 스텝 | 수평 스크롤 타임라인 |
| 단계 번호 | 작은 원형 뱃지 | text-8xl/9xl 대형 숫자 |
| 시각 요소 | 아이콘만 | 단계별 Unsplash 이미지 |

**파일**: `src/components/sections/Process.tsx`

**이미지**:
- Step 1: `photo-1552664730-d307ca884978` (팀 미팅)
- Step 2: `photo-1460925895917-afdab827c52f` (데이터 분석)
- Step 3: `photo-1555949963-ff9fe0c870eb` (코딩)
- Step 4: `photo-1521737852567-6949f3f9f2b5` (협업)

---

### 1.4 Team 섹션 리디자인

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 레이아웃 | 균일한 그리드 | Featured (2/3) + 일반 (1/3) |
| Featured 카드 | 없음 | 대형 카드, aspect-[3/4], 상세 정보 |
| 호버 효과 | 기본 | 이미지 줌 + 정보 오버레이 슬라이드 |

**파일**: `src/components/sections/Team.tsx`

**이미지**:
- CEO: `photo-1560250097-0b93528c311a`
- CTO: `photo-1519085360753-af0119f7cbe7`
- Designer: `photo-1573497019940-1c28c88b4f3e`
- Developer: `photo-1507003211169-0a1dd7228f2d`

---

### 1.5 ThreadFeed 섹션 리디자인

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 그리드 | 균일한 카드 | 매거진 레이아웃 (Featured 2x2 + 믹스) |
| 이미지 | 선택적 | 모든 카드에 이미지 (placeholder 포함) |
| 메타 정보 | 기본 | 읽기 시간, 작성자 아바타, 카테고리 뱃지 |

**파일**: `src/components/sections/ThreadFeed.tsx`

---

### 1.6 Header 개선

**파일**: `src/components/layout/Header.tsx`

**추가된 기능**:
- 스크롤 시 로고 크기 축소 애니메이션
- 네비게이션 링크 밑줄 애니메이션 (왼쪽→오른쪽)
- CTA 버튼 pill 스타일 + 그림자 강화
- 모바일 메뉴 슬라이드 패널 스타일

---

### 1.7 Footer 개선

**파일**: `src/components/layout/Footer.tsx`

**추가된 기능**:
- 4컬럼 그리드 레이아웃
- 뉴스레터 구독 섹션 (이메일 입력 + 버튼)
- 소셜 링크 호버 들어올림 효과
- 스크롤 진입 시 순차 애니메이션

---

### 1.8 새로 추가된 컴포넌트

#### CustomCursor
**파일**: `src/components/interactions/CustomCursor.tsx`

- 커스텀 마우스 커서 (dot + ring)
- 링크/버튼 호버 시 확대 및 색상 변화
- 모바일에서 자동 비활성화
- prefers-reduced-motion 존중

#### PageTransition
**파일**: `src/components/interactions/PageTransition.tsx`

- `PageWrapper` - 페이지 래퍼
- `SectionReveal` - 섹션별 reveal 애니메이션
- `StaggerContainer` / `StaggerItem` - 순차 등장

#### useScrollAnimation 훅
**파일**: `src/hooks/useScrollAnimation.ts`

- `useScrollProgress` - 스크롤 진행률 추적
- `useParallax` - 패럴랙스 효과
- `useTextReveal` - 텍스트 reveal 애니메이션
- `useImageReveal` - 이미지 reveal (clip-path + blur)
- `useScrollDirection` - 스크롤 방향 감지
- `useElementVisibility` - 요소 가시성 감지

---

### 1.9 CSS 추가 (globals.css)

**추가된 키프레임**:
- `text-reveal`, `text-reveal-left`, `text-reveal-mask`
- `parallax-up`, `parallax-down`, `parallax-left`, `parallax-right`
- `image-zoom`, `image-zoom-reveal`, `ken-burns`
- `fade-up-stagger`, `fade-up-rotate`, `stagger-scale`
- `loading-progress`

**추가된 유틸리티**:
- 에디토리얼 타이포그래피 스케일 (display-xl, 2xl, 3xl)
- 비대칭 그리드 클래스 (grid-asymmetric-*)
- 클립패스 유틸리티 (clip-inset, clip-circle, clip-diagonal)
- 블러 효과 유틸리티 (blur-reveal, blur-gradient)

---

### 1.10 번역 추가

**파일**: `messages/ko.json`, `messages/en.json`, `messages/ja.json`

```json
{
  "footer": {
    "socialTitle": "소셜 / Social / ソーシャル",
    "newsletterTitle": "뉴스레터 / Newsletter / ニュースレター",
    "newsletterDescription": "...",
    "newsletterPlaceholder": "...",
    "newsletterButton": "...",
    "newsletterSuccess": "..."
  }
}
```

---

## 2. 추가 작업 필요 사항

### 2.1 높은 우선순위

| 작업 | 설명 | 예상 복잡도 |
|------|------|------------|
| **실제 이미지 교체** | Unsplash placeholder → 실제 팀/서비스 이미지 | 낮음 |
| **Team 멤버 정보 업데이트** | 실제 팀원 이름, 직책, 프로필 사진 | 낮음 |
| **뉴스레터 API 연동** | Footer 뉴스레터 구독 실제 동작 | 중간 |
| **모바일 최적화 테스트** | 수평 스크롤, 터치 인터랙션 검증 | 중간 |

### 2.2 중간 우선순위

| 작업 | 설명 | 예상 복잡도 |
|------|------|------------|
| **성능 최적화** | 이미지 lazy loading, 애니메이션 throttle | 중간 |
| **접근성 검토** | WCAG 2.1 AA 준수 확인, 키보드 네비게이션 | 중간 |
| **SEO 메타데이터** | 각 섹션별 구조화된 데이터 추가 | 낮음 |
| **커스텀 커서 미세조정** | 호버 대상 정밀화, 성능 최적화 | 낮음 |
| **다크모드 재적용** | Brandazine 스타일 다크 테마 (선택적) | 높음 |

### 2.3 낮은 우선순위 / 향후 개선

| 작업 | 설명 | 예상 복잡도 |
|------|------|------------|
| **404 페이지 디자인** | Brandazine 스타일 에러 페이지 | 낮음 |
| **로딩 스켈레톤 개선** | 각 섹션별 맞춤 스켈레톤 | 중간 |
| **페이지 전환 효과** | route 변경 시 부드러운 전환 | 중간 |
| **스크롤 스냅** | 섹션별 스크롤 스냅 (선택적) | 중간 |
| **비디오 배경** | Hero 섹션 비디오 옵션 | 높음 |

---

## 3. 알려진 이슈

### 3.1 해결된 이슈

- [x] `styled-jsx` Server Component 에러 → Tailwind로 대체
- [x] motion/react Variants 타입 에러 → `as const` 추가
- [x] 번역 누락 에러 → ko/en/ja 모두 추가

### 3.2 미해결 이슈

| 이슈 | 설명 | 우회 방법 |
|------|------|----------|
| **Functions 배포 실패** | 환경 변수 누락 (SENDGRID_API_KEY 등) | `--only hosting`으로 배포 |
| **next.config headers 경고** | Static Export에서 headers 미지원 | 무시 가능 (기능에 영향 없음) |

---

## 4. 기술 스택 참고

### 사용된 주요 기술

- **Next.js 16** - App Router, Static Export
- **Framer Motion (motion/react)** - 애니메이션
- **Tailwind CSS v4** - 스타일링
- **next-intl** - 다국어 지원
- **next/image** - 이미지 최적화
- **Lucide React** - 아이콘

### 이미지 도메인 설정

```typescript
// next.config.ts
images: {
  remotePatterns: [
    { hostname: 'images.unsplash.com' },
    // 추가 도메인 필요 시 여기에 추가
  ]
}
```

---

## 5. 배포 정보

| 환경 | URL |
|------|-----|
| **Production** | https://carib-b153b.web.app |
| **GitHub** | https://github.com/Yoodaddy0311/carib-website |

### 배포 명령어

```bash
# 빌드
npm run build

# Firebase Hosting 배포
firebase deploy --only hosting

# 전체 배포 (Functions 포함 - 환경 변수 필요)
npm run deploy
```

---

## 6. 커밋 히스토리

| 커밋 | 설명 |
|------|------|
| `4f5b480` | feat: Brandazine-style UX/UI redesign with magazine layout |
| `9bd14f5` | feat: Add enhanced background animations and interactions |
| `6c80973` | feat: Complete Google Labs style redesign |

---

*마지막 업데이트: 2026-02-01*
