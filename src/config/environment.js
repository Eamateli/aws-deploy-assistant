/**
 * Environment configuration for AWS Deploy Assistant
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// Base configuration
const baseConfig = {
  app: {
    name: 'AWS Deploy Assistant',
    version: '1.0.0',
    description: 'Intelligent AWS deployment recommendations and guides'
  },
  
  features: {
    performanceMonitoring: true,
    errorLogging: true,
    analytics: false, // Disabled for privacy
    serviceWorker: isProduction,
    lazyLoading: true,
    virtualScrolling: true
  },

  performance: {
    bundleSizeWarningLimit: 1000, // KB
    renderTimeWarningLimit: 16, // ms
    memoryWarningLimit: 100, // MB
    cacheExpirationMinutes: 60
  },

  ui: {
    animationDuration: 200, // ms
    debounceDelay: 300, // ms
    throttleDelay: 100, // ms
    virtualScrollItemHeight: 60, // px
    virtualScrollContainerHeight: 400 // px
  }
};

// Development configuration
const developmentConfig = {
  ...baseConfig,
  
  debug: {
    enabled: true,
    logLevel: 'debug',
    showPerformanceMonitor: true,
    enableHotReload: true
  },

  features: {
    ...baseConfig.features,
    performanceMonitoring: true,
    errorLogging: true,
    serviceWorker: false // Disabled in development
  },

  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
    retries: 3
  }
};

// Production configuration
const productionConfig = {
  ...baseConfig,
  
  debug: {
    enabled: false,
    logLevel: 'error',
    showPerformanceMonitor: false,
    enableHotReload: false
  },

  features: {
    ...baseConfig.features,
    performanceMonitoring: true,
    errorLogging: true,
    serviceWorker: true
  },

  api: {
    baseUrl: 'https://api.aws-deploy-assistant.com',
    timeout: 5000,
    retries: 2
  },

  monitoring: {
    errorReportingUrl: '/api/errors',
    performanceReportingUrl: '/api/performance',
    batchSize: 10,
    flushInterval: 30000 // 30 seconds
  }
};

// Test configuration
const testConfig = {
  ...baseConfig,
  
  debug: {
    enabled: false,
    logLevel: 'warn',
    showPerformanceMonitor: false,
    enableHotReload: false
  },

  features: {
    ...baseConfig.features,
    performanceMonitoring: false,
    errorLogging: false,
    serviceWorker: false,
    lazyLoading: false // Disable for faster tests
  },

  api: {
    baseUrl: 'http://localhost:3001',
    timeout: 1000,
    retries: 1
  }
};

// Select configuration based on environment
let config;
if (isDevelopment) {
  config = developmentConfig;
} else if (isProduction) {
  config = productionConfig;
} else if (isTest) {
  config = testConfig;
} else {
  config = baseConfig;
}

// Environment utilities
export const env = {
  isDevelopment,
  isProduction,
  isTest,
  
  // Get environment variable with fallback
  get: (key, fallback = null) => {
    return process.env[key] || fallback;
  },

  // Check if feature is enabled
  isFeatureEnabled: (feature) => {
    return config.features[feature] || false;
  },

  // Get configuration value
  getConfig: (path) => {
    const keys = path.split('.');
    let value = config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
};

// Export configuration
export default config;

// Export specific configurations for testing
export {
  baseConfig,
  developmentConfig,
  productionConfig,
  testConfig
};

// Runtime configuration validation
const validateConfig = (config) => {
  const required = ['app.name', 'app.version'];
  const missing = [];

  required.forEach(path => {
    if (env.getConfig(path) === undefined) {
      missing.push(path);
    }
  });

  if (missing.length > 0) {
    console.warn('Missing required configuration:', missing);
  }
};

// Validate on load
validateConfig(config);

// Configuration change detection (for hot reloading in development)
if (isDevelopment && import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('Configuration reloaded');
  });
}