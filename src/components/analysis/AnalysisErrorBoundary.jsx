import React from 'react';
import { FileX, Upload, AlertTriangle } from 'lucide-react';
import ErrorBoundary from '../core/ErrorBoundary';
import Button from '../core/Button';
import Card from '../core/Card';

const AnalysisErrorFallback = ({ error, onRetry, onReset }) => {
  const getErrorType = (error) => {
    if (error?.name === 'PatternMatchingError') return 'pattern';
    if (error?.name === 'FileProcessingError') return 'file';
    if (error?.name === 'ValidationError') return 'validation';
    return 'unknown';
  };

  const errorType = getErrorType(error);
  
  const errorMessages = {
    pattern: {
      title: 'Pattern Detection Failed',
      message: 'We couldn\'t analyze your application pattern. This might happen with complex or unusual project structures.',
      icon: AlertTriangle,
      suggestions: [
        'Try uploading your package.json file',
        'Provide more details in the description field',
        'Select your framework manually from the dropdown'
      ]
    },
    file: {
      title: 'File Processing Error',
      message: 'There was an issue processing your uploaded files. Please check the file format and try again.',
      icon: FileX,
      suggestions: [
        'Ensure files are valid text files',
        'Check that package.json is properly formatted',
        'Try uploading fewer files at once'
      ]
    },
    validation: {
      title: 'Input Validation Error',
      message: 'The provided input doesn\'t meet our requirements. Please review and correct the issues.',
      icon: Upload,
      suggestions: [
        'Provide either files or a description',
        'Ensure uploaded files are under 10MB',
        'Use supported file types (.js, .jsx, .json, .py, etc.)'
      ]
    },
    unknown: {
      title: 'Analysis Error',
      message: 'An unexpected error occurred during analysis. Please try again or contact support.',
      icon: AlertTriangle,
      suggestions: [
        'Refresh the page and try again',
        'Try with a simpler project structure',
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-medium text-blue-900 mb-2">Suggestions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {errorConfig.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center space-x-3">
          <Button onClick={onRetry} className="flex items-center space-x-2">
            <Upload size={16} />
            <span>Try Again</span>
          </Button>
          
          <Button variant="secondary" onClick={onReset} className="flex items-center space-x-2">
            <FileX size={16} />
            <span>Start Over</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

const AnalysisErrorBoundary = ({ children, onRetry, onReset }) => {
  return (
    <ErrorBoundary
      name="AnalysisErrorBoundary"
      fallback={AnalysisErrorFallback}
      onRetry={onRetry}
      onReset={onReset}
      onError={(error, errorInfo) => {
        // Log analysis-specific error details
        console.error('Analysis Error Details:', {
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

export default AnalysisErrorBoundary;