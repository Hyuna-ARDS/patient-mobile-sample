import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ChatStackParamList } from "../../navigation";
import { colors } from "../../theme/colors";
import ChatHistoryPanel from "../../components/ChatHistoryPanel";

type NavigationProp = NativeStackNavigationProp<ChatStackParamList>;

interface ChatItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

const mockChats: ChatItem[] = [
  {
    id: "1",
    title: "이전 대화",
    lastMessage: "폐암 초기 증상에 대해 질문드렸습니다",
    timestamp: "오늘 오전 10:23",
  },
  {
    id: "2",
    title: "검사지 기반 상담",
    lastMessage: "혈액검사 결과 해석 요청",
    timestamp: "어제",
  },
];

export default function ChatListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const handleNewChat = () => {
    setShowHistoryPanel(false);
    navigation.navigate("ChatDetail", {});
  };

  const handleChatSelect = (chatId: string) => {
    setShowHistoryPanel(false);
    navigation.navigate("ChatDetail", { chatId });
  };

  return (
    <View style={styles.container}>
      {/* 왼쪽 상단 패널 열기 버튼 */}
      <TouchableOpacity
        style={styles.panelToggleButton}
        onPress={() => setShowHistoryPanel(true)}
      >
        <Text style={styles.panelToggleIcon}>☰</Text>
      </TouchableOpacity>

      {/* 새 채팅 버튼 - 웹 앱 ChatHistoryPanel과 동일 */}
      <View style={styles.newChatSection}>
        <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
          <Text style={styles.newChatButtonText}>+ 새 채팅 시작</Text>
        </TouchableOpacity>
      </View>

      {/* 채팅 히스토리 목록 - 웹 앱 ChatHistoryPanel과 동일 */}
      <FlatList
        data={mockChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => handleChatSelect(item.id)}
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

      {/* 채팅 히스토리 패널 */}
      <ChatHistoryPanel
        visible={showHistoryPanel}
        chatHistory={mockChats.map((chat) => ({
          id: chat.id,
          title: chat.title,
          lastMessage: chat.lastMessage,
          timestamp: chat.timestamp,
        }))}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onClose={() => setShowHistoryPanel(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    paddingTop: 30,
    paddingBottom: 20,
  },
  chatItem: {
    height: 40,
    justifyContent: "center",
    paddingVertical: 0,
    marginBottom: 0,
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
