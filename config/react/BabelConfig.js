exports.get = function () {
  return {
    "presets": ["es2015", "react"].map(function (preset) {
      return require.resolve(`babel-preset-${preset}`)
    }),
    "plugins": [
      require.resolve("babel-plugin-transform-decorators-legacy"),
      require.resolve('babel-plugin-transform-class-properties'),
      require.resolve('babel-plugin-transform-object-rest-spread')
    ]
  }
}
