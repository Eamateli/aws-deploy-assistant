/**
 * Default pattern matching rules
 * Fallback patterns when specific framework patterns can't be loaded
 */

export const defaultPatterns = {
  'generic-spa': {
    name: 'Single Page Application',
    indicators: {
      files: ['index.html', 'package.json'],
      dependencies: ['webpack', 'vite', 'parcel'],
      content: ['spa', 'single page', 'frontend'],
      build: ['npm run build', 'yarn build']
    },
    confidence_weights: {
      files: 0.3,
      dependencies: 0.3,
      content: 0.3,
      build: 0.1
    },
    architecture_recommendations: ['static-spa'],
    requirements: {
      database: 'none',
      auth: 'optional',
      realtime: 'none',
      storage: 'optional'
    }
  },
  'generic-api': {
    name: 'API Application',
    indicators: {
      files: ['server.js', 'app.js', 'main.py'],
      dependencies: ['express', 'fastify', 'flask', 'django'],
      content: ['api', 'rest', 'endpoint', 'route'],
      build: ['npm start', 'python app.py']
    },
    confidence_weights: {
      files: 0.4,
      dependencies: 0.3,
      content: 0.2,
      build: 0.1
    },
    architecture_recommendations: ['serverless-api', 'traditional-stack'],
    requirements: {
      database: 'required',
      auth: 'optional',
      realtime: 'optional',
      storage: 'optional'
    }
  },
  'static-site': {
    name: 'Static Website',
    indicators: {
      files: ['index.html', 'style.css'],
      dependencies: [],
      content: ['html', 'css', 'javascript', 'static'],
      build: []
    },
    confidence_weights: {
      files: 0.5,
      dependencies: 0.1,
      content: 0.3,
      build: 0.1
    },
    architecture_recommendations: ['static-spa'],
    requirements: {
      database: 'none',
      auth: 'none',
      realtime: 'none',
      storage: 'none'
    }
  }
};

export default defaultPatterns;