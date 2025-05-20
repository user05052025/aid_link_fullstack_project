import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths' // Додаємо імпорт

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // Додаємо цей плагін
  ],
  server: {
    watch: {
      usePolling: true,
    },
  },
})