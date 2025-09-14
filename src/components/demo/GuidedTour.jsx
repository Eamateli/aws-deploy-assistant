import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../core/Card';
import { Button } from '../core/Button';
import { Play, Pause, SkipForward, RotateCcw, X, ChevronRight } from 'lucide-react';
import AnimatedTransition from '../core/AnimatedTransition';

const GuidedTour = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef(null);

  const tourSteps = [
    {
      id: 'welcome',
      title: 'Welcome to AWS Deploy Assistant',
      description: 'Transform your application deployment from complex to simple with intelligent AWS recommendations.',
      duration: 4000,
      highlight: null,
      action: 'introduction'
    },
    {
      id: 'problem',
      title: 'The Problem We Solve',
      description: 'Developers spend hours researching AWS services, architecture patterns, and deployment strategies. We eliminate that complexity.',
      duration: 5000,
      highlight: null,
      action: 'problem-statement'
    },
    {
      id: 'upload',
      title: 'Step 1: Code Analysis',
      description: 'Upload your code files or describe your application. Our pattern matching engine analyzes your tech stack and requirements.',
      duration: 6000,
      highlight: '[data-tour="upload"]',
      action: 'demo-upload'
    },
    {
      id: 'analysis',
      title: 'Step 2: Intelligent Detection',
      description: 'Watch as we detect your framework (React, Node.js, Python), application type, and infrastructure needs with 90%+ accuracy.',
      duration: 5000,
      highlight: '[data-tour="analysis"]',
      action: 'demo-analysis'
    },
    {
      id: 'recommendations',
      title: 'Step 3: AWS Service Recommendations',
      description: 'Get personalized architecture recommendations with cost estimates, complexity ratings, and service explanations.',
      duration: 6000,
      highlight: '[data-tour="recommendations"]',
      action: 'demo-recommendations'
    },
    {
      id: 'architecture',
      title: 'Step 4: Visual Architecture',
      description: 'Explore interactive diagrams showing your recommended AWS infrastructure with service connections and data flows.',
      duration: 5000,
      highlight: '[data-tour="architecture"]',
      action: 'demo-architecture'
    },
    {
      id: 'deployment',
      title: 'Step 5: Deployment Guide',
      description: 'Follow step-by-step instructions with copy-paste commands to deploy your application to AWS in minutes.',
      duration: 6000,
      highlight: '[data-tour="deployment"]',
      action: 'demo-deployment'
    },
    {
      id: 'kiro-workflow',
      title: 'Built with Kiro',
      description: 'This entire application was built using Kiro\'s spec-driven development workflow, demonstrating rapid, high-quality development.',
      duration: 5000,
      highlight: null,
      action: 'kiro-showcase'
    },
    {
      id: 'conclusion',
      title: 'Ready to Deploy?',
      description: 'From zero AWS knowledge to production deployment in under 30 minutes. Try it with your own application!',
      duration: 4000,
      highlight: null,
      action: 'call-to-action'
    }
  ];

  const currentTourStep = tourSteps[currentStep];

  useEffect(() => {
    if (isPlaying && !isComplete) {
      intervalRef.current = setTimeout(() => {
        if (currentStep < tourSteps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsComplete(true);
          setIsPlaying(false);
          if (onComplete) onComplete();
        }
      }, currentTourStep.duration);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [currentStep, isPlaying, isComplete, currentTourStep.duration, onComplete]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsComplete(false);
    setIsPlaying(false);
  };

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
    setIsPlaying(false);
  };

  const getProgressPercentage = () => {
    return ((currentStep + 1) / tourSteps.length) * 100;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-4">
        {/* Main Tour Card */}
        <AnimatedTransition type="scale" className="mb-6">
          <Card className="text-center">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentTourStep.title}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {currentTourStep.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <div className="text-sm text-gray-500">
                Step {currentStep + 1} of {tourSteps.length}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Button
                onClick={handleRestart}
                variant="secondary"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>

              {!isPlaying ? (
                <Button onClick={handlePlay} size="lg">
                  <Play className="w-5 h-5 mr-2" />
                  {currentStep === 0 ? 'Start Tour' : 'Continue'}
                </Button>
              ) : (
                <Button onClick={handlePause} size="lg" variant="secondary">
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}

              <Button
                onClick={handleNext}
                variant="secondary"
                size="sm"
                disabled={currentStep >= tourSteps.length - 1}
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Next
              </Button>
            </div>

            {/* Step Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {tourSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`
                    px-3 py-1 text-xs rounded-full transition-colors
                    ${index === currentStep 
                      ? 'bg-blue-600 text-white' 
                      : index < currentStep 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {isComplete && (
              <AnimatedTransition type="bounce" className="mt-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Tour Complete! 🎉
                  </h3>
                  <p className="text-green-700 mb-4">
                    You've seen how AWS Deploy Assistant transforms complex deployment into a simple, guided process.
                  </p>
                  <Button onClick={onClose}>
                    Try It Yourself
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </AnimatedTransition>
            )}
          </Card>
        </AnimatedTransition>

        {/* Close Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Highlight Overlay */}
      {currentTourStep.highlight && (
        <TourHighlight selector={currentTourStep.highlight} />
      )}
    </div>
  );
};

// Component to highlight specific elements during tour
const TourHighlight = ({ selector }) => {
  const [elementRect, setElementRect] = useState(null);

  useEffect(() => {
    const element = document.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setElementRect(rect);
    }
  }, [selector]);

  if (!elementRect) return null;

  return (
    <div
      className="absolute border-4 border-yellow-400 rounded-lg animate-pulse-glow pointer-events-none"
      style={{
        top: elementRect.top - 4,
        left: elementRect.left - 4,
        width: elementRect.width + 8,
        height: elementRect.height + 8,
        zIndex: 60
      }}
    />
  );
};

export default GuidedTour;