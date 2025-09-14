import React, { useEffect, useState, useRef } from 'react';
import { BarChart3, Clock, Zap, AlertTriangle } from 'lucide-react';

const PerformanceMonitor = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    loadTime: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const startTime = useRef(performance.now());

  useEffect(() => {
    if (!enabled) return;

    const updateMetrics = () => {
      const now = performance.now();
      const renderTime = now - startTime.current;

      // Memory usage (if available)
      let memoryUsage = 0;
      if (performance.memory) {
        memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      }

      // Load time from navigation timing
      let loadTime = 0;
      if (performance.timing) {
        loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      }

      setMetrics({
        renderTime: Math.round(renderTime * 100) / 100,
        memoryUsage,
        bundleSize: 0, // Would need to be calculated from build stats
        loadTime: Math.round(loadTime)
      });

      startTime.current = now;
    };

    // Update metrics every 2 seconds
    const interval = setInterval(updateMetrics, 2000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, [enabled]);

  // Performance warnings
  const getWarnings = () => {
    const warnings = [];
    
    if (metrics.renderTime > 16) {
      warnings.push({
        type: 'warning',
        message: `Slow render: ${metrics.renderTime}ms (target: <16ms)`
      });
    }
    
    if (metrics.memoryUsage > 100) {
      warnings.push({
        type: 'error',
        message: `High memory usage: ${metrics.memoryUsage}MB`
      });
    }
    
    if (metrics.loadTime > 3000) {
      warnings.push({
        type: 'warning',
        message: `Slow load time: ${metrics.loadTime}ms`
      });
    }

    return warnings;
  };

  if (!enabled) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Performance Monitor"
      >
        <BarChart3 size={20} />
      </button>

      {/* Performance panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 w-80 bg-white border border-gray-300 rounded-lg shadow-xl">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock size={16} className="text-blue-500 mr-1" />
                  <span className="text-sm font-medium">Render</span>
                </div>
                <div className={`text-lg font-bold ${
                  metrics.renderTime > 16 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {metrics.renderTime}ms
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Zap size={16} className="text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">Memory</span>
                </div>
                <div className={`text-lg font-bold ${
                  metrics.memoryUsage > 100 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {metrics.memoryUsage}MB
                </div>
              </div>
            </div>

            {/* Load time */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <BarChart3 size={16} className="text-purple-500 mr-1" />
                <span className="text-sm font-medium">Load Time</span>
              </div>
              <div className={`text-lg font-bold ${
                metrics.loadTime > 3000 ? 'text-red-500' : 'text-green-500'
              }`}>
                {metrics.loadTime}ms
              </div>
            </div>

            {/* Warnings */}
            {getWarnings().length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <AlertTriangle size={14} className="text-yellow-500 mr-1" />
                  Warnings
                </h4>
                <div className="space-y-2">
                  {getWarnings().map((warning, index) => (
                    <div
                      key={index}
                      className={`text-xs p-2 rounded ${
                        warning.type === 'error'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}
                    >
                      {warning.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance tips */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tips</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Components are lazy-loaded for better performance</p>
                <p>• Virtual scrolling is used for large lists</p>
                <p>• Expensive calculations are memoized</p>
                <p>• Bundle is split by features</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Performance context for tracking across components
export const PerformanceContext = React.createContext({
  logPerformance: () => {},
  metrics: {}
});

export const PerformanceProvider = ({ children }) => {
  const [performanceLog, setPerformanceLog] = useState([]);

  const logPerformance = (operation, duration, component) => {
    const entry = {
      operation,
      duration,
      component,
      timestamp: Date.now()
    };

    setPerformanceLog(prev => [...prev.slice(-50), entry]); // Keep last 50 entries

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${component} - ${operation}: ${duration.toFixed(2)}ms`);
    }
  };

  const value = {
    logPerformance,
    metrics: {
      recentOperations: performanceLog.slice(-10),
      averageRenderTime: performanceLog
        .filter(entry => entry.operation === 'render')
        .reduce((acc, entry, _, arr) => acc + entry.duration / arr.length, 0)
    }
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
      <PerformanceMonitor />
    </PerformanceContext.Provider>
  );
};

// Hook for using performance context
export const usePerformance = () => {
  const context = React.useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

export default PerformanceMonitor;