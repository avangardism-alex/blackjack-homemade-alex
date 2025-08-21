import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        format: 'iife', // Format IIFE au lieu de ES modules
        entryFileNames: 'assets/bundle.js',
        chunkFileNames: 'assets/bundle.js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks: undefined,
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
