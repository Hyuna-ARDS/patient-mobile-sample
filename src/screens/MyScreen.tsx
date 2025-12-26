import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { logout, name, email } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert(
      "로그아웃",
      "정말 로그아웃 하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "로그아웃",
          style: "destructive",
          onPress: async () => {
            await logout();
            navigation.navigate("Auth");
          },
        },
      ]
    );
  };

  const getUserInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>마이페이지</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 섹션 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getUserInitials(name)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.name}>{name || "사용자"}</Text>
          <Text style={styles.accountLabel}>계정</Text>
          {email && (
            <Text style={styles.email}>{email}</Text>
          )}
        </View>

        {/* 메뉴 섹션 */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={20} color={colors.text} />
              <Text style={styles.menuItemText}>내 정보</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings-outline" size={20} color={colors.text} />
              <Text style={styles.menuItemText}>설정</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="language-outline" size={20} color={colors.text} />
              <Text style={styles.menuItemText}>언어</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={20} color={colors.redAccentLight} />
              <Text style={[styles.menuItemText, styles.logoutText]}>로그아웃</Text>
            </View>
          </TouchableOpacity>
        </View>
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
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 32,
    marginBottom: 8,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarOuter: {
    width: 64,
    height: 64,
    backgroundColor: colors.backgroundGray,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundGray,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: -0.4,
  },
  name: {
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: -0.6,
  },
  accountLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textTertiary,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  email: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textTertiary,
    letterSpacing: -0.3,
  },
  menuSection: {
    marginTop: 8,
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 56,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    fontWeight: "500",
    letterSpacing: -0.4,
  },
  logoutText: {
    color: colors.redAccentLight,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 20,
  },
});
