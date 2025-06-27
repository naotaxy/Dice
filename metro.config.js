const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.sourceExts.push('mjs', 'cjs');

// Ensure proper module resolution for web
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// Add transformer options for better compatibility
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;