/**
 * Asset optimization utilities for production builds
 */

/**
 * Preload critical resources
 */
export const preloadCriticalResources = () => {
  const criticalResources = [
    // Preload critical CSS
    { href: '/src/index.css', as: 'style' },
    // Preload critical fonts (if any)
    // { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
    document.head.appendChild(link);
  });
};

/**
 * Lazy load non-critical images
 */
export const setupLazyImageLoading = () => {
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

/**
 * Optimize images for different screen sizes
 */
export const getOptimizedImageUrl = (baseUrl, width, quality = 80) => {
  // In a real application, this would integrate with an image CDN
  // For now, return the base URL
  return baseUrl;
};

/**
 * Service Worker registration for caching
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, prompt user to refresh
            if (confirm('New version available! Refresh to update?')) {
              window.location.reload();
            }
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

/**
 * Critical CSS inlining
 */
export const inlineCriticalCSS = () => {
  // Critical CSS for above-the-fold content
  const criticalCSS = `
    /* Critical styles for initial render */
    .btn-primary {
      background-color: #2563eb;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      transition: background-color 0.2s;
    }
    .btn-primary:hover {
      background-color: #1d4ed8;
    }
    .card {
      background-color: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }
    .input-field {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
    }
    .input-field:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
};

/**
 * Resource hints for better performance
 */
export const addResourceHints = () => {
  const hints = [
    // DNS prefetch for external domains
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
    
    // Preconnect to critical origins
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    if (hint.crossorigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Bundle size monitoring
 */
export const monitorBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    // Monitor bundle size in development
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          console.log(`Bundle: ${entry.name} - ${Math.round(entry.transferSize / 1024)}KB`);
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource timing not supported');
    }
  }
};

/**
 * Memory usage monitoring
 */
export const monitorMemoryUsage = () => {
  if (performance.memory && process.env.NODE_ENV === 'development') {
    const logMemoryUsage = () => {
      const memory = performance.memory;
      console.log('Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
      });
    };

    // Log memory usage every 30 seconds in development
    setInterval(logMemoryUsage, 30000);
    logMemoryUsage(); // Initial log
  }
};

/**
 * Initialize all optimizations
 */
export const initializeOptimizations = () => {
  // Preload critical resources
  preloadCriticalResources();
  
  // Add resource hints
  addResourceHints();
  
  // Inline critical CSS
  inlineCriticalCSS();
  
  // Setup lazy loading
  setupLazyImageLoading();
  
  // Register service worker in production
  if (process.env.NODE_ENV === 'production') {
    registerServiceWorker();
  }
  
  // Development monitoring
  if (process.env.NODE_ENV === 'development') {
    monitorBundleSize();
    monitorMemoryUsage();
  }
};

/**
 * Cache management utilities
 */
export const cacheManager = {
  // Set cache with expiration
  set: (key, data, expirationMinutes = 60) => {
    const item = {
      data,
      expiration: Date.now() + (expirationMinutes * 60 * 1000)
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(item));
  },

  // Get cached data
  get: (key) => {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;

      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expiration) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return parsed.data;
    } catch (e) {
      return null;
    }
  },

  // Clear expired cache entries
  cleanup: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (Date.now() > item.expiration) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          localStorage.removeItem(key);
        }
      }
    });
  }
};

// Initialize cache cleanup on load
cacheManager.cleanup();