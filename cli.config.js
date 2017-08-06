module.exports = {
  preset: 'react',
  webpack: function (config) {
    config.entry['main'] = './src/index.js'
    return config
  },
  devServer: {
    hot: true,
    port: 8080
  }
}
