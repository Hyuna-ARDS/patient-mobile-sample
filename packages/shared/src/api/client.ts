/**
 * 플랫폼 중립적인 API 클라이언트
 * 토큰 저장/조회는 플랫폼별로 주입받습니다.
 */

// API 응답의 표준 봉투(envelope) 구조
export interface ApiResponse<T> {
  result_code: string;
  result_data: T;
  code: number;
  code_desc: string;
  message: string;
}

// 프로젝트에 맞게 ApiError 타입
export interface ApiError extends Error {
  status?: number;
  code?: number;
  code_desc?: string;
  response?: unknown;
}

// 토큰 저장소 추상화 인터페이스
export interface TokenStorage {
  getAccessToken(): Promise<string | null>;
  setAccessToken(token: string): Promise<void>;
  removeAccessToken(): Promise<void>;
}

// 플랫폼별 설정
export interface ApiClientConfig {
  baseUrl: string;
  tokenStorage: TokenStorage;
  onTokenExpired?: () => void | Promise<void>;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  // 1. HTTP 레벨 에러 처리 (e.g., 404, 500)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
    const error: ApiError = new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.response = errorData;
    throw error;
  }

  // 2. 애플리케이션 레벨 성공/에러 처리
  const body: ApiResponse<T> = await response.json();

  if (body.result_code === "TOKEN_EXPIRED") {
    const error: ApiError = new Error(body.message || body.code_desc || "Authentication expired");
    error.status = response.status;
    error.code = body.code;
    error.code_desc = body.code_desc;
    error.response = body;
    throw error;
  }

  if (body.result_code === 'OK' && body.code === 0) {
    return body; // 성공 시 전체 body 객체 반환
  } else {
    // 서버 비즈니스 로직 에러
    const error: ApiError = new Error(body.message || body.code_desc || 'An application error occurred');
    error.status = response.status; // HTTP 상태는 200일 수 있음
    error.code = body.code;
    error.code_desc = body.code_desc;
    error.response = body; // 디버깅을 위해 전체 응답 본문을 포함
    throw error;
  }
}

function buildUrl(baseUrl: string, endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  return `${baseUrl}${endpoint}`;
}

export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, tokenStorage, onTokenExpired } = config;

  // 헤더 설정 (Authorization + Content-Type 처리)
  async function withAuthHeaders(options?: RequestInit): Promise<RequestInit> {
    const headers = new Headers(options?.headers || {});

    // Authorization 주입
    if (!headers.has("Authorization")) {
      const accessToken = await tokenStorage.getAccessToken();
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
    }

    // Content-Type이 설정되지 않았고 FormData가 아닌 경우 JSON으로 설정
    if (!headers.has("Content-Type") && !(options?.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    return {
      ...options,
      headers,
    };
  }

  const apiClient = {
    get: async <T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> => {
      const response = await fetch(
        buildUrl(baseUrl, endpoint),
        await withAuthHeaders({
          method: 'GET',
          ...options,
        })
      );
      
      try {
        return await handleResponse<T>(response);
      } catch (error) {
        if (error instanceof Error && 'code' in error && (error as ApiError).code !== undefined) {
          const apiError = error as ApiError;
          if (apiError.code === 401 || (apiError as any).result_code === "TOKEN_EXPIRED") {
            await tokenStorage.removeAccessToken();
            if (onTokenExpired) {
              await onTokenExpired();
            }
          }
        }
        throw error;
      }
    },

    post: async <T>(endpoint: string, data: unknown, options?: RequestInit): Promise<ApiResponse<T>> => {
      try {
        const isFormData = data instanceof FormData;
        const authHeaders = await withAuthHeaders({
          method: 'POST',
          body: isFormData ? data : JSON.stringify(data),
          ...options,
        });

        const response = await fetch(buildUrl(baseUrl, endpoint), authHeaders);
        return await handleResponse<T>(response);
      } catch (error) {
        if (error instanceof Error && 'code' in error && (error as ApiError).code !== undefined) {
          const apiError = error as ApiError;
          if (apiError.code === 401 || (apiError as any).result_code === "TOKEN_EXPIRED") {
            await tokenStorage.removeAccessToken();
            if (onTokenExpired) {
              await onTokenExpired();
            }
          }
        }
        throw error;
      }
    },

    put: async <T>(endpoint: string, data: unknown, options?: RequestInit): Promise<ApiResponse<T>> => {
      const isFormData = data instanceof FormData;
      const authHeaders = await withAuthHeaders({
        method: 'PUT',
        body: isFormData ? data : JSON.stringify(data),
        ...options,
      });

      const response = await fetch(buildUrl(baseUrl, endpoint), authHeaders);
      try {
        return await handleResponse<T>(response);
      } catch (error) {
        if (error instanceof Error && 'code' in error && (error as ApiError).code !== undefined) {
          const apiError = error as ApiError;
          if (apiError.code === 401 || (apiError as any).result_code === "TOKEN_EXPIRED") {
            await tokenStorage.removeAccessToken();
            if (onTokenExpired) {
              await onTokenExpired();
            }
          }
        }
        throw error;
      }
    },

    patch: async <T>(endpoint: string, data: unknown, options?: RequestInit): Promise<ApiResponse<T>> => {
      const isFormData = data instanceof FormData;
      const authHeaders = await withAuthHeaders({
        method: 'PATCH',
        body: isFormData ? data : JSON.stringify(data),
        ...options,
      });

      const response = await fetch(buildUrl(baseUrl, endpoint), authHeaders);
      try {
        return await handleResponse<T>(response);
      } catch (error) {
        if (error instanceof Error && 'code' in error && (error as ApiError).code !== undefined) {
          const apiError = error as ApiError;
          if (apiError.code === 401 || (apiError as any).result_code === "TOKEN_EXPIRED") {
            await tokenStorage.removeAccessToken();
            if (onTokenExpired) {
              await onTokenExpired();
            }
          }
        }
        throw error;
      }
    },

    delete: async <T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> => {
      const response = await fetch(
        buildUrl(baseUrl, endpoint),
        await withAuthHeaders({
          method: 'DELETE',
          ...options,
        })
      );
      try {
        return await handleResponse<T>(response);
      } catch (error) {
        if (error instanceof Error && 'code' in error && (error as ApiError).code !== undefined) {
          const apiError = error as ApiError;
          if (apiError.code === 401 || (apiError as any).result_code === "TOKEN_EXPIRED") {
            await tokenStorage.removeAccessToken();
            if (onTokenExpired) {
              await onTokenExpired();
            }
          }
        }
        throw error;
      }
    },
  };

  return apiClient;
}

