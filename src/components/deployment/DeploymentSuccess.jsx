// DeploymentSuccess.jsx - Component for deployment success confirmation and next steps
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Copy,
  Check,
  Clock,
  Star,
  ArrowRight,
  RefreshCw,
  Shield,
  DollarSign,
  Zap,
  Info,
  AlertCircle
} from 'lucide-react';
import { validateDeploymentSuccess } from '../../utils/deploymentValidator.js';

/**
 * Main deployment success component
 */
const DeploymentSuccess = ({ 
  deploymentGuide, 
  parameters = {},
  onValidationComplete,
  showNextSteps = true,
  showCostInfo = true
}) => {
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [copiedUrls, setCopiedUrls] = useState(new Set());

  useEffect(() => {
    // Auto-run validation when component mounts
    if (deploymentGuide?.postDeployment?.validation) {
      handleValidateDeployment();
    }
  }, [deploymentGuide]);

  const handleValidateDeployment = async () => {
    setIsValidating(true);
    try {
      const results = await validateDeploymentSuccess(deploymentGuide, parameters);
      setValidationResults(results);
      onValidationComplete?.(results);
    } catch (error) {
      setValidationResults({
        success: false,
        message: `Validation error: ${error.message}`,
        error: error.message,
        checks: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  const copyUrl = async (url, index) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrls(prev => new Set([...prev, index]));
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const postDeployment = deploymentGuide?.postDeployment;
  const successConfirmation = postDeployment?.successConfirmation;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      {successConfirmation && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-900">{successConfirmation.title}</h2>
              <p className="text-green-800">{successConfirmation.message}</p>
            </div>
          </div>

          {/* Success Checklist */}
          {successConfirmation.checklist && (
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">Deployment Checklist</h3>
              <div className="space-y-2">
                {successConfirmation.checklist.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <span className="text-sm text-green-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deployment URLs */}
      {postDeployment?.urls && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <ExternalLink size={20} />
            <span>Your Application URLs</span>
          </h3>
          
          <div className="space-y-3">
            {postDeployment.urls.map((urlInfo, index) => (
              <div key={index} className={`p-3 border rounded-lg ${
                urlInfo.primary ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{urlInfo.name}</span>
                      {urlInfo.primary && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                      {urlInfo.conditional && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          If Created
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <code className="text-sm text-blue-600 bg-white px-2 py-1 rounded border">
                        {urlInfo.template}
                      </code>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyUrl(urlInfo.template, index)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded transition-colors"
                      title="Copy URL"
                    >
                      {copiedUrls.has(index) ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <a
                      href={urlInfo.template}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-white rounded transition-colors"
                      title="Open URL"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Results */}
      {postDeployment?.validation && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Shield size={20} />
              <span>Deployment Validation</span>
            </h3>
            <button
              onClick={handleValidateDeployment}
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
                  <RefreshCw size={16} />
                  <span>Re-validate</span>
                </>
              )}
            </button>
          </div>

          {validationResults ? (
            <ValidationResults results={validationResults} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield size={48} className="mx-auto mb-2 opacity-50" />
              <p>Click "Re-validate" to check deployment status</p>
            </div>
          )}
        </div>
      )}

      {/* Next Steps */}
      {showNextSteps && postDeployment?.nextSteps && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <ArrowRight size={20} />
            <span>Recommended Next Steps</span>
          </h3>
          
          <div className="space-y-4">
            {postDeployment.nextSteps.map((step, index) => (
              <NextStepCard key={index} step={step} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Cost Information */}
      {showCostInfo && postDeployment?.estimatedCosts && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <DollarSign size={20} />
            <span>Estimated Costs</span>
          </h3>
          
          <CostBreakdown costs={postDeployment.estimatedCosts} />
        </div>
      )}

      {/* Troubleshooting */}
      {postDeployment?.troubleshooting && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertCircle size={20} />
            <span>Troubleshooting Guide</span>
          </h3>
          
          <TroubleshootingGuide troubleshooting={postDeployment.troubleshooting} />
        </div>
      )}
    </div>
  );
};

/**
 * Validation results display component
 */
const ValidationResults = ({ results }) => {
  const getOverallColor = () => {
    if (results.skipped) return 'border-gray-200 bg-gray-50';
    return results.success 
      ? 'border-green-200 bg-green-50' 
      : 'border-red-200 bg-red-50';
  };

  const getOverallIcon = () => {
    if (results.skipped) return <Info className="text-gray-500" size={20} />;
    return results.success 
      ? <CheckCircle className="text-green-500" size={20} />
      : <AlertTriangle className="text-red-500" size={20} />;
  };

  const getOverallTextColor = () => {
    if (results.skipped) return 'text-gray-700';
    return results.success ? 'text-green-800' : 'text-red-800';
  };

  return (
    <div className="space-y-4">
      {/* Overall Result */}
      <div className={`border rounded-lg p-4 ${getOverallColor()}`}>
        <div className="flex items-center space-x-3">
          {getOverallIcon()}
          <div>
            <div className={`font-medium ${getOverallTextColor()}`}>
              {results.message}
            </div>
            {results.summary && (
              <div className="text-sm text-gray-600 mt-1">
                {results.summary.passed} of {results.summary.total} checks passed
                {results.summary.manual > 0 && ` (${results.summary.manual} manual)`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Individual Checks */}
      {results.checks && results.checks.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Validation Details</h4>
          {results.checks.map((check, index) => (
            <ValidationCheck key={index} check={check} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Individual validation check component
 */
const ValidationCheck = ({ check }) => {
  const getCheckColor = () => {
    return check.success 
      ? 'border-green-200 bg-green-50' 
      : 'border-red-200 bg-red-50';
  };

  const getCheckIcon = () => {
    return check.success 
      ? <CheckCircle className="text-green-500" size={16} />
      : <AlertTriangle className="text-red-500" size={16} />;
  };

  const getCheckTextColor = () => {
    return check.success ? 'text-green-800' : 'text-red-800';
  };

  return (
    <div className={`border rounded-lg p-3 ${getCheckColor()}`}>
      <div className="flex items-start space-x-2">
        {getCheckIcon()}
        <div className="flex-1">
          <div className={`font-medium text-sm ${getCheckTextColor()}`}>
            {check.name}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {check.description}
          </div>
          
          {check.type === 'manual' && check.instructions && (
            <div className="mt-2 p-2 bg-white border border-gray-200 rounded text-sm">
              <strong>Instructions:</strong> {check.instructions}
            </div>
          )}
          
          {check.command && (
            <div className="mt-2">
              <code className="block bg-white border border-gray-200 p-2 rounded text-xs font-mono">
                {check.command}
              </code>
            </div>
          )}
          
          {check.output && (
            <div className="mt-2 text-xs text-gray-600">
              Output: {check.output}
            </div>
          )}
          
          {check.successCriteria && (
            <div className="mt-2">
              <div className="text-xs font-medium text-gray-600">Success Criteria:</div>
              <ul className="list-disc list-inside text-xs text-gray-600 mt-1">
                {check.successCriteria.map((criteria, index) => (
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
 * Next step card component
 */
const NextStepCard = ({ step, index }) => {
  const getPriorityColor = () => {
    switch (step.priority) {
      case 'recommended':
        return 'border-blue-200 bg-blue-50';
      case 'optional':
        return 'border-gray-200 bg-gray-50';
      case 'critical':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getPriorityIcon = () => {
    switch (step.priority) {
      case 'recommended':
        return <Star className="text-blue-500" size={16} />;
      case 'optional':
        return <Info className="text-gray-500" size={16} />;
      case 'critical':
        return <AlertTriangle className="text-red-500" size={16} />;
      default:
        return <ArrowRight className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getPriorityColor()}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border">
          <span className="text-sm font-bold text-gray-600">{index + 1}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {getPriorityIcon()}
            <h4 className="font-medium text-gray-900">{step.title}</h4>
            {step.priority && (
              <span className={`text-xs px-2 py-1 rounded capitalize ${
                step.priority === 'recommended' ? 'bg-blue-100 text-blue-800' :
                step.priority === 'optional' ? 'bg-gray-100 text-gray-800' :
                step.priority === 'critical' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {step.priority}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{step.description}</p>
          {step.estimatedTime && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock size={12} />
              <span>Estimated time: {step.estimatedTime}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Cost breakdown component
 */
const CostBreakdown = ({ costs }) => {
  return (
    <div className="space-y-4">
      {/* Monthly Estimates */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-lg font-bold text-green-600">{costs.monthly.low}</div>
          <div className="text-sm text-green-800">Low Traffic</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-lg font-bold text-yellow-600">{costs.monthly.medium}</div>
          <div className="text-sm text-yellow-800">Medium Traffic</div>
        </div>
        <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-lg font-bold text-red-600">{costs.monthly.high}</div>
          <div className="text-sm text-red-800">High Traffic</div>
        </div>
      </div>

      {/* Cost Breakdown */}
      {costs.breakdown && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Cost Breakdown</h4>
          <div className="space-y-2">
            {costs.breakdown.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Troubleshooting guide component
 */
const TroubleshootingGuide = ({ troubleshooting }) => {
  const [expandedIssue, setExpandedIssue] = useState(null);

  const toggleIssue = (index) => {
    setExpandedIssue(expandedIssue === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {troubleshooting.commonIssues?.map((issue, index) => (
        <div key={index} className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleIssue(index)}
            className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-yellow-500" size={16} />
                <span className="font-medium text-gray-900">{issue.issue}</span>
              </div>
              <span className="text-gray-400">
                {expandedIssue === index ? '−' : '+'}
              </span>
            </div>
          </button>
          
          {expandedIssue === index && (
            <div className="px-4 pb-4 border-t border-gray-200">
              {issue.causes && (
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-2">Possible Causes:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {issue.causes.map((cause, causeIndex) => (
                      <li key={causeIndex}>{cause}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {issue.solutions && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Solutions:</h5>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                    {issue.solutions.map((solution, solutionIndex) => (
                      <li key={solutionIndex}>{solution}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DeploymentSuccess;