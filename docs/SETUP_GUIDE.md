# Patient Mobile App 설정 가이드

이 문서는 `mobile.md`를 기반으로 설정된 모바일 앱의 구조와 다음 단계를 설명합니다.

## 완료된 작업

### 1. 패키지 설치
- ✅ Expo 및 React Native 코어 패키지
- ✅ React Navigation (Stack, Bottom Tabs)
- ✅ i18next 및 react-i18next
- ✅ @tanstack/react-query
- ✅ react-hook-form, zod
- ✅ expo-secure-store (토큰 저장)
- ✅ 기타 필수 패키지

### 2. 공통 패키지 (`patient-shared`)
- ✅ `@patient/shared` 패키지 생성 및 빌드
- ✅ i18n 리소스 (번역 JSON 파일)
- ✅ 플랫폼 중립 API 클라이언트
- ✅ 공통 타입 정의
- ✅ 환경 설정 추상화

### 3. 모바일 앱 구조
- ✅ i18n 설정 (AsyncStorage 사용)
- ✅ 네비게이션 구조 (AuthStack → MainTabs)
- ✅ API 클라이언트 (SecureStore 사용)
- ✅ 기본 화면 (HomeScreen, LoginScreen)

## 프로젝트 구조

```
patient-mobile/
├── src/
│   ├── i18n/          # i18n 설정 (공통 패키지 리소스 사용)
│   ├── navigation/    # React Navigation 설정
│   ├── screens/       # 화면 컴포넌트
│   ├── services/      # API 클라이언트 등 서비스
│   ├── config/        # 앱 설정
│   └── hooks/         # 커스텀 훅
├── App.tsx            # 앱 진입점
└── package.json
```

## 다음 단계

### 1. 환경 변수 설정
`.env` 파일을 생성하고 API URL을 설정하세요:
```
EXPO_PUBLIC_API_URL=https://your-api-url.com
```

### 2. OAuth 인증 구현
`src/screens/LoginScreen.tsx`에 OAuth 로그인 버튼을 추가하고, `expo-auth-session`을 사용하여 인증을 구현하세요.

참고: `src/config/index.ts`에 OAuth 설정이 있습니다.

### 3. 인증 상태 관리
- `src/navigation/index.tsx`의 `isAuthenticated`를 실제 인증 상태로 교체
- Zustand나 React Context를 사용하여 전역 인증 상태 관리

### 4. 화면 구현
웹 앱의 화면을 참고하여 모바일 친화적으로 구현:
- 홈 화면
- 리포트 목록/상세
- 채팅 화면
- 설정 화면

### 5. 디자인 토큰 적용
웹 앱의 디자인 토큰을 `patient-shared/src/theme/tokens.ts`에 추가하고, 모바일에서 사용하세요.

### 6. React Query 설정
`@tanstack/react-query`를 사용하여 데이터 페칭을 구현하세요.

## 공통 패키지 사용법

### i18n 리소스
```typescript
import { resources, LANGUAGE_STORAGE_KEY } from "@patient/shared/i18n/resources";
```

### API 클라이언트
```typescript
import { createApiClient, type TokenStorage } from "@patient/shared/api/client";
```

### 타입
```typescript
import type { LabReportData } from "@patient/shared/types";
```

## 개발 명령어

```bash
# 개발 서버 시작
npm start

# iOS 시뮬레이터에서 실행
npm run ios

# Android 에뮬레이터에서 실행
npm run android
```

## 공통 패키지 빌드

공통 패키지를 수정한 후:
```bash
cd ../patient-shared
npm run build
```

그리고 모바일 앱에서 다시 설치:
```bash
cd ../patient-mobile
npm install ../patient-shared
```

## 참고사항

- 웹 앱의 디자인을 모바일 친화적으로 변환하되, 터치 타깃 크기와 키보드 대응을 고려하세요
- 네비게이션 흐름은 웹 앱과 동일하게 유지하되, 모바일 UX 패턴을 따르세요
- 느린 네트워크와 오프라인 상황을 고려한 에러 처리와 재시도 로직을 구현하세요

