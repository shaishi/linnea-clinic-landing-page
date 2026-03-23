import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/linnea-clinic-landing-page/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        botox: resolve(__dirname, 'article-botox.html'),
        fillers: resolve(__dirname, 'article-fillers.html'),
        scientific: resolve(__dirname, 'article-scientific.html')
      }
    }
  }
})
