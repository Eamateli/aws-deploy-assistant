/**
 * Error logging and monitoring utilities for production
 */

class ErrorLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Log an error with context information
   */
  logError(error, context = {}) {
    const errorEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      type: error.name || 'Error',
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: context.userId || 'anonymous',
        component: context.component,
        action: context.action,
        ...context
      },
      severity: this.determineSeverity(error, context)
    };

    // Add to local storage
    this.errors.push(errorEntry);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Store in localStorage for persistence
    this.persistErrors();

    // Log to console in development
    if (!this.isProduction) {
      console.error('[ErrorLogger]', errorEntry);
    }

    // Send to monitoring service in production
    if (this.isProduction) {
      this.sendToMonitoring(errorEntry);
    }

    return errorEntry.id;
  }

  /**
   * Log performance metrics
   */
  logPerformance(metric, value, context = {}) {
    const performanceEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      metric,
      value,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      }
    };

    // Store performance metrics
    const perfMetrics = this.getStoredData('performance_metrics') || [];
    perfMetrics.push(performanceEntry);
    
    // Keep only last 50 performance entries
    if (perfMetrics.length > 50) {
      perfMetrics.splice(0, perfMetrics.length - 50);
    }
    
    localStorage.setItem('aws_deploy_assistant_performance', JSON.stringify(perfMetrics));

    // Log to console in development
    if (!this.isProduction) {
      console.log('[Performance]', performanceEntry);
    }

    return performanceEntry.id;
  }

  /**
   * Log user interactions for analytics
   */
  logUserAction(action, data = {}) {
    const actionEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      action,
      data,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.getSessionId()
      }
    };

    // Store user actions
    const userActions = this.getStoredData('user_actions') || [];
    userActions.push(actionEntry);
    
    // Keep only last 100 user actions
    if (userActions.length > 100) {
      userActions.splice(0, userActions.length - 100);
    }
    
    localStorage.setItem('aws_deploy_assistant_actions', JSON.stringify(userActions));

    // Log to console in development
    if (!this.isProduction) {
      console.log('[UserAction]', actionEntry);
    }

    return actionEntry.id;
  }

  /**
   * Get all stored errors
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return this.getStoredData('performance_metrics') || [];
  }

  /**
   * Get user actions
   */
  getUserActions() {
    return this.getStoredData('user_actions') || [];
  }

  /**
   * Clear all stored data
   */
  clearData() {
    this.errors = [];
    localStorage.removeItem('aws_deploy_assistant_errors');
    localStorage.removeItem('aws_deploy_assistant_performance');
    localStorage.removeItem('aws_deploy_assistant_actions');
  }

  /**
   * Export data for debugging
   */
  exportData() {
    return {
      errors: this.getErrors(),
      performance: this.getPerformanceMetrics(),
      userActions: this.getUserActions(),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Determine error severity
   */
  determineSeverity(error, context) {
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'high'; // Bundle loading issues are critical
    }
    
    if (context.component === 'AnalysisEngine' || context.component === 'PatternMatcher') {
      return 'high'; // Core functionality errors
    }
    
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Persist errors to localStorage
   */
  persistErrors() {
    try {
      localStorage.setItem('aws_deploy_assistant_errors', JSON.stringify(this.errors));
    } catch (e) {
      console.warn('Failed to persist errors to localStorage:', e);
    }
  }

  /**
   * Load errors from localStorage
   */
  loadPersistedErrors() {
    try {
      const stored = localStorage.getItem('aws_deploy_assistant_errors');
      if (stored) {
        this.errors = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load persisted errors:', e);
    }
  }

  /**
   * Get stored data helper
   */
  getStoredData(key) {
    try {
      const stored = localStorage.getItem(`aws_deploy_assistant_${key}`);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn(`Failed to load ${key}:`, e);
      return null;
    }
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('aws_deploy_assistant_session');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('aws_deploy_assistant_session', sessionId);
    }
    return sessionId;
  }

  /**
   * Send error to monitoring service (placeholder for production)
   */
  async sendToMonitoring(errorEntry) {
    // In a real application, this would send to a service like Sentry, LogRocket, etc.
    try {
      // Example: await fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorEntry) });
      console.log('Would send to monitoring service:', errorEntry);
    } catch (e) {
      console.warn('Failed to send error to monitoring service:', e);
    }
  }
}

// Create singleton instance
const errorLogger = new ErrorLogger();

// Load persisted errors on initialization
errorLogger.loadPersistedErrors();

// Global error handler
window.addEventListener('error', (event) => {
  errorLogger.logError(event.error || new Error(event.message), {
    component: 'Global',
    action: 'unhandled_error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  errorLogger.logError(new Error(event.reason), {
    component: 'Global',
    action: 'unhandled_promise_rejection'
  });
});

// Performance observer for monitoring
if ('PerformanceObserver' in window) {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          errorLogger.logPerformance('page_load_time', entry.loadEventEnd - entry.loadEventStart);
        } else if (entry.entryType === 'paint') {
          errorLogger.logPerformance(entry.name, entry.startTime);
        }
      }
    });
    
    observer.observe({ entryTypes: ['navigation', 'paint'] });
  } catch (e) {
    console.warn('Performance observer not supported:', e);
  }
}

export default errorLogger;