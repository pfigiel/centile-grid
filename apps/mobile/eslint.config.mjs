import centileGridPlugin from '@centile-grid/eslint-plugin';
import expoConfig from 'eslint-config-expo/flat.js';
import prettierConfig from 'eslint-config-prettier';
import preferArrow from 'eslint-plugin-prefer-arrow';
import { defineConfig } from 'eslint/config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  expoConfig,
  ...centileGridPlugin.configs.react,
  prettierConfig,
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: resolve(tsconfigRootDir, 'tsconfig.json'),
        },
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.d.ts'],
    plugins: {
      'prefer-arrow': preferArrow,
    },
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
