const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = /.*\.test\.(ts|tsx)$/;

module.exports = config;
