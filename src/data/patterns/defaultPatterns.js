/**
 * Default Pattern Matching Rules
 * Fallback patterns when specific framework patterns are not available
 */

export const patterns = {
  react: {
    files: ['package.json', 'src/App.jsx', 'src/App.js', 'public/index.html'],
    dependencies: ['react', 'react-dom', '@vitejs/plugin-react'],
    content: ['jsx', 'useState', 'useEffect', 'React.'],
    confidence: 0.8
  },
  vue: {
    files: ['package.json', 'src/App.vue', 'src/main.js'],
    dependencies: ['vue', '@vitejs/plugin-vue'],
    content: ['<template>', 'v-if', 'v-for', 'Vue.'],
    confidence: 0.8
  },
  nodejs: {
    files: ['package.json', 'server.js', 'app.js', 'index.js'],
    dependencies: ['express', 'fastify', 'koa'],
    content: ['app.listen', 'require(', 'module.exports'],
    confidence: 0.7
  },
  python: {
    files: ['requirements.txt', 'app.py', 'main.py', 'wsgi.py'],
    dependencies: ['flask', 'django', 'fastapi'],
    content: ['def ', 'import ', 'from '],
    confidence: 0.7
  },
  static: {
    files: ['index.html', 'style.css', 'script.js'],
    dependencies: [],
    content: ['<!DOCTYPE html>', '<html>', '<head>'],
    confidence: 0.6
  }
};

export const architecturePatterns = {
  'static-spa': {
    name: 'Static SPA Hosting',
    services: ['S3', 'CloudFront', 'Route53'],
    cost: { min: 5, max: 25, typical: 12 },
    complexity: 2,
    scalability: 4
  },
  'serverless-api': {
    name: 'Serverless API',
    services: ['Lambda', 'API Gateway', 'DynamoDB'],
    cost: { min: 10, max: 100, typical: 35 },
    complexity: 3,
    scalability: 5
  },
  'traditional-stack': {
    name: 'Traditional Stack',
    services: ['EC2', 'ALB', 'RDS', 'S3'],
    cost: { min: 50, max: 300, typical: 120 },
    complexity: 4,
    scalability: 4
  }
};

export default { patterns, architecturePatterns };