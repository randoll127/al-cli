var program = require('commander')
var inquirer = require('inquirer')
var debug = require('debug')('lulu')
var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')
var path = require('path')
var express = require('express')
var fs = require('fs')
var path = require('path')
var ejs = require('ejs')

var pkg = require('./package.json')
var LuluConfig = require('./lib/LuluConfig')

var WebpackConfig

function requireWepackConfig(preset) {
    WebpackConfig = require('./config/' + preset + '/WebpackConfig')
}

debug('lulu start')

var statOptions = {
    colors: true,
    chunks: false,
}

function getLuluConfig(luluConfigFilePath, env) {
    var config
    try {
        config = require(path.join(process.cwd(), luluConfigFilePath))
    } catch (e) {
        console.log('读取 lulu.config.js 失败')
        debug('read lulu.config.js error', e)
        config =  {}
    }
    //生成的文件覆盖基础文件
    config = Object.assign(LuluConfig.get(), config)
    //读取webpackConfig
    requireWepackConfig(config.preset)

    config.webpackConfig = config.webpack(WebpackConfig[env]())
    return config
}

program
    .version(pkg.version)

program
    .command('start')
    .option('-c --config [config]', 'lulu 配置文件', './cli.config.js')
    .action(function (cmd) {
        var luluConfig = getLuluConfig(cmd.config, 'development')
        WebpackConfig.postDevelopment(luluConfig.webpackConfig, luluConfig.devServer)
        console.log(`DevServer on http://127.0.0.1:${luluConfig.devServer.port}`)
        var server = new WebpackDevServer(webpack(luluConfig.webpackConfig), {
            stats: statOptions,
            hot: luluConfig.devServer.hot,
            publicPath: luluConfig.devServer.publicPath,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            setup: function (app) {
                debug('setup')
                app.use(express.static(path.join(__dirname, './node_modules/')))
                app.use(express.static(path.join(__dirname, '../../../node_modules/')))
                luluConfig.devServer.setup && luluConfig.devServer.setup(app)
            }
        })
        server.listen(luluConfig.devServer.port, '127.0.0.1', function () {})
    })

program
    .command('build')
    .option('-c --config [config]', 'lulu 配置文件', './cli.config.js')
    .action(function (cmd) {
        var luluConfig = getLuluConfig(cmd.config, 'production')
        WebpackConfig.postProduction(luluConfig.webpackConfig)
        webpack(luluConfig.webpackConfig, function (err, stat) {
            if (err) {
                console.log(err)
            } else {
                console.log(stat.toString(statOptions))
            }
        })
    })

program
    .command('init')
    .action(function (cmd) {
        inquirer.prompt([{
            type: 'list',
            name: 'preset',
            message: 'Which preset do you want?',
            choices: ['react', 'ie8']
        }, {
            type: 'input',
            name: 'devServerPort',
            message: 'Dev Server Port?',
            default: 8080
        }, {
            type: 'input',
            name: 'entryFilePath',
            message: 'What is the entry file path?',
            default: './src/index.js'
        }, {
            type: 'input',
            name: 'entryName',
            message: 'Give the entry a name?',
            default: 'main'
        }]).then(function (answers) {
            fs.writeFileSync(path.join(process.cwd(), './cli.config.js'), ejs.render(fs.readFileSync(path.join(__dirname, './template/cli.config.js.ejs'), 'utf8'), answers))
            console.log('   \x1b[36mcreate\x1b[0m : cli.config.js');
            console.log('run \x1b[36mlulu start\x1b[0m to begin')
        }).catch(function (err) {
            console.log(err)
        });
    })

program.parse(process.argv);
