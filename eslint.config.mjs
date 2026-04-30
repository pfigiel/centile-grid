// https://docs.expo.dev/guides/using-eslint/
import expoConfig from 'eslint-config-expo/flat.js';
import prettierConfig from 'eslint-config-prettier';
import preferArrow from 'eslint-plugin-prefer-arrow';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  expoConfig,
  prettierConfig,
  {
    plugins: { 'prefer-arrow': preferArrow },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      'arrow-body-style': ['error', 'as-needed'],
      'prefer-arrow/prefer-arrow-functions': [
        'error',
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false,
        },
      ],
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
