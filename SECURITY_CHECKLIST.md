# 보안 체크리스트 - GitHub 업로드 전 확인사항

## ✅ 안전한 항목 (공개 가능)

### 1. OAuth 클라이언트 ID
- **카카오 REST API 키**: `73351eeab7629b08c7d103fb8adc13ea`
  - ✅ **공개 가능**: REST API 키는 클라이언트 측에서 사용하는 공개 키입니다
  - ⚠️ **주의**: 프로덕션 키라면 별도 관리 고려
  
- **네이버 클라이언트 ID**: `uIXpJ0jlRq7LKujB7rcy`
  - ✅ **공개 가능**: OAuth Client ID는 공개되어도 되는 값입니다

### 2. API URL
- **개발 서버**: `https://dev-patient-api.onco-navi.app`
  - ✅ **공개 가능**: 개발 서버 URL은 일반적으로 공개되어도 됩니다
  - ⚠️ **주의**: 프로덕션 서버 URL이라면 별도 관리 고려

### 3. Redirect URI
- ✅ **공개 가능**: OAuth Redirect URI는 공개되어도 됩니다

## ⚠️ 확인 필요 항목

### 1. OAuth 클라이언트 시크릿 (Client Secret)
- ❌ **절대 공개 금지**: Client Secret이 코드에 포함되어 있는지 확인
- ✅ **현재 상태**: 코드에 Client Secret 없음 (안전)

### 2. 환경 변수 파일
- ✅ `.env` 파일이 `.gitignore`에 포함되어 있음
- ✅ `.env*.local` 파일도 무시됨

### 3. 하드코딩된 키
- ⚠️ **현재 상태**: OAuth Client ID가 하드코딩되어 있음
- 💡 **권장**: 환경 변수로 관리하거나, 최소한 프로덕션 키는 제거

## 🔒 보안 권장사항

### 1. 환경 변수 사용 (권장)
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
```bash
# .env.example (공개 가능)
EXPO_PUBLIC_API_URL=https://dev-patient-api.onco-navi.app
EXPO_PUBLIC_KAKAO_REST_API_KEY=your_kakao_rest_api_key_here
EXPO_PUBLIC_KAKAO_REDIRECT_URI=https://dev-patient.onco-navi.app/auth/kakao/callback
```

### 3. 프로덕션 키 제거
- 프로덕션 OAuth 키가 있다면 제거하고 환경 변수로만 관리
- 개발 키만 남기거나 예시 값으로 교체

## 📋 업로드 전 최종 체크리스트

- [ ] `.env` 파일이 존재하지 않거나 `.gitignore`에 포함되어 있는지 확인
- [ ] OAuth Client Secret이 코드에 없는지 확인 ✅
- [ ] 하드코딩된 프로덕션 키가 없는지 확인
- [ ] API 토큰이나 비밀번호가 코드에 없는지 확인 ✅
- [ ] 개인 정보나 민감한 데이터가 없는지 확인 ✅
- [ ] `package.json`에 `"private": true` 설정 확인 ✅
- [ ] 빌드 아티팩트(`/ios`, `/android`)가 `.gitignore`에 있는지 확인 ✅

## 🚀 GitHub 업로드 방법

### 1. Git 초기화 (아직 안 했다면)
```bash
cd /Users/ards/Documents/GitHub/patient-mobile
git init
```

### 2. .gitignore 확인
```bash
cat .gitignore
```

### 3. 파일 추가 및 커밋
```bash
git add .
git commit -m "Initial commit: Patient Mobile App"
```

### 4. GitHub 저장소 생성 및 연결
```bash
# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/patient-mobile.git
git branch -M main
git push -u origin main
```

## ⚠️ 주의사항

1. **프로덕션 키**: 만약 하드코딩된 키가 프로덕션 키라면, 환경 변수로 변경하거나 제거
2. **API URL**: 프로덕션 서버 URL이라면 환경 변수로 관리
3. **개인 정보**: 코드에 개인 이메일, 전화번호 등이 있는지 확인
4. **의존성**: `@patient/shared`가 로컬 패키지이므로, 다른 개발자가 사용하려면 별도 설정 필요

## 📝 권장 README 내용

README.md에 다음 내용을 포함하는 것을 권장합니다:

```markdown
## 환경 설정

1. `.env` 파일 생성:
```bash
cp .env.example .env
```

2. `.env` 파일에 실제 값 입력:
- `EXPO_PUBLIC_API_URL`: API 서버 URL
- `EXPO_PUBLIC_KAKAO_REST_API_KEY`: 카카오 REST API 키
- `EXPO_PUBLIC_KAKAO_REDIRECT_URI`: 카카오 Redirect URI
```

