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
        scientific: resolve(__dirname, 'article-scientific.html'),
        skinQuality: resolve(__dirname, 'article-skin-quality.html'),
        facialHarmony: resolve(__dirname, 'article-facial-harmony.html'),
        consultationPlan: resolve(__dirname, 'article-consultation-plan.html')
      }
    }
  }
})
