const webpack = require('@cypress/webpack-preprocessor')
const { VueLoaderPlugin } = require('vue-loader')
const path = require('path')

const webpackOptions = {
  resolve: {
    extensions: ['.js', '.json', '.vue'],
    alias: {
      vue: 'vue/dist/vue.esm.js',
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@vue/cli-plugin-babel/preset'],
            plugins: [
              [
                "component",
                {
                  libraryName: "element-ui",
                  styleLibraryName: "theme-chalk"
                }
              ]
            ]
          },
        }
      },
      {
        test: /\.css$/,
        loaders: ['vue-style-loader', 'css-loader'],
      },
      {
        test: /\.(vs|fs)$/i,
        loaders: ['raw-loader'],
      },
      {
        test: /\.(ttf|otf|eot|woff|woff2)$/,
        loaders: ['base64-inline-loader'],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}

const options = {
  // send in the options from your webpack.config.js, so it works the same
  // as your app's code
  webpackOptions,
  watchOptions: {},
}

module.exports = (on) => {
  on('file:preprocessor', webpack(options))
}
