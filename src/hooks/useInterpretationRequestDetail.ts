import { useQuery } from "@tanstack/react-query";
import { interpretationApiService } from "../services/InterpretationService";
import type { InterpretationRequestDetailRes } from "../services/InterpretationService";

/**
 * 해석 요청 상세 정보를 조회하는 React Query 훅
 * 인증이 없어도 에러를 처리하도록 수정
 */
export function useInterpretationRequestDetail(interpretationRequestId: number | null) {
  return useQuery<InterpretationRequestDetailRes | undefined>({
    queryKey: ["interpretationRequestDetail", interpretationRequestId],
    queryFn: async () => {
      if (!interpretationRequestId) {
        return undefined;
      }
      try {
        return await interpretationApiService.getInterpretationRequestDetail(interpretationRequestId);
      } catch (error: any) {
        // 인증 에러(401) 시에도 undefined 반환하여 로그인 없이 접근 가능하도록 함
        if (error?.status === 401 || error?.code === 401) {
          console.log("인증이 필요합니다. 로그인 없이 접근합니다.");
          return undefined;
        }
        console.warn(`Failed to fetch interpretation request detail for ID ${interpretationRequestId}:`, error);
        return undefined;
      }
    },
    enabled: !!interpretationRequestId,
    staleTime: 5 * 60 * 1000, // 5분
    retry: false, // 로그인 없이 접근 가능하도록 재시도 비활성화
    refetchInterval: (query) => {
      // processing 상태일 때만 주기적으로 새로고침 (5초마다)
      const data = query.state.data;
      if (data?.status === "processing") {
        return 5000;
      }
      return false;
    },
  });
}

