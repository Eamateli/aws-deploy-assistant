/**
 * Node.js-specific pattern matching rules
 * Loaded dynamically when Node.js framework is detected
 */

export const nodejsPatterns = {
  'nodejs-api': {
    name: 'Node.js REST API',
    indicators: {
      files: ['package.json', 'server.js', 'app.js', 'index.js'],
      dependencies: ['express', 'fastify', 'koa', 'hapi'],
      content: ['app.listen', 'app.get', 'app.post', 'require(', 'module.exports'],
      build: ['npm start', 'node server.js', 'nodemon']
    },
    confidence_weights: {
      files: 0.3,
      dependencies: 0.4,
      content: 0.2,
      build: 0.1
    },
    architecture_recommendations: ['serverless-api', 'traditional-stack', 'container-stack'],
    requirements: {
      database: 'required',
      auth: 'optional',
      realtime: 'optional',
      storage: 'optional'
    }
  },
  'nodejs-fullstack': {
    name: 'Node.js Full-Stack Application',
    indicators: {
      files: ['package.json', 'server.js', 'public/', 'views/'],
      dependencies: ['express', 'ejs', 'handlebars', 'pug'],
      content: ['app.set(\'view engine\'', 'res.render', 'express.static'],
      build: ['npm start', 'node server.js']
    },
    confidence_weights: {
      files: 0.4,
      dependencies: 0.3,
      content: 0.2,
      build: 0.1
    },
    architecture_recommendations: ['traditional-stack', 'container-stack'],
    requirements: {
      database: 'required',
      auth: 'required',
      realtime: 'optional',
      storage: 'required'
    }
  },
  'nodejs-microservice': {
    name: 'Node.js Microservice',
    indicators: {
      files: ['package.json', 'Dockerfile', 'docker-compose.yml'],
      dependencies: ['express', 'cors', 'helmet', 'morgan'],
      content: ['microservice', 'api', 'service', 'middleware'],
      build: ['docker build', 'npm run docker']
    },
    confidence_weights: {
      files: 0.3,
      dependencies: 0.3,
      content: 0.3,
      build: 0.1
    },
    architecture_recommendations: ['container-stack', 'serverless-api'],
    requirements: {
      database: 'optional',
      auth: 'required',
      realtime: 'optional',
      storage: 'optional'
    }
  }
};

export const nodejsOptimizations = {
  bundling: {
    splitChunks: false, // Server-side doesn't need client-side splitting
    lazyLoading: false,
    treeShaking: true
  },
  deployment: {
    staticOptimization: false,
    cdnFriendly: false,
    caching: 'moderate'
  }
};

export default nodejsPatterns;