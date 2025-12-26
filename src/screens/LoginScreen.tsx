import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { useTranslation } from "react-i18next";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useKakaoAuth } from "../hooks/useKakaoAuth";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const { t } = useTranslation("common");
  const navigation = useNavigation<NavigationProp>();
  const { handleGoogleLogin, loading: googleLoading } = useGoogleAuth();
  const { handleKakaoLogin, loading: kakaoLoading } = useKakaoAuth();
  const { isAuthenticated } = useAuthStore();
  const loading = googleLoading || kakaoLoading;

  React.useEffect(() => {
    // 로그인 성공 시 메인 화면으로 이동
    if (isAuthenticated) {
      navigation.navigate("Main");
    }
  }, [isAuthenticated, navigation]);

  const handleLogin = () => {
    // 로그인 없이 바로 메인 화면(채팅)으로 이동 (테스트용)
    navigation.navigate("Main");
  };

  const handleSocialLogin = () => {
    // 소셜 로그인 버튼 클릭 시 메인 화면으로 이동 (임시)
    navigation.navigate("Main");
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>{t("appName")}</Text>
        <Image
          source={require("../../assets/images/navi-type2.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.socialButton, styles.kakaoButton, loading && styles.buttonDisabled]}
          onPress={handleKakaoLogin}
          disabled={loading}
        >
          {kakaoLoading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.socialButtonText}>카카오로 로그인</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, styles.naverButton, loading && styles.buttonDisabled]}
          onPress={handleSocialLogin}
          disabled={loading}
        >
          <Text style={[styles.socialButtonText, styles.naverButtonText]}>네이버로 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.socialButtonText}>구글로 로그인</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.testButtonText}>테스트 로그인 (건너뛰기)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.text,
  },
  logo: {
    width: 180,
    height: 110,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 400,
    gap: 12,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 8,
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
  },
  naverButton: {
    backgroundColor: "#03C75A",
  },
  googleButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  naverButtonText: {
    color: colors.background,
  },
  testButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: "center",
  },
  testButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

