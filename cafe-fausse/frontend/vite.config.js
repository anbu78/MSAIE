import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the Flask backend during local development.
      '/api': {
        // Note: port 5001 (not the Flask default 5000) because macOS's
        // AirPlay Receiver occupies port 5000 by default on many Macs.
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
