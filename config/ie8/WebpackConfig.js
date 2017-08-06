const path = require('path');
const webpack = require('webpack');
const BabelConfig = require('./BabelConfig');
const Utils = require('../../lib/utils');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

exports._default = function (devServerConfig, env) {
  env = env || 'development'
  const output = {
    path: path.join(process.cwd(), './dist/'),
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
  };

  const AUTOPREFIXER_BROWSERS = [
    'Chrome >= 35',
    'Firefox >= 31',
    'Explorer >= 7',
    'Opera >= 12',
    'Safari >= 7.1'
  ];

  const GLOBALS = {
    'process.env.NODE_ENV': `"${env}"`,
    __DEV__: env === 'development',
  };

  const plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin(GLOBALS),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.NoErrorsPlugin(),
    new ProgressBarPlugin(),
    new ExtractTextPlugin('[name].css'),
  ];

  const moduleConfig = {
    loaders: [{
      test: /\.js$/,
      loader: require.resolve('babel-loader'),
      query: BabelConfig.get(),
      exclude: /node_modules/,
    }, {
      test: /\.(png|jpg|jpeg|gif)$/,
      loader: require.resolve('url-loader') + '?limit=100&&name=images/[name].[hash:6].[ext]',
    }, {
      test: /\.(eot|ttf|wav|mp3|svg|woff|woff2)$/,
      loader: require.resolve('file-loader') + '?name=fonts/[name].[ext]',
    }, {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract(require.resolve('style-loader'), require.resolve('css-loader') + '!' + require.resolve('postcss-loader')),
    }],
  };

  const resolve = {
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx'],
    root: [
      path.join(__dirname, '../node_modules')
    ]
  };

  const config = {
    entry: {},
    output,
    module: moduleConfig,
    plugins,
    externals:{
    },
    resolve,
    postcss: function plugin(bundler) {
      return [
        require('postcss-import')({
          path: [path.join(__dirname, '../node_modules')]
        }),
        require('postcss-mixins')(),
        require('postcss-nested')(),
        require('postcss-cssnext')({
          browsers: AUTOPREFIXER_BROWSERS,
        }),
      ];
    },
  };

  return config;
}

exports.development = function (devServerConfig) {
  var config = this._default(devServerConfig)
  config.devtool = '#inline-source-map'
  return config
}

exports.postDevelopment = function (config, devServerConfig) {
  var nodeModulesPath = Utils.resolveNodeModulesPath()
  var hotEntrys = [nodeModulesPath + 'webpack-dev-server/client?http://localhost:' + devServerConfig.port + '/', nodeModulesPath + 'webpack/hot/dev-server']
  Object.keys(config.entry).forEach(function (entry) {
    if (devServerConfig.hot) {
      if (Array.isArray(config.entry[entry])) {
        config.entry[entry].unshift.apply(config.entry[entry], hotEntrys)
      } else {
        config.entry[entry] = hotEntrys.concat(config.entry[entry])
      }
    }
  })
  if (devServerConfig.hot) {
    config.plugins.push(new webpack.HotModuleReplacementPlugin())
  }
}

exports.production = function () {
  var config = this._default(null, 'production')
  return config
}

exports.postProduction = function (config) {
}
