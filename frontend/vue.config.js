const { defineConfig } = require('@vue/cli-service')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require("path");


module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  configureWebpack: {
    plugins: [
      new MonacoWebpackPlugin()
    ]
  },
  publicPath: '{{WebGPUTutorial}}',
  outputDir: path.resolve(__dirname, "../cli/dist"),
})
