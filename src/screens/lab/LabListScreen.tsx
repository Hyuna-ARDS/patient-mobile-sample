import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { LabStackParamList } from "../../navigation";
import { colors } from "../../theme/colors";
import { useInterpretationRequests } from "../../hooks/useInterpretationRequests";
import { format } from "date-fns";

type NavigationProp = NativeStackNavigationProp<LabStackParamList>;

export default function LabListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { data: requests, isLoading, error, refetch } = useInterpretationRequests();

  const handleUpload = () => {
    navigation.navigate("LabUpload");
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

  const renderReport = ({ item }: { item: NonNullable<typeof requests>[0] }) => {
    const isProcessing = item.status === "processing";
    const badgeColor = getStatusBadgeColor(item.status);
    const statusLabel = getStatusLabel(item.status);

    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => handleReportSelect(String(item.interpretation_request_id))}
      >
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>{item.title || "검사지"}</Text>
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
          </Text>
        )}
      </TouchableOpacity>
    );
  };

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
            data={requests || []}
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

      {/* 플로팅 업로드 버튼 */}
      <TouchableOpacity 
        style={[
          styles.floatingButton,
          { 
            bottom: Platform.OS === "ios" 
              ? Math.max(insets.bottom, 20) + 8 // 탭바 paddingBottom + 작은 여백
              : 8 // 작은 여백
          }
        ]} 
        onPress={handleUpload}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingButtonText}>+ 검사 결과지 올리기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGuide, // 웹 앱 GuideSection 배경색
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
  // 웹 앱 ReportCardItem과 동일한 스타일
  reportCard: {
    backgroundColor: colors.reportCardBg,
    borderRadius: 14,
    padding: 20,
    gap: 6,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 18, // text-stit2-bold
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
    fontSize: 12, // text-c3-medium
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
    color: colors.statusProcessing, // #215CFC
    letterSpacing: -0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15, // text-body2-regular
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
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: "600",
  },
  // 플로팅 버튼 스타일
  floatingButton: {
    position: "absolute",
    left: 0,
    right: 0,
    alignSelf: "center",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    marginHorizontal: 20, // 좌우 여백
  },
  floatingButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.6,
  },
});
