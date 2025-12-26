/**
 * 모바일 앱 설정
 */

// API Base URL - 환경 변수나 기본값 사용
// Constants.expoConfig 접근 시 타입 에러가 발생할 수 있으므로 환경 변수만 사용
// 슬래시로 끝나지 않도록 주의 (buildUrl에서 처리)
export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  "https://dev-patient-api.onco-navi.app";

// OAuth 설정 (모바일용)
export interface OAuthProviderConfig {
  clientId: string;
  redirectUri: string;
}

export interface OAuthConfig {
  kakao: OAuthProviderConfig;
  naver: OAuthProviderConfig;
  google: OAuthProviderConfig;
}

// TODO: 환경별 설정으로 확장
// REST API 키 사용 (네이티브 앱 키 아님)
// 환경 변수로 관리하려면: EXPO_PUBLIC_KAKAO_REST_API_KEY
export const oauthConfig: OAuthConfig = {
  kakao: {
    clientId: process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY || '73351eeab7629b08c7d103fb8adc13ea',
    // WebBrowser를 사용하므로 웹 URL을 redirectUri로 사용
    // 카카오 개발자 콘솔에 이 URL을 등록해야 함
    redirectUri: process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI || 'https://dev-patient.onco-navi.app/auth/kakao/callback',
  },
  naver: {
    clientId: 'uIXpJ0jlRq7LKujB7rcy',
    redirectUri: 'onconavi://auth/naver/callback',
  },
  google: {
    clientId: '', // TODO: 설정 필요
    redirectUri: 'onconavi://auth/google/callback',
  },
};

