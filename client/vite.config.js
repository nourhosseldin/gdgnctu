import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // يوجّه طلبات /api إلى سيرفر Express المحلي أثناء التطوير
      '/api': 'http://localhost:5000',
    },
  },
})
