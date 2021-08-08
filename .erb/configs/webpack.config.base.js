/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import { dependencies as externals } from '../../src/package.json';

const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const argv = process.env.npm_config_argv;
const plugins = [
  new webpack.EnvironmentPlugin({
    NODE_ENV: 'production',
  }),
  new webpack.DefinePlugin({
    'process.env.FLUENTFFMPEG_COV': false
  }),
];

const copyWebpackPlugins = [
  new CopyWebpackPlugin({
    patterns: [
      { from: path.resolve(__dirname, '../../node_modules/ffmpeg-static-electron/bin/mac/x64/ffmpeg'), to: 'bin/mac/x64'}
    ]
  }),
  new CopyWebpackPlugin({
    patterns: [
      { from: path.resolve(__dirname, '../../node_modules/ffprobe-static-electron/bin/mac/x64/ffprobe'), to: 'bin/mac/x64'}
    ]
  }),
  new CopyWebpackPlugin({
    patterns: [
      { from: path.resolve(__dirname, '../../node_modules/ffmpeg-static-electron/bin/win/x64/ffmpeg.exe'), to: 'bin/win/x64'}
    ]
  }),
  new CopyWebpackPlugin({
    patterns: [
      { from: path.resolve(__dirname, '../../node_modules/ffprobe-static-electron/bin/win/x64/ffprobe.exe'), to: 'bin/win/x64'}
    ]
  }),
];

//请分别使用package-mac、package-win打包，使用package-all打包会把该系统下不需要的文件打包进来，引起安装包体积增大
console.info('如果对ffmpeg或者ffprobe进行了升级，请手动删除 src/bin/下文件及app/dist/bin下文件');
if(argv.indexOf('mac')!==-1){
  //避免win依赖被打包进来
  fs.existsSync('src/bin/win/')&&fs.rmdirSync('src/bin/win/',{recursive:true});
  fs.existsSync('app/dist/bin/win/')&&fs.rmdirSync('app/dist/bin/win/',{recursive:true});

  //避免重复写入,如果对ffmpeg或者ffprobe进行了升级，请手动删除 bin/下文件及app/dist/bin下文件
  if(!fs.existsSync('src/bin/mac/')){
    plugins.push(
      copyWebpackPlugins[0],
      copyWebpackPlugins[1]
    )
  }

}else if(argv.indexOf('win')!==-1){
  //避免mac依赖被打包进来
  fs.existsSync('src/bin/mac/')&&fs.rmdirSync('src/bin/mac/',{recursive:true});
  fs.existsSync('app/dist/bin/mac/')&&fs.rmdirSync('app/dist/bin/mac/',{recursive:true});
  //避免重复写入,如果对ffmpeg或者ffprobe进行了升级，请手动删除 bin/下文件及app/dist/bin下文件
  if(!fs.existsSync('src/bin/win/')){
    plugins.push(
      copyWebpackPlugins[2],
      copyWebpackPlugins[3]
    )
  }

}else{
  if(!(fs.existsSync('src/bin/win/')&&fs.existsSync('src/bin/mac/')&&fs.existsSync('app/dist/bin/mac/')&&fs.existsSync('app/dist/bin/win/'))){
    plugins.push(...copyWebpackPlugins);
  }
}

export default {
  externals: [...Object.keys(externals || {})],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },

  output: {
    path: path.join(__dirname, '../../src'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [path.join(__dirname, '../../src'), 'node_modules'],
  },

  plugins: plugins,
};
