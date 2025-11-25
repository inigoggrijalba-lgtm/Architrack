import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'web', // Nueva raíz del código fuente
  publicDir: '../public', // Carpeta de estáticos relativa a la raíz 'web'
  base: '/Architrack/', 
  build: {
    outDir: '../dist', // Salida en la raíz del proyecto
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './web')
    }
  }
})