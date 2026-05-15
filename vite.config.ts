import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Dev: proxy API calls to the backend so there's no CORS friction.
      // Override the target with VITE_PROXY_TARGET (default: localhost:8000).
      "/api": { target: process.env.VITE_PROXY_TARGET || "http://localhost:8000", changeOrigin: true },
      "/webhook": { target: process.env.VITE_PROXY_TARGET || "http://localhost:8000", changeOrigin: true },
    },
  },
});
