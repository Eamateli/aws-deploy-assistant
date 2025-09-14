// DeploymentProgress.jsx - Component for tracking deployment progress
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Play, 
  Pause,
  SkipForward,
  RotateCcw,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { estimateDeploymentTime, generateDeploymentChecklist } from '../../utils/deploymentGuideGenerator.js';

/**
 * Component for tracking and visualizing deployment progress
 */
const DeploymentProgress = ({ 
  steps = [], 
  currentStep = 0,
  completedSteps = new Set(),
  skippedSteps = new Set(),
  onStepChange,
  showTimeEstimates = true,
  showDetailedProgress = true
}) => {
  const [checklist, setChecklist] = useState([]);
  const [timeEstimate, setTimeEstimate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Initialize checklist and time estimates
  useEffect(() => {
    if (steps.length > 0) {
      const initialChecklist = generateDeploymentChecklist(steps);
      setChecklist(initialChecklist);
      
      if (showTimeEstimates) {
        const estimate = estimateDeploymentTime(steps);
        setTimeEstimate(estimate);
      }
    }
  }, [steps, showTimeEstimates]);

  // Update checklist when step status changes
  useEffect(() => {
    setChecklist(prev => prev.map((item, index) => ({
      ...item,
      completed: completedSteps.has(index),
      skipped: skippedSteps.has(index)
    })));
  }, [completedSteps, skippedSteps]);

  // Track elapsed time
  useEffect(() => {
    if (!startTime) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);

  // Start timing when first step begins
  useEffect(() => {
    if (completedSteps.size > 0 && !startTime) {
      setStartTime(Date.now());
    }
  }, [completedSteps.size, startTime]);

  const getProgressStats = () => {
    const total = steps.length;
    const completed = completedSteps.size;
    const skipped = skippedSteps.size;
    const remaining = total - completed - skipped;
    const progressPercentage = total > 0 ? ((completed + skipped) / total) * 100 : 0;
    
    return {
      total,
      completed,
      skipped,
      remaining,
      progressPercentage: Math.round(progressPercentage)
    };
  };

  const getEstimatedTimeRemaining = () => {
    if (!timeEstimate || !startTime) return null;
    
    const stats = getProgressStats();
    if (stats.total === 0) return null;
    
    const completionRate = stats.completed / stats.total;
    if (completionRate === 0) return timeEstimate.totalMinutes;
    
    const elapsedMinutes = elapsedTime / (1000 * 60);
    const estimatedTotalTime = elapsedMinutes / completionRate;
    const remainingTime = Math.max(0, estimatedTotalTime - elapsedMinutes);
    
    return Math.round(remainingTime);
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatMinutes = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const stats = getProgressStats();
  const remainingTime = getEstimatedTimeRemaining();

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Progress Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Deployment Progress</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {startTime && (
              <div className="flex items-center space-x-1">
                <Clock size={16} />
                <span>Elapsed: {formatTime(elapsedTime)}</span>
              </div>
            )}
            {remainingTime !== null && (
              <div className="flex items-center space-x-1">
                <TrendingUp size={16} />
                <span>Remaining: ~{formatMinutes(remainingTime)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>{stats.completed} of {stats.total} steps completed</span>
            <span>{stats.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="text-lg font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-blue-800">Total</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <div className="text-lg font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-green-800">Completed</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-2">
            <div className="text-lg font-bold text-yellow-600">{stats.skipped}</div>
            <div className="text-xs text-yellow-800">Skipped</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-lg font-bold text-gray-600">{stats.remaining}</div>
            <div className="text-xs text-gray-800">Remaining</div>
          </div>
        </div>
      </div>

      {/* Detailed Progress */}
      {showDetailedProgress && (
        <div className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Step Details</h4>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <ProgressStepItem
                key={step.id || index}
                step={step}
                index={index}
                isActive={currentStep === index}
                isCompleted={completedSteps.has(index)}
                isSkipped={skippedSteps.has(index)}
                onStepClick={() => onStepChange?.(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Time Breakdown */}
      {showTimeEstimates && timeEstimate && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">Time Estimates</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Original Estimate:</span>
              <span className="ml-2 font-medium">{timeEstimate.formatted}</span>
            </div>
            <div>
              <span className="text-gray-600">Complexity Factor:</span>
              <span className="ml-2 font-medium">{timeEstimate.breakdown.complexity}/5</span>
            </div>
          </div>
          {timeEstimate.breakdown.complexityBuffer > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Includes {Math.round(timeEstimate.breakdown.complexityBuffer)} minute complexity buffer
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Individual progress step item
 */
const ProgressStepItem = ({ 
  step, 
  index, 
  isActive, 
  isCompleted, 
  isSkipped, 
  onStepClick 
}) => {
  const getStepStatus = () => {
    if (isCompleted) return 'completed';
    if (isSkipped) return 'skipped';
    if (isActive) return 'active';
    return 'pending';
  };

  const getStepIcon = () => {
    switch (getStepStatus()) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'skipped':
        return <SkipForward className="text-yellow-500" size={16} />;
      case 'active':
        return <Play className="text-blue-500" size={16} />;
      default:
        return <Circle className="text-gray-400" size={16} />;
    }
  };

  const getStepClasses = () => {
    const baseClasses = 'flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer hover:shadow-sm';
    
    switch (getStepStatus()) {
      case 'completed':
        return `${baseClasses} border-green-200 bg-green-50`;
      case 'skipped':
        return `${baseClasses} border-yellow-200 bg-yellow-50`;
      case 'active':
        return `${baseClasses} border-blue-500 bg-blue-50 shadow-sm`;
      default:
        return `${baseClasses} border-gray-200 bg-white`;
    }
  };

  const getStatusText = () => {
    switch (getStepStatus()) {
      case 'completed':
        return 'Completed';
      case 'skipped':
        return 'Skipped';
      case 'active':
        return 'In Progress';
      default:
        return 'Pending';
    }
  };

  return (
    <div className={getStepClasses()} onClick={onStepClick}>
      <div className="flex items-center space-x-3">
        {getStepIcon()}
        <div>
          <div className="font-medium text-sm text-gray-900">
            {index + 1}. {step.title}
          </div>
          <div className="text-xs text-gray-600">
            {step.estimatedTime} • {getStatusText()}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {step.estimatedTime && (
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {step.estimatedTime}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Deployment timeline component showing chronological progress
 */
export const DeploymentTimeline = ({ 
  steps = [], 
  completedSteps = new Set(),
  skippedSteps = new Set(),
  currentStep = 0 
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Deployment Timeline</h3>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {/* Timeline Items */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isSkipped = skippedSteps.has(index);
            const isActive = currentStep === index;
            const isPast = index < currentStep;
            
            return (
              <div key={step.id || index} className="relative flex items-start">
                {/* Timeline Dot */}
                <div className={`
                  relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2
                  ${isCompleted ? 'bg-green-500 border-green-500' :
                    isSkipped ? 'bg-yellow-500 border-yellow-500' :
                    isActive ? 'bg-blue-500 border-blue-500' :
                    isPast ? 'bg-gray-400 border-gray-400' :
                    'bg-white border-gray-300'}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="text-white" size={16} />
                  ) : isSkipped ? (
                    <SkipForward className="text-white" size={16} />
                  ) : (
                    <span className={`text-xs font-bold ${
                      isActive || isPast ? 'text-white' : 'text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                
                {/* Timeline Content */}
                <div className="ml-4 flex-1">
                  <div className={`
                    p-3 rounded-lg border
                    ${isCompleted ? 'border-green-200 bg-green-50' :
                      isSkipped ? 'border-yellow-200 bg-yellow-50' :
                      isActive ? 'border-blue-200 bg-blue-50' :
                      'border-gray-200 bg-white'}
                  `}>
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>⏱️ {step.estimatedTime}</span>
                        {isCompleted && (
                          <span className="text-green-600 font-medium">✓ Completed</span>
                        )}
                        {isSkipped && (
                          <span className="text-yellow-600 font-medium">⏭️ Skipped</span>
                        )}
                        {isActive && (
                          <span className="text-blue-600 font-medium">▶️ In Progress</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeploymentProgress;