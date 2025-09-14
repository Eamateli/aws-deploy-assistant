// DeploymentValidator.jsx - Component for deployment validation and testing
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Pause,
  RotateCcw,
  Clock,
  Shield,
  TestTube,
  FileCheck,
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import { 
  validateDeploymentStep, 
  runAutomatedTests, 
  validateDeploymentSuccess 
} from '../../utils/deploymentValidator.js';

/**
 * Main deployment validation component
 */
const DeploymentValidator = ({ 
  step, 
  deploymentGuide,
  parameters = {},
  onValidationComplete,
  showAutomatedTests = true,
  showManualTests = true
}) => {
  const [validationResult, setValidationResult] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [activeTab, setActiveTab] = useState('validation');

  const handleValidateStep = async () => {
    setIsValidating(true);
    try {
      const result = await validateDeploymentStep(step, parameters);
      setValidationResult(result);
      onValidationComplete?.(result);
    } catch (error) {
      setValidationResult({
        success: false,
        message: `Validation error: ${error.message}`,
        error: error.message
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const result = await runAutomatedTests(step, parameters);
      setTestResults(result);
    } catch (error) {
      setTestResults({
        success: false,
        message: `Test error: ${error.message}`,
        error: error.message,
        tests: []
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const hasValidation = step?.validation;
  const hasTests = step?.testing?.automatedTests?.length > 0;
  const hasManualTests = step?.testing?.suggestions?.length > 0;

  if (!hasValidation && !hasTests && !hasManualTests) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Info size={16} />
          <span className="text-sm">No validation or testing configured for this step</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-semibold text-gray-900">Step Validation & Testing</h4>
          <div className="flex items-center space-x-2">
            {hasValidation && (
              <button
                onClick={() => setActiveTab('validation')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === 'validation' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Shield size={14} className="inline mr-1" />
                Validation
              </button>
            )}
            {hasTests && showAutomatedTests && (
              <button
                onClick={() => setActiveTab('automated')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === 'automated' 
                    ? 'bg-green-100 text-green-800' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <TestTube size={14} className="inline mr-1" />
                Automated Tests
              </button>
            )}
            {hasManualTests && showManualTests && (
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === 'manual' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FileCheck size={14} className="inline mr-1" />
                Manual Tests
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'validation' && hasValidation && (
          <ValidationPanel
            step={step}
            validationResult={validationResult}
            isValidating={isValidating}
            onValidate={handleValidateStep}
          />
        )}

        {activeTab === 'automated' && hasTests && (
          <AutomatedTestPanel
            step={step}
            testResults={testResults}
            isRunningTests={isRunningTests}
            onRunTests={handleRunTests}
          />
        )}

        {activeTab === 'manual' && hasManualTests && (
          <ManualTestPanel step={step} />
        )}
      </div>
    </div>
  );
};

/**
 * Validation panel component
 */
const ValidationPanel = ({ step, validationResult, isValidating, onValidate }) => {
  const validation = step.validation;

  return (
    <div className="space-y-4">
      {/* Validation Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h5 className="font-medium text-blue-900 mb-2">Validation Check</h5>
        <p className="text-sm text-blue-800 mb-3">{validation.description}</p>
        
        <div className="space-y-2">
          <div>
            <span className="text-xs font-medium text-blue-700">Command:</span>
            <code className="block bg-blue-100 text-blue-900 p-2 rounded text-xs mt-1 font-mono">
              {validation.command}
            </code>
          </div>
          
          <div>
            <span className="text-xs font-medium text-blue-700">Expected Output:</span>
            <code className="block bg-blue-100 text-blue-900 p-2 rounded text-xs mt-1 font-mono">
              {validation.expectedOutput}
            </code>
          </div>
        </div>

        {validation.successCriteria && (
          <div className="mt-3">
            <span className="text-xs font-medium text-blue-700">Success Criteria:</span>
            <ul className="list-disc list-inside text-xs text-blue-800 mt-1 space-y-1">
              {validation.successCriteria.map((criteria, index) => (
                <li key={index}>{criteria}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Validation Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onValidate}
          disabled={isValidating}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          {isValidating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Validating...</span>
            </>
          ) : (
            <>
              <Shield size={16} />
              <span>Run Validation</span>
            </>
          )}
        </button>

        {validationResult && (
          <div className="text-sm text-gray-500">
            Last run: {new Date(validationResult.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Validation Result */}
      {validationResult && (
        <ValidationResult result={validationResult} />
      )}
    </div>
  );
};

/**
 * Automated test panel component
 */
const AutomatedTestPanel = ({ step, testResults, isRunningTests, onRunTests }) => {
  const tests = step.testing?.automatedTests || [];

  return (
    <div className="space-y-4">
      {/* Test Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <h5 className="font-medium text-green-900 mb-2">Automated Tests</h5>
        <p className="text-sm text-green-800 mb-3">
          {tests.length} automated test{tests.length !== 1 ? 's' : ''} configured for this step
        </p>
        
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="bg-white border border-green-200 rounded p-2">
              <div className="font-medium text-sm text-green-900">{test.name}</div>
              <code className="block bg-gray-100 text-gray-800 p-2 rounded text-xs mt-1 font-mono">
                {test.command}
              </code>
              <div className="text-xs text-green-700 mt-1">
                Expected: {test.expectedResult}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onRunTests}
          disabled={isRunningTests}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          {isRunningTests ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Running Tests...</span>
            </>
          ) : (
            <>
              <TestTube size={16} />
              <span>Run All Tests</span>
            </>
          )}
        </button>

        {testResults && (
          <div className="text-sm text-gray-500">
            {testResults.summary?.passed || 0} of {testResults.summary?.total || 0} passed
          </div>
        )}
      </div>

      {/* Test Results */}
      {testResults && (
        <TestResults results={testResults} />
      )}
    </div>
  );
};

/**
 * Manual test panel component
 */
const ManualTestPanel = ({ step }) => {
  const suggestions = step.testing?.suggestions || [];
  const [checkedItems, setCheckedItems] = useState(new Set());

  const toggleCheck = (index) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {/* Manual Test Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h5 className="font-medium text-purple-900 mb-2">Manual Testing Checklist</h5>
        <p className="text-sm text-purple-800 mb-3">
          Please perform these manual checks to verify the step completed successfully
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleCheck(index)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                checkedItems.has(index)
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {checkedItems.has(index) && <CheckCircle size={14} />}
            </button>
            <div className="flex-1">
              <p className={`text-sm ${
                checkedItems.has(index) ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}>
                {suggestion}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Progress: {checkedItems.size} of {suggestions.length} completed
          </span>
          <span className="text-gray-600">
            {Math.round((checkedItems.size / suggestions.length) * 100)}%
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(checkedItems.size / suggestions.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Validation result display component
 */
const ValidationResult = ({ result }) => {
  const getResultColor = () => {
    if (result.skipped) return 'border-gray-200 bg-gray-50';
    return result.success 
      ? 'border-green-200 bg-green-50' 
      : 'border-red-200 bg-red-50';
  };

  const getResultIcon = () => {
    if (result.skipped) return <Info className="text-gray-500" size={16} />;
    return result.success 
      ? <CheckCircle className="text-green-500" size={16} />
      : <AlertTriangle className="text-red-500" size={16} />;
  };

  const getResultTextColor = () => {
    if (result.skipped) return 'text-gray-700';
    return result.success ? 'text-green-800' : 'text-red-800';
  };

  return (
    <div className={`border rounded-lg p-3 ${getResultColor()}`}>
      <div className="flex items-start space-x-2">
        {getResultIcon()}
        <div className="flex-1">
          <div className={`font-medium text-sm ${getResultTextColor()}`}>
            {result.message}
          </div>
          
          {result.command && (
            <div className="mt-2">
              <span className="text-xs font-medium text-gray-600">Command:</span>
              <code className="block bg-white border border-gray-200 p-2 rounded text-xs mt-1 font-mono">
                {result.command}
              </code>
            </div>
          )}
          
          {result.output && (
            <div className="mt-2">
              <span className="text-xs font-medium text-gray-600">Output:</span>
              <code className="block bg-white border border-gray-200 p-2 rounded text-xs mt-1 font-mono">
                {result.output}
              </code>
            </div>
          )}
          
          {result.error && (
            <div className="mt-2">
              <span className="text-xs font-medium text-red-600">Error:</span>
              <code className="block bg-red-100 border border-red-200 p-2 rounded text-xs mt-1 font-mono text-red-800">
                {result.error}
              </code>
            </div>
          )}
          
          {result.successCriteria && result.successCriteria.length > 0 && (
            <div className="mt-2">
              <span className="text-xs font-medium text-gray-600">Success Criteria:</span>
              <ul className="list-disc list-inside text-xs text-gray-700 mt-1 space-y-1">
                {result.successCriteria.map((criteria, index) => (
                  <li key={index}>{criteria}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Test results display component
 */
const TestResults = ({ results }) => {
  const getOverallColor = () => {
    if (results.skipped) return 'border-gray-200 bg-gray-50';
    return results.success 
      ? 'border-green-200 bg-green-50' 
      : 'border-red-200 bg-red-50';
  };

  const getOverallTextColor = () => {
    if (results.skipped) return 'text-gray-700';
    return results.success ? 'text-green-800' : 'text-red-800';
  };

  return (
    <div className={`border rounded-lg p-3 ${getOverallColor()}`}>
      <div className={`font-medium text-sm mb-3 ${getOverallTextColor()}`}>
        {results.message}
      </div>
      
      {results.summary && (
        <div className="mb-3 text-xs text-gray-600">
          Summary: {results.summary.passed} passed, {results.summary.failed} failed, {results.summary.total} total
        </div>
      )}
      
      {results.tests && results.tests.length > 0 && (
        <div className="space-y-2">
          {results.tests.map((test, index) => (
            <div key={index} className={`p-2 border rounded ${
              test.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {test.success ? 
                    <CheckCircle className="text-green-500" size={14} /> :
                    <AlertTriangle className="text-red-500" size={14} />
                  }
                  <span className="text-sm font-medium">{test.name}</span>
                </div>
                {test.duration && (
                  <span className="text-xs text-gray-500">{test.duration}ms</span>
                )}
              </div>
              
              {test.command && (
                <code className="block bg-white border border-gray-200 p-1 rounded text-xs mt-1 font-mono">
                  {test.command}
                </code>
              )}
              
              {test.output && (
                <div className="text-xs text-gray-600 mt-1">
                  Output: {test.output}
                </div>
              )}
              
              {test.error && (
                <div className="text-xs text-red-600 mt-1">
                  Error: {test.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeploymentValidator;