/**
 * Bundle Optimization Utilities
 * Provides utilities for dynamic imports, code splitting, and performance optimization
 */

import React from 'react';

// Dynamic import wrapper with error handling and loading states
export const dynamicImport = async (importFn, fallback = null) => {
  try {
    const module = await importFn();
    return module.default || module;
  } catch (error) {
    console.error('Dynamic import failed:', error);
    return fallback;
  }
};

// Lazy load components with retry mechanism
export const createLazyComponent = (importFn, retries = 3) => {
  return React.lazy(async () => {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error;
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    
    throw lastError;
  });
};

// Preload critical chunks
export const preloadChunk = (chunkName) => {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = `/js/${chunkName}`;
  document.head.appendChild(link);
};

// Tree-shake unused AWS service data
export const getOptimizedServiceData = (requiredServices) => {
  return import('../data/awsServiceCatalog.js').then(module => {
    const allServices = module.default || module.awsServices;
    
    if (!requiredServices || requiredServices.length === 0) {
      return allServices;
    }
    
    // Only return data for required services
    const optimizedData = {};
    requiredServices.forEach(serviceName => {
      if (allServices[serviceName]) {
        optimizedData[serviceName] = allServices[serviceName];
      }
    });
    
    return optimizedData;
  });
};

// Lazy load pattern matching rules based on detected framework
export const getPatternRules = async (framework) => {
  const patternModules = {
    react: () => import('../data/patterns/reactPatterns.js').catch(() => import('../data/patterns/defaultPatterns.js')),
    vue: () => import('../data/patterns/vuePatterns.js').catch(() => import('../data/patterns/defaultPatterns.js')),
    nodejs: () => import('../data/patterns/nodejsPatterns.js').catch(() => import('../data/patterns/defaultPatterns.js')),
    python: () => import('../data/patterns/pythonPatterns.js').catch(() => import('../data/patterns/defaultPatterns.js')),
    default: () => import('../data/patterns/defaultPatterns.js')
  };
  
  const importFn = patternModules[framework] || patternModules.default;
  
  try {
    const module = await importFn();
    return module.default || module;
  } catch (error) {
    console.warn(`Failed to load patterns for ${framework}, using default:`, error);
    try {
      const defaultModule = await patternModules.default();
      return defaultModule.default || defaultModule;
    } catch (defaultError) {
      console.error('Failed to load default patterns:', defaultError);
      // Return minimal fallback patterns
      return {
        'generic-app': {
          name: 'Generic Application',
          indicators: { files: [], dependencies: [], content: [], build: [] },
          confidence_weights: { files: 0.25, dependencies: 0.25, content: 0.25, build: 0.25 },
          architecture_recommendations: ['static-spa'],
          requirements: { database: 'optional', auth: 'optional', realtime: 'optional', storage: 'optional' }
        }
      };
    }
  }
};

// Optimize image loading with lazy loading and WebP support
export const optimizeImageLoading = () => {
  // Add intersection observer for lazy loading images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

// Memory optimization - cleanup unused resources
export const cleanupResources = () => {
  // Clear any cached data that's no longer needed
  if (window.analysisCache) {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    Object.keys(window.analysisCache).forEach(key => {
      if (now - window.analysisCache[key].timestamp > maxAge) {
        delete window.analysisCache[key];
      }
    });
  }
  
  // Force garbage collection if available (development only)
  if (process.env.NODE_ENV === 'development' && window.gc) {
    window.gc();
  }
};

// Performance monitoring for bundle loading
export const monitorBundlePerformance = () => {
  if ('performance' in window) {
    // Monitor resource loading times
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(resource => 
        resource.name.includes('.js') && resource.transferSize > 0
      );
      
      const totalJSSize = jsResources.reduce((total, resource) => 
        total + resource.transferSize, 0
      );
      
      const totalLoadTime = jsResources.reduce((max, resource) => 
        Math.max(max, resource.responseEnd), 0
      );
      
      console.log('Bundle Performance:', {
        totalJSSize: `${(totalJSSize / 1024).toFixed(2)}KB`,
        totalLoadTime: `${totalLoadTime.toFixed(2)}ms`,
        resourceCount: jsResources.length
      });
      
      // Report to analytics if available
      if (window.gtag) {
        window.gtag('event', 'bundle_performance', {
          total_js_size: totalJSSize,
          load_time: totalLoadTime,
          resource_count: jsResources.length
        });
      }
    });
  }
};

// Initialize bundle optimizations
export const initializeBundleOptimizations = () => {
  // Preload critical chunks
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      preloadChunk('react-vendor');
      preloadChunk('ui-vendor');
    });
  } else {
    preloadChunk('react-vendor');
    preloadChunk('ui-vendor');
  }
  
  // Set up performance monitoring
  monitorBundlePerformance();
  
  // Set up resource cleanup
  setInterval(cleanupResources, 5 * 60 * 1000); // Every 5 minutes
  
  // Optimize images
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeImageLoading);
  } else {
    optimizeImageLoading();
  }
};

export default {
  dynamicImport,
  createLazyComponent,
  preloadChunk,
  getOptimizedServiceData,
  getPatternRules,
  optimizeImageLoading,
  cleanupResources,
  monitorBundlePerformance,
  initializeBundleOptimizations
};