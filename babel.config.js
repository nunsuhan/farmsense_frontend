module.exports = function (api) {
    api.cache(true);
    const isProduction = process.env.BABEL_ENV === 'production' || process.env.NODE_ENV === 'production';
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'react-native-reanimated/plugin',
            // release 빌드에서 console.log 제거 (Play Store 심사 권장)
            ...(isProduction ? [['transform-remove-console', { exclude: ['error', 'warn'] }]] : []),
        ],
    };
};
