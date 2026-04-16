import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/v1/telegram": {
        target: "http://localhost:8182",
        changeOrigin: true,
        secure: false,
      },

      "/api/v1/preview": {
        target: "http://localhost:8181",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://localhost:8180",
        changeOrigin: true,
        secure: false,
      },
      
    },
  },
})
