import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

/**
 * Memoized pattern matching hook for expensive analysis operations
 */
export const useMemoizedPatternMatching = (input, patterns) => {
  return useMemo(() => {
    if (!input || !patterns) return null;

    const startTime = performance.now();
    
    // Simulate expensive pattern matching
    const inputLower = input.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    for (const [key, pattern] of Object.entries(patterns)) {
      const score = pattern.indicators.reduce((acc, indicator) => {
        return acc + (inputLower.includes(indicator) ? 1 : 0);
      }, 0) / pattern.indicators.length;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = { ...pattern, id: key, score };
      }
    }

    const endTime = performance.now();
    console.log(`Pattern matching took ${endTime - startTime} milliseconds`);

    return {
      detected: bestMatch,
      confidence: highestScore * (bestMatch?.confidence || 0),
      timestamp: new Date().toISOString(),
      processingTime: endTime - startTime
    };
  }, [input, patterns]);
};

/**
 * Memoized cost calculation hook
 */
export const useMemoizedCostCalculation = (architecture, traffic, region = 'us-east-1') => {
  return useMemo(() => {
    if (!architecture || !traffic) return { monthly: 0, breakdown: [] };

    const startTime = performance.now();
    
    // Cost calculation logic (simplified for performance)
    let totalCost = 0;
    const breakdown = [];

    if (architecture.services) {
      architecture.services.forEach(service => {
        let serviceCost = 0;
        
        // Simplified cost calculation
        switch (service.name) {
          case 'S3':
            serviceCost = (traffic.storage || 5) * 0.023 + (traffic.requests || 10000) * 0.0004 / 1000;
            break;
          case 'CloudFront':
            serviceCost = (traffic.bandwidth || 10) * 0.085;
            break;
          case 'Lambda':
            serviceCost = (traffic.requests || 10000) * 0.20 / 1000000;
            break;
          default:
            serviceCost = 5; // Default cost
        }

        breakdown.push({
          service: service.name,
          cost: serviceCost,
          description: service.purpose
        });

        totalCost += serviceCost;
      });
    }

    const endTime = performance.now();
    console.log(`Cost calculation took ${endTime - startTime} milliseconds`);

    return {
      monthly: Math.round(totalCost * 100) / 100,
      breakdown,
      freeTierEligible: totalCost < 20,
      annual: Math.round(totalCost * 12 * 100) / 100,
      processingTime: endTime - startTime
    };
  }, [architecture, traffic, region]);
};

/**
 * Debounced value hook for performance optimization
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttled callback hook
 */
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

/**
 * Virtual scrolling hook for large lists
 */
export const useVirtualScrolling = (items, containerHeight = 400, itemHeight = 60) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, scrollTop, containerHeight, itemHeight]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    ...visibleItems,
    handleScroll
  };
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current} took ${renderTime.toFixed(2)}ms`);
    }
    
    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
    logPerformance: (operation, time) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} - ${operation}: ${time.toFixed(2)}ms`);
      }
    }
  };
};

/**
 * Memoized service recommendations hook
 */
export const useMemoizedRecommendations = (analysis, preferences = {}) => {
  return useMemo(() => {
    if (!analysis || !analysis.detected) return [];

    const startTime = performance.now();
    
    // Simplified recommendation logic
    const recommendations = [];
    const { detected } = analysis;

    if (detected.appType === 'spa') {
      recommendations.push({
        id: 'static-spa',
        name: 'Static SPA Hosting',
        services: [
          { name: 'S3', purpose: 'Static hosting' },
          { name: 'CloudFront', purpose: 'Global CDN' }
        ],
        score: 0.9
      });
    }

    if (detected.appType === 'api') {
      recommendations.push({
        id: 'serverless-api',
        name: 'Serverless API',
        services: [
          { name: 'Lambda', purpose: 'Serverless compute' },
          { name: 'API Gateway', purpose: 'API management' }
        ],
        score: 0.85
      });
    }

    const endTime = performance.now();
    console.log(`Recommendations generation took ${endTime - startTime} milliseconds`);

    return recommendations.sort((a, b) => b.score - a.score);
  }, [analysis, preferences]);
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [options]);

  return [targetRef, isIntersecting];
};

/**
 * Memory usage monitoring hook
 */
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if (performance.memory) {
        setMemoryInfo({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};