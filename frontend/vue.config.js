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
  publicPath: '{{_codestage_prefix_}}',
  outputDir: path.resolve(__dirname, "../cli/dist"),
})
