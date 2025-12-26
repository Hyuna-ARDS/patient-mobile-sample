# Patient Mobile App

React Native/Expo 기반의 환자 모바일 애플리케이션입니다. `patient-web`과 동일한 백엔드 API를 사용하며, 웹 앱의 디자인과 기능을 모바일에 최적화하여 구현했습니다.

## 📱 주요 기능

- **소셜 로그인**: 카카오, 네이버, 구글 OAuth 로그인 지원
- **채팅**: AI 어시스턴트와의 실시간 채팅
  - 채팅 히스토리 패널 (슬라이드 애니메이션)
  - 검사지 업로드 플로팅 패널 (채팅 입력창에서 접근)
  - 키보드 인식 및 자동 위치 조정
- **검사지 해석**: 검사 결과지 업로드 및 AI 해석
  - 플로팅 업로드 패널 (사진 촬영, 파일 선택)
  - 검사지 상태별 표시 (완료, 진행 중, 실패, 해석 불가)
  - 상세 해석 결과 및 치료 옵션 표시
- **마이페이지**: 사용자 정보 및 설정 관리

## 🛠 기술 스택

### Core
- **React Native** 0.81.5
- **Expo** ~54.0.30
- **TypeScript** 5.9.2

### Navigation
- **@react-navigation/native** 7.1.26
- **@react-navigation/native-stack** 7.9.0
- **@react-navigation/bottom-tabs** 7.9.0

### State Management
- **Zustand** 5.0.9 (전역 상태 관리)
- **@tanstack/react-query** 5.90.12 (서버 상태 관리)

### UI & Styling
- **StyleSheet** (React Native 기본 스타일링)
- **@expo/vector-icons** 15.0.3 (아이콘)
- **react-native-safe-area-context** 5.6.2 (Safe Area 처리)

### Authentication & Security
- **expo-web-browser** 15.0.10 (OAuth 웹 브라우저)
- **expo-secure-store** 15.0.8 (토큰 저장)
- **expo-linking** 8.0.11 (Deep Link 처리)

### Internationalization
- **i18next** 25.7.3
- **react-i18next** 16.5.0

### Other
- **axios** 1.13.2 (HTTP 클라이언트)
- **date-fns** 4.1.0 (날짜 처리)
- **react-hook-form** 7.69.0 (폼 관리)
- **zod** 4.2.1 (스키마 검증)

## 📁 프로젝트 구조

```
patient-mobile/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   └── ChatHistoryPanel.tsx
│   ├── config/              # 앱 설정
│   │   └── index.ts         # API URL, OAuth 설정
│   ├── hooks/               # 커스텀 훅
│   │   ├── useAuth.ts
│   │   ├── useGoogleAuth.ts
│   │   ├── useKakaoAuth.ts
│   │   └── useInterpretationRequests.ts
│   ├── i18n/                # 국제화 설정
│   │   └── index.ts
│   ├── lib/                 # 유틸리티
│   │   └── queryClient.ts
│   ├── navigation/          # 네비게이션 설정
│   │   └── index.tsx
│   ├── screens/             # 화면 컴포넌트
│   │   ├── LoginScreen.tsx
│   │   ├── MyScreen.tsx
│   │   ├── chat/
│   │   │   ├── ChatDetailScreen.tsx
│   │   │   └── ChatListScreen.tsx
│   │   └── lab/
│   │       ├── LabListScreen.tsx
│   │       └── LabDetailScreen.tsx
│   ├── services/            # API 서비스
│   │   ├── apiClient.ts
│   │   ├── ChatService.ts
│   │   └── InterpretationService.ts
│   ├── store/               # 상태 관리
│   │   └── authStore.ts
│   └── theme/               # 테마
│       └── colors.ts
├── assets/                   # 이미지, 아이콘 등
├── docs/                     # 문서
├── App.tsx                   # 앱 진입점
├── app.json                  # Expo 설정
└── package.json
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm, yarn, 또는 pnpm
- iOS 시뮬레이터 (macOS) 또는 Android 에뮬레이터
- Expo Go 앱 (실기기 테스트 시)

### 설치

```bash
# 저장소 클론
git clone https://github.com/YOUR_USERNAME/patient-mobile.git
cd patient-mobile

