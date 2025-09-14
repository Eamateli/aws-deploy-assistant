// CommandCopier.jsx - Component for displaying and copying deployment commands
import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Terminal, 
  Play, 
  AlertTriangle,
  Info,
  ExternalLink,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

/**
 * Component for displaying deployment commands with copy functionality
 */
const CommandCopier = ({ 
  commands = [], 
  title = "Commands",
  showLineNumbers = true,
  showCopyAll = true,
  onCommandExecute,
  className = ""
}) => {
  const [copiedCommands, setCopiedCommands] = useState(new Set());
  const [allCopied, setAllCopied] = useState(false);

  const copyCommand = async (command, index) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommands(prev => new Set([...prev, index]));
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedCommands(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy command:', error);
    }
  };

  const copyAllCommands = async () => {
    try {
      const allCommandsText = commands.join('\n');
      await navigator.clipboard.writeText(allCommandsText);
      setAllCopied(true);
      
      setTimeout(() => {
        setAllCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy all commands:', error);
    }
  };

  if (!commands || commands.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <Terminal size={16} className="text-gray-600" />
          <h4 className="font-medium text-gray-900">{title}</h4>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
            {commands.length} command{commands.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {showCopyAll && commands.length > 1 && (
          <button
            onClick={copyAllCommands}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            {allCopied ? <Check size={14} /> : <Copy size={14} />}
            <span>{allCopied ? 'Copied All' : 'Copy All'}</span>
          </button>
        )}
      </div>

      {/* Commands */}
      <div className="p-0">
        {commands.map((command, index) => (
          <CommandItem
            key={index}
            command={command}
            index={index}
            showLineNumber={showLineNumbers}
            isCopied={copiedCommands.has(index)}
            onCopy={() => copyCommand(command, index)}
            onExecute={() => onCommandExecute?.(command, index)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Individual command item component
 */
const CommandItem = ({ 
  command, 
  index, 
  showLineNumber, 
  isCopied, 
  onCopy, 
  onExecute 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Auto-expand long commands
  const isLongCommand = command.length > 80;
  const displayCommand = isLongCommand && !isExpanded 
    ? `${command.substring(0, 80)}...` 
    : command;

  return (
    <div className="group border-b border-gray-100 last:border-b-0">
      <div className="relative">
        {/* Command Display */}
        <div className="flex items-start bg-gray-900 text-green-400 font-mono text-sm">
          {/* Line Number */}
          {showLineNumber && (
            <div className="flex-shrink-0 w-8 text-center text-gray-500 bg-gray-800 py-3 border-r border-gray-700">
              {index + 1}
            </div>
          )}
          
          {/* Command Text */}
          <div className="flex-1 p-3 pr-12 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-all">
              {displayCommand}
            </pre>
          </div>
          
          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isLongCommand && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            )}
            
            <button
              onClick={onCopy}
              className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
              title="Copy command"
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            
            {onExecute && (
              <button
                onClick={onExecute}
                className="p-1 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors"
                title="Execute command"
              >
                <Play size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Multi-step command sequence component
 */
export const CommandSequence = ({ 
  steps = [], 
  currentStep = 0,
  onStepComplete,
  showProgress = true 
}) => {
  const [completedSteps, setCompletedSteps] = useState(new Set());
  
  const handleStepComplete = (stepIndex) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    onStepComplete?.(stepIndex);
  };

  return (
    <div className="space-y-4">
      {showProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-800 font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-blue-600">
              {completedSteps.size} completed
            </span>
          </div>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {steps.map((step, index) => (
        <CommandStep
          key={index}
          step={step}
          index={index}
          isActive={currentStep === index}
          isCompleted={completedSteps.has(index)}
          onComplete={() => handleStepComplete(index)}
        />
      ))}
    </div>
  );
};

/**
 * Individual command step in a sequence
 */
const CommandStep = ({ step, index, isActive, isCompleted, onComplete }) => {
  const getStepClasses = () => {
    const baseClasses = 'border rounded-lg transition-all';
    if (isCompleted) return `${baseClasses} border-green-300 bg-green-50`;
    if (isActive) return `${baseClasses} border-blue-500 bg-blue-50`;
    return `${baseClasses} border-gray-200 bg-white`;
  };

  return (
    <div className={getStepClasses()}>
      {/* Step Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${isCompleted ? 'bg-green-500 text-white' :
                isActive ? 'bg-blue-500 text-white' :
                'bg-gray-200 text-gray-600'}
            `}>
              {isCompleted ? <Check size={16} /> : index + 1}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{step.title}</h4>
              {step.description && (
                <p className="text-sm text-gray-600">{step.description}</p>
              )}
            </div>
          </div>
          
          {isActive && !isCompleted && (
            <button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Step Content */}
      {(isActive || isCompleted) && (
        <div className="p-4">
          {step.commands && (
            <CommandCopier
              commands={step.commands}
              title="Commands to run"
              showCopyAll={step.commands.length > 1}
            />
          )}
          
          {step.explanation && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-start space-x-2">
                <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">{step.explanation}</p>
              </div>
            </div>
          )}
          
          {step.warning && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-start space-x-2">
                <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">{step.warning}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Command validation component
 */
export const CommandValidator = ({ 
  command, 
  expectedOutput, 
  onValidate,
  validationResult 
}) => {
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      await onValidate?.(command);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-medium text-gray-900">Validation</h5>
        <button
          onClick={handleValidate}
          disabled={isValidating}
          className="flex items-center space-x-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded transition-colors"
        >
          {isValidating ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent" />
              <span>Validating...</span>
            </>
          ) : (
            <>
              <Play size={12} />
              <span>Validate</span>
            </>
          )}
        </button>
      </div>
      
      <div className="text-sm">
        <div className="mb-2">
          <span className="text-gray-600">Command:</span>
          <code className="ml-2 bg-gray-200 px-2 py-1 rounded text-xs">{command}</code>
        </div>
        
        <div className="mb-2">
          <span className="text-gray-600">Expected output contains:</span>
          <code className="ml-2 bg-gray-200 px-2 py-1 rounded text-xs">{expectedOutput}</code>
        </div>
        
        {validationResult && (
          <div className={`p-2 rounded ${
            validationResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`text-sm font-medium ${
              validationResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {validationResult.success ? '✓ Validation passed' : '✗ Validation failed'}
            </div>
            {validationResult.output && (
              <div className="text-xs text-gray-600 mt-1 font-mono">
                Output: {validationResult.output}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandCopier;