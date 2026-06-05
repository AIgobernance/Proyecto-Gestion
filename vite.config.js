import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/js/main.jsx', 'resources/js/app.jsx'], // Compilamos ambos por si acaso
      refresh: true,
    }),
    react(),
  ],
})