# 의존성 설치
npm install
# 또는
yarn install
# 또는
pnpm install
```

> **⚠️ 중요**: `patient-shared` 패키지가 없으면 앱을 실행할 수 없습니다. 
> `@patient/shared`는 API 클라이언트, i18n 리소스, 공통 타입 등을 제공하는 필수 의존성입니다.

### 환경 변수 설정 (선택사항)

프로젝트 루트에 `.env` 파일을 생성하세요:

```bash
# API 설정
EXPO_PUBLIC_API_URL=https://dev-patient-api.onco-navi.app

# 카카오 OAuth 설정
EXPO_PUBLIC_KAKAO_REST_API_KEY=your_kakao_rest_api_key_here
EXPO_PUBLIC_KAKAO_REDIRECT_URI=https://dev-patient.onco-navi.app/auth/kakao/callback

# 네이버 OAuth 설정 (선택사항)
EXPO_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id_here

# 구글 OAuth 설정 (선택사항)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

> **참고**: 환경 변수를 설정하지 않으면 `src/config/index.ts`의 기본값이 사용됩니다.

### 실행

```bash
# 개발 서버 시작
npm start
# 또는
yarn start
# 또는
pnpm start

# iOS 시뮬레이터에서 실행
npm run ios

# Android 에뮬레이터에서 실행
npm run android

# 웹 브라우저에서 실행
npm run web
```

## 🔐 인증 설정

### 카카오 로그인

