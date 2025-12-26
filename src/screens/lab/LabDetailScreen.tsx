import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp as NavigationRouteProp } from "@react-navigation/native";
import type { LabStackParamList } from "../../navigation";
import { colors } from "../../theme/colors";
import { useInterpretationRequestDetail } from "../../hooks/useInterpretationRequestDetail";

type RouteProp = NavigationRouteProp<LabStackParamList, "LabDetail">;

export default function LabDetailScreen() {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation();
  const reportId = parseInt(route.params.reportId, 10);
  const { data: detail, isLoading, error } = useInterpretationRequestDetail(
    isNaN(reportId) ? null : reportId
  );

  const handleAskQuestion = () => {
    // 채팅 탭으로 이동하고 검사지 컨텍스트 전달 (타입 안전성을 위해 any 사용)
    (navigation as any).navigate("Chat", {
      screen: "ChatDetail",
      params: { reportId: route.params.reportId },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>검사지 해석 결과</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !detail) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>검사지 해석 결과</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>검사지 정보를 불러올 수 없습니다</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 - 웹 앱 DetailPanel과 동일 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>검사지 해석 결과</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>내 결과 한눈에</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>백혈구 수치</Text>
            <Text style={[styles.summaryValue, styles.summaryValueNormal]}>정상</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>적혈구 수치</Text>
            <Text style={[styles.summaryValue, styles.summaryValueWarning]}>주의</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>혈소판 수치</Text>
            <Text style={[styles.summaryValue, styles.summaryValueNormal]}>정상</Text>
          </View>
        </View>

        <View style={styles.guideBox}>
          <Text style={styles.guideTitle}>나비 가이드</Text>
          <Text style={styles.guideText}>
            검사 결과를 종합해보면, 전반적으로 양호한 상태입니다. 다만 적혈구 수치가 다소 낮게 나타났으니...
          </Text>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>더 자세히 보기 →</Text>
        </TouchableOpacity>

        <View style={styles.suggestedQuestions}>
          <Text style={styles.suggestedTitle}>추천 질문</Text>
          <TouchableOpacity style={styles.questionChip}>
            <Text style={styles.questionText}>적혈구 수치를 높이려면?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.questionChip}>
            <Text style={styles.questionText}>어떤 치료를 받게 되나요?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.askButton} onPress={handleAskQuestion}>
          <Text style={styles.askButtonText}>💬 질문하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 60,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderBlack10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 50,
  },
  backButton: {
    padding: 4,
    borderRadius: 20,
  },
  backButtonIcon: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 20, // text-stit1-bold
    fontWeight: "bold",
    color: colors.text,
    letterSpacing: -0.6,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 16,
  },
  summaryBox: {
    backgroundColor: colors.successBg,
    borderRadius: 10,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.6,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    letterSpacing: -0.6,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.6,
  },
  summaryValueNormal: {
    color: colors.statusCompleted,
  },
  summaryValueWarning: {
    color: "#F59E0B",
  },
  guideBox: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    padding: 20,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  guideText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    letterSpacing: -0.6,
  },
  moreButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  moreButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  suggestedQuestions: {
    gap: 8,
  },
  suggestedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  questionChip: {
    backgroundColor: colors.suggestedQuestionBg,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  questionText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.suggestedQuestionText,
    textAlign: "left",
  },
  askButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  askButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textTertiary,
    letterSpacing: -0.6,
  },
});

