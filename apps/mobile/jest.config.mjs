export default {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'require', 'default'],
  },
  transform: {
    '^.+\\.mjs$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-native|@react-native|@react-native-community|expo|@expo|react-navigation|@react-navigation|@open-draft/deferred-promise|rettime|until-async))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
};