1. [카카오 개발자 콘솔](https://developers.kakao.com/)에서 앱 등록
2. REST API 키 확인
3. Redirect URI 등록: `https://dev-patient.onco-navi.app/auth/kakao/callback`
4. `src/config/index.ts` 또는 `.env`에 REST API 키 설정

### 네이버 로그인

1. [네이버 개발자 센터](https://developers.naver.com/)에서 앱 등록
2. Client ID 확인
3. Redirect URI 등록
4. `src/config/index.ts` 또는 `.env`에 Client ID 설정

### 구글 로그인

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. OAuth 2.0 클라이언트 ID 생성
3. `src/config/index.ts` 또는 `.env`에 Client ID 설정

## 📦 의존성 패키지

### 공유 패키지 (`@patient/shared`)

이 프로젝트는 **필수 의존성**인 `@patient/shared` 패키지를 사용합니다. 이 패키지는 다음을 제공합니다:

- API 클라이언트 (`createApiClient`)
- i18n 리소스 (번역 JSON 파일)
- 공통 타입 정의
- 환경 설정 추상화

#### 설정

`@patient/shared` 패키지는 현재 레포지토리의 `packages/shared` 폴더에 포함되어 있습니다.

```bash
# 프로젝트 디렉토리 구조
patient-mobile/
├── packages/
│   └── shared/          # @patient/shared 패키지 (포함됨)
├── src/
├── package.json
└── ...
```

별도의 설정 없이 바로 사용할 수 있습니다:

```bash
npm install
npm start
```

#### 확인 방법

설치가 제대로 되었는지 확인:

```bash
npm list @patient/shared
```

정상적으로 설치되었다면 다음과 같이 표시됩니다:
```
`-- @patient/shared@0.0.1 -> ./packages/shared
```

#### 문제 해결

만약 `@patient/shared` 관련 오류가 발생한다면:

1. **오류 예시**:
   ```
   Error: Cannot find module '@patient/shared'
   ```

2. **해결 방법**:
   - `packages/shared` 폴더가 존재하는지 확인
   - `npm install`을 다시 실행
   - `metro.config.js`의 경로 설정 확인

## 🎨 스타일링

이 프로젝트는 React Native의 기본 `StyleSheet.create()` 방식을 사용합니다.

- **색상 관리**: `src/theme/colors.ts`에서 중앙 집중식 관리
- **스타일 패턴**: 각 컴포넌트에서 `StyleSheet.create()` 사용
- **디자인 시스템**: `patient-web`과 동일한 색상 시스템 사용

## 🌐 국제화 (i18n)

- **언어 지원**: 한국어, 영어
- **설정 파일**: `src/i18n/index.ts`
- **번역 리소스**: `@patient/shared` 패키지에서 공유

## 📱 네비게이션 구조

```
RootNavigator
├── AuthNavigator (로그인)
│   └── LoginScreen
└── MainNavigator (메인)
    ├── Chat (채팅)
    │   ├── ChatListScreen
    │   └── ChatDetailScreen
    │       └── 플로팅 업로드 패널 (검사지 버튼)
    ├── Lab (검사지해석)
    │   ├── LabListScreen
    │   │   └── 플로팅 업로드 패널
    │   └── LabDetailScreen
    └── My (마이페이지)
        └── MyScreen
```

> **참고**: 검사지 업로드는 별도 화면이 아닌 플로팅 패널로 구현되어 있습니다.
> - 채팅 화면: 채팅 입력창의 "검사지" 버튼 클릭 시 패널 표시
> - 검사지 목록 화면: 하단 플로팅 버튼 클릭 시 패널 표시

## 🔧 개발 가이드

### 코드 스타일

- TypeScript 사용
- 함수형 컴포넌트 및 Hooks 사용
- `StyleSheet.create()`로 스타일 정의
- `src/theme/colors.ts`의 색상 사용

### API 클라이언트

- `src/services/apiClient.ts`: 공통 API 클라이언트
- `@patient/shared` 패키지의 API 클라이언트 사용
- 토큰은 `expo-secure-store`에 저장

### 상태 관리

- **전역 상태**: Zustand (`src/store/authStore.ts`)
- **서버 상태**: React Query (`src/lib/queryClient.ts`)

## 📚 참고 문서

- [docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) - 상세 설정 가이드
- [docs/IMPROVEMENTS.md](./docs/IMPROVEMENTS.md) - 개선 및 추가 사항
- [docs/mobile.md](./docs/mobile.md) - 모바일 앱 개발 가이드

## ✨ 주요 UI/UX 기능

### 플로팅 업로드 패널
- **위치**: 검사지 버튼 바로 위에 표시
- **키보드 인식**: 키보드가 올라와도 키보드 위에 자동 위치 조정
- **옵션**: 사진 촬영, 파일 선택
- **애니메이션**: 슬라이드 업/다운 효과

### 채팅 히스토리 패널
- **슬라이드 애니메이션**: 좌측에서 슬라이드 인/아웃
- **이전 대화 목록**: 채팅 제목, 마지막 메시지, 타임스탬프 표시

### 검사지 상태 관리
- **완료**: 클릭 가능, 상세 결과 확인 가능
- **진행 중**: 클릭 불가, 상태 배지 표시
- **실패/해석 불가**: 클릭 불가, 상태 배지 표시

## 🐛 문제 해결

### Metro Bundler 오류

```bash
# 캐시 클리어
npx expo start --clear
```

### 의존성 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

### TypeScript 오류

```bash
# 타입 체크
npx tsc --noEmit
```

## 📄 라이선스

이 프로젝트는 비공개 프로젝트입니다.

## 👥 기여

이 프로젝트는 내부 프로젝트입니다. 기여 관련 문의는 프로젝트 관리자에게 연락하세요.

## 🔗 관련 프로젝트

- [patient-web](../patient-web) - 웹 애플리케이션
- `@patient/shared` 패키지는 현재 레포지토리의 `packages/shared`에 포함되어 있습니다.

