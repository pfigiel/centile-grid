export default {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'require', 'default'],
  },
  moduleNameMapper: {
    '^msw$': '<rootDir>/../../node_modules/msw/lib/core/index.js',
    '^msw/node$': '<rootDir>/../../node_modules/msw/lib/node/index.js',
  },
  transform: {
    '^.+\\.mjs$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|@open-draft/deferred-promise|rettime|until-async))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
};
