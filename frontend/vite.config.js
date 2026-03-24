import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // Configuration pour le routing côté client (SPA)
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})

