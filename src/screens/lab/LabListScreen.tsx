import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Platform, Alert, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { LabStackParamList } from "../../navigation";
import { colors } from "../../theme/colors";
import { useInterpretationRequests } from "../../hooks/useInterpretationRequests";
import { format } from "date-fns";
import type { InterpretationRequestRes } from "../../services/InterpretationService";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { interpretationApiService } from "../../services/InterpretationService";
import { Ionicons } from "@expo/vector-icons";

type NavigationProp = NativeStackNavigationProp<LabStackParamList>;

// Mock 검사지 데이터 (테스트용) - 다양한 상태
const MOCK_REPORTS: InterpretationRequestRes[] = [
  {
    interpretation_request_id: 999,
    title: "폐암 조직검사 결과 (테스트)",
    status: "completed",
    is_valid_request: true,
    test_date: new Date().toISOString(),
    hospital_name: "서울대학교병원",
    file_paths: [],
    created_at: new Date().toISOString(),
  },
  {
    interpretation_request_id: 998,
    title: "위암 내시경 검사 결과",
    status: "processing",
    is_valid_request: true,
    test_date: new Date(Date.now() - 86400000).toISOString(),
    hospital_name: "세브란스병원",
    file_paths: [],
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    interpretation_request_id: 997,
    title: "대장암 종양표지자 검사",
    status: "failed",
    is_valid_request: true,
    test_date: new Date(Date.now() - 172800000).toISOString(),
    hospital_name: "아산병원",
    file_paths: [],
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    interpretation_request_id: 996,
    title: "유방암 세포진 검사",
    status: "unable",
    is_valid_request: false,
    test_date: new Date(Date.now() - 259200000).toISOString(),
    hospital_name: "삼성서울병원",
    file_paths: [],
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

export default function LabListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { data: requests, isLoading, error, refetch } = useInterpretationRequests();
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [uploading, setUploading] = useState(false);
  const slideAnim = useMemo(() => new Animated.Value(0), []);

  // Mock 데이터와 실제 데이터 합치기 (테스트용)
  const displayRequests = useMemo(() => {
    const realRequests = requests || [];
    // 실제 데이터가 없거나 빈 배열일 때만 mock 데이터 추가
    if (realRequests.length === 0) {
      return MOCK_REPORTS;
    }
    return realRequests;
  }, [requests]);

  // 업로드 패널 토글 애니메이션
  React.useEffect(() => {
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
      
      // 채팅 화면으로 이동하고 검사지 컨텍스트 전달
      Alert.alert("업로드 완료", "검사지가 업로드되었습니다. 분석이 시작되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            // 채팅 탭으로 이동하고 검사지 컨텍스트 전달
            (navigation as any).navigate("Chat", {
              screen: "ChatDetail",
              params: { reportId: String(requestId) },
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

  const handleReportSelect = (reportId: string) => {
    navigation.navigate("LabDetail", { reportId });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "processing":
        return colors.statusProcessing;
      case "completed":
        return colors.statusCompleted;
      case "failed":
      case "unable":
        return colors.statusError;
      default:
        return colors.statusProcessing;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "processing":
        return "해석 중";
      case "completed":
        return "분석 완료";
      case "failed":
        return "분석 실패";
      case "unable":
        return "해석 불가";
      default:
        return "해석 중";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "yyyy.MM.dd");
    } catch {
      return dateString;
    }
  };

  const renderReport = ({ item }: { item: InterpretationRequestRes }) => {
    const isProcessing = item.status === "processing";
    const badgeColor = getStatusBadgeColor(item.status);
    const statusLabel = getStatusLabel(item.status);
    const isMock = MOCK_REPORTS.some(mock => mock.interpretation_request_id === item.interpretation_request_id);
    const isCompleted = item.status === "completed";
    const isClickable = isCompleted; // 완료 상태일 때만 클릭 가능

    return (
      <TouchableOpacity
        style={[
          styles.reportCard, 
          isMock && styles.mockReportCard,
          !isClickable && styles.reportCardDisabled
        ]}
        onPress={() => {
          if (isClickable) {
            handleReportSelect(String(item.interpretation_request_id));
          }
        }}
        disabled={!isClickable}
        activeOpacity={isClickable ? 0.7 : 1}
      >
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>
            {item.title || "검사지"}
            {isMock && " 🧪"}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.statusBadgeText}>{statusLabel}</Text>
          </View>
        </View>
        {isProcessing ? (
          <Text style={styles.reportDescriptionProcessing}>
            AI 분석 중입니다. 잠시만 기다려주세요...
          </Text>
        ) : (
          <Text style={styles.reportDescription}>
            {formatDate(item.test_date || item.created_at)} {item.hospital_name && `· ${item.hospital_name}`}
            {isMock && " (테스트용)"}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // 업로드 패널 위치 계산
  const uploadButtonBottom = Platform.OS === "ios" 
    ? Math.max(insets.bottom, 20) + 8
    : 8;
  const panelBottom = uploadButtonBottom + 60 + 8; // 버튼 높이 + 여백

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>검사지해석</Text>
      </View>
      
      {/* 검사지 목록 - 웹 앱 GuideList와 동일 */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={displayRequests}
            keyExtractor={(item) => String(item.interpretation_request_id)}
            renderItem={renderReport}
            contentContainerStyle={styles.listContent}
            refreshing={isLoading}
            onRefresh={refetch}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>검사지가 없습니다</Text>
                <Text style={styles.emptySubtext}>
                  검사지를 업로드하여 해석을 받아보세요
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* 업로드 패널 (토글) */}
      {showUploadPanel && (
        <Animated.View
          style={[
            styles.uploadPanel,
            {
              bottom: panelBottom,
              opacity: slideAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
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

      {/* 플로팅 업로드 버튼 */}
      <TouchableOpacity 
        style={[
          styles.floatingButton,
          { 
            bottom: uploadButtonBottom,
            backgroundColor: showUploadPanel ? colors.textTertiary : colors.primary,
          }
        ]} 
        onPress={handleUploadButtonPress}
        activeOpacity={0.8}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <>
            <Ionicons 
              name={showUploadPanel ? "close" : "add"} 
              size={24} 
              color={colors.background} 
            />
            <Text style={styles.floatingButtonText}>
              {showUploadPanel ? "닫기" : "검사 결과지 올리기"}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* 배경 오버레이 (패널 열렸을 때) */}
      {showUploadPanel && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowUploadPanel(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGuide,
  },
  header: {
    minHeight: 60,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: 20,
    paddingBottom: 16,
    justifyContent: "flex-end",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingTop: 30,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  reportCard: {
    backgroundColor: colors.reportCardBg,
    borderRadius: 14,
    padding: 20,
    gap: 6,
  },
  mockReportCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
  },
  reportCardDisabled: {
    opacity: 0.6,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
    letterSpacing: -0.6,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.background,
    letterSpacing: -0.6,
  },
  reportDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textBlack40,
    letterSpacing: -0.6,
  },
  reportDescriptionProcessing: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.statusProcessing,
    letterSpacing: -0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.textBlack60,
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textTertiary,
    letterSpacing: -0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  // 플로팅 버튼 스타일
  floatingButton: {
    position: "absolute",
    left: 20,
    right: 20,
    alignSelf: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  floatingButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.6,
  },
  // 업로드 패널 스타일
  uploadPanel: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingVertical: 12,
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
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  uploadOptionDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 20,
  },
  uploadOptionText: {
    fontSize: 16,
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
