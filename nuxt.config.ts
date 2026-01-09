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
    // Git repository configuration (owner and repo are required)
    dev: true,
    repository: {
      provider: 'github', // 'github' or 'gitlab'
      owner: 'fabianabarca', // your GitHub/GitLab username or organization
      repo: 'araiza', // your repository name
      branch: 'main', // the branch to commit to (default: 'main')
    }
  },

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true,
      concurrency: 1
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