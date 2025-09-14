import React from 'react';
import { Server, AlertCircle, Settings } from 'lucide-react';
import ErrorBoundary from '../core/ErrorBoundary';
import Button from '../core/Button';
import Card from '../core/Card';

const RecommendationErrorFallback = ({ error, onRetry, onReset }) => {
  const getErrorType = (error) => {
    if (error?.name === 'ServiceSelectionError') return 'service';
    if (error?.name === 'ArchitectureMatchingError') return 'architecture';
    if (error?.name === 'ConfigurationError') return 'configuration';
    return 'unknown';
  };

  const errorType = getErrorType(error);
  
  const errorMessages = {
    service: {
      title: 'Service Selection Failed',
      message: 'We couldn\'t determine the best AWS services for your application. This might be due to unclear requirements.',
      icon: Server,
      suggestions: [
        'Provide more specific application details',
        'Try selecting your preferences manually',
        'Review the detected application pattern'
      ]
    },
    architecture: {
      title: 'Architecture Matching Error',
      message: 'Unable to match your application to a suitable architecture pattern. Your app might have unique requirements.',
      icon: Settings,
      suggestions: [
        'Try describing your application differently',
        'Select a similar architecture pattern manually',
        'Break down complex applications into simpler components'
      ]
    },
    configuration: {
      title: 'Configuration Error',
      message: 'There was an issue generating the service configuration. Some settings might be incompatible.',
      icon: AlertCircle,
      suggestions: [
        'Try adjusting your preferences',
        'Select a different architecture option',
        'Review the application requirements'
      ]
    },
    unknown: {
      title: 'Recommendation Error',
      message: 'An unexpected error occurred while generating recommendations. Please try again.',
      icon: AlertCircle,
      suggestions: [
        'Refresh and try the analysis again',
        'Try with different input parameters',
        'Contact support if the issue persists'
      ]
    }
  };

  const errorConfig = errorMessages[errorType];

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="text-center py-8">
        <errorConfig.icon className="mx-auto mb-4 text-red-500" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {errorConfig.title}
        </h3>
        <p className="text-gray-600 mb-6">
          {errorConfig.message}
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-medium text-yellow-900 mb-2">What you can try:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            {errorConfig.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center space-x-3">
          <Button onClick={onRetry} className="flex items-center space-x-2">
            <Settings size={16} />
            <span>Retry Recommendations</span>
          </Button>
          
          <Button variant="secondary" onClick={onReset} className="flex items-center space-x-2">
            <Server size={16} />
            <span>Back to Analysis</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

const RecommendationErrorBoundary = ({ children, onRetry, onReset }) => {
  return (
    <ErrorBoundary
      name="RecommendationErrorBoundary"
      fallback={RecommendationErrorFallback}
      onRetry={onRetry}
      onReset={onReset}
      onError={(error, errorInfo) => {
        // Log recommendation-specific error details
        console.error('Recommendation Error Details:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString()
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default RecommendationErrorBoundary;