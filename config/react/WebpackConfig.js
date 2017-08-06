const path = require('path');
const webpack = require('webpack');
const BabelConfig = require('./BabelConfig');
const Utils = require('../../lib/utils');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

exports._default = function (devServerConfig, env) {
  env = env || 'development'
  const output = {
    path: path.join(process.cwd(), './dist/'),
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
  };

  const AUTOPREFIXER_BROWSERS = [
    'Android 2.3',
    'Android >= 4',
    'Chrome >= 35',
    'Firefox >= 31',
    'Explorer >= 9',
    'iOS >= 6',
    'Opera >= 12',
    'Safari >= 7.1',
  ];

  const GLOBALS = {
    'process.env.NODE_ENV': `'${env}'`,
    __DEV__: env === 'development',
  };

  const plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin(GLOBALS),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.NoErrorsPlugin(),
    new ProgressBarPlugin(),
    new ExtractTextPlugin('[name].css'),
  ];

  const moduleConfig = {
    loaders: [{
      test: /\.jsx?$/,
      loader: require.resolve('babel-loader'),
      query: BabelConfig.get(),
      include: /(node_modules\/@lulu\/lubc|src)/
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
      'react': {
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'react',
        root: 'React',
        'var': 'React'
      },
      'react-dom': {
        commonjs: 'react-dom',
        commonjs2: 'react-dom',
        amd: 'react-dom',
        root: 'ReactDOM',
        'var': 'ReactDOM'
      },
      'react-router': {
        commonjs: 'react-router',
        commonjs2: 'react-router',
        amd: 'react-router',
        root: 'ReactRouter',
        'var': 'ReactRouter'
      },
      'fastclick': {
        commonjs: 'fastclick',
        commonjs2: 'fastclick',
        amd: 'fastclick',
        root: 'FastClick',
        'var': 'FastClick'
      },
      'lodash': {
        commonjs: 'lodash',
        commonjs2: 'lodash',
        amd: 'lodash',
        root: '_',
        'var': '_'
      },
      'luui': 'luui',
      'lubase': 'lubase'
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
  var preEntrys = [path.join(__dirname, '../../lib/injectStaticHostUrl.js')]
  if (devServerConfig.hot) {
    preEntrys = preEntrys.concat([nodeModulesPath + 'webpack-dev-server/client?http://localhost:' + devServerConfig.port + '/', nodeModulesPath + 'webpack/hot/dev-server'])
  }
  var template = devServerConfig.template ? devServerConfig.template : path.join(__dirname, '../../template/html/index.html');
  Object.keys(config.entry).forEach(function (entry) {
    if (Array.isArray(config.entry[entry])) {
      config.entry[entry].unshift.apply(config.entry[entry], preEntrys)
    } else {
      config.entry[entry] = preEntrys.concat(config.entry[entry])
    }
    config.plugins.push(new HtmlWebpackPlugin({
      template: template,
      filename: `${entry}.html`,
      chunks: [entry]
    }))
  })
  if (devServerConfig.hot) {
    config.module.loaders.unshift({
      test: /\.jsx?$/,
      loader: require.resolve('react-hot-loader/webpack'),
      exclude: /node_modules/,
    })
    config.plugins.push(new webpack.HotModuleReplacementPlugin())
  }
}

exports.production = function () {
  var config = this._default(null, 'production')
  return config
}

exports.postProduction = function (config) {
  var preEntrys = [path.join(__dirname, '../../lib/injectStaticHostUrl.js')]
  Object.keys(config.entry).forEach(function (entry) {
    if (Array.isArray(config.entry[entry])) {
      config.entry[entry].unshift.apply(config.entry[entry], preEntrys)
    } else {
      config.entry[entry] = preEntrys.concat(config.entry[entry])
    }
  })
}
