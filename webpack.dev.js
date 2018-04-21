const path = require('path');
const webpack = require('webpack');

const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, 'src');
const BUILD_PATH = path.resolve(ROOT_PATH, 'build');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  mode: 'development',
  entry: ['./src/index.tsx', 'react-hot-loader/patch'],
  devServer: {
    publicPath: '/',
    contentBase: BUILD_PATH,
    historyApiFallback: true,
    hot: true,
    open: true,
    inline: true,
    port: 8888,
    host: 'localhost',
    openPage: '',
    proxy: {},
    quiet: true,
    compress: true // 开发服务器是否启动gzip等压缩
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]) // 忽略掉 d.ts 文件，避免因为编译生成 d.ts 文件导致又重新检查。
  ],
  watch: true,
  watchOptions: {
    ignored: /node_modules/, // 忽略不用监听变更的目录
    aggregateTimeout: 100, // 防止重复保存频繁重新编译,500毫米内重复保存不打包
    poll: 1000 // 每秒询问的文件变更的次数
  }
};
