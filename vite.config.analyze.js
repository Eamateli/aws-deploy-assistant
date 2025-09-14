/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// Bundle analyzer configuration
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap' // 'treemap', 'sunburst', 'network'
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('reactflow')) {
              return 'flow-vendor';
            }
            return 'vendor';
          }
          
          if (id.includes('/components/architecture/')) {
            return 'architecture';
          }
          if (id.includes('/components/deployment/')) {
            return 'deployment';
          }
          if (id.includes('/components/cost/')) {
            return 'cost';
          }
          if (id.includes('/components/analysis/')) {
            return 'analysis';
          }
          if (id.includes('/utils/') || id.includes('/hooks/')) {
            return 'utils';
          }
          if (id.includes('/data/')) {
            return 'data';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    minify: 'terser',
    reportCompressedSize: true
  }
})