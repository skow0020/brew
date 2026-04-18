import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/admin': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@mui')) {
            return 'mui'
          }

          if (id.includes('node_modules/@emotion')) {
            return 'emotion'
          }

          if (id.includes('node_modules/react-router')) {
            return 'router'
          }

          if (id.includes('node_modules/@tanstack')) {
            return 'query'
          }

          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
