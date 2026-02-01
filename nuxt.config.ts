// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-studio'
  ],

  studio: {
    repository: {
      provider: 'github', 
      owner: 'fabianabarca', 
      repo: 'araiza', 
      branch: 'main', 
    },
    i18n: {
      defaultLocale: 'es'
    }
  },

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  mdc: {
    highlight: {
      noApiRoute: false
    }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('@nuxt') || id.includes('nuxt')) {
                return 'vendor-nuxt'
              }
              if (id.includes('vue')) {
                return 'vendor-vue'
              }
              return 'vendor'
            }
          }
        }
      }
    }
  },

  typescript: {
    typeCheck: false
  }
})