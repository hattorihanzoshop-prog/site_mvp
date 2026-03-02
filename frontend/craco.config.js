const path = require("path");

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      // 1. Убираем ForkTsCheckerWebpackPlugin, который не дружит с новыми AJV
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
      );

      // 2. Оптимизируем watchOptions (оставляем твою логику)
      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        ignored: ['**/node_modules/**', '**/build/**'],
      };

      return webpackConfig;
    },
  },
};
