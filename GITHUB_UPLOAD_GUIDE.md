# GitHub 업로드 가이드

## 🔒 보안 검토 결과

### ✅ 안전한 항목 (공개 가능)

1. **OAuth 클라이언트 ID**
   - 카카오 REST API 키: `73351eeab7629b08c7d103fb8adc13ea` ✅
     - REST API 키는 클라이언트 측에서 사용하는 **공개 키**입니다
     - OAuth 표준에 따라 공개되어도 안전합니다
   - 네이버 클라이언트 ID: `uIXpJ0jlRq7LKujB7rcy` ✅
     - OAuth Client ID는 공개되어도 되는 값입니다

2. **API URL**
   - `https://dev-patient-api.onco-navi.app` ✅
     - 개발 서버 URL이므로 공개되어도 됩니다
     - 프로덕션 서버 URL이라면 환경 변수로 관리 권장

3. **Redirect URI**
   - OAuth Redirect URI는 공개되어도 안전합니다 ✅

### ⚠️ 확인 필요 항목

1. **하드코딩된 키**
   - 현재 OAuth 키가 하드코딩되어 있음
   - 프로덕션 키라면 환경 변수로 변경 권장
   - 개발 키라면 그대로 두어도 됩니다

2. **console.log**
   - 개발용 로그가 많이 포함되어 있음
   - 프로덕션 빌드 전에 제거하거나 조건부로 처리 권장

### ❌ 위험한 항목 (없음)

- ✅ OAuth Client Secret 없음
- ✅ API 토큰 하드코딩 없음
- ✅ 비밀번호 하드코딩 없음
- ✅ 개인 정보 하드코딩 없음

## 📋 업로드 전 체크리스트

- [x] `.env` 파일이 `.gitignore`에 포함되어 있음
- [x] OAuth Client Secret이 코드에 없음
- [x] 하드코딩된 비밀번호나 토큰 없음
- [x] `package.json`에 `"private": true` 설정됨
- [x] 빌드 아티팩트(`/ios`, `/android`)가 `.gitignore`에 있음
- [ ] (선택) 프로덕션 키가 있다면 환경 변수로 변경

## 🚀 GitHub 업로드 방법

### 1. Git 저장소 초기화 (아직 안 했다면)

```bash
cd /Users/ards/Documents/GitHub/patient-mobile
git init
```

### 2. .gitignore 확인

```bash
# .gitignore 파일이 올바르게 설정되어 있는지 확인
cat .gitignore
```

### 3. 파일 추가 및 첫 커밋

```bash
# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Patient Mobile App

- React Native/Expo 기반 모바일 앱
- 카카오/네이버/구글 OAuth 로그인
- 채팅, 검사지 해석, 마이페이지 기능
- patient-web과 동일한 백엔드 API 사용"
```

### 4. GitHub 저장소 생성 및 연결

1. **GitHub에서 새 저장소 생성**
   - https://github.com/new 접속
   - 저장소 이름: `patient-mobile` (또는 원하는 이름)
   - Public 또는 Private 선택
   - **README, .gitignore, license 추가하지 않기** (이미 있음)

2. **로컬 저장소와 연결**

```bash
# 원격 저장소 추가 (YOUR_USERNAME을 실제 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/patient-mobile.git

# 또는 SSH 사용 시
git remote add origin git@github.com:YOUR_USERNAME/patient-mobile.git

# 브랜치 이름을 main으로 설정
git branch -M main

# 업로드
git push -u origin main
```

### 5. 업로드 확인

GitHub 저장소 페이지에서 파일들이 올바르게 업로드되었는지 확인하세요.

## 🔐 추가 보안 권장사항

### 1. 환경 변수 사용 (선택사항)

프로덕션 키를 사용한다면 환경 변수로 관리하는 것을 권장합니다:

```typescript
// src/config/index.ts
export const oauthConfig: OAuthConfig = {
  kakao: {
    clientId: process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY || '',
    redirectUri: process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI || '',
  },
  // ...
};
```

### 2. .env.example 파일 생성

다른 개발자가 쉽게 설정할 수 있도록 예시 파일을 제공:

```bash
# .env.example
EXPO_PUBLIC_API_URL=https://dev-patient-api.onco-navi.app
EXPO_PUBLIC_KAKAO_REST_API_KEY=your_kakao_rest_api_key_here
EXPO_PUBLIC_KAKAO_REDIRECT_URI=https://dev-patient.onco-navi.app/auth/kakao/callback
```

### 3. README.md 작성

저장소에 README.md를 추가하여 프로젝트 설명과 설정 방법을 포함하세요.

## ⚠️ 주의사항

1. **의존성 패키지**: `@patient/shared`가 로컬 패키지(`file:../patient-shared`)이므로, 다른 개발자가 사용하려면:
   - `patient-shared` 패키지도 함께 공유하거나
   - npm/yarn registry에 배포하거나
   - Git submodule로 관리

2. **프로덕션 키**: 만약 하드코딩된 키가 프로덕션 키라면:
   - 환경 변수로 변경하거나
   - GitHub Secrets를 사용하여 CI/CD에서 주입

3. **개인 정보**: 코드에 개인 이메일, 전화번호 등이 있는지 최종 확인

## ✅ 최종 확인

업로드 전에 다음을 확인하세요:

```bash
# 커밋할 파일 목록 확인
git status

# .env 파일이 포함되지 않았는지 확인
git status | grep .env

# 민감한 정보가 포함된 파일 확인
git diff --cached | grep -i "password\|secret\|token\|api.*key"
```

위 명령어들이 아무것도 반환하지 않으면 안전하게 업로드할 수 있습니다!

