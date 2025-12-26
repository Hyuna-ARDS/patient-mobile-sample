import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RouteProp as NavigationRouteProp } from "@react-navigation/native";
import type { LabStackParamList } from "../../navigation";
import { colors } from "../../theme/colors";
import { useInterpretationRequestDetail } from "../../hooks/useInterpretationRequestDetail";
import { Ionicons } from "@expo/vector-icons";

type RouteProp = NavigationRouteProp<LabStackParamList, "LabDetail">;

// Mock 데이터 타입 정의
interface MockLabValue {
  name: string;
  value: string;
  unit?: string;
  status: "normal" | "warning" | "critical";
  referenceRange?: string;
}

interface MockTreatmentOption {
  id: string;
  title: string;
  description: string;
  type: "medication" | "procedure" | "lifestyle";
  details?: string[];
}

interface MockInterpretationData {
  summary: {
    overallStatus: "normal" | "warning" | "critical";
    message: string;
  };
  labValues: MockLabValue[];
  interpretation: {
    title: string;
    content: string;
    keyPoints: string[];
  };
  treatmentOptions: MockTreatmentOption[];
  recommendations: string[];
}

// Mock 데이터 생성 함수 (암 검사 관련)
const generateMockData = (status?: string): MockInterpretationData => {
  // 상태에 따라 다른 데이터 반환
  if (status === "processing") {
    return {
      summary: {
        overallStatus: "warning",
        message: "AI 분석이 진행 중입니다. 잠시만 기다려주세요...",
      },
      labValues: [],
      interpretation: {
        title: "분석 중",
        content: "검사 결과를 분석하고 있습니다. 완료되면 상세한 해석 결과를 제공해드리겠습니다.",
        keyPoints: [],
      },
      treatmentOptions: [],
      recommendations: [],
    };
  }

  if (status === "failed" || status === "unable") {
    return {
      summary: {
        overallStatus: "critical",
        message: "검사지 해석에 실패했습니다. 다시 시도해주세요.",
      },
      labValues: [],
      interpretation: {
        title: "해석 실패",
        content: "죄송합니다. 검사지 해석 중 오류가 발생했습니다. 검사지 이미지의 품질을 확인하시거나 다시 업로드해주세요.",
        keyPoints: [
          "검사지 이미지가 선명한지 확인해주세요",
          "전체 검사지가 포함되어 있는지 확인해주세요",
          "다시 업로드하여 시도해보세요",
        ],
      },
      treatmentOptions: [],
      recommendations: [
        "검사지 이미지를 다시 촬영하거나 스캔해주세요",
        "이미지가 선명하고 전체 내용이 보이는지 확인해주세요",
        "문제가 지속되면 고객센터로 문의해주세요",
      ],
    };
  }

  // 완료된 상태의 암 검사 데이터
  return {
    summary: {
      overallStatus: "warning",
      message: "검사 결과를 종합해보면, 추가 검사와 전문의 상담이 필요합니다.",
    },
    labValues: [
      {
        name: "CEA (암배아항원)",
        value: "8.5",
        unit: "ng/mL",
        status: "warning",
        referenceRange: "0-5.0",
      },
      {
        name: "CA 19-9",
        value: "45.2",
        unit: "U/mL",
        status: "warning",
        referenceRange: "0-37.0",
      },
      {
        name: "CA 125",
        value: "28.5",
        unit: "U/mL",
        status: "normal",
        referenceRange: "0-35.0",
      },
      {
        name: "PSA (전립선특이항원)",
        value: "2.8",
        unit: "ng/mL",
        status: "normal",
        referenceRange: "0-4.0",
      },
      {
        name: "AFP (알파태아단백)",
        value: "5.2",
        unit: "ng/mL",
        status: "normal",
        referenceRange: "0-10.0",
      },
    ],
    interpretation: {
      title: "종합 해석",
      content: "검사 결과를 종합해보면, CEA와 CA 19-9 수치가 정상 범위를 초과하여 나타났습니다. 이는 위장관계 암이나 췌장암의 가능성을 시사할 수 있으나, 양성 질환이나 염증성 질환에서도 상승할 수 있습니다. 정확한 진단을 위해서는 추가 검사와 전문의 상담이 필수적입니다.",
      keyPoints: [
        "CEA 수치가 정상 범위(0-5.0 ng/mL)를 초과하여 8.5 ng/mL로 나타났습니다.",
        "CA 19-9 수치도 정상 범위(0-37.0 U/mL)를 초과하여 45.2 U/mL로 측정되었습니다.",
        "CA 125, PSA, AFP 수치는 정상 범위 내에 있습니다.",
        "종양표지자 수치 상승은 암의 가능성을 시사하지만, 확진을 위해서는 조직검사 등 추가 검사가 필요합니다.",
        "양성 질환이나 염증성 질환에서도 종양표지자가 상승할 수 있으므로 전문의 상담이 필요합니다.",
      ],
    },
    treatmentOptions: [
      {
        id: "1",
        title: "추가 진단 검사",
        description: "정확한 진단을 위한 추가 검사가 필요합니다.",
        type: "procedure",
        details: [
          "복부 CT 또는 MRI 촬영",
          "내시경 검사 (위내시경, 대장내시경 등)",
          "조직검사 (필요시)",
          "전문의 상담 및 진료",
        ],
      },
      {
        id: "2",
        title: "정기 추적 관찰",
        description: "추가 검사 결과에 따라 정기적인 추적 관찰이 필요할 수 있습니다.",
        type: "procedure",
        details: [
          "2-3개월 후 종양표지자 재검사",
          "의사와 상의하여 추적 일정 결정",
          "증상 변화 시 즉시 병원 방문",
        ],
      },
      {
        id: "3",
        title: "생활습관 개선",
        description: "건강한 생활습관 유지가 중요합니다.",
        type: "lifestyle",
        details: [
          "금연 및 금주",
          "규칙적인 운동",
          "균형 잡힌 식단 (과일, 채소 섭취)",
          "충분한 수면과 휴식",
        ],
      },
    ],
    recommendations: [
      "가능한 빠른 시일 내에 전문의 상담을 받으시기 바랍니다",
      "추가 검사 결과를 바탕으로 정확한 진단을 받으세요",
      "증상이 악화되거나 새로운 증상이 나타나면 즉시 병원을 방문하세요",
      "정기적인 건강검진을 받으시기 바랍니다",
    ],
  };
};

