import React, { useState, useMemo, useCallback } from 'react';
import { 
  Copy, Check, Clock, AlertCircle, ExternalLink, 
  Play, ChevronDown, ChevronRight, Terminal, FileText
} from 'lucide-react';

const DeploymentStep = React.memo(({ 
  step, 
  index, 
  isActive, 
  isCompleted, 
  onComplete, 
  onActivate 
}) => {
  const [commandsCopied, setCommandsCopied] = useState(new Set());
  const [isExpanded, setIsExpanded] = useState(isActive);

  const copyCommand = useCallback((command, commandIndex) => {
    navigator.clipboard.writeText(command);
    setCommandsCopied(prev => new Set([...prev, commandIndex]));
    setTimeout(() => {
      setCommandsCopied(prev => {
        const newSet = new Set(prev);
        newSet.delete(commandIndex);
        return newSet;
      });
    }, 2000);
  }, []);

  React.useEffect(() => {
    setIsExpanded(isActive);
  }, [isActive]);

  return (
    <div className={`
      border rounded-lg transition-all duration-200
      ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
      ${isCompleted ? 'bg-green-50 border-green-300' : ''}
    `}>
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors
              ${isCompleted ? 'bg-green-500 text-white' : 
                isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}
            `}>
              {isCompleted ? <Check size={16} /> : index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{step.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isCompleted && !isActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onActivate();
                }}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Start
              </button>
            )}
            {isActive && !isCompleted && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Complete
              </button>
            )}
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 ml-11 space-y-4">
          {step.commands && step.commands.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                <Terminal size={16} className="mr-2" />
                Commands:
              </h5>
              <div className="space-y-2">
                {step.commands.map((command, cmdIndex) => (
                  <div key={cmdIndex} className="relative group">
                    <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto pr-12">
                      {command}
                    </pre>
                    <button
                      onClick={() => copyCommand(command, cmdIndex)}
                      className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy command"
                    >
                      {commandsCopied.has(cmdIndex) ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {step.explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex items-start">
                <AlertCircle size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">{step.explanation}</p>
              </div>
            </div>
          )}

          {step.troubleshooting && step.troubleshooting.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <h6 className="font-medium text-yellow-800 mb-2">Troubleshooting:</h6>
              <div className="space-y-2">
                {step.troubleshooting.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium text-yellow-800">{item.issue}</p>
                    <p className="text-yellow-700">{item.solution}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const PrerequisiteChecker = React.memo(({ prerequisites, onAllMet }) => {
  const [checkedItems, setCheckedItems] = useState(new Set());

  const toggleCheck = useCallback((index) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const allChecked = checkedItems.size === prerequisites.length;

  React.useEffect(() => {
    if (allChecked && onAllMet) {
      onAllMet();
    }
  }, [allChecked, onAllMet]);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
        <FileText size={16} className="mr-2" />
        Prerequisites
      </h4>
      <div className="space-y-2">
        {prerequisites.map((prereq, index) => (
          <label key={index} className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checkedItems.has(index)}
              onChange={() => toggleCheck(index)}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className={`text-sm ${checkedItems.has(index) ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                {prereq}
              </span>
            </div>
          </label>
        ))}
      </div>
      {allChecked && (
        <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
          ✓ All prerequisites checked! You can now proceed with deployment.
        </div>
      )}
    </div>
  );
});

const DeploymentGuide = ({ architecture, guide, className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Memoize guide processing
  const processedGuide = useMemo(() => {
    if (!guide || !guide.steps) return null;
    return {
      ...guide,
      steps: guide.steps.map((step, index) => ({
        ...step,
        id: `step-${index}`
      }))
    };
  }, [guide]);

  const handleStepComplete = useCallback((stepIndex) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    if (stepIndex === currentStep && stepIndex < processedGuide.steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  }, [currentStep, processedGuide]);

  const handleStepActivate = useCallback((stepIndex) => {
    setCurrentStep(stepIndex);
  }, []);

  if (!processedGuide) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-8 text-center ${className}`}>
        <Terminal size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Deployment Guide</h3>
        <p className="text-gray-600">Select an architecture to see deployment instructions.</p>
      </div>
    );
  }

  const progress = (completedSteps.size / processedGuide.steps.length) * 100;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{processedGuide.title}</h3>
            <p className="text-gray-600 mt-1">Step-by-step deployment instructions</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Clock size={16} className="mr-1" />
                {processedGuide.estimatedTime}
              </span>
              <span>{completedSteps.size}/{processedGuide.steps.length} steps</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {processedGuide.prerequisites && (
          <PrerequisiteChecker 
            prerequisites={processedGuide.prerequisites}
            onAllMet={() => setCurrentStep(0)}
          />
        )}
      </div>

      <div className="p-6 space-y-4">
        {processedGuide.steps.map((step, index) => (
          <DeploymentStep
            key={step.id}
            step={step}
            index={index}
            isActive={currentStep === index}
            isCompleted={completedSteps.has(index)}
            onComplete={() => handleStepComplete(index)}
            onActivate={() => handleStepActivate(index)}
          />
        ))}
      </div>

      {completedSteps.size === processedGuide.steps.length && (
        <div className="p-6 border-t border-gray-200 bg-green-50">
          <div className="text-center">
            <Check size={48} className="mx-auto mb-4 text-green-500" />
            <h4 className="text-lg font-semibold text-green-800 mb-2">Deployment Complete!</h4>
            <p className="text-green-700">
              Your application has been successfully deployed to AWS. 
              Check your AWS console to verify all services are running correctly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(DeploymentGuide);