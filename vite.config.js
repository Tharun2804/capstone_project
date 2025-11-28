import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/login': 'http://localhost:3000',
      '/register': 'http://localhost:3000',
      '/books': 'http://localhost:3000',
      '/reviews': 'http://localhost:3000',
      '/assignments': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/admin': 'http://localhost:3000',
      '/plagiarism-check': 'http://localhost:3000'
    }
  }
})