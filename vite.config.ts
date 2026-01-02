import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import apiRoutes from './server/api';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // API routes plugin - only active in development mode
    ...(process.env.NODE_ENV === 'development' ? [apiRoutes()] : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
