import React from 'react';
import { Terminal, FileText, AlertTriangle } from 'lucide-react';
import ErrorBoundary from '../core/ErrorBoundary';
import Button from '../core/Button';
import Card from '../core/Card';

const DeploymentErrorFallback = ({ error, onRetry, onReset }) => {
  const getErrorType = (error) => {
    if (error?.name === 'GuideGenerationError') return 'generation';
    if (error?.name === 'TemplateError') return 'template';
    if (error?.name === 'CommandGenerationError') return 'command';
    return 'unknown';
  };

  const errorType = getErrorType(error);
  
  const errorMessages = {
    generation: {
      title: 'Guide Generation Failed',
      message: 'We couldn\'t generate the deployment guide for your architecture. This might be due to missing configuration.',
      icon: FileText,
      suggestions: [
        'Verify your architecture selection',
        'Check that all required services are configured',
        'Try a simpler deployment pattern first'
      ]
    },
    template: {
      title: 'Template Processing Error',
      message: 'There was an issue processing the deployment templates. Some commands might be missing.',
      icon: Terminal,
      suggestions: [
        'Try regenerating the guide',
        'Select a different architecture option',
        'Use manual deployment steps as a fallback'
      ]
    },
    command: {
      title: 'Command Generation Error',
      message: 'Unable to generate the deployment commands. The configuration might have invalid parameters.',
      icon: Terminal,
      suggestions: [
        'Review your application settings',
        'Try with default configuration values',
        'Check the AWS service requirements'
      ]
    },
    unknown: {
      title: 'Deployment Guide Error',
      message: 'An unexpected error occurred while creating the deployment guide.',
      icon: AlertTriangle,
      suggestions: [
        'Try regenerating the guide',
        'Go back and select a different architecture',
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

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-medium text-green-900 mb-2">Next steps:</h4>
          <ul className="text-sm text-green-800 space-y-1">
            {errorConfig.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Manual Deployment Option</h4>
          <p className="text-sm text-blue-800">
            You can still deploy your application manually using the AWS Console. 
            We recommend starting with the AWS documentation for your selected services.
          </p>
        </div>

        <div className="flex justify-center space-x-3">
          <Button onClick={onRetry} className="flex items-center space-x-2">
            <FileText size={16} />
            <span>Regenerate Guide</span>
          </Button>
          
          <Button variant="secondary" onClick={onReset} className="flex items-center space-x-2">
            <Terminal size={16} />
            <span>Back to Architecture</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

const DeploymentErrorBoundary = ({ children, onRetry, onReset }) => {
  return (
    <ErrorBoundary
      name="DeploymentErrorBoundary"
      fallback={DeploymentErrorFallback}
      onRetry={onRetry}
      onReset={onReset}
      onError={(error, errorInfo) => {
        // Log deployment-specific error details
        console.error('Deployment Error Details:', {
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

export default DeploymentErrorBoundary;