export default function LabDetailScreen() {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const reportId = parseInt(route.params.reportId, 10);
  
  // Mock reportId (999, 998, 997, 996)일 때는 쿼리를 비활성화하여 에러 방지
  const isMockReport = reportId >= 996 && reportId <= 999;
  const { data: detail, isLoading, error } = useInterpretationRequestDetail(
    isNaN(reportId) || isMockReport ? null : reportId
  );

  // Mock reportId에 따라 상태 결정
  const mockStatus = useMemo(() => {
    if (reportId === 999) return "completed";
    if (reportId === 998) return "processing";
    if (reportId === 997) return "failed";
    if (reportId === 996) return "unable";
    return "completed";
  }, [reportId]);

  // Mock 데이터 사용 (로그인 없이도 접근 가능하도록)
  const mockData = useMemo(() => generateMockData(isMockReport ? mockStatus : undefined), [isMockReport, mockStatus]);

  const handleAskQuestion = () => {
    // 채팅 탭으로 이동하고 검사지 컨텍스트 전달
    (navigation as any).navigate("Chat", {
      screen: "ChatDetail",
      params: { reportId: route.params.reportId },
    });
  };

  const getStatusColor = (status: "normal" | "warning" | "critical") => {
    switch (status) {
      case "normal":
        return colors.statusCompleted;
      case "warning":
        return "#F59E0B";
      case "critical":
        return colors.statusError;
      default:
        return colors.textTertiary;
    }
  };

  const getStatusLabel = (status: "normal" | "warning" | "critical") => {
    switch (status) {
      case "normal":
        return "정상";
      case "warning":
        return "주의";
      case "critical":
        return "위험";
      default:
        return "";
    }
  };

  const getTreatmentIcon = (type: "medication" | "procedure" | "lifestyle") => {
    switch (type) {
      case "medication":
        return "medical";
      case "procedure":
        return "clipboard";
      case "lifestyle":
        return "restaurant";
      default:
        return "help-circle";
    }
  };

  // Mock report일 때는 로딩 표시하지 않음
  if (isLoading && !isMockReport) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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

  // 항상 mock 데이터 사용 (로그인 없이도 테스트 가능)
  const displayData = mockData;

  // 탭바 높이 계산
  const tabBarHeight = Platform.OS === "ios" ? Math.max(insets.bottom, 20) + 60 - 8 : 60;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>검사지 해석 결과</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[styles.contentContainer, { paddingBottom: tabBarHeight + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 요약 박스 */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>내 결과 한눈에</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(displayData.summary.overallStatus) }]}>
              <Text style={styles.statusBadgeText}>{getStatusLabel(displayData.summary.overallStatus)}</Text>
            </View>
          </View>
          <Text style={styles.summaryMessage}>{displayData.summary.message}</Text>
        </View>

        {/* 검사 수치 상세 */}
        {displayData.labValues.length > 0 && (
          <View style={styles.labValuesBox}>
            <Text style={styles.sectionTitle}>검사 수치</Text>
            {displayData.labValues.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.labValueItem,
                  index === displayData.labValues.length - 1 && styles.labValueItemLast
                ]}
              >
                <View style={styles.labValueHeader}>
                  <Text style={styles.labValueName}>{item.name}</Text>
                  <View style={[styles.labValueStatusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
                    <Text style={[styles.labValueStatusText, { color: getStatusColor(item.status) }]}>
                      {getStatusLabel(item.status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.labValueContent}>
                  <Text style={styles.labValueValue}>
                    {item.value} {item.unit}
                  </Text>
                  {item.referenceRange && (
                    <Text style={styles.labValueRange}>(참고치: {item.referenceRange})</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 해석 결과 */}
        <View style={styles.interpretationBox}>
          <Text style={styles.sectionTitle}>{displayData.interpretation.title}</Text>
          <Text style={styles.interpretationContent}>{displayData.interpretation.content}</Text>
          
          {displayData.interpretation.keyPoints.length > 0 && (
            <View style={styles.keyPointsContainer}>
              {displayData.interpretation.keyPoints.map((point, index) => (
                <View key={index} style={styles.keyPointItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={styles.keyPointIcon} />
                  <Text style={styles.keyPointText}>{point}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 치료 옵션 */}
        {displayData.treatmentOptions.length > 0 && (
          <View style={styles.treatmentBox}>
            <Text style={styles.sectionTitle}>치료 옵션</Text>
            {displayData.treatmentOptions.map((option) => (
              <View key={option.id} style={styles.treatmentOptionCard}>
                <View style={styles.treatmentOptionHeader}>
                  <Ionicons 
                    name={getTreatmentIcon(option.type) as any} 
                    size={20} 
                    color={colors.primary} 
                    style={styles.treatmentIcon}
                  />
                  <Text style={styles.treatmentOptionTitle}>{option.title}</Text>
                </View>
                <Text style={styles.treatmentOptionDescription}>{option.description}</Text>
                
                {option.details && option.details.length > 0 && (
                  <View style={styles.treatmentDetailsContainer}>
                    {option.details.map((detail, index) => (
                      <View key={index} style={styles.treatmentDetailItem}>
                        <View style={styles.treatmentDetailBullet} />
                        <Text style={styles.treatmentDetailText}>{detail}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 권장 사항 */}
        {displayData.recommendations.length > 0 && (
          <View style={styles.recommendationsBox}>
            <Text style={styles.sectionTitle}>권장 사항</Text>
            {displayData.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons name="star" size={16} color={colors.primary} style={styles.recommendationIcon} />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 추천 질문 */}
        {displayData.treatmentOptions.length > 0 && (
          <View style={styles.suggestedQuestions}>
            <Text style={styles.sectionTitle}>추천 질문</Text>
            <TouchableOpacity 
              style={styles.questionChip}
              onPress={() => handleAskQuestion()}
            >
              <Text style={styles.questionText}>추가 검사는 언제 받아야 하나요?</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.questionChip}
              onPress={() => handleAskQuestion()}
            >
              <Text style={styles.questionText}>종양표지자 수치가 높으면 암인가요?</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.questionChip}
              onPress={() => handleAskQuestion()}
            >
              <Text style={styles.questionText}>어떤 치료를 받게 되나요?</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 플로팅 질문하기 버튼 */}
      <TouchableOpacity 
        style={[
          styles.floatingAskButton,
          { 
            bottom: Platform.OS === "ios" 
              ? Math.max(insets.bottom, 20) + 8
              : 8
          }
        ]} 
        onPress={handleAskQuestion}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={20} color={colors.background} />
        <Text style={styles.floatingAskButtonText}>질문하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
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
  backButton: {
    padding: 4,
  },
  backButtonIcon: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.6,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 20,
  },
  // 요약 박스
  summaryBox: {
    backgroundColor: colors.successBg,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.background,
  },
  summaryMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    letterSpacing: -0.4,
  },
  // 검사 수치 박스
  labValuesBox: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  labValueItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  labValueItemLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  labValueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labValueName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: -0.4,
  },
  labValueStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  labValueStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  labValueContent: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  labValueValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
  },
  labValueRange: {
    fontSize: 14,
    color: colors.textTertiary,
    letterSpacing: -0.4,
  },
  // 해석 결과 박스
  interpretationBox: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 20,
  },
  interpretationContent: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  keyPointsContainer: {
    gap: 12,
  },
  keyPointItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  keyPointIcon: {
    marginTop: 2,
  },
  keyPointText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    letterSpacing: -0.4,
    flex: 1,
  },
  // 치료 옵션 박스
  treatmentBox: {
    gap: 16,
  },
  treatmentOptionCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  treatmentOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  treatmentIcon: {
    marginTop: 2,
  },
  treatmentOptionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
    flex: 1,
  },
  treatmentOptionDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  treatmentDetailsContainer: {
    gap: 8,
    marginTop: 8,
  },
  treatmentDetailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  treatmentDetailBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  treatmentDetailText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textTertiary,
    letterSpacing: -0.4,
    flex: 1,
  },
  // 권장 사항 박스
  recommendationsBox: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 20,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  recommendationIcon: {
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    letterSpacing: -0.4,
    flex: 1,
  },
  // 추천 질문
  suggestedQuestions: {
    gap: 12,
  },
  questionChip: {
    backgroundColor: colors.suggestedQuestionBg,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  questionText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.suggestedQuestionText,
    textAlign: "left",
    letterSpacing: -0.4,
  },
  // 플로팅 질문하기 버튼
  floatingAskButton: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
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
  floatingAskButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.4,
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
