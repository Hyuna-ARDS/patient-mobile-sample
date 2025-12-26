// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 로컬 패키지(@patient/shared)를 인식하도록 watchFolders 추가
config.watchFolders = [
  __dirname,
  __dirname + '/../patient-shared',
];

// resolver 설정
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    '@patient/shared': __dirname + '/../patient-shared',
  },
};

module.exports = config;

