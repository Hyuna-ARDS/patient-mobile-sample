import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "../services/apiClient";

const TOKEN_KEY = "access_token";

interface AuthState {
  accessToken: string | null;
  patientId: number | null;
  email: string | null;
  name: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginWithToken: (token: string, userData: { patientId: number; email: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  patientId: null,
  email: null,
  name: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<{
        access_token: string;
        patient_id: number;
        email: string;
        name: string;
      }>("/auth/login", credentials);

      const token = res.result_data.access_token;
      const userData = {
        patientId: res.result_data.patient_id,
        email: res.result_data.email,
        name: res.result_data.name,
      };

      // 토큰을 SecureStore에 저장
      await SecureStore.setItemAsync(TOKEN_KEY, token);

      set({
        accessToken: token,
        patientId: userData.patientId,
        email: userData.email,
        name: userData.name,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      set({
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage,
      });
      throw err;
    }
  },

  loginWithToken: async (token, userData) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({
      accessToken: token,
      patientId: userData.patientId,
      email: userData.email,
      name: userData.name,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({
      accessToken: null,
      patientId: null,
      email: null,
      name: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        // 토큰이 있으면 유효성 검증 (선택사항)
        // 여기서는 토큰 존재만 확인하고, 필요시 API 호출로 검증 가능
        set({
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Failed to check auth:", error);
      set({
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

