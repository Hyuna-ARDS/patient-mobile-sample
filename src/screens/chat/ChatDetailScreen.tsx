import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp as NavigationRouteProp } from "@react-navigation/native";
import type { ChatStackParamList } from "../../navigation";
import { colors } from "../../theme/colors";
import ChatHistoryPanel from "../../components/ChatHistoryPanel";
import { useInterpretationRequestDetail } from "../../hooks/useInterpretationRequestDetail";
import { chatApiService } from "../../services/ChatService";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { interpretationApiService } from "../../services/InterpretationService";
import { Ionicons } from "@expo/vector-icons";

type RouteProp = NavigationRouteProp<ChatStackParamList, "ChatDetail">;

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    type: "assistant",
    content: "안녕하세요! 무엇을 도와드릴까요?",
    timestamp: "10:23",
  },
  {
    id: "2",
    type: "user",
    content: "폐암 초기 증상이 궁금해요",
    timestamp: "10:24",
  },
  {
    id: "3",
    type: "assistant",
    content: "폐암 초기에는 기침, 호흡곤란, 가슴 통증 등의 증상이 나타날 수 있습니다.",
    timestamp: "10:24",
  },
];

export default function ChatDetailScreen() {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const [showLabAnalysisPrompt, setShowLabAnalysisPrompt] = useState(true);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mockMessages, setMockMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const slideAnim = useMemo(() => new Animated.Value(0), []);
  
  // 탭바 높이 계산 (navigation/index.tsx와 동일)
  const tabBarHeight = Platform.OS === "ios" ? Math.max(insets.bottom, 20) + 60 - 8 : 60;
  
  // 헤더 높이 계산 (safe area + 헤더 높이) - 다른 페이지와 동일하게
  const headerHeight = insets.top + 10 + 60; // safe area top + padding + 헤더 minHeight (다른 페이지와 동일)

  // reportId가 있으면 해석 요청 상세 조회
  const reportId = route.params?.reportId ? parseInt(route.params.reportId, 10) : null;
  const { data: detail, isLoading: detailLoading } = useInterpretationRequestDetail(
    reportId && !isNaN(reportId) ? reportId : null
  );

  // 채팅 제목 결정
  const chatTitle = React.useMemo(() => {
    if (detail?.title) {
      return detail.title;
    }
    if (route.params?.chatId) {
      return `채팅 ${route.params.chatId}`;
    }
    return "새 채팅";
  }, [detail?.title, route.params?.chatId]);

  // 메시지 목록 (API에서 가져온 데이터 또는 빈 배열)
  const messages: Message[] = React.useMemo(() => {
    const baseMessages: Message[] = [];
    
    // 검사지 해석 상태 메시지 추가
    if (detail) {
      if (detail.status === "processing") {
        baseMessages.push({
          id: "status-processing",
          type: "assistant",
          content: "검사지 분석 중이에요. 잠시만 기다려주세요...",
          timestamp: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      } else if (detail.status === "completed") {
        baseMessages.push({
          id: "status-completed",
          type: "assistant",
          content: "검사지 분석이 완료되었습니다!",
          timestamp: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      } else if (detail.status === "failed" || detail.status === "unable") {
        baseMessages.push({
          id: "status-failed",
          type: "assistant",
          content: "검사지 분석에 실패했습니다. 다시 시도해주세요.",
          timestamp: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }
    }
    
    // 채팅 히스토리 메시지 추가
    if (detail?.chat_history) {
      const chatMessages: Message[] = detail.chat_history.map((msg) => ({
        id: String(msg.id),
        type: (msg.sender === "USER" ? "user" : "assistant") as "user" | "assistant",
        content: msg.message,
        timestamp: new Date(msg.created_at).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      baseMessages.push(...chatMessages);
    }
    
    // Mock 메시지 추가 (검사지 없이 채팅하는 경우)
    if (!reportId && mockMessages.length > 0) {
      baseMessages.push(...mockMessages);
    }
    
    return baseMessages;
  }, [detail?.chat_history, detail?.status, reportId, mockMessages]);

  const isNewChat = messages.length === 0 && !reportId;

  // 키보드 이벤트 리스너
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // 채팅 히스토리 데이터 (실제로는 API에서 가져와야 함)
  const chatHistory = [
    { id: "1", title: "이전 대화", lastMessage: "폐암 초기 증상에 대해 질문드렸습니다", timestamp: "오늘 오전 10:23", isActive: route.params?.chatId === "1" },
    { id: "2", title: "검사지 기반 상담", lastMessage: "혈액검사 결과 해석 요청", timestamp: "어제", isActive: route.params?.chatId === "2" },
  ];

  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // 헤더 제거
    });
  }, [navigation]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    setSending(true);
    const messageText = inputText.trim();
    setInputText("");

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    if (reportId) {
      // Mock reportId (996-999)인 경우 API 호출하지 않고 mock 응답 생성
      const isMockReport = reportId >= 996 && reportId <= 999;
      
      if (isMockReport) {
        // Mock 응답 생성
        setMockMessages((prev) => [...prev, userMessage]);
        
        setTimeout(() => {
          const mockResponse: Message = {
            id: `assistant-${Date.now()}`,
            type: "assistant",
            content: "검사 결과에 대해 궁금하신 점이 있으시군요. 추가 검사와 전문의 상담을 권장드립니다. 더 자세한 정보가 필요하시면 언제든지 질문해주세요.",
            timestamp: new Date().toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMockMessages((prev) => [...prev, mockResponse]);
          setSending(false);
        }, 1000);
        return;
      }
      
      // 실제 검사지인 경우: API로 메시지 전송
      try {
        await chatApiService.sendMessage(reportId, messageText);
        
        // 상세 정보 새로고침하여 최신 메시지 가져오기
        await queryClient.invalidateQueries({
          queryKey: ["interpretationRequestDetail", reportId],
        });
      } catch (error) {
        console.error("메시지 전송 실패:", error);
        Alert.alert("오류", "메시지 전송에 실패했습니다.");
        setInputText(messageText); // 실패 시 입력 텍스트 복원
      } finally {
        setSending(false);
      }
    } else {
      // 검사지가 없는 경우: Mock 응답 생성
      setMockMessages((prev) => [...prev, userMessage]);
      
      // Mock 응답 생성 (1초 후)
      setTimeout(() => {
        const mockResponses = [
          "안녕하세요! 무엇을 도와드릴까요?",
          "궁금하신 점이 있으시면 언제든지 물어보세요.",
          "검사지 해석이 필요하시면 검사지를 업로드해주세요.",
          "건강 관련 질문에 대해 답변해드릴 수 있습니다.",
        ];
        
        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: randomResponse,
          timestamp: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        
        setMockMessages((prev) => [...prev, assistantMessage]);
        setSending(false);
        
        // 메시지 추가 후 스크롤
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1000);
    }
  };

  // 업로드 패널 토글 애니메이션
  useEffect(() => {
    if (showUploadPanel) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [showUploadPanel, slideAnim]);

  const handleUploadButtonPress = () => {
    setShowUploadPanel(!showUploadPanel);
  };

  const handleTakePhoto = async () => {
    setShowUploadPanel(false);
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("권한 필요", "카메라 권한이 필요합니다.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadFile(result.assets[0].uri, "image");
      }
    } catch (error) {
      console.error("카메라 오류:", error);
      Alert.alert("오류", "사진 촬영 중 오류가 발생했습니다.");
    }
  };

  const handleSelectFile = async () => {
    setShowUploadPanel(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await uploadFile(asset.uri, asset.mimeType || "file");
      }
    } catch (error) {
      console.error("파일 선택 오류:", error);
      Alert.alert("오류", "파일 선택 중 오류가 발생했습니다.");
    }
  };

  const uploadFile = async (uri: string, type: string) => {
    setUploading(true);
    try {
      // FormData 생성
      const formData = new FormData();
      
      // React Native에서는 파일을 FormData에 추가할 때 특별한 형식 필요
      const filename = uri.split("/").pop() || "file";
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : `image/jpeg`;
      
      formData.append("files", {
        uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
        type: fileType,
        name: filename,
      } as any);

      // API 호출
      const requestId = await interpretationApiService.createInterpretationRequest(formData);
      
      if (!requestId) {
        Alert.alert("업로드 실패", "로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
        return;
      }
      
      // 검사지 목록 캐시 무효화하여 새로고침
      await queryClient.invalidateQueries({ queryKey: ["interpretationRequests"] });
      
      // 현재 채팅에 검사지 컨텍스트 추가
      Alert.alert("업로드 완료", "검사지가 업로드되었습니다. 분석이 시작되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            // 현재 채팅 화면을 새로고침하여 검사지 컨텍스트 추가
            (navigation as any).navigate("ChatDetail", {
              reportId: String(requestId),
            });
          },
        },
      ]);
    } catch (error) {
      console.error("업로드 오류:", error);
      Alert.alert("업로드 실패", "검사지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleLabAnalysisRequest = () => {
    // 검사지 해석 목록 페이지로 이동
    (navigation as any).navigate("Lab", { screen: "LabList" });
  };

  const handleChatSelect = (chatId: string) => {
    setShowHistoryPanel(false);
    (navigation as any).navigate("ChatDetail", { chatId });
  };

  const handleNewChat = () => {
    setShowHistoryPanel(false);
    (navigation as any).navigate("ChatDetail", {});
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.type === "user";
    const isStatusMessage = item.id.startsWith("status-");

    if (isUser) {
      return (
        <View style={styles.userMessageContainer}>
          <View style={styles.userMessageWrapper}>
            <View style={styles.userBubble}>
              <Text style={styles.userMessageText}>{item.content}</Text>
            </View>
          </View>
        </View>
      );
    }

    // 상태 메시지 스타일 (보라색 배경, 로딩 아이콘)
    if (isStatusMessage && item.id === "status-processing") {
      return (
        <View style={styles.statusMessageContainer}>
          <View style={styles.statusMessageBubble}>
            <ActivityIndicator size="small" color="#9333EA" style={{ marginRight: 8 }} />
            <Text style={styles.statusMessageText}>{item.content}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.assistantMessageContainer}>
        <View style={styles.assistantBubble}>
          <Text style={styles.assistantMessageText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  // 로딩 중
  if (detailLoading && reportId) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // 새 채팅: 웰컴 화면 (웹 앱 ChatArea와 동일)
  if (isNewChat) {
    return (
      <>
        <View style={styles.container}>
          {/* 헤더 - 토글 아이콘과 채팅 제목 */}
          <View style={[styles.chatHeader, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity
              style={styles.panelToggleButtonInHeader}
              onPress={() => setShowHistoryPanel(true)}
            >
              <Text style={styles.panelToggleIcon}>☰</Text>
            </TouchableOpacity>
            <Text style={styles.chatHeaderTitle}>{chatTitle}</Text>
          </View>
          
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.chatContentContainer}>

              <View style={styles.welcomeContainer}>
                <View style={styles.welcomeContent}>
                  {/* 나비 이미지 */}
                  <View style={styles.welcomeImageContainer}>
                    <Image
                      source={require("../../../assets/images/navi-type2.png")}
                      style={styles.welcomeImage}
                      resizeMode="contain"
                    />
                  </View>

                  {/* 환영 메시지 */}
                  <View style={styles.welcomeTextContainer}>
                    <Text style={styles.welcomeText}>안녕하세요!</Text>
                    <Text style={styles.welcomeText}>암 치료 여정을 나비와 함께해요.</Text>
                    <Text style={styles.welcomeText}>최근 검사하신 결과지를 업로드해 주시면 더 정확히 도와드릴 수 있어요.</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>

          {/* 입력창을 하단에 고정 (탭바 위) - 키보드가 보일 때는 패딩 최소화 */}
          <View style={[styles.inputContainer, { 
            marginBottom: 0,
          }]}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadButtonPress}
            >
              <Text style={styles.uploadIcon}>📎</Text>
              <Text style={styles.uploadText}>검사지</Text>
            </TouchableOpacity>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="메시지 입력..."
                placeholderTextColor={colors.textPlaceholder}
                multiline
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <Text style={[styles.sendButtonIcon, !inputText.trim() && styles.sendButtonIconDisabled]}>
                  ↑
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          </KeyboardAvoidingView>
        </View>

        {/* 업로드 패널 (토글) - 검사지 버튼 바로 위에 표시 */}
        {showUploadPanel && (
          <Animated.View
            style={[
              styles.uploadPanel,
              {
                // 키보드가 있을 때는 키보드 높이 + 여백, 없을 때는 입력창 바로 위
                // 입력창 높이: paddingTop(8) + paddingBottom(8) + minHeight(56) = 72px
                bottom: isKeyboardVisible 
                  ? keyboardHeight + 2  // 키보드 위에 위치 (작은 여백)
                  : tabBarHeight + 72 + 2, // 입력창 바로 위 (검사지 버튼 바로 위)
                opacity: slideAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.uploadOption}
              onPress={handleTakePhoto}
              disabled={uploading}
            >
              <Ionicons name="camera" size={24} color={colors.primary} />
              <Text style={styles.uploadOptionText}>사진 촬영</Text>
            </TouchableOpacity>
            <View style={styles.uploadOptionDivider} />
            <TouchableOpacity
              style={styles.uploadOption}
              onPress={handleSelectFile}
              disabled={uploading}
            >
              <Ionicons name="document-text" size={24} color={colors.primary} />
              <Text style={styles.uploadOptionText}>파일 선택</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* 배경 오버레이 (패널 열렸을 때) */}
        {showUploadPanel && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setShowUploadPanel(false)}
          />
        )}

        {/* 채팅 히스토리 패널 */}
        <ChatHistoryPanel
          visible={showHistoryPanel}
          chatHistory={chatHistory}
          activeChatId={route.params?.chatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onClose={() => setShowHistoryPanel(false)}
        />
      </>
    );
  }

  // 일반 채팅: 메시지 목록 + 입력창 하단 고정 (웹 앱 ChatArea와 동일)
  return (
    <>
      <View style={styles.container}>
        {/* 헤더 - 토글 아이콘과 채팅 제목 */}
        <View style={[styles.chatHeader, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            style={styles.panelToggleButtonInHeader}
            onPress={() => setShowHistoryPanel(true)}
          >
            <Text style={styles.panelToggleIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.chatHeaderTitle}>{chatTitle}</Text>
        </View>
        
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={styles.chatContentContainer}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              style={styles.flatList}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              ListFooterComponent={
                showLabAnalysisPrompt ? (
                  <View style={styles.labAnalysisPrompt}>
                    <Text style={styles.labAnalysisTitle}>💡 검사지 해석</Text>
                    <Text style={styles.labAnalysisText}>
                      검사 결과를 분석해드릴까요?
                    </Text>
                    <TouchableOpacity
                      style={styles.labAnalysisButton}
                      onPress={handleLabAnalysisRequest}
                    >
                      <Text style={styles.labAnalysisButtonText}>검사지 해석 요청</Text>
                    </TouchableOpacity>
                  </View>
                ) : null
              }
            />
          </View>

          {/* 입력창을 하단에 고정 (탭바 위) - 키보드와 함께 올라감 */}
          <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadButtonPress}
          >
            <Text style={styles.uploadIcon}>📎</Text>
            <Text style={styles.uploadText}>검사지</Text>
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="메시지 입력..."
              placeholderTextColor={colors.textPlaceholder}
              multiline
              onSubmitEditing={handleSend}
              editable={!sending}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.userMessageText} />
              ) : (
                <Text style={[styles.sendButtonIcon, !inputText.trim() && styles.sendButtonIconDisabled]}>
                  ↑
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        </KeyboardAvoidingView>
      </View>

      {/* 업로드 패널 (토글) - 검사지 버튼 바로 위에 표시 */}
      {showUploadPanel && (
        <Animated.View
          style={[
            styles.uploadPanel,
            {
                // 키보드가 있을 때는 키보드 높이 + 여백, 없을 때는 입력창 바로 위
                // 입력창 높이: paddingTop(8) + paddingBottom(8) + minHeight(56) = 72px
                bottom: isKeyboardVisible 
                  ? keyboardHeight + 2  // 키보드 위에 위치 (작은 여백)
                  : tabBarHeight + 72 + 2, // 입력창 바로 위 (검사지 버튼 바로 위)
              opacity: slideAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.uploadOption}
            onPress={handleTakePhoto}
            disabled={uploading}
          >
            <Ionicons name="camera" size={24} color={colors.primary} />
            <Text style={styles.uploadOptionText}>사진 촬영</Text>
          </TouchableOpacity>
          <View style={styles.uploadOptionDivider} />
          <TouchableOpacity
            style={styles.uploadOption}
            onPress={handleSelectFile}
            disabled={uploading}
          >
            <Ionicons name="document-text" size={24} color={colors.primary} />
            <Text style={styles.uploadOptionText}>파일 선택</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* 배경 오버레이 (패널 열렸을 때) */}
      {showUploadPanel && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowUploadPanel(false)}
        />
      )}

      {/* 채팅 히스토리 패널 */}
      <ChatHistoryPanel
        visible={showHistoryPanel}
        chatHistory={chatHistory}
        activeChatId={route.params?.chatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onClose={() => setShowHistoryPanel(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // 웰컴 화면
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeContent: {
    width: "100%",
    maxWidth: 494,
    alignItems: "center",
    gap: 30,
  },
  welcomeImageContainer: {
    width: 180,
    height: 110,
    overflow: "hidden",
  },
  welcomeImage: {
    width: "100%",
    height: "100%",
  },
  welcomeTextContainer: {
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    letterSpacing: -0.6,
    textAlign: "center",
  },
  // FlatList 스타일
  flatList: {
    flex: 1,
  },
  // 메시지 목록 - 하단 입력창 공간 확보
  messagesList: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // 입력창 높이만큼 여백
    gap: 20,
  },
  userMessageContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  userMessageWrapper: {
    maxWidth: "70%",
    alignItems: "flex-end",
  },
  userBubble: {
    backgroundColor: colors.userMessageBg,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 0,
  },
  userMessageText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.userMessageText,
    letterSpacing: -0.6,
  },
  assistantMessageContainer: {
    alignItems: "flex-start",
    marginBottom: 10,
  },
  assistantBubble: {
    maxWidth: "100%",
  },
  assistantMessageText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.assistantMessageText,
    letterSpacing: -0.6,
  },
  // 상태 메시지 스타일
  statusMessageContainer: {
    alignItems: "flex-start",
    marginBottom: 10,
  },
  statusMessageBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF", // 보라색 배경
    borderWidth: 1,
    borderColor: "#E9D5FF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: "90%",
  },
  statusMessageText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#9333EA", // 보라색 텍스트
    letterSpacing: -0.6,
    flex: 1,
  },
  // 검사지 해석 프롬프트
  labAnalysisPrompt: {
    backgroundColor: colors.noticeBg,
    borderWidth: 1,
    borderColor: colors.noticeBorder,
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    maxWidth: 362,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  labAnalysisTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.6,
  },
  labAnalysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.6,
  },
  labAnalysisButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  labAnalysisButtonText: {
    color: colors.userMessageText,
    fontSize: 14,
    fontWeight: "600",
  },
  // 입력창 (웹 앱 ChatInput과 동일) - 하단 고정
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: 10,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingRight: 10,
  },
  uploadIcon: {
    fontSize: 16,
    color: colors.text,
  },
  uploadText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "400",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    paddingRight: 10,
    backgroundColor: colors.background,
    shadowColor: "rgba(100, 100, 111, 0.2)",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 29,
    elevation: 7,
    minHeight: 56,
  },
  input: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxHeight: 100,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    letterSpacing: -0.6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "transparent",
  },
  sendButtonIcon: {
    color: colors.userMessageText,
    fontSize: 16,
    fontWeight: "600",
  },
  sendButtonIconDisabled: {
    color: colors.textDisabled,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  panelToggleButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  panelToggleIcon: {
    fontSize: 20,
    color: colors.text,
    fontWeight: "600",
  },
  // 채팅 헤더 (다른 페이지와 동일한 높이)
  chatHeader: {
    minHeight: 60,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "flex-end",
  },
  panelToggleButtonInHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  chatHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    letterSpacing: -0.6,
    flex: 1,
  },
  // 채팅 컨텐츠 컨테이너
  chatContentContainer: {
    flex: 1,
  },
  // 업로드 패널 스타일 (검사지 버튼과 비슷한 넓이)
  uploadPanel: {
    position: "absolute",
    left: 20, // 입력창과 동일한 좌측 여백
    width: 110, // 검사지 버튼과 비슷한 넓이 (아이콘 + 텍스트 + 패딩 고려)
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
  uploadOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  uploadOptionDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 12,
  },
  uploadOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: -0.4,
  },
  // 오버레이
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 998,
  },
});
