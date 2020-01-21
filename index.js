const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanAssetsPlugin = require('./clean-assets-plugin');

module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    const {
      appShell: {
        nextPages = [],
        template = path.resolve(__dirname, 'default-template.ejs'),
        filenameGenerator = pageKey => `app-shell/${pageKey}.html`,
        htmlWebpackPluginOptions = {}
      }
    } = nextConfig;

    if (nextPages.length === 0) {
      throw new Error('withAppShell: missing appShell.nextPages parameter');
    }

    // We build the app shell files only once, on the client compilation
    // because the build-manifest file is not available on server compilation
    // (and because it doesn't make sense to build these files twice)
    if (!options.isServer && options.buildId !== 'development') {
      // Generate one app shell file per page
      nextPages.forEach(pageKey => {
        config.plugins.push(
          new HtmlWebpackPlugin({
            filename: filenameGenerator(pageKey),
            template,
            // User-defined params
            ...htmlWebpackPluginOptions,
            // Params needed by NextJS
            nextData: {
              dataManager: [],
              props: {
                isServer: false,
                initialState: {},
                initialProps: {}
              },
              page: '/' + pageKey,
              query: {},
              buildId: options.buildId,
              dynamicBuildId: false,
              dynamicIds: [],
              isAppShell: true
            }
          })
        );
      });

      // Clean up and complete the linked assets
      config.plugins.push(new CleanAssetsPlugin());
    }

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  }
});
