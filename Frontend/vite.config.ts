import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'd3-color': path.resolve(__dirname, './node_modules/d3-color/src/index.js'),
      'shiki/wasm': path.resolve(__dirname, './node_modules/shiki/dist/onig.wasm'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return
          }

          if (
            id.includes("/recharts/") ||
            id.includes("/d3-") ||
            id.includes("/internmap/")
          ) {
            return "charts-vendor"
          }

          if (id.includes("/react-router-dom/") || id.includes("/react-router/") || id.includes("/history/")) {
            return "router-vendor"
          }

          if (id.includes("/zustand/") || id.includes("/@tanstack/")) {
            return "state-vendor"
          }

          if (id.includes("/lucide-react/")) {
            return "icon-vendor"
          }
        },
      },
    },
  },
})
