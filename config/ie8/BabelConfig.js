exports.get = function () {
  return {
    "presets": ["es2015"].map(function (preset) {
      return require.resolve(`babel-preset-${preset}`)
    })
  }
}
