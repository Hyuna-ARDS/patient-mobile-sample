import * as SecureStore from "expo-secure-store";
import { createApiClient, type TokenStorage, type ApiClientConfig } from "@patient/shared";
import { API_BASE_URL } from "../config";

const TOKEN_KEY = "access_token";

// Expo SecureStore를 사용한 토큰 저장소 구현
const tokenStorage: TokenStorage = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get access token:", error);
      return null;
    }
  },
  async setAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to set access token:", error);
    }
  },
  async removeAccessToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Failed to remove access token:", error);
    }
  },
};

// 토큰 만료 시 처리 (토큰이 있을 때만 처리)
const handleTokenExpired = async () => {
  const token = await tokenStorage.getAccessToken();
  // 토큰이 있을 때만 로그아웃 처리 (토큰이 없으면 그냥 무시)
  if (token) {
    console.log("Token expired, redirecting to login...");
    // authStore를 동적으로 import하여 순환 참조 방지
    const { useAuthStore } = await import("../store/authStore");
    await useAuthStore.getState().logout();
  }
};

const apiClientConfig: ApiClientConfig = {
  baseUrl: API_BASE_URL,
  tokenStorage,
  onTokenExpired: handleTokenExpired,
};

export const apiClient = createApiClient(apiClientConfig);

