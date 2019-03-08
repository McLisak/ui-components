const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const fs = require('fs');

const getEntries = () => {
  const result = {
    index: path.resolve(__dirname, 'src/index.js'),
  };
  const exclude = ['assets'];

  const extensionRegex = new RegExp(/^.*\.[^\\]+$/);
  const srcFiles = fs.readdirSync('src');
  srcFiles.forEach((fileName) => {
    if (exclude.includes(fileName) || extensionRegex.test(fileName)) {
      return;
    }
    let entryName = `${fileName}/index`;
    result[entryName] = path.resolve(__dirname, 'src/' + entryName);
  });
  return result;
};

const getHtmlPlugins = () => {
  const result = [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['index'],
      template: path.resolve(__dirname, 'src/index.html'),
    }),
  ];
  const exclude = ['assets'];
  const extensionRegex = new RegExp(/^.*\.[^\\]+$/);
  const srcFiles = fs.readdirSync('src');
  srcFiles.forEach((fileName) => {
    if (exclude.includes(fileName) || extensionRegex.test(fileName)) {
      return;
    }
    let entryName = `${fileName}/index.html`;
    result.push(
      new HtmlWebpackPlugin({
        filename: entryName,
        template: path.resolve(__dirname, 'src/' + entryName),
        chunks: [`${fileName}/index`],
      })
    );
  });
  return result;
};

module.exports = () => {
  const config = {
    mode: 'development',
    devServer: {
      contentBase: path.resolve(__dirname, 'dist'),
      host: '0.0.0.0',
    },
    entry: getEntries(),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
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
      new MiniCssExtractPlugin({
        chunkFilename: '[name].css',
      }),
      ...getHtmlPlugins(),
    ],
  };

  return config;
};
