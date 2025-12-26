import { useCallback, useState } from "react";
import * as Linking from "expo-linking";
import { Alert } from "react-native";
import { apiClient } from "../services/apiClient";
import { useAuthStore } from "../store/authStore";

/**
 * 구글 OAuth 로그인 훅
 * patient-web과 동일한 방식: 백엔드에서 OAuth URL을 가져와서 브라우저로 열기
 * 백엔드가 임시 토큰을 발급하고, 콜백에서 최종 access_token으로 교환
 */
export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const { loginWithToken } = useAuthStore();

  const handleGoogleLogin = useCallback(async () => {
    setLoading(true);
    try {
      // 백엔드에서 구글 OAuth URL 가져오기
      // 모바일 앱은 Custom URL Scheme 사용: onconavi://auth/google/callback
      // 백엔드에 모바일임을 알리고 Custom URL Scheme을 redirect_uri로 전달
      const mobileRedirectUri = "onconavi://auth/google/callback";
      const response = await apiClient.get<{ auth_url: string }>(
        `/auth/google/auth_url?env=server&redirect_uri=${encodeURIComponent(mobileRedirectUri)}&platform=mobile`
      );

      if (!response.result_data?.auth_url) {
        Alert.alert("오류", "구글 로그인 URL을 가져오지 못했습니다.");
        setLoading(false);
        return;
      }

      // 브라우저에서 구글 로그인 페이지 열기
      // 백엔드가 웹과 동일한 HTTPS redirect URI를 사용하므로,
      // 구글 인증 후 https://dev-patient.onco-navi.app/auth/google/callback?token=xxx 로 리다이렉트됨
      // Universal Links/App Links가 설정되어 있으면 자동으로 앱으로 리다이렉트됨
      const canOpen = await Linking.canOpenURL(response.result_data.auth_url);
      if (!canOpen) {
        Alert.alert("오류", "구글 로그인 페이지를 열 수 없습니다.");
        setLoading(false);
        return;
      }

      await Linking.openURL(response.result_data.auth_url);
      // 브라우저로 이동했으므로 여기서는 로딩 상태만 유지
      // 실제 로그인 완료는 Universal Links/App Links 콜백에서 처리됨
    } catch (error) {
      console.error("구글 로그인 오류:", error);
      Alert.alert("오류", "구글 로그인 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }, []);

  /**
   * Universal Links/App Links 콜백에서 호출되는 함수
   * 구글 인증 후 백엔드가 발급한 임시 토큰을 최종 access_token으로 교환
   * URL 형식: https://dev-patient.onco-navi.app/auth/google/callback?token=xxx
   * 
   * patient-web과 동일: 백엔드가 임시 토큰을 발급하고, 여기서 최종 토큰으로 교환
   */
  const handleGoogleCallback = useCallback(
    async (tempToken: string) => {
      try {
        setLoading(true);

        // 토큰 교환: 임시 토큰을 최종 access_token으로 교환
        // patient-web의 GoogleCallback.tsx와 동일한 로직
        const response = await apiClient.post<{
          access_token: string;
          patient_id: number;
          email: string;
          name: string;
        }>("/auth/login/google", { token: tempToken });

        const token = response.result_data.access_token;
        const userData = {
          patientId: response.result_data.patient_id,
          email: response.result_data.email,
          name: response.result_data.name,
        };

        await loginWithToken(token, userData);
        setLoading(false);
        return true;
      } catch (error) {
        console.error("구글 로그인 토큰 교환 실패:", error);
        Alert.alert("오류", "구글 로그인에 실패했습니다. 다시 시도해주세요.");
        setLoading(false);
        return false;
      }
    },
    [loginWithToken]
  );

  return {
    handleGoogleLogin,
    handleGoogleCallback,
    loading,
  };
}

