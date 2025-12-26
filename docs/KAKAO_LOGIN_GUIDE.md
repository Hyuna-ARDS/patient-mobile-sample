# 카카오 로그인 구현 가이드

## 현재 구현 방식 (웹 OAuth 플로우)

### ✅ 현재 방식의 특징
- **카카오 SDK 불필요**: `expo-web-browser`만 사용
- **REST API 키 사용**: 네이티브 앱 키가 아닌 REST API 키 사용
- **Deep Link 불필요**: 웹 URL을 redirectUri로 사용
- **patient-web과 동일한 백엔드 로직**: `/auth/social` API 사용

### 🔑 필요한 키: REST API 키
현재 `src/config/index.ts`에 하드코딩된 `clientId`는 **REST API 키**입니다:
```typescript
kakao: {
  clientId: '73351eeab7629b08c7d103fb8adc13ea', // 이것은 REST API 키
  redirectUri: 'https://dev-patient.onco-navi.app/auth/kakao/callback',
}
```

### 📍 REST API 키 위치
- 카카오 개발자 콘솔 > 내 애플리케이션 > 앱 선택 > 앱 키
- **REST API 키**를 사용 (네이티브 앱 키 아님)

### ⚙️ 설정 방법

#### 1. 환경 변수로 관리 (권장)
`.env` 파일 생성:
```bash
EXPO_PUBLIC_KAKAO_REST_API_KEY=73351eeab7629b08c7d103fb8adc13ea
EXPO_PUBLIC_KAKAO_REDIRECT_URI=https://dev-patient.onco-navi.app/auth/kakao/callback
```

`src/config/index.ts` 수정:
```typescript
export const oauthConfig: OAuthConfig = {
  kakao: {
    clientId: process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY || '',
    redirectUri: process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI || 'https://dev-patient.onco-navi.app/auth/kakao/callback',
  },
  // ...
};
```

#### 2. 카카오 개발자 콘솔 설정
- **플랫폼 설정**: 웹 플랫폼 추가
- **Redirect URI 등록**: `https://dev-patient.onco-navi.app/auth/kakao/callback`

### 🔄 작동 방식
1. 앱에서 카카오 로그인 버튼 클릭
2. `WebBrowser.openAuthSessionAsync`로 카카오 인증 페이지 열기
3. 사용자가 카카오 로그인 완료
4. 카카오가 웹 URL(`redirectUri`)로 리다이렉트
5. WebBrowser가 리다이렉트를 감지하고 결과 반환
6. URL에서 `code` 추출
7. 백엔드 `/auth/social` API 호출하여 토큰 받기

---

## 대안: 카카오 SDK 사용 방식

### 📦 필요한 패키지
```bash
npx expo install @react-native-seoul/kakao-login
```

### 🔑 필요한 키: 네이티브 앱 키
- 카카오 개발자 콘솔 > 내 애플리케이션 > 앱 선택 > 앱 키
- **네이티브 앱 키**를 사용

### ⚙️ 설정 방법

#### 1. app.json 설정
```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-seoul/kakao-login",
        {
          "kakaoAppKey": "YOUR_NATIVE_APP_KEY"
        }
      ]
    ]
  }
}
```

#### 2. iOS Info.plist 설정 (네이티브 빌드 시)
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>kakao{YOUR_NATIVE_APP_KEY}</string>
    </array>
  </dict>
</array>
```

#### 3. 구현 예시
```typescript
import { login, getProfile } from '@react-native-seoul/kakao-login';

const handleKakaoLogin = async () => {
  try {
    const token = await login();
    const profile = await getProfile();
    // 백엔드에 토큰 전달하여 로그인 처리
  } catch (error) {
    console.error(error);
  }
};
```

### ⚖️ 두 방식 비교

| 항목 | 웹 OAuth (현재) | 카카오 SDK |
|------|----------------|-----------|
| **키 종류** | REST API 키 | 네이티브 앱 키 |
| **SDK 필요** | ❌ 불필요 | ✅ 필요 |
| **Deep Link** | ❌ 불필요 | ✅ 필요 (Custom URL Scheme) |
| **사용자 경험** | 브라우저 열림 | 앱 내에서 처리 |
| **구현 복잡도** | 낮음 | 중간 |
| **백엔드 호환** | ✅ patient-web과 동일 | ⚠️ 백엔드 수정 필요할 수 있음 |

---

## 권장 사항

### 현재 방식 유지 (웹 OAuth)
- ✅ patient-web과 동일한 백엔드 로직 사용
- ✅ 구현이 간단하고 유지보수 용이
- ✅ Deep Link 설정 불필요
- ⚠️ 브라우저가 열리는 UX (하지만 일반적으로 허용됨)

### 카카오 SDK로 전환하는 경우
- ✅ 더 나은 사용자 경험 (앱 내에서 처리)
- ✅ 네이티브 기능 활용 가능
- ⚠️ 백엔드 로직 수정 필요할 수 있음
- ⚠️ 추가 설정 및 빌드 필요

---

## 현재 구현에서 앱 키 관리

### 방법 1: 환경 변수 사용 (권장)
```bash
# .env
EXPO_PUBLIC_KAKAO_REST_API_KEY=your_rest_api_key_here
```

### 방법 2: config 파일에 직접 입력
```typescript
// src/config/index.ts
export const oauthConfig: OAuthConfig = {
  kakao: {
    clientId: 'your_rest_api_key_here', // REST API 키
    redirectUri: 'https://dev-patient.onco-navi.app/auth/kakao/callback',
  },
};
```

### 방법 3: SecureStore 사용 (런타임에 설정)
런타임에 키를 설정하는 방식도 가능하지만, 일반적으로는 환경 변수나 config 파일 사용을 권장합니다.

---

## 질문과 답변

### Q: 네이티브 앱 키는 어디에 둬야 하나요?
**A:** 현재 구현 방식(웹 OAuth)에서는 **네이티브 앱 키가 필요 없습니다**. REST API 키만 사용합니다.

### Q: 카카오 SDK를 사용하지 않고 어떻게 로그인이 되나요?
**A:** 웹 OAuth 플로우를 사용합니다. 카카오의 웹 인증 페이지를 브라우저로 열고, 인증 후 받은 `code`를 백엔드로 전달하여 토큰을 받습니다. 이는 patient-web과 동일한 방식입니다.

### Q: REST API 키와 네이티브 앱 키의 차이는?
**A:**
- **REST API 키**: 웹 OAuth, REST API 호출 시 사용
- **네이티브 앱 키**: 카카오 SDK 사용 시 필요, 앱의 고유 식별자

### Q: 현재 방식에서 앱 키를 어디에 두나요?
**A:** 
1. 환경 변수로 관리 (`.env` 파일) - **권장**
2. `src/config/index.ts`에 직접 입력
3. SecureStore에 저장 (런타임 설정)

---

## 다음 단계

1. **환경 변수 설정**: `.env` 파일 생성 및 REST API 키 설정
2. **카카오 개발자 콘솔**: Redirect URI 등록 확인
3. **테스트**: 카카오 로그인 플로우 테스트

