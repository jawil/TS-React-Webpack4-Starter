const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackVersionPlugin = require('webpack-version-plugin');
const WebpackMerge = require('webpack-merge');
const StyleLintPlugin = require('stylelint-webpack-plugin');

const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, 'src');
const BUILD_PATH = path.resolve(ROOT_PATH, 'build');
const manifest = require('./vendor/react.manifest.json');

const svgDirs = [
  path.resolve(ROOT_PATH, 'src/my-project-svg-foler') // 自己私人的 svg 存放目录
];

module.exports = WebpackMerge(
  process.env.NODE_ENV === 'dev' ? require('./webpack.dev.js') : require('./webpack.build.js'),
  {
    output: {
      path: BUILD_PATH, // 编译到当前目录
      filename: 'js/[name].js'
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            'css-hot-loader',
            MiniCssExtractPlugin.loader,
            'css-loader?importLoaders=1',
            'postcss-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.tsx?$/, // 用babel编译jsx和es6
          include: [APP_PATH], // 指定检查的目录
          exclude: /node_modules/,
          use: [
            'cache-loader',
            'thread-loader',
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                presets: ['react', 'stage-2', ['env', { modules: false }]],
                // 关闭 Babel 的模块转换功能，保留原本的 ES6 模块化语法
                plugins: [
                  'transform-runtime',
                  'transform-decorators-legacy',
                  'react-hot-loader/babel'
                ]
              }
            },
            {
              loader: 'ts-loader',
              options: {
                happyPackMode: true,
                transpileOnly: true
              }
            }
          ]
        },
        {
          test: /\.(woff|woff2|eot|ttf)(\?.*$|$)/,
          use: ['url-loader']
        },
        {
          test: /\.(svg)$/i,
          use: ['svg-sprite-loader'],
          include: svgDirs // 把 svgDirs 路径下的所有 svg 文件交给 svg-sprite-loader 插件处理
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: ['url-loader?limit=8192&name=images/[hash:8].[name].[ext]']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: './index.html', // 生成的html存放路径，相对于 path
        template: './src/index.html',
        inject: true, // 允许插件修改哪些内容，包括head与body
        hash: true // 为静态资源生成hash值
      }),

      new AddAssetHtmlPlugin({
        filepath: path.resolve(ROOT_PATH, 'vendor/*.dll.js')
      }),

      new StyleLintPlugin(),

      new ForkTsCheckerWebpackPlugin({
        checkSyntacticErrors: true,
        tsconfig: path.resolve(ROOT_PATH, 'tsconfig.json'),
        tslint: path.resolve(ROOT_PATH, 'tslint.json'),
        watch: ['./src/**/*.tsx'],
        ignoreLints: ['no-console', 'object-literal-sort-keys', 'quotemark']
      }),

      new webpack.DllReferencePlugin({
        context: ROOT_PATH,
        manifest,
        extensions: ['.js', '.jsx', '.tsx']
      }),

      new MiniCssExtractPlugin({
        filename: 'css/[name].css'
      }),

      new WebpackVersionPlugin({
        cb: (hashMap) => {
          console.log(hashMap);
        }
      })
    ],

    resolve: {
      modules: ['node_modules', path.join(ROOT_PATH, './node_modules')],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.less', '.scss', '.json'],
      alias: {
        components: path.resolve(APP_PATH, './components')
      }
    },
    externals: {
      zepto: 'Zepto'
    }
  }
);
