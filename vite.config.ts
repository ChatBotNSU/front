import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/v1/telegram": {
        target: "http://localhost:8082",
        changeOrigin: true,
        secure: false,
      },

      "/api/v1/preview": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
      // Forward /api requests to backend running on localhost:8080 during development
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      
    },
  },
})
