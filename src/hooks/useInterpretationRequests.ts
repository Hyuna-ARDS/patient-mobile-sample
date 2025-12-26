import { useQuery } from "@tanstack/react-query";
import { interpretationApiService } from "../services/InterpretationService";
import type { InterpretationRequestRes } from "../services/InterpretationService";

/**
 * 해석 요청 목록을 조회하는 React Query 훅
 * 인증이 없어도 빈 배열을 반환하도록 처리
 */
export function useInterpretationRequests() {
  return useQuery<InterpretationRequestRes[]>({
    queryKey: ["interpretationRequests"],
    queryFn: async () => {
      try {
        return await interpretationApiService.getInterpretationRequests();
      } catch (error: any) {
        // 인증 에러(401) 또는 기타 에러 시 빈 배열 반환 (에러 메시지 출력하지 않음)
        if (error?.status === 401 || error?.code === 401 || error?.message?.includes("로그인")) {
          return [];
        }
        // 다른 에러도 일단 빈 배열 반환 (개발 중)
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: false, // 인증 에러는 재시도하지 않음
  });
}

