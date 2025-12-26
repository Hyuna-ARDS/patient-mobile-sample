import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resources, LANGUAGE_STORAGE_KEY, type AppLanguage } from "@patient/shared";

const storage = {
  async get(): Promise<string | null> {
    return await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  },
  async set(lng: string): Promise<void> {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  },
};

// 비동기 초기화
(async () => {
  const savedLanguage = (await storage.get()) ?? "en";
  
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      defaultNS: "common",
      compatibilityJSON: "v4",
      lng: savedLanguage,
      react: { useSuspense: false },
    });

  i18n.on("languageChanged", (lng) => {
    void storage.set(lng);
  });
})();

export type { AppLanguage };
export default i18n;

