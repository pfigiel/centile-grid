'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const eslint_plugin_react_1 = __importDefault(require('eslint-plugin-react'))
const plugin_1 = __importDefault(require('../plugin'))
const pluginReactHooks = require('eslint-plugin-react-hooks')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tsParser = require('@typescript-eslint/parser')
const reactConfig = [
  eslint_plugin_react_1.default.configs.flat.recommended,
  eslint_plugin_react_1.default.configs.flat['jsx-runtime'],
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
      'react-hooks': pluginReactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    plugins: {
      '@centile-grid': plugin_1.default,
    },
    rules: {
      '@centile-grid/no-react-namespace': 'error',
    },
  },
]
exports.default = reactConfig
