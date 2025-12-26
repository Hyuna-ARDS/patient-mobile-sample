# Patient Mobile App 개선 및 추가 사항

이 문서는 `patient-web`과 `patient-mobile`을 비교하여 모바일 앱에서 개선하거나 추가해야 할 기능들을 정리한 것입니다.

## 📋 목차

1. [인증 및 OAuth](#1-인증-및-oauth)
2. [알림 시스템](#2-알림-시스템)
3. [검사지 해석 상태 체크](#3-검사지-해석-상태-체크)
4. [채팅 기능](#4-채팅-기능)
5. [검사지 관리](#5-검사지-관리)
6. [에러 처리](#6-에러-처리)
7. [언어 전환](#7-언어-전환)
8. [사용자 경험 개선](#8-사용자-경험-개선)
9. [성능 최적화](#9-성능-최적화)
10. [모바일 특화 기능](#10-모바일-특화-기능)
11. [우선순위 추천](#우선순위-추천)

---

## 1. 인증 및 OAuth

### 현재 상태
- ✅ Google OAuth 부분 구현
- ⚠️ 카카오/네이버 OAuth는 임시 버튼만 존재 (실제 구현 없음)
- ⚠️ 인증 상태 체크가 주석 처리되어 있음 (`RootNavigator`)

### 개선 필요 사항

#### 1.1 카카오/네이버 OAuth 구현
- **파일**: `src/hooks/useKakaoAuth.ts`, `src/hooks/useNaverAuth.ts`
- **참고**: `patient-web/src/hooks/useOAuth.ts`
- **구현 내용**:
  - `expo-auth-session`을 사용한 OAuth 플로우
  - Deep Link 콜백 처리
  - 토큰 저장 및 사용자 정보 가져오기

#### 1.2 OAuth 콜백 처리 개선
- **파일**: `src/navigation/index.tsx`, `App.tsx`
- **현재**: Google만 Deep Link 처리
- **개선**: 카카오/네이버 콜백도 동일하게 처리

#### 1.3 인증 상태 체크 활성화
- **파일**: `src/navigation/index.tsx`
- **현재**: `RootNavigator`에서 인증 체크가 주석 처리됨
- **개선**: 
  ```typescript
  // 주석 처리된 코드 활성화
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsInitializing(false);
    };
    initAuth();
  }, [checkAuth]);
  ```

#### 1.4 세션 만료 처리
- **파일**: `src/components/SessionExpiryDialog.tsx` (신규 생성)
- **참고**: `patient-web/src/components/SessionExpiryDialog.tsx`
- **구현 내용**:
  - 토큰 만료 시 다이얼로그 표시
  - 로그아웃 후 로그인 화면으로 이동
  - 현재 경로 저장하여 로그인 후 복귀

---

## 2. 알림 시스템

### 현재 상태
- ❌ 알림 시스템 없음

### 추가 필요 사항

#### 2.1 알림 훅 구현
- **파일**: `src/hooks/useNotifications.ts` (신규 생성)
- **참고**: `patient-web/src/hooks/useNotifications.ts`
- **기능**:
  - 알림 목록 관리
  - 읽음/안 읽음 상태 관리
  - AsyncStorage에 알림 저장
  - 알림 개수 계산

#### 2.2 알림 패널 컴포넌트
- **파일**: `src/components/NotificationPanel.tsx` (신규 생성)
- **참고**: `patient-web/src/components/NotificationPanel.tsx`
- **기능**:
  - 알림 목록 표시
  - 읽음 처리
  - 알림 클릭 시 관련 화면으로 이동
  - 시간 표시 (상대 시간)

#### 2.3 헤더에 알림 아이콘 추가
- **파일**: `src/screens/chat/ChatDetailScreen.tsx`, `src/screens/MyScreen.tsx`
- **기능**:
  - 알림 아이콘 및 배지 표시
  - 알림 패널 열기/닫기
  - 알림 개수 표시

#### 2.4 검사지 해석 완료 알림
- **파일**: `src/hooks/useInterpretationStatusCheck.ts` (신규 생성)
- **기능**:
  - 검사지 해석 상태 변경 감지
  - 완료 시 알림 생성
  - 실패 시 알림 생성

#### 2.5 푸시 알림 (선택 사항)
- **패키지**: `expo-notifications`
- **기능**:
  - 백그라운드 푸시 알림
  - 로컬 알림 스케줄링
  - 알림 권한 요청

---

## 3. 검사지 해석 상태 체크

### 현재 상태
- ⚠️ 수동 새로고침만 가능
- ⚠️ 상태 변경 시 자동 업데이트 없음

### 추가 필요 사항

#### 3.1 상태 체크 훅 구현
- **파일**: `src/hooks/useInterpretationStatusCheck.ts` (신규 생성)
- **참고**: `patient-web/src/hooks/useInterpretationStatusCheck.ts`
- **기능**:
  - 주기적 상태 체크 (예: 30초마다)
  - 상태 변경 감지
  - 알림 생성
  - 채팅 메시지 자동 업데이트

#### 3.2 백그라운드 상태 체크
- **파일**: `src/hooks/useNotificationCheckTimer.ts` (신규 생성)
- **기능**:
  - 앱이 포그라운드에 있을 때만 체크
  - 효율적인 폴링 (exponential backoff)
  - 상태 캐시 관리

#### 3.3 자동 채팅 메시지 업데이트
- **파일**: `src/screens/chat/ChatDetailScreen.tsx`
- **기능**:
  - 검사지 해석 완료 시 자동으로 채팅에 메시지 추가
  - "검사지 분석이 완료되었습니다!" 메시지 표시
  - 실패 시 에러 메시지 표시

---

## 4. 채팅 기능

### 현재 상태
- ✅ 기본 채팅 구현 완료
- ⚠️ 채팅 히스토리가 Mock 데이터
- ⚠️ 채팅 세션 관리 없음

### 개선 필요 사항

#### 4.1 채팅 히스토리 API 연동
- **파일**: `src/services/ChatService.ts`
- **기능**:
  - 채팅 목록 조회 API
  - 채팅 세션 생성
  - 채팅 제목 자동 생성/수정

#### 4.2 채팅 세션 관리
- **파일**: `src/hooks/useChatState.ts` (신규 생성)
- **참고**: `patient-web/src/hooks/useChatState.ts`
- **기능**:
  - 활성 채팅 세션 관리
  - 채팅 히스토리 상태 관리
  - 제안 질문 관리

#### 4.3 검사지 해석 완료 시 자동 채팅 메시지
- **파일**: `src/screens/chat/ChatDetailScreen.tsx`
- **기능**:
  - 해석 완료 시 자동으로 채팅에 결과 요약 추가
  - "검사지 분석이 완료되었습니다!" 메시지
  - 결과 요약 링크/버튼

#### 4.4 채팅 검색 기능 (선택 사항)
- **파일**: `src/components/ChatHistoryPanel.tsx`
- **기능**:
  - 채팅 히스토리 검색
  - 메시지 내용 검색

---

## 5. 검사지 관리

### 현재 상태
- ✅ 검사지 목록 조회
- ✅ 검사지 업로드
- ✅ 검사지 상세 보기
- ❌ 검사지 편집 없음
- ❌ 검사지 삭제 없음

### 추가 필요 사항

#### 5.1 검사지 편집 기능
- **파일**: `src/components/EditReportDialog.tsx` (신규 생성)
- **참고**: `patient-web/src/components/EditReportDialog.tsx`
- **기능**:
  - 검사지 제목 수정
  - 검사일 수정
  - 병원명 수정
  - 저장 후 API 업데이트

#### 5.2 검사지 삭제 기능
- **파일**: `src/components/DeleteReportDialog.tsx` (신규 생성)
- **참고**: `patient-web/src/components/Main/DeleteReportDialog.tsx`
- **기능**:
  - 삭제 확인 다이얼로그
  - API 삭제 요청
  - 목록에서 제거

#### 5.3 검사지 공유 기능 (선택 사항)
- **기능**:
  - 검사지 결과 공유
  - PDF 생성 및 공유
  - 링크 공유

---

## 6. 에러 처리

### 현재 상태
- ⚠️ 기본 에러 처리만 존재
- ❌ 에러 바운더리 없음

### 추가 필요 사항

#### 6.1 에러 바운더리 구현
- **파일**: `src/components/error/AppErrorBoundary.tsx` (신규 생성)
- **참고**: `patient-web/src/components/error/AppErrorBoundary.tsx`
- **기능**:
  - React Error Boundary 구현
  - 에러 로깅 (선택: Sentry 등)
  - 에러 발생 시 폴백 UI 표시
  - 재시도 기능

#### 6.2 에러 폴백 컴포넌트
- **파일**: `src/components/error/ErrorFallback.tsx` (신규 생성)
- **참고**: `patient-web/src/components/error/ErrorFallback.tsx`
- **기능**:
  - 사용자 친화적인 에러 메시지
  - 재시도 버튼
  - 홈으로 돌아가기 버튼

#### 6.3 네트워크 에러 처리
- **파일**: `src/services/apiClient.ts`
- **기능**:
  - 네트워크 연결 확인
  - 타임아웃 처리
  - 재시도 로직

#### 6.4 오프라인 상태 처리
- **패키지**: `@react-native-community/netinfo`
- **기능**:
  - 네트워크 상태 감지
  - 오프라인 상태 표시
  - 오프라인 시 캐시된 데이터 표시

---

## 7. 언어 전환

### 현재 상태
- ✅ i18n 설정 완료
- ❌ 언어 전환 UI 없음

### 추가 필요 사항

#### 7.1 언어 전환 컴포넌트
- **파일**: `src/components/LanguageSwitcher.tsx` (신규 생성)
- **참고**: `patient-web/src/components/LanguageSwitcher.tsx`
- **기능**:
  - 한국어/영어 전환
  - 드롭다운 또는 토글 버튼

#### 7.2 마이페이지에 언어 설정 추가
- **파일**: `src/screens/MyScreen.tsx`
- **기능**:
  - 언어 설정 메뉴 항목 추가
  - 언어 선택 다이얼로그

---

## 8. 사용자 경험 개선

### 현재 상태
- ✅ 일부 화면에 Pull-to-refresh 구현
- ⚠️ 로딩 상태는 기본 ActivityIndicator만 사용

### 개선 필요 사항

#### 8.1 로딩 스켈레톤
- **파일**: `src/components/SkeletonLoader.tsx` (신규 생성)
- **기능**:
  - 검사지 목록 스켈레톤
  - 채팅 메시지 스켈레톤
  - 검사지 상세 스켈레톤

#### 8.2 빈 상태 개선
- **파일**: 각 화면 컴포넌트
- **기능**:
  - 일관된 빈 상태 디자인
  - 액션 가이드 (예: "검사지를 업로드해보세요")
  - 일러스트 또는 아이콘 추가

#### 8.3 토스트 알림
- **패키지**: `react-native-toast-message` 또는 커스텀 구현
- **기능**:
  - 성공/에러/정보 토스트
  - 검사지 업로드 완료 토스트
  - 메시지 전송 완료 토스트

#### 8.4 Pull-to-refresh 일관성
- **파일**: 모든 목록 화면
- **기능**:
  - 모든 목록에 Pull-to-refresh 적용
  - 일관된 새로고침 동작

---

## 9. 성능 최적화

### 현재 상태
- ✅ FlatList 최적화 적용 (removeClippedSubviews 등)
- ⚠️ 이미지 최적화 없음

### 개선 필요 사항

#### 9.1 이미지 최적화
- **패키지**: `expo-image`
- **파일**: 모든 Image 컴포넌트
- **기능**:
  - `expo-image`로 교체 (기본 `Image` 대신)
  - 이미지 캐싱
  - 로딩 플레이스홀더

#### 9.2 리스트 가상화 개선
- **파일**: `src/screens/chat/ChatDetailScreen.tsx`
- **기능**:
  - `getItemLayout` 최적화 (가변 높이 고려)
  - `initialNumToRender` 조정
  - `windowSize` 최적화

#### 9.3 캐싱 전략 개선
- **파일**: `src/lib/queryClient.ts`
- **기능**:
  - React Query 캐시 전략 최적화
  - 오프라인 캐시 활용
  - 백그라운드 데이터 업데이트

---

## 10. 모바일 특화 기능

### 추가 필요 사항

#### 10.1 백그라운드 작업
- **패키지**: `expo-task-manager`
- **기능**:
  - 백그라운드에서 검사지 상태 체크
  - 백그라운드 알림

#### 10.2 앱 상태 관리
- **패키지**: `expo-app-state`
- **기능**:
  - 포그라운드/백그라운드 상태 감지
  - 앱이 포그라운드로 돌아올 때 데이터 새로고침

#### 10.3 딥링크 처리 개선
- **파일**: `App.tsx`, `src/navigation/index.tsx`
- **기능**:
  - Universal Links/App Links 지원
  - 딥링크 라우팅 개선
  - 검사지 상세 화면으로 직접 이동

#### 10.4 파일 다운로드
- **패키지**: `expo-file-system`
- **기능**:
  - 검사지 PDF 다운로드
  - 파일 저장 위치 관리
  - 파일 공유

---

## 우선순위 추천

### 🔴 높은 우선순위 (필수)

1. **OAuth 완전 구현**
   - 카카오/네이버 OAuth 구현
   - 인증 상태 체크 활성화
   - 세션 만료 처리

2. **알림 시스템 기본 구현**
   - 알림 훅 및 컴포넌트
   - 헤더에 알림 아이콘
   - 검사지 해석 완료 알림

3. **검사지 해석 상태 자동 체크**
   - 상태 체크 훅
   - 자동 채팅 메시지 업데이트

### 🟡 중간 우선순위 (권장)

4. **검사지 편집/삭제**
   - 편집 다이얼로그
   - 삭제 다이얼로그

5. **에러 바운더리**
   - AppErrorBoundary
   - ErrorFallback

6. **세션 만료 처리**
   - SessionExpiryDialog

### 🟢 낮은 우선순위 (선택)

7. **언어 전환 UI**
   - LanguageSwitcher
   - 마이페이지에 언어 설정

8. **검사지 공유**
   - PDF 생성 및 공유

9. **푸시 알림**
   - 백그라운드 푸시 알림

10. **채팅 검색**
    - 채팅 히스토리 검색

---

## 구현 가이드

각 기능을 구현할 때는 다음을 참고하세요:

1. **patient-web의 구현을 참고**: 웹 앱의 로직을 모바일에 맞게 포팅
2. **공통 패키지 활용**: `@patient/shared`의 공통 로직 활용
3. **모바일 특화 고려**: 터치 제스처, 네이티브 컴포넌트 활용
4. **성능 최적화**: 리스트 가상화, 이미지 최적화 등

---

## 참고 파일

### patient-web 참고 파일
- `src/hooks/useOAuth.ts` - OAuth 구현
- `src/hooks/useNotifications.ts` - 알림 관리
- `src/hooks/useInterpretationStatusCheck.ts` - 상태 체크
- `src/hooks/useChatState.ts` - 채팅 상태 관리
- `src/components/SessionExpiryDialog.tsx` - 세션 만료
- `src/components/error/AppErrorBoundary.tsx` - 에러 바운더리
- `src/components/EditReportDialog.tsx` - 검사지 편집
- `src/components/Main/DeleteReportDialog.tsx` - 검사지 삭제

### patient-mobile 수정/추가 파일
- `src/hooks/useKakaoAuth.ts` (신규)
- `src/hooks/useNaverAuth.ts` (신규)
- `src/hooks/useNotifications.ts` (신규)
- `src/hooks/useInterpretationStatusCheck.ts` (신규)
- `src/components/NotificationPanel.tsx` (신규)
- `src/components/SessionExpiryDialog.tsx` (신규)
- `src/components/error/AppErrorBoundary.tsx` (신규)
- `src/components/EditReportDialog.tsx` (신규)
- `src/components/DeleteReportDialog.tsx` (신규)
- `src/navigation/index.tsx` (수정 - 인증 체크 활성화)

---

## 체크리스트

각 기능 구현 후 체크하세요:

- [ ] 카카오 OAuth 구현
- [ ] 네이버 OAuth 구현
- [ ] 인증 상태 체크 활성화
- [ ] 세션 만료 처리
- [ ] 알림 시스템 구현
- [ ] 검사지 해석 상태 자동 체크
- [ ] 검사지 편집 기능
- [ ] 검사지 삭제 기능
- [ ] 에러 바운더리
- [ ] 언어 전환 UI
- [ ] 로딩 스켈레톤
- [ ] 토스트 알림
- [ ] 이미지 최적화
- [ ] 딥링크 처리 개선

