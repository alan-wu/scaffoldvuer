module.exports = {
    chainWebpack: config => {
      // GraphQL Loader
      config.module
        .rule('sahder')
        .test(/\.(vs|fs)$/i)
        .use('raw-loader')
          .loader('raw-loader')
          .end()
    }
}