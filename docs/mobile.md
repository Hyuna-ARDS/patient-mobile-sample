# Mobile app kickoff (React Native / Expo)

지금 `patient-web`을 유지하면서 모바일 앱을 별도 레포로 시작하고, 공통 코드는 패키지로 공유하는 방식을 정리했습니다. 커서에서 따라 할 명령/구조를 그대로 적어둡니다.

## 런타임/패키지 매니저
- Node: Expo/RN은 LTS 18.x 또는 20.x 권장. 표준 없으면 `20`을 `.nvmrc`에 기록해 두 레포에서 동일하게 사용.
- 패키지 매니저: 모바일은 bun보다 npm/yarn/pnpm이 호환성 높음. 웹이 bun이어도 모바일은 `pnpm`(권장) 또는 `yarn`/`npm`으로 진행.

## 디렉터리 레이아웃 권장
- `~/Documents/GitHub/patient-web` (현 리포)
- `~/Documents/GitHub/patient-mobile` (새 Expo 앱)
- `~/Documents/GitHub/patient-shared` 또는 `patient-platform/packages/shared` (공통 패키지)

## 패키지 스택 (웹과 정렬)
- 코어: `expo`, `react-native`, `expo-router`(또는 `@react-navigation/native` + `@react-navigation/native-stack`/`bottom-tabs`), `react-native-safe-area-context`, `react-native-screens`.
- 상태/데이터: `@tanstack/react-query`, `zod` (웹 동일). 필요 시 `zustand`도 동일하게 사용.
- API: `axios`(웹과 동일) + 인터셉터/재시도 로직을 공통화.
- i18n: `i18next`, `react-i18next`, 번역 JSON 공유. 스토리지는 `@react-native-async-storage/async-storage`.
- 폼: `react-hook-form`, `@hookform/resolvers` (웹 동일).
- 날짜/유틸: `date-fns`, `clsx`는 선택.
- UI: 토큰은 공유, 컴포넌트는 플랫폼 전용 라이브러리(`react-native-paper`/`tamagui`/`nativewind` 등) 중 택1.
- 인증/보안 저장소: `expo-auth-session` 또는 `react-native-app-auth`; 토큰 저장 `expo-secure-store` 또는 `react-native-encrypted-storage`.
- 네비 요구 패키지: `react-native-gesture-handler`, `react-native-reanimated`, `expo-linking`, 필요 시 `react-native-mmkv`.
- dev: `typescript`, `@types/react`, `eslint` RN 설정.

### patient-mobile 설치 예시 (pnpm)
```bash
pnpm add @tanstack/react-query axios i18next react-i18next @react-native-async-storage/async-storage \
  @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
  react-native-safe-area-context react-native-screens react-hook-form @hookform/resolvers \
  zod date-fns expo-auth-session expo-linking

pnpm add react-native-reanimated react-native-gesture-handler expo-secure-store
pnpm add -D typescript @types/react eslint
```

## 1) Expo 앱 생성
```bash
cd ~/Documents/GitHub
npx create-expo-app patient-mobile --template expo-template-blank-typescript
cd patient-mobile
```
패키지 스택은 웹과 맞춰 설치하세요: `@tanstack/react-query`, `zod`, `axios`(또는 기존 apiClient 의존), `i18next`, `react-i18next`, `@react-native-async-storage/async-storage`, `@react-navigation/native` + stack/tab.

## 2) 공통 패키지 초기화
웹/모바일이 함께 쓰는 도메인 로직, 타입, API 클라이언트, 번역 리소스, 디자인 토큰을 묶습니다.

```bash
cd ~/Documents/GitHub
mkdir patient-shared && cd patient-shared
pnpm init # 또는 npm/yarn
mkdir src
```

`package.json` 예시:
```json
{
  "name": "@patient/shared",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json"
  },
  "dependencies": {
    "i18next": "^23.11.5",
    "zod": "^4.1.12"
  },
  "peerDependencies": {
    "typescript": ">=5.0.0"
  }
}
```

`tsconfig.json` 예시:
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "target": "ES2020",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

### 공유 코드 초안
- `src/i18n/resources.ts`: `common.json`, `chat.json` 등 번역 JSON과 `LANGUAGE_STORAGE_KEY`(`"patient-web-language"`)를 export.
- `src/api/client.ts`: 웹의 `src/services/apiClient.ts` 로직을 플랫폼 중립으로 옮기고, 토큰 저장은 추상화 함수로 분리.
- `src/config/index.ts`: 환경별 상수/타입.
- `src/types/…`: 도메인 타입.
- `src/theme/tokens.ts`: 색/폰트/간격/라운드 값 등 디자인 토큰.
- `src/utils/…`: 공통 유틸(포맷터, validator).

모바일/웹에서 설치:
```bash
# patient-mobile
pnpm add ../patient-shared
# patient-web
pnpm add ../patient-shared
```
또는 pnpm/yarn workspace를 써서 루트에 `pnpm-workspace.yaml`을 만들고 두 프로젝트를 등록해도 됩니다.

## 3) 모바일에서 i18n 연결
`LANGUAGE_STORAGE_KEY`를 그대로 쓰되, 스토리지 어댑터만 교체합니다.
```ts
// patient-mobile/src/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import resources, { LANGUAGE_STORAGE_KEY } from "@patient/shared/i18n/resources";

const storage = {
  async get() {
    return AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  },
  async set(lng: string) {
    return AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  },
};

void i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    defaultNS: "common",
    compatibilityJSON: "v4",
    lng: (await storage.get()) ?? "en",
    react: { useSuspense: false },
  });

i18n.on("languageChanged", (lng) => {
  void storage.set(lng);
});
```

## 4) 모바일 네비게이션 매핑
- 웹 라우팅 흐름을 `React Navigation` stack/tab으로 대응.
- 최소 플로우: `AuthStack`(로그인/회원가입) → `MainTabs`(홈/리포트/챗 등).

## 5) 인증/토큰 처리
- 웹의 OAuth 리다이렉션은 모바일에서 `expo-auth-session` 혹은 `react-native-app-auth`로 교체.
- 토큰 저장은 `expo-secure-store`나 `react-native-encrypted-storage` 추천. 공통 API 클라이언트에서는 토큰 공급 함수를 주입하는 식으로 추상화.

## 6) 디자인 토큰/컴포넌트
- 공통 패키지에 색상/폰트/간격 토큰을 JSON or TS로 정의.
- 모바일은 `StyleSheet`/`styled-components`/`tamagui` 등에서 토큰을 그대로 참조해 동일한 룩앤필을 유지하되, 터치 타깃과 키보드 대응을 우선 조정.

## 7) 빌드/테스트 체크리스트
- iOS/Android 에뮬레이터에서 네비게이션 흐름, 키보드 가림, 권한(갤러리/카메라/파일) 확인.
- 느린 네트워크 프로파일링(오프라인 메시지/재시도) 점검.
- 폰트/로케일 깨짐 여부 확인.

이 순서대로 진행하면 `patient-web`을 손대지 않고 모바일을 시작하고, 나중에 공통 패키지를 성숙하게 키울 수 있습니다. 필요하면 workspace 설정이나 공유 패키지 초기 코드까지 추가로 적어드릴게요.
