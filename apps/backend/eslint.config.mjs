import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(...tseslint.configs.recommended, prettierConfig, {
  ignores: ['dist/*', '*.cjs'],
});
