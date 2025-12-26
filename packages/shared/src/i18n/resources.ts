import type { Resource } from "i18next";

import commonEn from "./locales/en/common.json" with { type: "json" };
import chatEn from "./locales/en/chat.json" with { type: "json" };
import uploadEn from "./locales/en/upload.json" with { type: "json" };
import homeEn from "./locales/en/home.json" with { type: "json" };
import reportsEn from "./locales/en/reports.json" with { type: "json" };

import commonKo from "./locales/ko/common.json" with { type: "json" };
import chatKo from "./locales/ko/chat.json" with { type: "json" };
import uploadKo from "./locales/ko/upload.json" with { type: "json" };
import homeKo from "./locales/ko/home.json" with { type: "json" };
import reportsKo from "./locales/ko/reports.json" with { type: "json" };

export const LANGUAGE_STORAGE_KEY = "patient-web-language";

export const resources = {
  en: {
    common: commonEn,
    chat: chatEn,
    upload: uploadEn,
    home: homeEn,
    reports: reportsEn,
  },
  ko: {
    common: commonKo,
    chat: chatKo,
    upload: uploadKo,
    home: homeKo,
    reports: reportsKo,
  },
} satisfies Resource;

export type AppLanguage = keyof typeof resources;

