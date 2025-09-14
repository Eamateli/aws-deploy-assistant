import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

const ConfidenceIndicator = ({ 
  confidence, 
  threshold = 0.7, 
  showPercentage = true, 
  showLabel = true,
  size = 'md',
  className = ''
}) => {
  const getConfidenceLevel = (conf) => {
    if (conf >= 0.9) return 'high';
    if (conf >= threshold) return 'medium';
    if (conf >= 0.4) return 'low';
    return 'very-low';
  };

  const level = getConfidenceLevel(confidence);
  
  const configs = {
    'high': {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      label: 'High Confidence',
      description: 'Analysis is very reliable'
    },
    'medium': {
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      label: 'Good Confidence',
      description: 'Analysis is reliable'
    },
    'low': {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      label: 'Low Confidence',
      description: 'Please review the results'
    },
    'very-low': {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      label: 'Very Low Confidence',
      description: 'Manual review required'
    }
  };

  const config = configs[level];
  const Icon = config.icon;
  
  const sizes = {
    sm: { icon: 14, text: 'text-xs', padding: 'px-2 py-1' },
    md: { icon: 16, text: 'text-sm', padding: 'px-3 py-1.5' },
    lg: { icon: 18, text: 'text-base', padding: 'px-4 py-2' }
  };
  
  const sizeConfig = sizes[size];

  return (
    <div className={`inline-flex items-center space-x-2 rounded-full border ${config.bgColor} ${config.borderColor} ${sizeConfig.padding} ${className}`}>
      <Icon className={config.color} size={sizeConfig.icon} />
      
      {showLabel && (
        <span className={`font-medium ${config.color} ${sizeConfig.text}`}>
          {config.label}
        </span>
      )}
      
      {showPercentage && (
        <span className={`${config.color} ${sizeConfig.text}`}>
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </div>
  );
};

const ConfidenceBar = ({ 
  confidence, 
  threshold = 0.7, 
  className = '',
  showThreshold = true 
}) => {
  const percentage = Math.round(confidence * 100);
  const thresholdPercentage = Math.round(threshold * 100);
  
  const getBarColor = (conf) => {
    if (conf >= 0.9) return 'bg-green-500';
    if (conf >= threshold) return 'bg-blue-500';
    if (conf >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const barColor = getBarColor(confidence);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">
          Analysis Confidence
        </span>
        <span className="text-sm text-gray-600">
          {percentage}%
        </span>
      </div>
      
      <div className="relative w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
        
        {showThreshold && (
          <div
            className="absolute top-0 h-2 w-0.5 bg-gray-600"
            style={{ left: `${thresholdPercentage}%` }}
            title={`Confidence threshold: ${thresholdPercentage}%`}
          />
        )}
      </div>
      
      {showThreshold && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>Threshold: {thresholdPercentage}%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
};

const ConfidenceTooltip = ({ confidence, detected, className = '' }) => {
  const level = confidence >= 0.9 ? 'high' : 
               confidence >= 0.7 ? 'medium' : 
               confidence >= 0.4 ? 'low' : 'very-low';

  const messages = {
    'high': 'The analysis is very confident about the detected patterns.',
    'medium': 'The analysis is reasonably confident. Results should be reliable.',
    'low': 'The analysis has some uncertainty. Please review the detected patterns.',
    'very-low': 'The analysis is uncertain. Manual review and correction may be needed.'
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <HelpCircle className="text-gray-500" size={16} />
        <span className="font-medium text-gray-900">Confidence Explanation</span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        {messages[level]}
      </p>
      
      <ConfidenceBar confidence={confidence} className="mb-3" />
      
      {detected && (
        <div className="text-xs text-gray-500">
          <div>Framework: {detected.framework || 'Unknown'}</div>
          <div>App Type: {detected.appType || 'Unknown'}</div>
        </div>
      )}
    </div>
  );
};

export { ConfidenceIndicator, ConfidenceBar, ConfidenceTooltip };
export default ConfidenceIndicator;