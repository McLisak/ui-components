const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = () => {
  const config = {
    mode: 'development',
    devServer: {
      contentBase: 'dist',
      host: '0.0.0.0',
      hot: true,
    },
    entry: {
      'test1/index': './src/test1/index.js',
      index: './src/index.js',
    },
    output: {
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: ['css-loader', 'postcss-loader', 'sass-loader'],
        },
      ],
    },
    resolve: {
      alias: {
        '@': './src',
      },
    },
    plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin(
        [
          {
            context: 'src/',
            from: '**/*.html',
          },
        ],
        { logLevel: 'debug' }
      ),
      new webpack.HotModuleReplacementPlugin(),
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /node_modules/,
            name: 'vendors',
            chunks: 'initial',
          },
        },
      },
    },
  };

  return config;
};
