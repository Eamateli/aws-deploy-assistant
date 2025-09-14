// DeploymentRollback.jsx - Component for deployment rollback and error recovery
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  Clock, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Copy,
  Check,
  Play,
  Pause,
  Info,
  ExternalLink,
  Download
} from 'lucide-react';
import { generateRollbackPlan } from '../../utils/deploymentValidator.js';

/**
 * Main deployment rollback component
 */
const DeploymentRollback = ({ 
  deploymentGuide, 
  completedSteps = [],
  parameters = {},
  onRollbackComplete,
  showWarnings = true
}) => {
  const [rollbackPlan, setRollbackPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [executingSteps, setExecutingSteps] = useState(new Set());
  const [completedRollbacks, setCompletedRollbacks] = useState(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    generatePlan();
  }, [deploymentGuide, completedSteps, parameters]);

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const plan = generateRollbackPlan(deploymentGuide, completedSteps, parameters);
      setRollbackPlan(plan);
    } catch (error) {
      console.error('Failed to generate rollback plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecuteRollback = async (stepIndex) => {
    setExecutingSteps(prev => new Set([...prev, stepIndex]));
    
    // Simulate rollback execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setExecutingSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepIndex);
      return newSet;
    });
    
    setCompletedRollbacks(prev => new Set([...prev, stepIndex]));
  };

  const handleCompleteRollback = () => {
    onRollbackComplete?.(rollbackPlan);
    setShowConfirmation(false);
  };

  if (isGenerating) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mr-3"></div>
          <span className="text-gray-600">Generating rollback plan...</span>
        </div>
      </div>
    );
  }

  if (!rollbackPlan?.hasRollbackSteps) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="text-center py-8">
          <Info className="mx-auto mb-3 text-gray-400" size={48} />
          <h3 className="font-semibold text-gray-900 mb-2">No Rollback Required</h3>
          <p className="text-gray-600">
            No deployment steps were completed that require rollback procedures.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rollback Header */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
            <RotateCcw className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-900">Deployment Rollback</h2>
            <p className="text-red-800">Remove AWS resources and undo deployment changes</p>
          </div>
        </div>

        {/* Rollback Summary */}
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-red-600">{rollbackPlan.steps.length}</div>
              <div className="text-sm text-red-800">Rollback Steps</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">{rollbackPlan.summary.estimatedTime}</div>
              <div className="text-sm text-orange-800">Estimated Time</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">{rollbackPlan.summary.riskLevel}</div>
              <div className="text-sm text-yellow-800">Risk Level</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-600">{rollbackPlan.warnings.length}</div>
              <div className="text-sm text-gray-800">Warnings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {showWarnings && rollbackPlan.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-4 flex items-center space-x-2">
            <AlertTriangle size={20} />
            <span>Important Warnings</span>
          </h3>
          
          <div className="space-y-2">
            {rollbackPlan.warnings.map((warning, index) => (
              <div key={index} className="flex items-start space-x-2">
                <AlertTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" size={16} />
                <span className="text-sm text-yellow-800">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {rollbackPlan.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
            <Info size={20} />
            <span>Rollback Recommendations</span>
          </h3>
          
          <div className="space-y-2">
            {rollbackPlan.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <span className="text-sm text-blue-800">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rollback Steps */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Rollback Procedure</h3>
        
        <div className="space-y-4">
          {rollbackPlan.steps.map((step, index) => (
            <RollbackStep
              key={index}
              step={step}
              index={index}
              isExecuting={executingSteps.has(index)}
              isCompleted={completedRollbacks.has(index)}
              onExecute={() => handleExecuteRollback(index)}
            />
          ))}
        </div>

        {/* Rollback Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {completedRollbacks.size} of {rollbackPlan.steps.length} rollback steps completed
            </div>
            
            <div className="flex items-center space-x-3">
              {completedRollbacks.size === rollbackPlan.steps.length ? (
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  Complete Rollback
                </button>
              ) : (
                <button
                  onClick={() => {
                    rollbackPlan.steps.forEach((_, index) => {
                      if (!completedRollbacks.has(index) && !executingSteps.has(index)) {
                        handleExecuteRollback(index);
                      }
                    });
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  Execute All Rollbacks
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <RollbackConfirmation
          onConfirm={handleCompleteRollback}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

/**
 * Individual rollback step component
 */
const RollbackStep = ({ step, index, isExecuting, isCompleted, onExecute }) => {
  const [copiedCommands, setCopiedCommands] = useState(new Set());
  const [showDetails, setShowDetails] = useState(false);

  const copyCommand = async (command, commandIndex) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommands(prev => new Set([...prev, commandIndex]));
      setTimeout(() => {
        setCopiedCommands(prev => {
          const newSet = new Set(prev);
          newSet.delete(commandIndex);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy command:', error);
    }
  };

  const getStepClasses = () => {
    const baseClasses = 'border rounded-lg p-4 transition-all';
    if (isCompleted) return `${baseClasses} border-green-300 bg-green-50`;
    if (isExecuting) return `${baseClasses} border-blue-500 bg-blue-50`;
    return `${baseClasses} border-gray-200 hover:border-gray-300`;
  };

  const getStepIcon = () => {
    if (isCompleted) return <CheckCircle className="text-green-500" size={20} />;
    if (isExecuting) return <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />;
    return <RotateCcw className="text-gray-500" size={20} />;
  };

  return (
    <div className={getStepClasses()}>
      {/* Step Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          {getStepIcon()}
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{step.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            
            {step.originalStep && (
              <div className="text-xs text-gray-500 mt-1">
                Rollback for: {step.originalStep}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            {showDetails ? '▼' : '▶'}
          </button>
          
          {!isCompleted && !isExecuting && (
            <button
              onClick={onExecute}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Execute
            </button>
          )}
        </div>
      </div>

      {/* Step Details */}
      {showDetails && (
        <div className="ml-8 space-y-3">
          {/* Commands */}
          {step.commands && step.commands.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Commands:</h5>
              <div className="space-y-2">
                {step.commands.map((command, cmdIndex) => (
                  <div key={cmdIndex} className="relative">
                    <pre className="bg-gray-900 text-red-400 p-3 rounded text-sm overflow-x-auto pr-12">
                      {command}
                    </pre>
                    <button
                      onClick={() => copyCommand(command, cmdIndex)}
                      className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                      title="Copy command"
                    >
                      {copiedCommands.has(cmdIndex) ? 
                        <Check size={16} /> : 
                        <Copy size={16} />
                      }
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-steps */}
          {step.steps && step.steps.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Sub-steps:</h5>
              <div className="space-y-3">
                {step.steps.map((subStep, subIndex) => (
                  <div key={subIndex} className="border border-gray-200 rounded p-3">
                    <h6 className="font-medium text-gray-900">{subStep.title}</h6>
                    {subStep.commands && (
                      <div className="mt-2 space-y-1">
                        {subStep.commands.map((command, cmdIndex) => (
                          <code key={cmdIndex} className="block bg-gray-100 p-2 rounded text-xs font-mono">
                            {command}
                          </code>
                        ))}
                      </div>
                    )}
                    {subStep.warnings && subStep.warnings.length > 0 && (
                      <div className="mt-2">
                        {subStep.warnings.map((warning, warnIndex) => (
                          <div key={warnIndex} className="flex items-start space-x-1 text-xs text-yellow-700">
                            <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                            <span>{warning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {step.warnings && step.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <h5 className="font-medium text-yellow-900 mb-2">Warnings:</h5>
              <div className="space-y-1">
                {step.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" size={14} />
                    <span className="text-sm text-yellow-800">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost Impact */}
          {step.costImpact && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="flex items-center space-x-2">
                <Shield className="text-green-600" size={16} />
                <span className="font-medium text-green-900">Cost Impact:</span>
              </div>
              <p className="text-sm text-green-800 mt-1">{step.costImpact}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Rollback confirmation modal
 */
const RollbackConfirmation = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Rollback Complete</h3>
            <p className="text-gray-600">All rollback steps have been executed</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-green-800">
            Your deployment has been successfully rolled back. All AWS resources 
            created during the deployment have been removed.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Confirm Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentRollback;