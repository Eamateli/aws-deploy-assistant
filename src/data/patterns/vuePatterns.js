/**
 * Vue.js-specific pattern matching rules
 * Loaded dynamically when Vue framework is detected
 */

export const vuePatterns = {
  'vue-spa': {
    name: 'Vue.js Single Page Application',
    indicators: {
      files: ['package.json', 'src/App.vue', 'public/index.html'],
      dependencies: ['vue', '@vue/cli-service', 'vue-router'],
      content: ['<template>', '<script>', '<style>', 'v-if', 'v-for', 'v-model'],
      build: ['npm run build', 'yarn build', 'vue-cli-service build']
    },
    confidence_weights: {
      files: 0.3,
      dependencies: 0.4,
      content: 0.2,
      build: 0.1
    },
    architecture_recommendations: ['static-spa', 'container-stack'],
    requirements: {
      database: 'optional',
      auth: 'optional',
      realtime: 'optional',
      storage: 'optional'
    }
  },
  'vue-ssr': {
    name: 'Vue.js Server-Side Rendered Application',
    indicators: {
      files: ['nuxt.config.js', 'pages/', 'layouts/'],
      dependencies: ['nuxt', 'vue', '@nuxt/typescript-build'],
      content: ['asyncData', 'fetch', 'head()', 'serverMiddleware'],
      build: ['nuxt build', 'npm run build']
    },
    confidence_weights: {
      files: 0.4,
      dependencies: 0.3,
      content: 0.2,
      build: 0.1
    },
    architecture_recommendations: ['container-stack', 'traditional-stack'],
    requirements: {
      database: 'optional',
      auth: 'optional',
      realtime: 'optional',
      storage: 'optional'
    }
  }
};

export const vueOptimizations = {
  bundling: {
    splitChunks: true,
    lazyLoading: true,
    treeShaking: true
  },
  deployment: {
    staticOptimization: true,
    cdnFriendly: true,
    caching: 'aggressive'
  }
};

export default vuePatterns;