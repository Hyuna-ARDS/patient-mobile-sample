import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { colors } from "../theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PANEL_WIDTH = SCREEN_WIDTH * 0.7; // 화면의 50% 너비 (반 정도)

interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  isActive?: boolean;
}

interface ChatHistoryPanelProps {
  visible: boolean;
  chatHistory: ChatHistoryItem[];
  activeChatId?: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}

export default function ChatHistoryPanel({
  visible,
  chatHistory,
  activeChatId,
  onChatSelect,
  onNewChat,
  onClose,
}: ChatHistoryPanelProps) {
  const slideAnim = React.useRef(new Animated.Value(-PANEL_WIDTH)).current;

  React.useEffect(() => {
    if (visible) {
      // 항상 왼쪽 밖에서부터 다시 시작하도록 초기값을 리셋
      slideAnim.setValue(-PANEL_WIDTH);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -PANEL_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* 배경 오버레이 */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* 슬라이드 패널 */}
        <Animated.View
          style={[
            styles.panel,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* 새 채팅 버튼 */}
          <View style={styles.newChatSection}>
            <TouchableOpacity style={styles.newChatButton} onPress={onNewChat}>
              <Text style={styles.newChatButtonText}>+ 새 채팅 시작</Text>
            </TouchableOpacity>
          </View>

          {/* 채팅 히스토리 목록 */}
          <FlatList
            data={chatHistory}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.chatItem,
                  (item.isActive || item.id === activeChatId) && styles.chatItemActive,
                ]}
                onPress={() => onChatSelect(item.id)}
              >
                <Text style={styles.chatItemText} numberOfLines={1}>
                  {item.title || item.lastMessage}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>대화 내역이 없습니다</Text>
                <Text style={styles.emptySubtitle}>
                  새로운 대화를 시작해보세요
                </Text>
              </View>
            }
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
    paddingTop: 50, // 상단 safe area
  },
  newChatSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  newChatButton: {
    width: "100%",
    backgroundColor: colors.buttonBlack,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: "center",
  },
  newChatButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  chatItem: {
    height: 40,
    justifyContent: "center",
    paddingVertical: 0,
    marginBottom: 0,
    borderRadius: 8,
  },
  chatItemActive: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  chatItemText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    letterSpacing: -0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.6,
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textBlack60,
    letterSpacing: -0.6,
  },
});

