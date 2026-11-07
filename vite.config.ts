import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ["suspected-blake-affect-cargo.trycloudflare.com"],
  },
  plugins: [react(), tailwindcss(),],
})
