import { apiClient } from "./apiClient";

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
 * 채팅 메시지 전송 요청 타입
 */
export interface SendChatMessageReq {
  interpretation_request_id: number;
  message: string;
}

export class ChatApiService {
  private readonly baseEndpoint = "/interpretation";

  /**
   * 해석 요청에 메시지 전송
   * POST /interpretation/:interpretationRequestId/chat
   */
  async sendMessage(
    interpretationRequestId: number,
    message: string
  ): Promise<ChatMessageRes> {
    try {
      const response = await apiClient.post<ChatMessageRes>(
        `${this.baseEndpoint}/${interpretationRequestId}/chat`,
        { message }
      );
      if (!response.result_data) {
        throw new Error("응답 데이터가 없습니다");
      }
      return response.result_data;
    } catch (error) {
      console.error("메시지 전송 실패", error);
      throw error;
    }
  }

  /**
   * 해석 요청의 채팅 히스토리 조회
   * GET /interpretation/:interpretationRequestId
   * (InterpretationService의 getInterpretationRequestDetail에서 chat_history 포함)
   */
}

export const chatApiService = new ChatApiService();

