// PrerequisiteChecker.jsx - Component for checking deployment prerequisites
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw,
  Info,
  Download,
  Terminal
} from 'lucide-react';
import { validatePrerequisites } from '../../utils/deploymentGuideGenerator.js';

/**
 * Component for checking and validating deployment prerequisites
 */
const PrerequisiteChecker = ({ 
  prerequisites = [], 
  onValidationComplete,
  autoValidate = true 
}) => {
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    if (autoValidate && prerequisites.length > 0) {
      handleValidate();
    }
  }, [prerequisites, autoValidate]);

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const results = await validatePrerequisites(prerequisites);
      setValidationResults(results);
      onValidationComplete?.(results);
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationResults({
        allMet: false,
        checks: [],
        error: error.message
      });
    } finally {
      setIsValidating(false);
    }
  };

  const toggleExpanded = (prereqId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(prereqId)) {
        newSet.delete(prereqId);
      } else {
        newSet.add(prereqId);
      }
      return newSet;
    });
  };

  const getOverallStatus = () => {
    if (!validationResults) return 'unknown';
    if (validationResults.error) return 'error';
    if (validationResults.allMet) return 'success';
    
    const requiredFailed = validationResults.checks.some(
      check => check.required && !check.satisfied
    );
    return requiredFailed ? 'error' : 'warning';
  };

  const getStatusMessage = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'success':
        return 'All prerequisites are satisfied';
      case 'error':
        return validationResults?.error || 'Some required prerequisites are missing';
      case 'warning':
        return 'Some optional prerequisites are missing';
      default:
        return 'Prerequisites not yet validated';
    }
  };

  const getStatusIcon = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      default:
        return <Info className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`border rounded-lg ${getStatusColor()}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-gray-900">Prerequisites Check</h3>
              <p className="text-sm text-gray-600">{getStatusMessage()}</p>
            </div>
          </div>
          <button
            onClick={handleValidate}
            disabled={isValidating}
            className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw 
              size={16} 
              className={isValidating ? 'animate-spin' : ''} 
            />
            <span>{isValidating ? 'Checking...' : 'Recheck'}</span>
          </button>
        </div>
      </div>

      {/* Prerequisites List */}
      <div className="p-4">
        <div className="space-y-3">
          {prerequisites.map((prereq) => {
            const check = validationResults?.checks.find(c => c.id === prereq.id);
            const isExpanded = expandedItems.has(prereq.id);
            
            return (
              <PrerequisiteItem
                key={prereq.id}
                prerequisite={prereq}
                check={check}
                isExpanded={isExpanded}
                onToggleExpanded={() => toggleExpanded(prereq.id)}
              />
            );
          })}
        </div>

        {/* Validation Error */}
        {validationResults?.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle size={16} />
              <span className="font-medium">Validation Error</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{validationResults.error}</p>
          </div>
        )}

        {/* Summary */}
        {validationResults && !validationResults.error && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Summary:</strong> {validationResults.checks.filter(c => c.satisfied).length} of {validationResults.checks.length} prerequisites satisfied
              {validationResults.checks.some(c => c.required && !c.satisfied) && (
                <span className="block mt-1 text-red-700 font-medium">
                  ⚠️ Required prerequisites are missing - deployment cannot proceed
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Individual prerequisite item component
 */
const PrerequisiteItem = ({ 
  prerequisite, 
  check, 
  isExpanded, 
  onToggleExpanded 
}) => {
  const getItemStatus = () => {
    if (!check) return 'unknown';
    if (check.satisfied) return 'satisfied';
    if (check.error) return 'error';
    return 'missing';
  };

  const getItemIcon = () => {
    const status = getItemStatus();
    switch (status) {
      case 'satisfied':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'error':
      case 'missing':
        return <AlertTriangle className="text-red-500" size={18} />;
      default:
        return <Info className="text-gray-400" size={18} />;
    }
  };

  const getItemClasses = () => {
    const status = getItemStatus();
    const baseClasses = 'border rounded-lg p-3 transition-all cursor-pointer hover:shadow-sm';
    
    switch (status) {
      case 'satisfied':
        return `${baseClasses} border-green-200 bg-green-50`;
      case 'error':
      case 'missing':
        return `${baseClasses} border-red-200 bg-red-50`;
      default:
        return `${baseClasses} border-gray-200 bg-white`;
    }
  };

  return (
    <div className={getItemClasses()}>
      {/* Main Item */}
      <div 
        className="flex items-center justify-between"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center space-x-3">
          {getItemIcon()}
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{prerequisite.name}</span>
              {prerequisite.required && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  Required
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{prerequisite.description}</p>
            {check && (
              <div className="text-xs text-gray-500 mt-1">
                Status: {check.satisfied ? 'Installed' : 'Missing'}
                {check.output && ` (${check.output})`}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {prerequisite.installUrl && (
            <a
              href={prerequisite.installUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-700 p-1"
              title="Installation guide"
            >
              <ExternalLink size={16} />
            </a>
          )}
          <button className="text-gray-400 hover:text-gray-600">
            <Info size={16} />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
          {/* Check Command */}
          {prerequisite.checkCommand && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-1">
                Verification Command:
              </h5>
              <div className="bg-gray-900 text-green-400 p-2 rounded text-sm font-mono">
                {prerequisite.checkCommand}
              </div>
            </div>
          )}

          {/* Installation Instructions */}
          {prerequisite.installInstructions && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                Installation Instructions:
              </h5>
              <div className="space-y-2">
                {Object.entries(prerequisite.installInstructions).map(([os, instruction]) => (
                  <div key={os} className="bg-white border border-gray-200 rounded p-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <Terminal size={14} />
                      <span className="text-sm font-medium capitalize">{os}:</span>
                    </div>
                    <code className="text-sm text-gray-700">{instruction}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Version Requirements */}
          {prerequisite.minVersion && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              <div className="text-sm text-blue-800">
                <strong>Minimum Version:</strong> {prerequisite.minVersion}
              </div>
            </div>
          )}

          {/* Permissions */}
          {prerequisite.permissions && (
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-1">
                Required Permissions:
              </h5>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {prerequisite.permissions.map((permission, index) => (
                  <li key={index}>{permission}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Error Details */}
          {check && check.error && (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <div className="text-sm text-red-800">
                <strong>Error:</strong> {check.error}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-2">
            {prerequisite.installUrl && (
              <a
                href={prerequisite.installUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                <Download size={14} />
                <span>Install</span>
              </a>
            )}
            {prerequisite.setupUrl && (
              <a
                href={prerequisite.setupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                <ExternalLink size={14} />
                <span>Setup Guide</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrerequisiteChecker;