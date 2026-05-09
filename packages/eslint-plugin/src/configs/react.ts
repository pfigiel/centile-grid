import type { Linter } from 'eslint'
import pluginReact from 'eslint-plugin-react'
import plugin from '../plugin'
import pluginReactHooks = require('eslint-plugin-react-hooks')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tsParser = require('@typescript-eslint/parser')

const reactConfig: Linter.Config[] = [
  pluginReact.configs.flat.recommended as Linter.Config,
  pluginReact.configs.flat['jsx-runtime'] as Linter.Config,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    plugins: {
      'react-hooks': pluginReactHooks as any,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    plugins: {
      '@centile-grid': plugin,
    },
    rules: {
      '@centile-grid/no-react-namespace': 'error',
    },
  },
]

export default reactConfig
