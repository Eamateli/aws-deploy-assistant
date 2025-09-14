import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Info, 
  DollarSign, 
  Zap, 
  Settings, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

/**
 * AWSServiceNode - Custom React Flow node for AWS services
 * Displays service information with interactive features
 */
const AWSServiceNode = ({ data, selected }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { 
    service, 
    serviceDefinition, 
    purpose, 
    configuration, 
    estimatedCost,
    required,
    status = 'active'
  } = data;

  const Icon = serviceDefinition?.icon || Zap;

  // Get service category styling
  const getCategoryStyle = (category) => {
    const styles = {
      compute: {
        bg: 'bg-orange-100',
        border: 'border-orange-300',
        text: 'text-orange-800',
        icon: 'text-orange-600'
      },
      storage: {
        bg: 'bg-blue-100',
        border: 'border-blue-300',
        text: 'text-blue-800',
        icon: 'text-blue-600'
      },
      database: {
        bg: 'bg-green-100',
        border: 'border-green-300',
        text: 'text-green-800',
        icon: 'text-green-600'
      },
      networking: {
        bg: 'bg-purple-100',
        border: 'border-purple-300',
        text: 'text-purple-800',
        icon: 'text-purple-600'
      },
      security: {
        bg: 'bg-red-100',
        border: 'border-red-300',
        text: 'text-red-800',
        icon: 'text-red-600'
      },
      monitoring: {
        bg: 'bg-yellow-100',
        border: 'border-yellow-300',
        text: 'text-yellow-800',
        icon: 'text-yellow-600'
      }
    };
    
    return styles[category] || {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      text: 'text-gray-800',
      icon: 'text-gray-600'
    };
  };

  const categoryStyle = getCategoryStyle(serviceDefinition?.category);

  // Get status styling
  const getStatusStyle = (status) => {
    const styles = {
      active: 'ring-2 ring-green-500 ring-opacity-50',
      pending: 'ring-2 ring-yellow-500 ring-opacity-50',
      error: 'ring-2 ring-red-500 ring-opacity-50',
      disabled: 'opacity-60'
    };
    return styles[status] || '';
  };

  // Get complexity indicator
  const getComplexityDots = (complexity) => {
    const level = complexity || 3;
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-1.5 h-1.5 rounded-full ${
          i < level ? 'bg-orange-400' : 'bg-gray-200'
        }`}
      />
    ));
  };

  return (
    <div className="relative">
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />

      {/* Main Node */}
      <div
        className={`
          relative min-w-48 bg-white rounded-lg border-2 shadow-lg transition-all duration-200 cursor-pointer
          ${categoryStyle.border}
          ${selected ? 'ring-4 ring-blue-500 ring-opacity-30 transform scale-105' : 'hover:shadow-xl'}
          ${getStatusStyle(status)}
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Header */}
        <div className={`p-4 rounded-t-lg ${categoryStyle.bg}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-white rounded-lg ${categoryStyle.icon}`}>
              <Icon size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm truncate ${categoryStyle.text}`}>
                {serviceDefinition?.name || service}
              </h3>
              <p className="text-xs text-gray-600 truncate">
                {purpose || serviceDefinition?.description}
              </p>
            </div>

            {/* Status Indicator */}
            <div className="flex-shrink-0">
              {status === 'active' && <CheckCircle className="text-green-500" size={16} />}
              {status === 'pending' && <Clock className="text-yellow-500" size={16} />}
              {status === 'error' && <AlertCircle className="text-red-500" size={16} />}
              {required && (
                <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-1 -right-1" />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Quick Stats */}
          <div className="flex items-center justify-between text-xs mb-3">
            <div className="flex items-center space-x-1">
              <DollarSign size={12} className="text-green-600" />
              <span className="text-gray-700">
                ${estimatedCost || serviceDefinition?.pricing?.estimatedMonthly?.typical || 0}/mo
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <div className="flex space-x-0.5">
                {getComplexityDots(serviceDefinition?.complexity)}
              </div>
            </div>
          </div>

          {/* Category Badge */}
          <div className="flex items-center justify-between">
            <span className={`
              px-2 py-1 text-xs font-medium rounded-full
              ${categoryStyle.bg} ${categoryStyle.text}
            `}>
              {serviceDefinition?.category || 'service'}
            </span>
            
            {expanded && (
              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings size={14} />
              </button>
            )}
          </div>

          {/* Expanded Content */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
              {/* Configuration Summary */}
              {configuration && Object.keys(configuration).length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Configuration</h4>
                  <div className="space-y-1">
                    {Object.entries(configuration).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-gray-800 font-medium">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                  Configure
                </button>
                <button className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors">
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hover Tooltip */}
      {showTooltip && !expanded && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3">
          <div className="space-y-2">
            <div className="font-medium">{serviceDefinition?.name || service}</div>
            <div className="text-gray-300">{serviceDefinition?.description}</div>
            
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700">
              <div>
                <div className="text-gray-400">Monthly Cost</div>
                <div className="font-medium text-green-400">
                  ${estimatedCost || serviceDefinition?.pricing?.estimatedMonthly?.typical || 0}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Complexity</div>
                <div className="font-medium text-orange-400">
                  {serviceDefinition?.complexity || 3}/5
                </div>
              </div>
            </div>

            {/* Use Cases */}
            {serviceDefinition?.useCases && (
              <div className="pt-2 border-t border-gray-700">
                <div className="text-gray-400 mb-1">Use Cases</div>
                <div className="flex flex-wrap gap-1">
                  {serviceDefinition.useCases.slice(0, 3).map((useCase, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded text-xs"
                    >
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

export default AWSServiceNode;