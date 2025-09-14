import React from 'react';
import { Network, Eye, Zap } from 'lucide-react';
import ErrorBoundary from '../core/ErrorBoundary';
import Button from '../core/Button';
import Card from '../core/Card';

const DiagramErrorFallback = ({ error, onRetry, onReset }) => {
  const getErrorType = (error) => {
    if (error?.name === 'RenderingError') return 'rendering';
    if (error?.name === 'LayoutError') return 'layout';
    if (error?.name === 'InteractionError') return 'interaction';
    if (error?.message?.includes('React Flow')) return 'reactflow';
    return 'unknown';
  };

  const errorType = getErrorType(error);
  
  const errorMessages = {
    rendering: {
      title: 'Diagram Rendering Failed',
      message: 'The architecture diagram couldn\'t be displayed. This might be due to complex service relationships.',
      icon: Eye,
      suggestions: [
        'Try refreshing the diagram',
        'Simplify the architecture by removing optional services',
        'Switch to a different view mode'
      ]
    },
    layout: {
      title: 'Layout Generation Error',
      message: 'Unable to arrange the services in the diagram. The architecture might be too complex for automatic layout.',
      icon: Network,
      suggestions: [
        'Try a simpler architecture pattern',
        'Manually arrange the services',
        'Reduce the number of services in the diagram'
      ]
    },
    interaction: {
      title: 'Diagram Interaction Error',
      message: 'There was an issue with diagram interactions. Some features might not work properly.',
      icon: Zap,
      suggestions: [
        'Try clicking on different areas',
        'Refresh the diagram',
        'Use keyboard navigation instead'
      ]
    },
    reactflow: {
      title: 'Visualization Library Error',
      message: 'The diagram visualization library encountered an error. This is usually temporary.',
      icon: Network,
      suggestions: [
        'Refresh the page and try again',
        'Try a different browser',
        'Disable browser extensions that might interfere'
      ]
    },
    unknown: {
      title: 'Diagram Error',
      message: 'An unexpected error occurred while displaying the architecture diagram.',
      icon: Network,
      suggestions: [
        'Refresh the diagram',
        'Try a different architecture option',
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

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-medium text-purple-900 mb-2">Troubleshooting steps:</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            {errorConfig.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            <strong>Alternative:</strong> You can still proceed with the deployment guide even without the visual diagram. 
            The architecture information is available in text format.
          </p>
        </div>

        <div className="flex justify-center space-x-3">
          <Button onClick={onRetry} className="flex items-center space-x-2">
            <Eye size={16} />
            <span>Retry Diagram</span>
          </Button>
          
          <Button variant="secondary" onClick={onReset} className="flex items-center space-x-2">
            <Network size={16} />
            <span>Skip Visualization</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

const DiagramErrorBoundary = ({ children, onRetry, onReset, onSkip }) => {
  return (
    <ErrorBoundary
      name="DiagramErrorBoundary"
      fallback={(props) => (
        <DiagramErrorFallback 
          {...props} 
          onSkip={onSkip}
        />
      )}
      onRetry={onRetry}
      onReset={onReset}
      onError={(error, errorInfo) => {
        // Log diagram-specific error details
        console.error('Diagram Error Details:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default DiagramErrorBoundary;