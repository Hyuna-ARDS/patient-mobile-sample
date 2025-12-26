import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { colors } from "../../theme/colors";
import { interpretationApiService } from "../../services/InterpretationService";

export default function LabUploadScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const handleTakePhoto = async () => {
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
            navigation.goBack();
            // 채팅 탭으로 이동하고 검사지 컨텍스트 전달
            (navigation as any).navigate("Chat", {
              screen: "ChatDetail",
              params: { reportId: requestId },
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.uploadArea}>
          <View style={styles.uploadIcon}>
            <Text style={styles.uploadIconText}>+</Text>
          </View>
          <Text style={styles.uploadTitle}>검사지를 업로드해주세요</Text>
          <Text style={styles.uploadSubtitle}>
            사진 또는 PDF 파일{'\n'}
            최대 10MB
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, uploading && styles.buttonDisabled]}
            onPress={handleTakePhoto}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>📷 사진 촬영</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, uploading && styles.buttonDisabled]}
            onPress={handleSelectFile}
            disabled={uploading}
          >
            <Text style={styles.secondaryButtonText}>📁 파일 선택</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💬 채팅은 백그라운드에서 계속 이용 가능합니다
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  uploadArea: {
    alignItems: "center",
    marginBottom: 32,
  },
  uploadIcon: {
    width: 128,
    height: 128,
    borderWidth: 4,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  uploadIconText: {
    fontSize: 48,
    color: colors.textTertiary,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  infoBox: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
