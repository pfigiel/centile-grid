'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
const plugin_1 = __importDefault(require('./plugin'))
const react_1 = __importDefault(require('./configs/react'))
const pluginWithConfigs = {
  ...plugin_1.default,
  configs: {
    react: react_1.default,
  },
}
module.exports = pluginWithConfigs
