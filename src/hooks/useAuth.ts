import { useAuthStore } from "../store/authStore";

/**
 * 인증 관련 훅
 * 웹 앱의 useAuth와 동일한 인터페이스를 제공합니다.
 */
export const useAuth = () => {
  const store = useAuthStore();

  return {
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    accessToken: store.accessToken,
    patientId: store.patientId,
    email: store.email,
    name: store.name,
    login: store.login,
    logout: store.logout,
    clearError: store.clearError,
  };
};

