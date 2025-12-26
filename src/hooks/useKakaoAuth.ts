import { useCallback, useState, useEffect, useRef } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Alert, AppState, AppStateStatus } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { apiClient } from "../services/apiClient";
import { useAuthStore } from "../store/authStore";
import { oauthConfig } from "../config";

// WebBrowser를 완전히 닫도록 설정
WebBrowser.maybeCompleteAuthSession();

const KAKAO_STATE_KEY = "kakao_oauth_state";

/**
 * 카카오 OAuth 로그인 훅
 * Deep Link 없이 WebBrowser를 사용하여 구현
 * patient-web과 동일한 백엔드 로직 사용
 */
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useKakaoAuth() {
  const [loading, setLoading] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(false);
  const { loginWithToken, isAuthenticated } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const pendingStateRef = useRef<string | null>(null);

  // 로그인 성공 시 로딩 상태 해제
  useEffect(() => {
    if (isAuthenticated && loading) {
      console.log("[KakaoAuth] Login successful, clearing loading state");
      setLoading(false);
      pendingStateRef.current = null;
    }
  }, [isAuthenticated, loading]);
  
  // 앱이 포그라운드로 돌아올 때 네비게이션 처리
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && pendingNavigation && isAuthenticated) {
        // 약간의 지연 후 네비게이션 (앱이 완전히 포그라운드로 돌아온 후)
        setTimeout(() => {
          try {
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }],
            });
            setPendingNavigation(false);
          } catch (error) {
            console.error("Navigation error:", error);
            // reset이 실패하면 navigate 시도
            navigation.navigate("Main");
            setPendingNavigation(false);
          }
        }, 300);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [pendingNavigation, isAuthenticated, navigation]);
  

  /**
   * 카카오 로그인 시작
   * WebBrowser를 사용하여 카카오 인증 페이지를 열고,
   * redirectUri로 돌아올 때 code를 추출하여 백엔드로 전달
   */
  const handleKakaoLogin = useCallback(async () => {
    setLoading(true);
    try {
      const { clientId, redirectUri } = oauthConfig.kakao;
      
      if (!clientId || !redirectUri) {
        Alert.alert("오류", "카카오 로그인 설정이 되어 있지 않습니다.");
        setLoading(false);
        return;
      }

      // state 생성 및 저장 (CSRF 방지)
      // 간단한 UUID 생성: timestamp + random
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 15);
      const state = `${timestamp}-${random}`;
      await SecureStore.setItemAsync(KAKAO_STATE_KEY, state);
      pendingStateRef.current = state;

      // 카카오 OAuth URL 생성 (patient-web과 동일)
      // redirectUri는 웹 URL을 사용 (예: https://dev-patient.onco-navi.app/auth/kakao/callback)
      // WebBrowser가 이 URL로 리다이렉트될 때 결과를 반환
      const authUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;

      // WebBrowser로 카카오 로그인 페이지 열기
      // Linking 리스너가 이미 설정되어 있으므로, openBrowserAsync를 사용
      console.log("[KakaoAuth] Opening WebBrowser with URL:", authUrl);
      console.log("[KakaoAuth] Redirect URI:", redirectUri);
      
      // openAuthSessionAsync를 다시 사용하되, redirectUri를 웹 URL로 설정
      // iOS에서는 openAuthSessionAsync가 Universal Links를 자동으로 처리할 수 있음
      try {
        console.log("[KakaoAuth] Using openAuthSessionAsync with redirectUri:", redirectUri);
        console.log("[KakaoAuth] Auth URL:", authUrl);
        
        // 타임아웃 설정 (30초)
        const timeoutPromise = new Promise<{ type: "timeout" }>((resolve) => {
          setTimeout(() => {
            resolve({ type: "timeout" });
          }, 30000); // 30초
        });
        
        const browserPromise = WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
        const result = await Promise.race([browserPromise, timeoutPromise]);
        
        console.log("[KakaoAuth] WebBrowser result:", JSON.stringify(result, null, 2));
        
        // 타임아웃 처리
        if (result.type === "timeout") {
          console.error("[KakaoAuth] Timeout waiting for browser result");
          await WebBrowser.dismissBrowser();
          Alert.alert("오류", "로그인 시간이 초과되었습니다. 다시 시도해주세요.");
          setLoading(false);
          pendingStateRef.current = null;
          return;
        }
        
        // 사용자가 취소한 경우
        if (result.type === "cancel") {
          console.log("[KakaoAuth] User cancelled");
          setLoading(false);
          pendingStateRef.current = null;
          return;
        }

        // 에러 발생 시
        if (result.type === "dismiss") {
          console.log("[KakaoAuth] WebBrowser dismissed");
          setLoading(false);
          pendingStateRef.current = null;
          return;
        }

        // 성공 시 URL에서 code와 state 추출
        if (result.type === "success" && result.url) {
          console.log("[KakaoAuth] Success! URL:", result.url);
          
          try {
            // URL 파싱
            const urlParts = result.url.split("?");
            const queryString = urlParts[1] || "";
            console.log("[KakaoAuth] Query string:", queryString);
            
            const params = new URLSearchParams(queryString);
            const code = params.get("code");
            const returnedState = params.get("state");
            const error = params.get("error");
            
            console.log("[KakaoAuth] Extracted code:", code ? `${code.substring(0, 10)}...` : "missing");
            console.log("[KakaoAuth] Extracted state:", returnedState);
            console.log("[KakaoAuth] Error:", error);

          // 저장된 state 확인
          const storedState = await SecureStore.getItemAsync(KAKAO_STATE_KEY);
          await SecureStore.deleteItemAsync(KAKAO_STATE_KEY);
          pendingStateRef.current = null;

            // 검증: error, code 없음, state 불일치 시 실패 처리
            if (error) {
              console.error("[KakaoAuth] Error in callback:", error);
              Alert.alert("오류", `카카오 로그인에 실패했습니다: ${error}`);
              setLoading(false);
              return;
            }
            
            if (!code) {
              console.error("[KakaoAuth] No code in callback");
              Alert.alert("오류", "카카오 로그인에 실패했습니다. code가 없습니다.");
              setLoading(false);
              return;
            }
            
            if (!storedState) {
              console.error("[KakaoAuth] No stored state");
              Alert.alert("오류", "카카오 로그인에 실패했습니다. state가 없습니다.");
              setLoading(false);
              return;
            }
            
            if (returnedState !== storedState) {
              console.error("[KakaoAuth] State mismatch:", { returned: returnedState, stored: storedState });
              Alert.alert("오류", "카카오 로그인에 실패했습니다. state가 일치하지 않습니다.");
              setLoading(false);
              return;
            }

            // 백엔드에 code 전달하여 토큰 받기
            console.log("[KakaoAuth] Calling backend API...");
            console.log("[KakaoAuth] Request payload:", {
              social_provider: "KAKAO",
              code: code.substring(0, 10) + "...",
              state: storedState.substring(0, 10) + "...",
              redirect_uri: redirectUri,
            });
            
            const response = await apiClient.post<{
              access_token: string;
              patient_id: number;
              email: string;
              name: string;
            }>("/auth/social", {
              social_provider: "KAKAO",
              code,
              state: storedState,
              redirect_uri: redirectUri,
            });
            console.log("[KakaoAuth] Backend response received:", {
              hasToken: !!response.result_data?.access_token,
              patientId: response.result_data?.patient_id,
              email: response.result_data?.email,
            });

            const token = response.result_data.access_token;
            const userData = {
              patientId: response.result_data.patient_id,
              email: response.result_data.email,
              name: response.result_data.name,
            };

            console.log("[KakaoAuth] Calling loginWithToken...");
            await loginWithToken(token, userData);
            console.log("[KakaoAuth] loginWithToken completed");
            setLoading(false);
            
            // 네비게이션
            console.log("[KakaoAuth] Navigating to Main...");
            if (AppState.currentState === "active") {
              try {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Main" }],
                });
                console.log("[KakaoAuth] Navigation reset completed");
              } catch (error) {
                console.error("[KakaoAuth] Navigation error:", error);
                navigation.navigate("Main");
              }
            } else {
              console.log("[KakaoAuth] App not active, setting pending navigation");
              setPendingNavigation(true);
            }
          } catch (parseError) {
            console.error("[KakaoAuth] URL parsing error:", parseError);
            Alert.alert("오류", "URL 파싱 중 오류가 발생했습니다.");
            setLoading(false);
            pendingStateRef.current = null;
          }
        } else {
          console.log("[KakaoAuth] Unexpected result type:", result.type);
          console.log("[KakaoAuth] Result URL:", result.url);
          Alert.alert("오류", `카카오 로그인에 실패했습니다. (타입: ${result.type})`);
          setLoading(false);
          pendingStateRef.current = null;
        }
      } catch (error) {
        console.error("[KakaoAuth] Browser error:", error);
        console.error("[KakaoAuth] Error details:", JSON.stringify(error, null, 2));
        setLoading(false);
        pendingStateRef.current = null;
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
        Alert.alert("오류", `브라우저 오류: ${errorMessage}`);
      }
    } catch (error) {
      console.error("카카오 로그인 오류:", error);
      Alert.alert("오류", "카카오 로그인 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }, [loginWithToken]);

  return {
    handleKakaoLogin,
    loading,
  };
}

