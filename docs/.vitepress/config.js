import { defineConfig } from 'vitepress'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "ScaffoldVuer Docs",
  description: "API documentation for ScaffoldVuer",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API References', link: '/components/ScaffoldVuer' }
    ],

    sidebar: [
      {
        text: 'Index',
        items: [
          { text: 'Live Demo', link: '/demo' },
          { text: 'API References', link: '/components/ScaffoldVuer' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ABI-Software/scaffoldvuer' }
    ]
  },
  sass: {
    data: `@import "@theme/styles/_variables";`
  },
  markdown: { attrs: { disable: true } },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use '../src/assets/styles' as *;`
        },
      },
    },
    plugins: [
      Components({
        // allow auto load markdown components under `./src/components/`
        extensions: ['vue'],
        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/],
        resolvers: [
          ElementPlusResolver({
            importStyle: 'css',
          }),
        ],
      }),
  
      // https://github.com/antfu/unocss
      // see unocss.config.ts for config
    ]
  }
})
