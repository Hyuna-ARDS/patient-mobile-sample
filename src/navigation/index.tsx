import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, ActivityIndicator, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useAuthStore } from "../store/authStore";

import LoginScreen from "../screens/LoginScreen";
import ChatDetailScreen from "../screens/chat/ChatDetailScreen";
import LabListScreen from "../screens/lab/LabListScreen";
import LabUploadScreen from "../screens/lab/LabUploadScreen";
import LabDetailScreen from "../screens/lab/LabDetailScreen";
import MyScreen from "../screens/MyScreen";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  // Register: undefined;
};

export type MainTabParamList = {
  Chat: undefined;
  Lab: undefined;
  My: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatDetail: { chatId?: string; reportId?: string };
};

export type LabStackParamList = {
  LabList: undefined;
  LabUpload: undefined;
  LabDetail: { reportId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();
const LabStack = createNativeStackNavigator<LabStackParamList>();

// 인증 스택 (로그인/회원가입)
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      {/* <AuthStack.Screen name="Register" component={RegisterScreen} /> */}
    </AuthStack.Navigator>
  );
}

// 채팅 스택 네비게이터
// ChatListScreen 제거 - ChatDetailScreen만 사용 (히스토리 패널로 관리)
function ChatNavigator() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="ChatDetail">
      <ChatStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </ChatStack.Navigator>
  );
}

// 검사지 스택 네비게이터
function LabNavigator() {
  return (
    <LabStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="LabList">
      <LabStack.Screen name="LabList" component={LabListScreen} />
      <LabStack.Screen name="LabUpload" component={LabUploadScreen} />
      <LabStack.Screen name="LabDetail" component={LabDetailScreen} />
    </LabStack.Navigator>
  );
}

// 메인 탭 네비게이터 (채팅/검사지해석/마이페이지)
function MainNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "ios" ? Math.max(insets.bottom, 20) : 20;
  
  return (
    <MainTabs.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: "#0A78F5",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#1C1C1C1A",
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: 60 + bottomPadding - 8,
          backgroundColor: "#FFFFFF",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
      initialRouteName="Chat"
    >
      <MainTabs.Screen 
        name="Chat" 
        component={ChatNavigator}
        options={{
          tabBarLabel: "채팅",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <MainTabs.Screen 
        name="Lab" 
        component={LabNavigator}
        options={{
          tabBarLabel: "검사지해석",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "document-text" : "document-text-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <MainTabs.Screen 
        name="My" 
        component={MyScreen}
        options={{
          tabBarLabel: "마이페이지",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </MainTabs.Navigator>
  );
}

// 루트 네비게이터
function RootNavigator() {
  // 임시: 인증 체크 없이 항상 Auth 화면으로 시작 (로그인 버튼으로 Main으로 이동)
  // const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  // const [isInitializing, setIsInitializing] = useState(true);

  // useEffect(() => {
  //   // 앱 시작 시 인증 상태 확인
  //   const initAuth = async () => {
  //     await checkAuth();
  //     setIsInitializing(false);
  //   };
  //   initAuth();
  // }, [checkAuth]);

  // // 초기 로딩 중일 때
  // if (isInitializing || isLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Auth" // 로그인 페이지부터 시작
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  const { handleGoogleCallback } = useGoogleAuth();
  const { isAuthenticated } = useAuthStore();
  const navigationRef = React.useRef<any>(null);
  const handledInitialUrl = useRef(false);

  useEffect(() => {
    // 앱이 이미 열려있을 때 Deep Link 처리
    const subscription = Linking.addEventListener("url", (event) => {
      const { url } = event;
      console.log("[Navigation] Linking event received:", url);
      handleDeepLink(url);
    });

    // 앱이 닫혀있을 때 Deep Link로 열린 경우 처리 (한 번만)
    if (!handledInitialUrl.current) {
      Linking.getInitialURL().then((url) => {
        if (url) {
          console.log("[Navigation] Initial URL:", url);
          handleDeepLink(url);
        }
        handledInitialUrl.current = true;
      });
    }

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // 로그인 성공 시 메인 화면으로 이동
    if (isAuthenticated && navigationRef.current) {
      navigationRef.current.navigate("Main");
    }
  }, [isAuthenticated]);

  const handleDeepLink = async (url: string) => {
    console.log("[Navigation] Deep link received:", url);
    const parsed = Linking.parse(url);
    
    // 구글 로그인 콜백 처리
    // Universal Links/App Links: https://dev-patient.onco-navi.app/auth/google/callback?token=xxx
    // Custom URL Scheme: onconavi://auth/google/callback?token=xxx (백업용)
    // patient-web과 동일: state 없이 token만 사용
    if (
      (parsed.hostname === "dev-patient.onco-navi.app" || parsed.scheme === "onconavi") &&
      parsed.path === "auth/google/callback"
    ) {
      const token = parsed.queryParams?.token as string;
      
      if (token) {
        const success = await handleGoogleCallback(token);
        if (success && navigationRef.current) {
          // 로그인 성공 시 메인 화면으로 이동
          navigationRef.current.navigate("Main");
        }
      }
    }
    
    // 카카오 로그인 콜백 처리
    // Universal Links/App Links: https://dev-patient.onco-navi.app/auth/kakao/callback?code=xxx&state=xxx
    if (
      (parsed.hostname === "dev-patient.onco-navi.app" || parsed.scheme === "onconavi") &&
      parsed.path === "auth/kakao/callback"
    ) {
      console.log("[Navigation] Kakao callback detected");
      const code = parsed.queryParams?.code as string;
      const returnedState = parsed.queryParams?.state as string;
      const error = parsed.queryParams?.error as string;
      
      if (error) {
        console.error("[Navigation] Kakao callback error:", error);
        return;
      }
      
      if (code && returnedState) {
        console.log("[Navigation] Processing Kakao callback with code and state");
        
        // state 검증을 위해 SecureStore에서 저장된 state 가져오기
        const SecureStore = await import("expo-secure-store");
        const KAKAO_STATE_KEY = "kakao_oauth_state";
        const storedState = await SecureStore.default.getItemAsync(KAKAO_STATE_KEY);
        
        // state 검증
        if (!storedState || returnedState !== storedState) {
          console.error("[Navigation] State mismatch or missing");
          return;
        }
        
        // state 검증 후 삭제
        await SecureStore.default.deleteItemAsync(KAKAO_STATE_KEY);
        
        const { useAuthStore } = await import("../store/authStore");
        const { apiClient } = await import("../services/apiClient");
        const { oauthConfig } = await import("../config");
        
        try {
          const response = await apiClient.post<{
            access_token: string;
            patient_id: number;
            email: string;
            name: string;
          }>("/auth/social", {
            social_provider: "KAKAO",
            code,
            state: storedState,
            redirect_uri: oauthConfig.kakao.redirectUri,
          });
          
          const token = response.result_data.access_token;
          const userData = {
            patientId: response.result_data.patient_id,
            email: response.result_data.email,
            name: response.result_data.name,
          };
          
          const authStore = useAuthStore.getState();
          await authStore.loginWithToken(token, userData);
          
          if (navigationRef.current) {
            navigationRef.current.navigate("Main");
          }
        } catch (error) {
          console.error("[Navigation] Kakao callback error:", error);
        }
      }
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

