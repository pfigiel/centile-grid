export default {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  moduleNameMapper: {
    '^@shopify/react-native-skia$': '@shopify/react-native-skia/src/mock',
  },
};
