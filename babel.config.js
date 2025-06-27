module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for Expo Router
      require.resolve('expo-router/babel'),
      // Ensure proper interop for web
      ['@babel/plugin-transform-modules-commonjs', {
        allowTopLevelThis: true,
        loose: true
      }],
      // Reanimated plugin should be last
      'react-native-reanimated/plugin',
    ],
  };
};