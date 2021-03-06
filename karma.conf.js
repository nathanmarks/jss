var webpack = require('webpack')
var assign = require('lodash/object/assign')
var webpackConfig = require('./webpack.config')
var browsers = require('./browsers')

module.exports = function (config) {
  config.set({
    singleRun: true,
    customLaunchers: browsers,
    browsers: ['Chrome', 'Firefox', 'Safari'],
    frameworks: ['qunit'],
    files: [
      'node_modules/es5-shim/es5-shim.js',
      'node_modules/es5-shim/es5-sham.js',
      'tests.webpack.js'
    ],
    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ]
    },
    webpack: assign(webpackConfig, {
      devtool: 'inline-source-map'
    }),
    webpackServer: {
      noInfo: true
    },
    coverageReporter: {
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'lcovonly', subdir: '.' }
      ]
    }
  })

  if (process.env.USE_CLOUD) {
    // We support multiple node versions in travis.
    // To reduce load on browserstack, we only run tests in one node version.
    var nodeVersion = parseInt(process.version.substr(1), 10)
    var nodeVersionBrowserStack = parseInt(process.env.NODE_VERSION_BROWSERSTACK, 10)
    if (nodeVersion === nodeVersionBrowserStack) {
      config.browsers = Object.keys(browsers)
    } else {
      config.browsers = ['PhantomJS']
    }

    config.browserDisconnectTimeout = 10000
    config.browserDisconnectTolerance = 3
    config.browserNoActivityTimeout = 30000
    config.captureTimeout = 200000

    if (process.env.TRAVIS) {
      var buildLabel = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')'

      config.browserStack = {
        username: process.env.BROWSER_STACK_USERNAME,
        accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
        pollingTimeout: 10000,
        startTunnel: false,
        project: 'jss',
        build: buildLabel,
        name: process.env.TRAVIS_JOB_NUMBER
      }

      config.singleRun = true
    }
    else {
      config.browserStack = {
        username: process.env.BROWSER_STACK_USERNAME,
        accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
        pollingTimeout: 10000,
        startTunnel: true
      }
    }
  }
}
