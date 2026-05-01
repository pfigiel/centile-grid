import centileGridPlugin from '@centile-grid/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  ...centileGridPlugin.configs.react,
  prettierConfig,
  {
    ignores: ['dist/*'],
  },
]);
