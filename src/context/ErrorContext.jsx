import React, { createContext, useContext, useReducer, useCallback } from 'react';

const ErrorContext = createContext();

// Error types
export const ERROR_TYPES = {
  ANALYSIS: 'analysis',
  RECOMMENDATION: 'recommendation',
  DIAGRAM: 'diagram',
  DEPLOYMENT: 'deployment',
  VALIDATION: 'validation',
  NETWORK: 'network',
  SYSTEM: 'system'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const initialState = {
  errors: [],
  globalError: null,
  errorHistory: [],
  retryAttempts: {},
  maxRetryAttempts: 3
};

const errorReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, { ...action.payload, id: generateErrorId() }],
        errorHistory: [...state.errorHistory, { ...action.payload, timestamp: new Date().toISOString() }]
      };

    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload.id)
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: action.payload?.type 
          ? state.errors.filter(error => error.type !== action.payload.type)
          : []
      };

    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.payload
      };

    case 'CLEAR_GLOBAL_ERROR':
      return {
        ...state,
        globalError: null
      };

    case 'INCREMENT_RETRY':
      const errorId = action.payload.errorId;
      return {
        ...state,
        retryAttempts: {
          ...state.retryAttempts,
          [errorId]: (state.retryAttempts[errorId] || 0) + 1
        }
      };

    case 'RESET_RETRY':
      return {
        ...state,
        retryAttempts: {
          ...state.retryAttempts,
          [action.payload.errorId]: 0
        }
      };

    default:
      return state;
  }
};

const generateErrorId = () => {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const ErrorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = useCallback((error) => {
    const errorWithDefaults = {
      type: ERROR_TYPES.SYSTEM,
      severity: ERROR_SEVERITY.MEDIUM,
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      ...error
    };

    dispatch({ type: 'ADD_ERROR', payload: errorWithDefaults });

    // Auto-remove low severity errors after 5 seconds
    if (errorWithDefaults.severity === ERROR_SEVERITY.LOW) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_ERROR', payload: { id: errorWithDefaults.id } });
      }, 5000);
    }

    return errorWithDefaults.id;
  }, []);

  const removeError = useCallback((errorId) => {
    dispatch({ type: 'REMOVE_ERROR', payload: { id: errorId } });
  }, []);

  const clearErrors = useCallback((type = null) => {
    dispatch({ type: 'CLEAR_ERRORS', payload: type ? { type } : null });
  }, []);

  const setGlobalError = useCallback((error) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: error });
  }, []);

  const clearGlobalError = useCallback(() => {
    dispatch({ type: 'CLEAR_GLOBAL_ERROR' });
  }, []);

  const canRetry = useCallback((errorId) => {
    const attempts = state.retryAttempts[errorId] || 0;
    return attempts < state.maxRetryAttempts;
  }, [state.retryAttempts, state.maxRetryAttempts]);

  const incrementRetry = useCallback((errorId) => {
    dispatch({ type: 'INCREMENT_RETRY', payload: { errorId } });
  }, []);

  const resetRetry = useCallback((errorId) => {
    dispatch({ type: 'RESET_RETRY', payload: { errorId } });
  }, []);

  // Error handling utilities
  const handleAnalysisError = useCallback((error, context = {}) => {
    return addError({
      type: ERROR_TYPES.ANALYSIS,
      severity: ERROR_SEVERITY.HIGH,
      message: 'Failed to analyze application',
      originalError: error,
      context,
      recoverable: true,
      suggestions: [
        'Try uploading different files',
        'Provide more detailed description',
        'Select framework manually'
      ]
    });
  }, [addError]);

  const handleRecommendationError = useCallback((error, context = {}) => {
    return addError({
      type: ERROR_TYPES.RECOMMENDATION,
      severity: ERROR_SEVERITY.HIGH,
      message: 'Failed to generate recommendations',
      originalError: error,
      context,
      recoverable: true,
      suggestions: [
        'Try different preferences',
        'Go back and modify analysis',
        'Select architecture manually'
      ]
    });
  }, [addError]);

  const handleDiagramError = useCallback((error, context = {}) => {
    return addError({
      type: ERROR_TYPES.DIAGRAM,
      severity: ERROR_SEVERITY.MEDIUM,
      message: 'Failed to render architecture diagram',
      originalError: error,
      context,
      recoverable: true,
      suggestions: [
        'Refresh the diagram',
        'Try a different browser',
        'Continue without visualization'
      ]
    });
  }, [addError]);

  const handleDeploymentError = useCallback((error, context = {}) => {
    return addError({
      type: ERROR_TYPES.DEPLOYMENT,
      severity: ERROR_SEVERITY.HIGH,
      message: 'Failed to generate deployment guide',
      originalError: error,
      context,
      recoverable: true,
      suggestions: [
        'Try regenerating the guide',
        'Select different architecture',
        'Use manual deployment steps'
      ]
    });
  }, [addError]);

  const handleValidationError = useCallback((error, context = {}) => {
    return addError({
      type: ERROR_TYPES.VALIDATION,
      severity: ERROR_SEVERITY.MEDIUM,
      message: 'Input validation failed',
      originalError: error,
      context,
      recoverable: true,
      suggestions: [
        'Check your input format',
        'Review file requirements',
        'Try with different data'
      ]
    });
  }, [addError]);

  const handleNetworkError = useCallback((error, context = {}) => {
    return addError({
      type: ERROR_TYPES.NETWORK,
      severity: ERROR_SEVERITY.HIGH,
      message: 'Network request failed',
      originalError: error,
      context,
      recoverable: true,
      suggestions: [
        'Check your internet connection',
        'Try again in a moment',
        'Refresh the page'
      ]
    });
  }, [addError]);

  // Get errors by type or severity
  const getErrorsByType = useCallback((type) => {
    return state.errors.filter(error => error.type === type);
  }, [state.errors]);

  const getErrorsBySeverity = useCallback((severity) => {
    return state.errors.filter(error => error.severity === severity);
  }, [state.errors]);

  const getCriticalErrors = useCallback(() => {
    return getErrorsBySeverity(ERROR_SEVERITY.CRITICAL);
  }, [getErrorsBySeverity]);

  const hasErrors = state.errors.length > 0;
  const hasCriticalErrors = getCriticalErrors().length > 0;

  const value = {
    // State
    errors: state.errors,
    globalError: state.globalError,
    errorHistory: state.errorHistory,
    hasErrors,
    hasCriticalErrors,

    // Generic error actions
    addError,
    removeError,
    clearErrors,
    setGlobalError,
    clearGlobalError,

    // Retry management
    canRetry,
    incrementRetry,
    resetRetry,

    // Specific error handlers
    handleAnalysisError,
    handleRecommendationError,
    handleDiagramError,
    handleDeploymentError,
    handleValidationError,
    handleNetworkError,

    // Utilities
    getErrorsByType,
    getErrorsBySeverity,
    getCriticalErrors
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorContext;