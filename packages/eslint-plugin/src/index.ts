import plugin from './plugin';
import reactConfig from './configs/react';

const pluginWithConfigs = {
  ...plugin,
  configs: {
    react: reactConfig,
  },
};

export = pluginWithConfigs;
