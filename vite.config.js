/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
  build: {
    // Bundle optimization settings
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
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
            // Group other vendor libraries
            return 'vendor';
          }
          
          // Feature-based chunks - more granular splitting
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
          if (id.includes('/components/recommendations/')) {
            return 'recommendations';
          }
          
          // Data chunks - split by type
          if (id.includes('/data/patterns/')) {
            return 'patterns';
          }
          if (id.includes('/data/architecturePatterns')) {
            return 'arch-patterns';
          }
          if (id.includes('/data/deploymentGuides')) {
            return 'deploy-guides';
          }
          if (id.includes('/data/awsServiceCatalog')) {
            return 'service-catalog';
          }
          if (id.includes('/data/')) {
            return 'data';
          }
          
          // Utility chunks
          if (id.includes('/utils/bundleOptimizer')) {
            return 'bundle-optimizer';
          }
          if (id.includes('/utils/') || id.includes('/hooks/')) {
            return 'utils';
          }
          
          // Context chunks
          if (id.includes('/context/')) {
            return 'context';
          }
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Optimize chunk size - reduce warning limit to catch large chunks
    chunkSizeWarningLimit: 500,
    // Enable source maps only for development
    sourcemap: process.env.NODE_ENV === 'development',
    // Advanced minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info'] : [],
        // Remove unused code
        dead_code: true,
        // Optimize conditionals
        conditionals: true,
        // Optimize comparisons
        comparisons: true,
        // Optimize sequences
        sequences: true,
        // Optimize properties
        properties: true,
        // Remove unused variables
        unused: true
      },
      mangle: {
        // Mangle property names for better compression
        properties: {
          regex: /^_/
        }
      },
      format: {
        // Remove comments
        comments: false
      }
    },
    // Target modern browsers for better optimization
    target: 'es2020',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize CSS
    cssMinify: true,
    // Report compressed size
    reportCompressedSize: true,
    // Optimize for production
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
    exclude: ['reactflow'] // Let reactflow be loaded dynamically
  },
  // Enable experimental features for better performance
  esbuild: {
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Optimize for modern browsers
    target: 'es2020'
  }
})