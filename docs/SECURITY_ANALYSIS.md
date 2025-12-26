# 구글 로그인 보안 분석: HTTPS Redirect URI vs Custom URL Scheme

## 현재 구현 방식: HTTPS Redirect URI + Universal Links/App Links

### 보안 고려사항

#### ✅ 장점
1. **표준 OAuth 2.0 플로우**: 웹과 동일한 표준 방식 사용
2. **HTTPS 통신**: 모든 통신이 암호화됨
3. **Universal Links/App Links 검증**: iOS/Android가 도메인 소유권을 검증
4. **백엔드 호환성**: 웹과 동일한 redirect URI 사용 가능

#### ⚠️ 잠재적 보안 문제

1. **토큰이 URL에 노출**
   - 문제: `https://dev-patient.onco-navi.app/auth/google/callback?token=xxx`
   - 토큰이 브라우저 히스토리, 서버 로그, Referer 헤더에 남을 수 있음
   - 완화: 백엔드가 임시 토큰(단기 유효)을 사용하고 즉시 교환하므로 위험도 낮음

2. **CSRF 공격 가능성**
   - 문제: 악의적인 사이트에서 사용자를 리다이렉트할 수 있음
   - 완화: 백엔드가 state 파라미터나 세션 검증을 사용해야 함
   - 현재: patient-web에서 state 파라미터를 사용하지 않는 것으로 보임

3. **Universal Links 검증 실패**
   - 문제: 설정이 잘못되면 웹 브라우저로 리다이렉트됨
   - 완화: Custom URL Scheme을 백업으로 사용 가능

4. **토큰 재사용 공격**
   - 문제: URL에 노출된 토큰을 다른 사람이 사용할 수 있음
   - 완화: 백엔드가 토큰을 일회용으로 처리하고 짧은 유효기간 설정 필요

### 기술적 문제

1. **Universal Links/App Links 설정 복잡도**
   - iOS: Apple Developer Console에서 Associated Domains 설정 필요
   - Android: `.well-known/assetlinks.json` 파일 배치 필요
   - 도메인 소유권 검증 필요

2. **백엔드 모바일 감지**
   - 백엔드가 User-Agent나 다른 방법으로 모바일 요청을 감지해야 함
   - 또는 모바일 전용 파라미터 전달 필요

3. **폴백 처리**
   - Universal Links가 작동하지 않으면 웹 페이지로 리다이렉트됨
   - 사용자가 웹 페이지에서 토큰을 볼 수 있음

### 권장 보안 강화 방안

1. **State 파라미터 추가** (CSRF 방어)
   ```typescript
   // 로그인 시작 시 state 생성 및 저장
   const state = crypto.randomUUID();
   await SecureStore.setItemAsync("oauth_state", state);
   
   // 콜백에서 state 검증
   const savedState = await SecureStore.getItemAsync("oauth_state");
   if (parsed.queryParams?.state !== savedState) {
     // CSRF 공격 가능성
     return;
   }
   ```

2. **토큰 만료 시간 단축**
   - 백엔드가 임시 토큰을 5분 이내로 제한
   - 일회용 토큰으로 처리

3. **PKCE (Proof Key for Code Exchange) 사용**
   - OAuth 2.0의 보안 강화 확장
   - 모바일 앱에 권장되는 방식

4. **토큰 교환 즉시 처리**
   - URL에서 토큰을 받자마자 백엔드로 전송
   - 메모리에만 보관, 로그에 남기지 않음

## 대안: Custom URL Scheme (onconavi://)

### 장점
- 설정이 간단함 (app.json만 수정)
- 백엔드 설정 변경 불필요
- Universal Links 설정 불필요

### 단점
- 보안성: Custom URL Scheme은 검증되지 않음
- 다른 앱이 동일한 scheme을 사용할 수 있음
- iOS에서 경고 메시지 표시 가능

## 결론 및 권장사항

**현재 방식 (HTTPS + Universal Links)이 더 안전하지만, 다음 보안 강화 필요:**

1. ✅ State 파라미터로 CSRF 방어 추가
2. ✅ 토큰을 즉시 교환하고 URL에서 제거
3. ✅ 백엔드에서 토큰 만료 시간 단축
4. ⚠️ Universal Links 설정이 복잡하므로 Custom URL Scheme을 백업으로 유지

**최종 권장:**
- HTTPS Redirect URI + Universal Links 사용 (표준 방식)
- Custom URL Scheme을 백업으로 유지
- State 파라미터 추가로 보안 강화

