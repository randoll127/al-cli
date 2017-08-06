exports.get = function () {
  return {
    preset: 'react',
    webpackConfig: function (config) {
      return config
    },
    devServerConfig: {
      hot: true,
      port: 8080
    }
  }
}
