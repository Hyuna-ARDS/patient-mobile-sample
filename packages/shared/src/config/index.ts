/**
 * 앱 환경 설정 모듈
 * 플랫폼 중립적인 환경 설정을 제공합니다.
 */

export type AppEnv = 'local' | 'dev' | 'qa' | 'prod';

/**
 * 환경 변수에서 앱 환경을 가져오는 함수
 * 플랫폼별로 구현이 달라질 수 있으므로 추상화
 */
export interface EnvProvider {
  getEnv(): AppEnv;
  getApiUrl(): string;
}

// 기본 구현 (웹용)
export function getAppEnvFromString(env?: string): AppEnv {
  if (env === 'local' || env === 'dev' || env === 'qa' || env === 'prod') {
    return env;
  }
  return 'dev';
}

