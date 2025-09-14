import React, { Component } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';
import Card from './Card';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error for debugging
    console.error(`${this.props.name || 'ErrorBoundary'} caught an error:`, error, errorInfo);
    
    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails = false } = this.props;
      
      if (Fallback) {
        return (
          <Fallback 
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onReset={this.handleReset}
          />
        );
      }

      return (
        <ErrorFallback
          title={this.props.title || 'Something went wrong'}
          message={this.props.message || 'An unexpected error occurred'}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          showDetails={showDetails}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
          actions={this.props.actions}
        />
      );
    }
    
    return this.props.children;
  }
}

const ErrorFallback = ({ 
  title, 
  message, 
  error, 
  errorInfo, 
  errorId,
  showDetails, 
  onRetry, 
  onReset, 
  actions 
}) => (
  <Card className="max-w-2xl mx-auto">
    <div className="text-center py-8">
      <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6">
        {message}
      </p>
      
      {errorId && (
        <p className="text-xs text-gray-400 mb-4">
          Error ID: {errorId}
        </p>
      )}

      <div className="flex justify-center space-x-3 mb-6">
        {onRetry && (
          <Button onClick={onRetry} className="flex items-center space-x-2">
            <RefreshCw size={16} />
            <span>Try Again</span>
          </Button>
        )}
        
        {onReset && (
          <Button variant="secondary" onClick={onReset} className="flex items-center space-x-2">
            <Home size={16} />
            <span>Start Over</span>
          </Button>
        )}
        
        {actions && actions.map((action, index) => (
          <Button 
            key={index}
            variant={action.variant || 'secondary'}
            onClick={action.onClick}
            className="flex items-center space-x-2"
          >
            {action.icon && <action.icon size={16} />}
            <span>{action.label}</span>
          </Button>
        ))}
      </div>

      {showDetails && error && (
        <details className="text-left bg-gray-50 rounded-lg p-4 mt-4">
          <summary className="cursor-pointer font-medium text-gray-700 mb-2">
            Technical Details
          </summary>
          <div className="text-sm text-gray-600 space-y-2">
            <div>
              <strong>Error:</strong> {error.toString()}
            </div>
            {errorInfo && errorInfo.componentStack && (
              <div>
                <strong>Component Stack:</strong>
                <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  </Card>
);

export default ErrorBoundary;