'use strict'
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const cwd = (file) => {
  return path.join(process.cwd(), file || '')
}

module.exports = {
  entry: {
    content: './src/content.js',
    inpage: './src/inpage.js'
  },
  output: {
    path: __dirname,
    filename: '[name].js',
    // Point sourcemap entries to original disk location
    devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath),
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true
  },
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false
  },
  watch: true,
  // watchOptions: {
  //   ignored: /contracts/
  // },
  resolve: {
    extensions: ['.js', '.vue', '.css', '.json'],
    alias: {
      artifacts: path.join(__dirname, './contracts/build/contracts'),
      contracts: path.join(__dirname, './src/contracts'),
      data: path.join(__dirname, './contracts/data')
    },
    modules: [
      cwd('node_modules')//,
      // this meanse you can get rid of dot hell
      // for example import 'components/Foo' instead of import '../../components/Foo'
      // _.cwd('client')
    ]
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loaders: ['vue-loader']
      },
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: [/node_modules/]
      },
      {
        test: /\.es6$/,
        loaders: ['babel-loader']
      },
      {
        test: /\.(ico|jpg|png|gif|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/,
        loader: 'file-loader',
        query: {
          name: 'static/media/[name].[hash:8].[ext]'
        }
      },
      {
        test: /\.svg$/,
        loader: 'raw-loader'
      }
    ]
  }
}
