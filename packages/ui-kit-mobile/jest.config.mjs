import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|react-native-reanimated))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
  moduleNameMapper: {
    '^react-native-reanimated$': require.resolve('react-native-reanimated/mock'),
    '^react-native-reanimated/(.+)': require.resolve('react-native-reanimated/mock'),
  },
};
