import React from 'react';
import { X, RefreshCw, AlertTriangle } from 'lucide-react';
import { useError, ERROR_SEVERITY } from '../../context/ErrorContext';
import Button from './Button';
import ValidationMessage from './ValidationMessage';

const GlobalErrorDisplay = ({ className = '' }) => {
  const { 
    errors, 
    globalError, 
    removeError, 
    clearGlobalError, 
    canRetry, 
    incrementRetry 
  } = useError();

  if (!globalError && errors.length === 0) {
    return null;
  }

  const handleRetry = (error) => {
    if (canRetry(error.id)) {
      incrementRetry(error.id);
      if (error.onRetry) {
        error.onRetry();
      }
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case ERROR_SEVERITY.CRITICAL:
        return 'border-red-500 bg-red-50';
      case ERROR_SEVERITY.HIGH:
        return 'border-red-400 bg-red-50';
      case ERROR_SEVERITY.MEDIUM:
        return 'border-yellow-400 bg-yellow-50';
      case ERROR_SEVERITY.LOW:
        return 'border-blue-400 bg-blue-50';
      default:
        return 'border-gray-400 bg-gray-50';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Global Error */}
      {globalError && (
        <div className={`border-2 rounded-lg p-4 ${getSeverityColor(globalError.severity)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {globalError.title || 'Critical Error'}
                </h4>
                <p className="text-gray-700 mb-2">
                  {globalError.message}
                </p>
                {globalError.suggestions && globalError.suggestions.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Suggestions:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {globalError.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={clearGlobalError}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
          
          {globalError.onRetry && (
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                onClick={globalError.onRetry}
                className="flex items-center space-x-2"
              >
                <RefreshCw size={14} />
                <span>Try Again</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Individual Errors */}
      {errors.map((error) => (
        <div
          key={error.id}
          className={`border rounded-lg p-4 ${getSeverityColor(error.severity)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle 
                  className={
                    error.severity === ERROR_SEVERITY.CRITICAL ? 'text-red-600' :
                    error.severity === ERROR_SEVERITY.HIGH ? 'text-red-500' :
                    error.severity === ERROR_SEVERITY.MEDIUM ? 'text-yellow-500' :
                    'text-blue-500'
                  } 
                  size={16} 
                />
                <span className="text-xs uppercase font-semibold text-gray-600">
                  {error.type} Error
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(error.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <p className="text-gray-800 mb-2">{error.message}</p>
              
              {error.suggestions && error.suggestions.length > 0 && (
                <ValidationMessage
                  type="info"
                  messages={error.suggestions.map(suggestion => ({
                    message: suggestion,
                    type: 'info'
                  }))}
                  showIcon={false}
                  className="mt-2"
                />
              )}
              
              {error.recoverable && (
                <div className="mt-3 flex items-center space-x-2">
                  {error.onRetry && canRetry(error.id) && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRetry(error)}
                      className="flex items-center space-x-1"
                    >
                      <RefreshCw size={12} />
                      <span>Retry</span>
                    </Button>
                  )}
                  
                  {error.onFallback && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={error.onFallback}
                    >
                      Use Alternative
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={() => removeError(error.id)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GlobalErrorDisplay;