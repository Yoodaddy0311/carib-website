# GitHub Secrets 설정 가이드

Carib Website CI/CD 파이프라인을 위해 다음 GitHub Secrets를 설정해야 합니다.

## 워크플로우 구조

### CI 워크플로우 (`ci.yml`)
- **트리거**: Pull Request (main, develop 브랜치)
- **병렬 실행**: lint, type-check, test 작업이 동시 실행
- **목적**: 코드 품질 검증

### Deploy 워크플로우 (`deploy.yml`)
- **트리거**:
  - main 브랜치 push (프로덕션 배포)
  - Pull Request (프리뷰 배포)
- **목적**: Firebase Hosting 및 Cloud Functions 배포

## 필수 Secrets

### Firebase 인증

| Secret 이름 | 설명 | 필수 |
|------------|------|:----:|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase 서비스 계정 JSON (전체 내용) | O |
| `FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID (예: `carib-b153b`) | O |

### Firebase 환경 변수 (빌드 시 필요)

| Secret 이름 | 설명 | 필수 |
|------------|------|:----:|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API 키 | O |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth 도메인 | O |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | O |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage 버킷 | O |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase 메시징 발신자 ID | O |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase 앱 ID | O |

## Secret 생성 방법

### 1. Firebase 서비스 계정 키 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 선택 > 프로젝트 설정 (톱니바퀴 아이콘)
3. **서비스 계정** 탭 클릭
4. **새 비공개 키 생성** 버튼 클릭
5. JSON 파일이 다운로드됨
6. JSON 파일 내용 전체를 `FIREBASE_SERVICE_ACCOUNT` secret에 저장

**필요 권한:**
- Firebase Hosting Admin
- Cloud Functions Admin
- Service Account User

### 2. Firebase 웹 앱 설정 값 가져오기

1. Firebase Console > 프로젝트 설정
2. **일반** 탭에서 아래로 스크롤
3. **내 앱** 섹션에서 웹 앱 선택
4. `firebaseConfig` 객체에서 각 값 복사

```javascript
const firebaseConfig = {
  apiKey: "...",           // NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "...",       // NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "...",        // NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "...",    // NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "...",// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "..."             // NEXT_PUBLIC_FIREBASE_APP_ID
};
```

### 3. GitHub에 Secrets 등록

1. GitHub 레포지토리로 이동
2. **Settings** > **Secrets and variables** > **Actions**
3. **New repository secret** 클릭
4. Name과 Secret 값 입력 후 **Add secret**

## GitHub Environment 설정

Production 배포에 대한 추가 보호를 위해 환경을 설정합니다:

### Production 환경 생성

1. **Settings** > **Environments** > **New environment**
2. `production` 이름으로 생성
3. 보호 규칙 설정 (선택):
   - Required reviewers (필수 리뷰어)
   - Wait timer (대기 시간)
   - Deployment branches: `main` 브랜치만 허용

### 환경별 시크릿 분리 (선택)

개발/스테이징/프로덕션 환경을 분리하려면:
- `staging` 환경 생성
- 각 환경별로 다른 Firebase 프로젝트 사용

## CI/CD 파이프라인 흐름

### Pull Request 시
```
┌─────────────────────────────────────────────────────────────┐
│                     CI Workflow (ci.yml)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌──────────────┐  ┌──────────┐               │
│  │  Lint   │  │  Type Check  │  │   Test   │  (병렬 실행)  │
│  └────┬────┘  └──────┬───────┘  └────┬─────┘               │
│       │              │               │                      │
│       └──────────────┼───────────────┘                      │
│                      ▼                                      │
│               ┌─────────────┐                               │
│               │    Build    │                               │
│               └─────────────┘                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Deploy Workflow (deploy.yml)                │
├─────────────────────────────────────────────────────────────┤
│               ┌───────────────────────┐                     │
│               │   Deploy Preview      │                     │
│               │   (Firebase Channel)  │                     │
│               └───────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### main 브랜치 Push 시
```
┌─────────────────────────────────────────────────────────────┐
│                  Deploy Workflow (deploy.yml)                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────┐             │
│  │      Build      │    │   Build Functions   │  (병렬)     │
│  └────────┬────────┘    └──────────┬──────────┘             │
│           │                        │                        │
│           └───────────┬────────────┘                        │
│                       ▼                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐   │
│  │   Deploy Hosting        │  │   Deploy Functions      │   │
│  │   (Firebase Hosting)    │  │   (Cloud Functions)     │   │
│  └─────────────────────────┘  └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 로컬 환경 설정

로컬 개발 시 `.env.local` 파일을 생성합니다:

```bash
# .env.local (Git에 커밋하지 않음)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

`.env.local.example` 파일을 참고하여 설정하세요.

## 보안 주의사항

- 서비스 계정 키는 절대 코드에 포함하지 마세요
- Secrets는 워크플로우 로그에 마스킹되어 표시됩니다
- 주기적으로 서비스 계정 키를 교체하세요 (권장: 90일마다)
- 최소 권한 원칙에 따라 필요한 권한만 부여하세요
- `.env.local` 파일은 `.gitignore`에 포함되어 있는지 확인

## 트러블슈팅

### "Permission denied" 오류
- 서비스 계정에 필요한 권한이 있는지 확인
- Firebase Hosting Admin, Cloud Functions Admin 권한 필요
- IAM에서 `iam.serviceAccountUser` 역할 추가

### 빌드 실패
- 모든 환경 변수가 올바르게 설정되었는지 확인
- `NEXT_PUBLIC_` 접두사가 포함되어 있는지 확인
- Secret 값에 줄바꿈이나 공백이 포함되지 않았는지 확인

### Preview 채널 생성 실패
- GitHub Actions 봇에 PR 코멘트 권한이 있는지 확인
- `pull-requests: write` 권한이 워크플로우에 설정되어 있는지 확인

### Functions 배포 실패
- functions/package.json에 필요한 의존성이 모두 포함되어 있는지 확인
- Node.js 버전이 firebase.json의 runtime과 일치하는지 확인 (Node 20)
- 빌드된 `lib/` 폴더가 아티팩트에 포함되어 있는지 확인

### 인증 오류
- `FIREBASE_SERVICE_ACCOUNT` 값이 유효한 JSON인지 확인
- JSON을 복사할 때 전체 내용이 포함되었는지 확인
- 서비스 계정이 비활성화되지 않았는지 확인

## Secrets 체크리스트

GitHub Secrets에 등록할 항목:

- [ ] `FIREBASE_SERVICE_ACCOUNT` - 서비스 계정 JSON
- [ ] `FIREBASE_PROJECT_ID` - 프로젝트 ID
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

## 관련 파일

- `.github/workflows/ci.yml` - CI 워크플로우
- `.github/workflows/deploy.yml` - 배포 워크플로우
- `firebase.json` - Firebase 설정
- `.firebaserc` - Firebase 프로젝트 설정
- `.env.local.example` - 환경 변수 예시
