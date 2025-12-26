import { apiClient } from "./apiClient";

/**
 * API 공통 응답 타입
 */
export interface ApiResponse<T> {
  code: number;
  code_desc: string;
  message?: string;
  result_code: string;
  result_data?: T;
}

/**
 * 해석 요청 응답 타입
 */
export interface InterpretationRequestRes {
  interpretation_request_id: number;
  questions?: string;
  file_paths: string[];
  status: string;
  is_valid_request: boolean;
  title?: string;
  test_date?: string;
  hospital_name?: string;
  created_at: string;
}

/**
 * 해석 요청 상세 응답 타입
 */
export interface InterpretationRequestDetailRes {
  interpretation_request_id: number;
  questions?: string;
  file_paths: string[];
  status: string;
  is_valid_request: boolean;
  title?: string;
  test_date?: string;
  hospital_name?: string;
  results?: string;
  result_detail?: unknown;
  chat_history: ChatMessageRes[];
  created_at: string;
}

/**
 * 채팅 메시지 응답 타입
 */
export interface ChatMessageRes {
  id: number;
  sender: "USER" | "AI";
  message: string;
  created_at: string;
}

/**
 * 해석 요청 생성 요청 타입
 */
export interface CreateInterpretationRequestReq {
  files: FormData;
}

export class InterpretationApiService {
  private readonly baseEndpoint = "/interpretation";

  /**
   * 사용자의 해석 요청 목록 조회
   * GET /interpretation
   */
  async getInterpretationRequests(): Promise<InterpretationRequestRes[]> {
    try {
      const response = await apiClient.get<InterpretationRequestRes[]>(
        `${this.baseEndpoint}`
      );
      if (!response.result_data) {
        return [];
      }
      return Array.isArray(response.result_data) ? response.result_data : [];
    } catch (error: any) {
      // 인증 에러는 조용히 처리 (로그인 없이 접근 가능하도록)
      if (error?.status === 401 || error?.code === 401 || error?.message?.includes("로그인")) {
        return [];
      }
      console.error("해석 요청 목록 조회 실패", error);
      throw error;
    }
  }

  /**
   * 특정 해석 요청 상세 조회
   * GET /interpretation/:interpretationRequestId
   */
  async getInterpretationRequestDetail(
    interpretationRequestId: number
  ): Promise<InterpretationRequestDetailRes | undefined> {
    try {
      const response = await apiClient.get<InterpretationRequestDetailRes>(
        `${this.baseEndpoint}/${interpretationRequestId}`
      );
      if (!response.result_data) {
        return undefined;
      }
      return response.result_data;
    } catch (error: any) {
      // 인증 에러는 조용히 처리 (로그인 없이 접근 가능하도록)
      if (error?.status === 401 || error?.code === 401 || error?.message?.includes("로그인")) {
        return undefined;
      }
      console.error(
        `해석 요청 상세 조회 실패 (ID: ${interpretationRequestId})`,
        error
      );
      return undefined;
    }
  }

  /**
   * 새로운 해석 요청 생성
   * POST /interpretation/request
   *
   * @param formData FormData with files
   */
  async createInterpretationRequest(
    formData: FormData
  ): Promise<string | null> {
    try {
      const response = await apiClient.post<string>(
        `${this.baseEndpoint}/request`,
        formData
      );

      if (!response.result_data) {
        return null;
      }

      return response.result_data;
    } catch (error: any) {
      // 인증 에러도 에러로 처리하지 않고 null 반환 (로그인 없이도 시도 가능)
      // 백엔드가 토큰 없이도 업로드를 허용하는 경우를 대비
      if (error?.status === 401 || error?.code === 401 || error?.message?.includes("로그인")) {
        console.warn("검사지 업로드: 인증이 필요할 수 있습니다. 백엔드 설정을 확인하세요.");
        // 일단 에러를 throw하지 않고 null 반환하여 사용자에게 알림
        return null;
      }
      console.error("해석 요청 생성 실패", error);
      throw error;
    }
  }

  /**
   * 해석 요청 삭제
   * DELETE /interpretation/:interpretationRequestId
   */
  async deleteInterpretationRequest(
    interpretationRequestId: number
  ): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<string>>(
        `${this.baseEndpoint}/${interpretationRequestId}`
      );
    } catch (error) {
      console.error(
        `해석 요청 삭제 실패 (ID: ${interpretationRequestId})`,
        error
      );
      throw error;
    }
  }
}

export const interpretationApiService = new InterpretationApiService();

