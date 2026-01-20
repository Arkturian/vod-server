import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Source maps für lesbare Stack Traces (in Dev deaktivieren für Prod)
    sourcemap: true,
  },
})
