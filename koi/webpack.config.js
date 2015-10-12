var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    app: './app/main.js',
    vendor: [
      'react',
      'redux',
      'redux-thunk',
      'react-redux',
      'react-router',
      'whatwg-fetch',
      'history'
    ],
  },

  output: {
    path: 'public/',
    filename: '[name].bundle.js',
  },

  resolve: {
    root: path.resolve('./node_modules'),
  },

  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
    new ExtractTextPlugin('[name].bundle.css')
  ],

  devtool: 'source-map',

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules\/)/,
        loader: 'babel-loader',
        query: {
          optional: ['es7.asyncFunctions', 'es7.classProperties']
        },
      },

      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('css-loader'),
      },

      {
        test: /(?:\.woff|\.ttf|\.svg|\.eot)/,
        loader: 'file-loader',
        query: {
          name: '/static/koi/font/[hash].[ext]'
        }
      },
    ]
  }
};
